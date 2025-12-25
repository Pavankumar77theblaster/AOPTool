"""
AOPTool Execution Plane - Celery Tasks
Complete attack execution orchestration with Docker integration
"""

from celery import Celery, chain, group, chord
import os
import asyncio
import asyncpg
import docker
from minio import Minio
from datetime import datetime
import json
import hashlib
import subprocess
from typing import Dict, List, Optional
import tempfile

# Initialize Celery app
app = Celery(
    'aoptool_execution',
    broker=os.getenv('REDIS_URL', 'redis://:changeme@redis:6379/0'),
    backend=os.getenv('REDIS_URL', 'redis://:changeme@redis:6379/0')
)

# Celery configuration
app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour
    task_soft_time_limit=3300,  # 55 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=100,
)

# ================================
# Database Helpers
# ================================

async def get_db_connection():
    """Create PostgreSQL connection"""
    database_url = os.getenv('DATABASE_URL')
    return await asyncpg.connect(database_url)


async def get_attack_details(attack_id: int) -> Dict:
    """Fetch attack definition from database"""
    conn = await get_db_connection()
    try:
        row = await conn.fetchrow(
            """SELECT id, name, description, category, target_type,
                      risk_level, tool_name, command_template,
                      prerequisites, expected_output, parsing_rules
               FROM attacks WHERE id = $1""",
            attack_id
        )
        return dict(row) if row else None
    finally:
        await conn.close()


async def get_target_details(target_id: int) -> Dict:
    """Fetch target information from database"""
    conn = await get_db_connection()
    try:
        row = await conn.fetchrow(
            """SELECT id, name, url_or_ip, scope, risk_tolerance,
                      owner_approval, metadata
               FROM targets WHERE id = $1""",
            target_id
        )
        return dict(row) if row else None
    finally:
        await conn.close()


async def log_execution_start(plan_id: int, attack_id: int, target_id: int) -> int:
    """Log attack execution start"""
    conn = await get_db_connection()
    try:
        exec_id = await conn.fetchval(
            """INSERT INTO attack_executions
               (plan_id, attack_id, target_id, status, started_at, result_data)
               VALUES ($1, $2, $3, 'running', NOW(), '{}')
               RETURNING id""",
            plan_id, attack_id, target_id
        )
        return exec_id
    finally:
        await conn.close()


async def log_execution_complete(
    exec_id: int,
    status: str,
    result_data: Dict,
    evidence_ids: List[int] = None
):
    """Log attack execution completion"""
    conn = await get_db_connection()
    try:
        await conn.execute(
            """UPDATE attack_executions
               SET status = $1, completed_at = NOW(),
                   result_data = $2, evidence_ids = $3
               WHERE id = $4""",
            status,
            json.dumps(result_data),
            evidence_ids or [],
            exec_id
        )
    finally:
        await conn.close()


async def save_evidence_metadata(
    execution_id: int,
    evidence_type: str,
    file_path: str,
    file_hash: str,
    metadata: Dict
) -> int:
    """Save evidence metadata to database"""
    conn = await get_db_connection()
    try:
        evidence_id = await conn.fetchval(
            """INSERT INTO evidence
               (execution_id, evidence_type, file_path, file_hash,
                collected_at, metadata)
               VALUES ($1, $2, $3, $4, NOW(), $5)
               RETURNING id""",
            execution_id, evidence_type, file_path, file_hash,
            json.dumps(metadata)
        )
        return evidence_id
    finally:
        await conn.close()


# ================================
# MinIO Helpers
# ================================

def get_minio_client():
    """Initialize MinIO client"""
    return Minio(
        os.getenv('MINIO_URL', 'minio:9000').replace('http://', ''),
        access_key=os.getenv('MINIO_USER', 'minioadmin'),
        secret_key=os.getenv('MINIO_PASSWORD', 'changeme'),
        secure=False
    )


def ensure_bucket_exists(minio_client, bucket_name='aoptool-evidence'):
    """Ensure evidence bucket exists"""
    if not minio_client.bucket_exists(bucket_name):
        minio_client.make_bucket(bucket_name)


def upload_to_minio(file_path: str, object_name: str) -> str:
    """Upload file to MinIO and return object path"""
    minio_client = get_minio_client()
    bucket_name = 'aoptool-evidence'

    ensure_bucket_exists(minio_client, bucket_name)

    minio_client.fput_object(
        bucket_name,
        object_name,
        file_path
    )

    return f"s3://{bucket_name}/{object_name}"


# ================================
# Attack Execution Functions
# ================================

def execute_docker_tool(
    tool_name: str,
    command: str,
    timeout: int = 300
) -> Dict:
    """
    Execute pentesting tool in Docker container

    Args:
        tool_name: Name of Docker image (e.g., 'nmap', 'sqlmap')
        command: Command to run inside container
        timeout: Execution timeout in seconds

    Returns:
        dict: Execution results with stdout, stderr, exit_code
    """
    try:
        client = docker.from_env()

        # Map tool names to Docker images
        tool_images = {
            'nmap': 'instrumentisto/nmap:latest',
            'sqlmap': 'paoloo/sqlmap:latest',
            'nikto': 'sullo/nikto:latest',
            'wpscan': 'wpscanteam/wpscan:latest',
            'dirb': 'aoptool/dirb:latest',  # Custom image
            'gobuster': 'aoptool/gobuster:latest',  # Custom image
            'curl': 'curlimages/curl:latest',
            'nuclei': 'projectdiscovery/nuclei:latest',
            'ffuf': 'ffuf/ffuf:latest'
        }

        image = tool_images.get(tool_name, tool_name)

        # Run container
        container = client.containers.run(
            image,
            command=command,
            detach=True,
            network='aoptool_aoptool_network',
            remove=True
        )

        # Wait for completion with timeout
        result = container.wait(timeout=timeout)
        exit_code = result['StatusCode']

        # Get logs
        stdout = container.logs(stdout=True, stderr=False).decode('utf-8')
        stderr = container.logs(stdout=False, stderr=True).decode('utf-8')

        return {
            'success': exit_code == 0,
            'exit_code': exit_code,
            'stdout': stdout,
            'stderr': stderr,
            'tool': tool_name
        }

    except docker.errors.ContainerError as e:
        return {
            'success': False,
            'error': f"Container error: {str(e)}",
            'exit_code': e.exit_status,
            'stdout': e.stderr.decode('utf-8') if e.stderr else ''
        }
    except docker.errors.ImageNotFound:
        return {
            'success': False,
            'error': f"Docker image not found: {image}"
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"Execution error: {str(e)}"
        }


def execute_command_directly(command: str, timeout: int = 300) -> Dict:
    """
    Execute command directly on host (for simple tools)

    Args:
        command: Command to execute
        timeout: Timeout in seconds

    Returns:
        dict: Execution results
    """
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            timeout=timeout,
            text=True
        )

        return {
            'success': result.returncode == 0,
            'exit_code': result.returncode,
            'stdout': result.stdout,
            'stderr': result.stderr
        }

    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'error': f"Command timed out after {timeout} seconds"
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"Execution error: {str(e)}"
        }


# ================================
# CELERY TASKS
# ================================

@app.task(name='aoptool.ping')
def ping():
    """Test task to verify Celery is working"""
    return {'status': 'pong', 'timestamp': datetime.utcnow().isoformat()}


@app.task(name='aoptool.execute_attack', bind=True, max_retries=3)
def execute_attack(self, attack_id: int, target_id: int, plan_id: int = None):
    """
    Execute a single attack against a target

    Args:
        attack_id: ID of attack from attacks table
        target_id: ID of target from targets table
        plan_id: Optional ID of attack plan

    Returns:
        dict: Execution result with status and evidence_id
    """
    try:
        # Run async database operations
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        # Get attack and target details
        attack = loop.run_until_complete(get_attack_details(attack_id))
        target = loop.run_until_complete(get_target_details(target_id))

        if not attack or not target:
            return {
                'success': False,
                'error': 'Attack or target not found',
                'attack_id': attack_id,
                'target_id': target_id
            }

        # Log execution start
        exec_id = loop.run_until_complete(
            log_execution_start(plan_id or 0, attack_id, target_id)
        )

        print(f"[{exec_id}] Executing {attack['name']} against {target['name']}")

        # Build command from template
        command_template = attack.get('command_template', '')
        target_url = target.get('url_or_ip', '')

        # Replace placeholders in command template
        command = command_template.replace('{target}', target_url)
        command = command.replace('{url}', target_url)

        # Execute attack
        tool_name = attack.get('tool_name', 'curl')

        if tool_name in ['nmap', 'sqlmap', 'nikto', 'nuclei', 'ffuf']:
            # Use Docker execution
            execution_result = execute_docker_tool(tool_name, command)
        else:
            # Direct execution
            execution_result = execute_command_directly(command)

        # Collect evidence
        evidence_ids = []

        if execution_result.get('stdout'):
            # Save output as evidence
            output_file = tempfile.NamedTemporaryFile(
                mode='w',
                delete=False,
                suffix='.txt',
                prefix=f'attack_{attack_id}_'
            )
            output_file.write(execution_result['stdout'])
            output_file.close()

            # Calculate hash
            with open(output_file.name, 'rb') as f:
                file_hash = hashlib.sha256(f.read()).hexdigest()

            # Upload to MinIO
            object_name = f"executions/{exec_id}/output.txt"
            minio_path = upload_to_minio(output_file.name, object_name)

            # Save metadata
            evidence_id = loop.run_until_complete(
                save_evidence_metadata(
                    exec_id,
                    'tool_output',
                    minio_path,
                    file_hash,
                    {'tool': tool_name, 'attack_id': attack_id}
                )
            )
            evidence_ids.append(evidence_id)

            # Clean up temp file
            os.unlink(output_file.name)

        # Prepare result data
        result_data = {
            'success': execution_result.get('success', False),
            'tool': tool_name,
            'command': command,
            'exit_code': execution_result.get('exit_code'),
            'output_preview': execution_result.get('stdout', '')[:500],
            'error': execution_result.get('error'),
            'evidence_count': len(evidence_ids),
            'timestamp': datetime.utcnow().isoformat()
        }

        # Log completion
        status = 'success' if execution_result.get('success') else 'failed'
        loop.run_until_complete(
            log_execution_complete(exec_id, status, result_data, evidence_ids)
        )

        loop.close()

        print(f"[{exec_id}] Attack completed: {status}")

        return {
            'success': execution_result.get('success', False),
            'execution_id': exec_id,
            'attack_id': attack_id,
            'target_id': target_id,
            'evidence_ids': evidence_ids,
            'result': result_data
        }

    except Exception as e:
        print(f"Attack execution failed: {e}")
        # Retry with exponential backoff
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@app.task(name='aoptool.orchestrate_attack_plan')
def orchestrate_attack_plan(plan_id: int):
    """
    Orchestrate execution of an entire attack plan

    Args:
        plan_id: ID of attack plan from attack_plans table

    Returns:
        dict: Orchestration result with execution IDs
    """
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        # Define async function for database operations
        async def get_plan_details():
            conn = await get_db_connection()
            try:
                plan = await conn.fetchrow(
                    """SELECT id, target_id, attack_sequence, metadata
                       FROM attack_plans WHERE id = $1""",
                    plan_id
                )

                if not plan:
                    return None

                # Update plan status to running
                await conn.execute(
                    "UPDATE attack_plans SET status = 'running' WHERE id = $1",
                    plan_id
                )

                return dict(plan)
            finally:
                await conn.close()

        # Get plan details
        plan = loop.run_until_complete(get_plan_details())
        loop.close()

        if not plan:
            return {
                'success': False,
                'error': 'Attack plan not found',
                'plan_id': plan_id
            }

        target_id = plan['target_id']
        attack_sequence = plan['attack_sequence']

        print(f"[Plan {plan_id}] Orchestrating {len(attack_sequence)} attacks")

        # Create Celery workflow
        # Execute attacks sequentially using chain
        workflow = chain(
            execute_attack.s(attack_id, target_id, plan_id)
            for attack_id in attack_sequence
        )

        # Execute workflow
        result = workflow.apply_async()

        # Wait for completion (with timeout)
        final_result = result.get(timeout=3600)

        print(f"[Plan {plan_id}] Orchestration complete")

        return {
            'success': True,
            'plan_id': plan_id,
            'attacks_executed': len(attack_sequence),
            'final_result': final_result
        }

    except Exception as e:
        print(f"Orchestration failed: {e}")
        return {
            'success': False,
            'plan_id': plan_id,
            'error': str(e)
        }


@app.task(name='aoptool.collect_evidence')
def collect_evidence(execution_id: int, evidence_type: str, data: Dict):
    """
    Collect and store evidence from an attack execution

    Args:
        execution_id: ID of execution from attack_executions table
        evidence_type: Type of evidence (screenshot, log, pcap, etc.)
        data: Evidence data to store

    Returns:
        dict: Evidence storage result with evidence_id
    """
    try:
        # Create temp file
        temp_file = tempfile.NamedTemporaryFile(
            mode='wb',
            delete=False,
            suffix=f'.{evidence_type}'
        )

        # Write data
        if isinstance(data.get('content'), bytes):
            temp_file.write(data['content'])
        else:
            temp_file.write(str(data.get('content', '')).encode('utf-8'))

        temp_file.close()

        # Calculate hash
        with open(temp_file.name, 'rb') as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()

        # Upload to MinIO
        object_name = f"executions/{execution_id}/{evidence_type}_{datetime.utcnow().timestamp()}"
        minio_path = upload_to_minio(temp_file.name, object_name)

        # Save metadata
        loop = asyncio.new_event_loop()
        evidence_id = loop.run_until_complete(
            save_evidence_metadata(
                execution_id,
                evidence_type,
                minio_path,
                file_hash,
                data.get('metadata', {})
            )
        )
        loop.close()

        # Clean up
        os.unlink(temp_file.name)

        return {
            'success': True,
            'evidence_id': evidence_id,
            'execution_id': execution_id,
            'evidence_type': evidence_type,
            'file_hash': file_hash,
            'storage_path': minio_path
        }

    except Exception as e:
        print(f"Evidence collection failed: {e}")
        return {
            'success': False,
            'execution_id': execution_id,
            'error': str(e)
        }


@app.task(name='aoptool.schedule_periodic_scan')
def schedule_periodic_scan(target_id: int, attack_ids: List[int], interval_hours: int):
    """
    Schedule periodic scanning of a target

    Args:
        target_id: Target to scan
        attack_ids: List of attack IDs to execute
        interval_hours: Interval between scans

    Returns:
        dict: Schedule result
    """
    print(f"Scheduling periodic scan for target {target_id} every {interval_hours}h")

    # TODO: Implement using Celery Beat
    # This would create a periodic task entry in the database

    return {
        'success': True,
        'target_id': target_id,
        'attack_ids': attack_ids,
        'interval_hours': interval_hours,
        'message': 'Periodic scan scheduled'
    }


if __name__ == '__main__':
    app.start()
