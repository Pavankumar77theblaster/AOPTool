# AOPTool - System Architecture Documentation

**Version:** 1.0.0
**Last Updated:** 2025-12-26
**Status:** Design Phase

---

## Table of Contents

1. [Overview](#overview)
2. [5-Plane Architecture](#5-plane-architecture)
3. [Technology Stack](#technology-stack)
4. [Data Flow](#data-flow)
5. [Component Details](#component-details)
6. [Database Schemas](#database-schemas)
7. [API Specifications](#api-specifications)
8. [Security Architecture](#security-architecture)
9. [Deployment Architecture](#deployment-architecture)

---

## Overview

AOPTool is an AI-orchestrated autonomous pentesting platform built on a 5-plane architecture:

```
User Intent → AI Reasoning → Automated Execution → Evidence Collection → Continuous Learning
```

### Core Principles

1. **Autonomy**: Minimal human intervention after initial setup
2. **Intelligence**: AI-driven decision making and adaptation
3. **Safety**: Scope validation and approval workflows
4. **Learning**: Continuous improvement from outcomes
5. **Modularity**: Loosely coupled components

---

## 5-Plane Architecture

### High-Level Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER LAYER                                │
│                    (Web Dashboard / CLI)                          │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│                      CONTROL PLANE                                │
│ ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
│ │  Web Interface │  │  Orchestrator   │  │  Scope Manager   │   │
│ │   (React UI)   │  │   (FastAPI)     │  │  (Validation)    │   │
│ └────────────────┘  └─────────────────┘  └──────────────────┘   │
│         │                    │                      │             │
│         └────────────────────┼──────────────────────┘             │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                   INTELLIGENCE PLANE                              │
│ ┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│ │ AI Translator  │  │ Reasoning Engine │  │ Attack Library   │  │
│ │ (Claude API)   │  │  (LangChain)     │  │  (PostgreSQL)    │  │
│ └────────────────┘  └──────────────────┘  └──────────────────┘  │
│         │                    │                      │             │
│         └────────────────────┼──────────────────────┘             │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    EXECUTION PLANE                                │
│ ┌────────────────┐  ┌──────┐  ┌────────┐  ┌────────┐  ┌──────┐ │
│ │ Orchestration  │→ │ Nmap │  │ SQLMap │  │ Nuclei │  │  ZAP │ │
│ │   (Celery)     │  └──────┘  └────────┘  └────────┘  └──────┘ │
│ └────────────────┘  ┌──────┐  ┌────────┐  ┌─────────────────┐  │
│                     │  MSF │  │Gobuster│  │ Evidence        │  │
│                     └──────┘  └────────┘  │ Collector       │  │
│                                           └─────────────────┘  │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│             EVIDENCE & VALIDATION PLANE                           │
│ ┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│ │ Evidence Store │  │  Results         │  │  Report          │  │
│ │ (MinIO/PG)     │  │  Validator       │  │  Generator       │  │
│ └────────────────┘  └──────────────────┘  └──────────────────┘  │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│              LEARNING & EVOLUTION PLANE                           │
│ ┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│ │ Attack Memory  │  │  Feedback Loop   │  │  Model Update    │  │
│ │  (MongoDB)     │  │   Processor      │  │   Pipeline       │  │
│ └────────────────┘  └──────────────────┘  └──────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Infrastructure

| Component | Technology | Version | Purpose | Cost |
|-----------|-----------|---------|---------|------|
| Containerization | Docker | 24.x | Isolation & deployment | Free |
| Orchestration | Docker Compose | 2.x | Multi-container management | Free |
| Operating System | Windows 11 | Latest | Host OS | Included |

### Databases

| Database | Type | Purpose | Storage Location | Cost |
|----------|------|---------|------------------|------|
| PostgreSQL | Relational | Structured data (targets, attacks, evidence metadata) | Docker volume | Free |
| MongoDB | Document | Flexible data (attack memory, learning patterns) | Docker volume | Free |
| Redis | In-Memory | Task queue broker, caching | Docker volume | Free |
| MinIO | Object Storage | Binary evidence (screenshots, pcaps, files) | Docker volume | Free |

### Backend

| Component | Technology | Purpose | Container |
|-----------|-----------|---------|-----------|
| Control Plane API | FastAPI | REST API, WebSocket | control_plane |
| Intelligence Plane | Python 3.11 | AI integration, reasoning | intelligence_plane |
| Execution Plane | Python 3.11 | Tool orchestration | execution_plane |
| Task Queue | Celery | Async task execution | celery_worker |
| Task Scheduler | Celery Beat | Scheduled tasks | celery_beat |

### Frontend

| Component | Technology | Purpose | Port |
|-----------|-----------|---------|------|
| Web Dashboard | React 18 + Next.js 14 | User interface | 3000 |
| UI Framework | Tailwind CSS | Styling | - |
| State Management | React Context / Zustand | State management | - |
| API Client | Axios | HTTP requests | - |

### AI/ML

| Component | Technology | Purpose | Cost/Month |
|-----------|-----------|---------|------------|
| Primary AI | Claude 4.5 Sonnet API | Exploit translation, reasoning | $20-50 |
| Backup AI | OpenAI GPT-4 | Fallback | Pay-as-you-go |
| Local ML | Python (scikit-learn, XGBoost) | Confidence scoring | Free |
| Experiment Tracking | MLflow | Model versioning | Free |

### Pentesting Tools

| Tool | Purpose | Container | License |
|------|---------|-----------|---------|
| Nmap | Network scanning | tools/nmap | Free |
| Metasploit | Exploitation framework | tools/metasploit | Free |
| SQLMap | SQL injection | tools/sqlmap | Free |
| OWASP ZAP | Web app scanning | tools/zap | Free |
| Nuclei | Vulnerability scanning | tools/nuclei | Free |
| Gobuster | Directory brute-forcing | tools/gobuster | Free |
| Sublist3r | Subdomain enumeration | tools/sublist3r | Free |

---

## Data Flow

### 1. User Initiates Attack Plan

```
User (Dashboard)
  → POST /attack_plans
  → Control Plane validates scope
  → Control Plane creates plan in PostgreSQL
  → If approved: triggers Celery task
```

### 2. Intelligence Plane Processes Plan

```
Celery task
  → Intelligence Plane loads plan
  → AI Translator converts attack descriptions to scripts
  → Reasoning Engine analyzes target context
  → Builds attack chain with preconditions
  → Calculates confidence scores
  → Returns execution plan
```

### 3. Execution Plane Runs Attacks

```
Execution Orchestrator
  → Creates Celery subtasks for each attack
  → Resolves dependencies (parallel vs. sequential)
  → Executes tool executors (Docker containers)
  → Tool executors run commands (e.g., nmap -sV target)
  → Evidence Collector captures outputs
  → Stores raw evidence in MinIO
  → Stores metadata in PostgreSQL
```

### 4. Validation & Reporting

```
Evidence Validator
  → Loads evidence from MinIO
  → Applies validation rules (e.g., SQL injection indicators)
  → Cross-validates with multiple sources
  → Calculates confidence score
  → Marks as validated in PostgreSQL
  → Report Generator creates PDF/HTML reports
```

### 5. Learning Loop

```
Feedback Loop Processor
  → Monitors validation results (Kafka/RabbitMQ)
  → Updates Attack Memory in MongoDB
  → Recalculates success rates
  → If patterns change significantly:
    → Triggers Model Update Pipeline
    → Retrains confidence predictor
    → Updates AI prompts
```

---

## Component Details

### Control Plane Components

#### 1. Web Dashboard (React + Next.js)

**Responsibilities:**
- User authentication (JWT-based)
- Target management UI (add/edit/delete targets)
- Attack plan creation and approval
- Real-time attack monitoring (WebSocket)
- Evidence viewer
- Report download

**Key Files:**
```
web_dashboard/
├── src/
│   ├── components/
│   │   ├── TargetList.tsx
│   │   ├── AttackPlanForm.tsx
│   │   ├── EvidenceViewer.tsx
│   │   └── ReportList.tsx
│   ├── pages/
│   │   ├── index.tsx (Dashboard)
│   │   ├── targets.tsx
│   │   ├── plans.tsx
│   │   └── evidence.tsx
│   ├── services/
│   │   ├── api.ts (Axios client)
│   │   └── websocket.ts
│   └── styles/
│       └── globals.css
├── package.json
└── Dockerfile
```

**API Endpoints Used:**
- `GET /targets` - List all targets
- `POST /targets` - Create new target
- `POST /attack_plans` - Create attack plan
- `GET /attack_plans/{id}` - Get plan status
- `WS /ws` - Real-time updates

#### 2. Project Core Orchestrator (FastAPI)

**Responsibilities:**
- Central command & control
- Scope validation (CIDR, domain, IP whitelist)
- Rate limiting (prevent DoS)
- Human approval workflow
- Health monitoring

**Key Files:**
```
control_plane/
├── main.py (FastAPI app)
├── models.py (Pydantic models)
├── scope_validator.py
├── auth.py (JWT handlers)
├── database.py (PostgreSQL connection)
├── websocket.py (Real-time updates)
├── requirements.txt
└── Dockerfile
```

**Endpoints:**
- `POST /token` - Login
- `POST /targets` - Create target (with scope validation)
- `GET /targets` - List targets
- `POST /attack_plans` - Create plan
- `POST /attack_plans/{id}/approve` - Approve plan
- `GET /health` - Health check

#### 3. Scope & Approval Manager

**Responsibilities:**
- Whitelist/blacklist management
- CIDR range validation
- Domain ownership verification
- Risk scoring (low/medium/high/critical)
- Audit trail generation

**Key Logic:**
```python
# Scope validation pseudocode
def validate_target(target: str) -> bool:
    1. Load whitelist from PostgreSQL
    2. Check if target is IP:
       - Check against IP whitelist
       - Check against CIDR ranges
    3. Else check if target is domain:
       - Check against domain whitelist
       - Check parent domains
    4. Return True/False
    5. Log validation attempt to audit_log
```

---

### Intelligence Plane Components

#### 1. AI Logic Translator

**Responsibilities:**
- Parse training resources (texts, images, PDFs)
- Convert exploit descriptions to executable scripts
- Maintain knowledge graph of attack patterns

**Key Logic:**
```python
# AI translation flow
def translate_exploit(description: str) -> dict:
    # Build prompt
    prompt = f"""
    Convert this exploit description into an executable attack definition:
    {description}

    Return JSON with:
    - attack_name
    - category (recon/scanning/exploitation/post_exploitation)
    - risk_level (low/medium/high/critical)
    - preconditions (list of required context)
    - execution_script (Python/Bash)
    - validation_script (success detection logic)
    - success_indicators (list of strings to search for in output)
    """

    # Call Claude API
    response = claude.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    )

    # Parse response
    attack_definition = json.loads(response.content[0].text)

    # Store in Attack Library (PostgreSQL)
    save_to_attack_library(attack_definition)

    return attack_definition
```

**Training Model Folder Structure:**
```
training_model/
├── exploits/
│   ├── sql_injection_techniques.txt
│   ├── xss_payloads.txt
│   └── privilege_escalation.pdf
├── attack_flows/
│   ├── web_attack_chain.png
│   └── network_pentest_flow.jpg
├── heuristics/
│   ├── success_patterns.json
│   └── failure_indicators.yaml
└── updates/
    └── weekly_cve_feed.txt
```

#### 2. Attack Reasoning Engine

**Responsibilities:**
- Contextual analysis (detect tech stack, WAF, etc.)
- Attack chain planning
- Precondition checking
- Confidence scoring
- Adaptive strategy adjustment

**Key Logic:**
```python
# Reasoning engine pseudocode
def plan_attack_chain(target_id: int, attack_goals: list) -> dict:
    # 1. Load target context
    target = get_target(target_id)
    context = analyze_target_context(target)  # Tech stack, security measures

    # 2. Load historical data
    memory = get_attack_memory(context)

    # 3. Select attacks from library
    candidate_attacks = get_candidate_attacks(attack_goals, context)

    # 4. Calculate confidence for each attack
    for attack in candidate_attacks:
        attack['confidence'] = calculate_confidence(
            attack,
            context,
            memory.get_success_rate(attack, context)
        )

    # 5. Build attack chain (topological sort based on preconditions)
    attack_chain = build_chain(candidate_attacks)

    # 6. Prioritize by confidence
    attack_chain = sort_by_confidence(attack_chain)

    return {
        'target_id': target_id,
        'context': context,
        'attack_sequence': [a['attack_id'] for a in attack_chain],
        'estimated_success_rate': calculate_overall_success_rate(attack_chain)
    }
```

**Context Analysis:**
- Tech Stack Detection: Parse headers, error messages, response patterns
- WAF Detection: Test for ModSecurity, Cloudflare signatures
- Auth Mechanisms: Detect JWT, session cookies, OAuth
- Rate Limiting: Measure response times, 429 errors

#### 3. Attack Library

**Schema (PostgreSQL):**
```sql
CREATE TABLE attacks (
    attack_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),  -- recon, scanning, exploitation, post_exploitation
    risk_level VARCHAR(50),  -- low, medium, high, critical
    preconditions JSONB DEFAULT '{}'::jsonb,  -- {"requires": ["open_port_80", "php_detected"]}
    execution_script TEXT,  -- Python/Bash script
    validation_script TEXT,  -- Script to verify success
    success_rate DECIMAL(5,2) DEFAULT 0.0,
    avg_execution_time INTEGER DEFAULT 0,  -- seconds
    total_executions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Example Attack Record:**
```json
{
  "attack_id": 1,
  "name": "SQL Injection (UNION-based)",
  "category": "exploitation",
  "risk_level": "high",
  "preconditions": {
    "requires": ["web_application", "database_backend"],
    "incompatible_with": ["strong_input_validation"]
  },
  "execution_script": "sqlmap -u {target_url} --batch --risk=3 --level=5",
  "validation_script": "check_for_db_version_in_output(output)",
  "success_rate": 72.5,
  "avg_execution_time": 180
}
```

---

### Execution Plane Components

#### 1. Attack Orchestration Engine (Celery)

**Responsibilities:**
- Distributed task management
- Parallel attack execution (within rate limits)
- Dependency resolution
- Retry logic with exponential backoff
- Timeout enforcement

**Celery Configuration:**
```python
# execution_plane/celery_app.py
from celery import Celery

app = Celery(
    'aoptool',
    broker='redis://:password@redis:6379/0',
    backend='redis://:password@redis:6379/0'
)

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

@app.task(bind=True, max_retries=3)
def execute_attack(self, attack_id: int, target_id: int):
    try:
        # Load attack definition
        attack = get_attack_from_library(attack_id)
        target = get_target(target_id)

        # Execute attack
        result = run_attack_executor(attack, target)

        # Collect evidence
        evidence_id = collect_evidence(attack_id, target_id, result)

        return {'success': True, 'evidence_id': evidence_id}
    except Exception as e:
        # Retry with exponential backoff
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
```

**Attack Chain Execution:**
```python
@app.task
def orchestrate_attack_plan(plan_id: int):
    # Load plan
    plan = get_attack_plan(plan_id)
    attack_sequence = plan['attack_sequence']

    # Group by dependencies
    phases = resolve_dependencies(attack_sequence)

    # Execute phases
    for phase in phases:
        # Parallel execution within phase
        group_result = group([
            execute_attack.s(attack_id, plan['target_id'])
            for attack_id in phase
        ])()

        # Wait for all in phase to complete
        results = group_result.get()

        # Check if any failed - stop chain if critical
        if any_critical_failure(results, phase):
            break

    # Trigger validation & reporting
    validate_and_report.delay(plan_id)
```

#### 2. Tool Executors

Each pentesting tool has a dedicated executor module:

**Nmap Executor:**
```python
# execution_plane/executors/nmap_executor.py
import subprocess
import xml.etree.ElementTree as ET

def execute_nmap(target: str, flags: str = "-sV -A") -> dict:
    # Build command
    cmd = f"docker run --rm --network host instrumentisto/nmap {flags} -oX - {target}"

    # Execute
    result = subprocess.run(
        cmd,
        shell=True,
        capture_output=True,
        text=True,
        timeout=600  # 10 minutes
    )

    # Parse XML output
    hosts = parse_nmap_xml(result.stdout)

    return {
        'tool': 'nmap',
        'target': target,
        'command': cmd,
        'raw_output': result.stdout,
        'parsed_data': hosts,
        'exit_code': result.returncode
    }

def parse_nmap_xml(xml_output: str) -> list:
    root = ET.fromstring(xml_output)
    hosts = []

    for host in root.findall('host'):
        ip = host.find('address').get('addr')
        open_ports = []

        for port in host.findall('.//port[@state="open"]'):
            port_id = port.get('portid')
            service = port.find('service')

            open_ports.append({
                'port': port_id,
                'protocol': port.get('protocol'),
                'service': service.get('name') if service is not None else 'unknown',
                'version': service.get('version') if service is not None else ''
            })

        hosts.append({
            'ip': ip,
            'open_ports': open_ports
        })

    return hosts
```

**SQLMap Executor:**
```python
# execution_plane/executors/sqlmap_executor.py
def execute_sqlmap(target_url: str, data: str = None, risk: int = 3) -> dict:
    cmd = [
        'docker', 'run', '--rm', '--network', 'host',
        'paoloo/sqlmap',
        '-u', target_url,
        '--batch',
        f'--risk={risk}',
        '--level=5',
        '--output-dir=/tmp/sqlmap'
    ]

    if data:
        cmd.extend(['--data', data])

    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=1800  # 30 minutes
    )

    # Parse output for vulnerabilities
    vulnerabilities = parse_sqlmap_output(result.stdout)

    return {
        'tool': 'sqlmap',
        'target': target_url,
        'command': ' '.join(cmd),
        'raw_output': result.stdout,
        'vulnerabilities': vulnerabilities,
        'exit_code': result.returncode
    }
```

#### 3. Evidence Collector

**Responsibilities:**
- Capture screenshots (Selenium/Playwright)
- Save command outputs
- Store network captures
- Tag with metadata
- Calculate file hashes (SHA-256)
- Upload to MinIO

**Implementation:**
```python
# execution_plane/evidence_collector.py
from minio import Minio
import hashlib
from datetime import datetime

class EvidenceCollector:
    def __init__(self):
        self.minio_client = Minio(
            'minio:9000',
            access_key='minioadmin',
            secret_key='changeme',
            secure=False
        )

    def collect_evidence(
        self,
        execution_id: int,
        evidence_type: str,
        file_path: str = None,
        content: str = None
    ) -> str:
        # Calculate hash
        if file_path:
            with open(file_path, 'rb') as f:
                file_hash = hashlib.sha256(f.read()).hexdigest()
        else:
            file_hash = hashlib.sha256(content.encode()).hexdigest()

        # Create bucket if not exists
        bucket_name = f"execution-{execution_id}"
        if not self.minio_client.bucket_exists(bucket_name):
            self.minio_client.make_bucket(bucket_name)

        # Generate object name
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        object_name = f"{evidence_type}_{timestamp}_{file_hash[:8]}.dat"

        # Upload to MinIO
        if file_path:
            self.minio_client.fput_object(bucket_name, object_name, file_path)
            file_size = os.path.getsize(file_path)
        else:
            from io import BytesIO
            data = BytesIO(content.encode())
            self.minio_client.put_object(
                bucket_name,
                object_name,
                data,
                len(content.encode())
            )
            file_size = len(content.encode())

        # Store metadata in PostgreSQL
        storage_path = f"s3://{bucket_name}/{object_name}"
        evidence_id = self.save_evidence_metadata(
            execution_id,
            evidence_type,
            storage_path,
            file_hash,
            file_size
        )

        return storage_path

    def save_evidence_metadata(self, ...):
        # Insert into PostgreSQL evidence table
        ...
```

---

### Evidence & Validation Plane Components

#### 1. Evidence Store

**PostgreSQL Schema:**
```sql
CREATE TABLE evidence (
    evidence_id SERIAL PRIMARY KEY,
    execution_id INTEGER REFERENCES attack_executions(execution_id) ON DELETE CASCADE,
    evidence_type VARCHAR(100),  -- screenshot, log, pcap, exploit_proof
    storage_path TEXT NOT NULL,  -- MinIO object path
    file_hash VARCHAR(64) NOT NULL,  -- SHA-256
    file_size BIGINT,
    metadata JSONB DEFAULT '{}'::jsonb,
    validated BOOLEAN DEFAULT FALSE,
    captured_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_evidence_execution ON evidence(execution_id);
CREATE INDEX idx_evidence_type ON evidence(evidence_type);
CREATE INDEX idx_evidence_validated ON evidence(validated);
```

#### 2. Results Validator

**Validation Rules:**
```python
# evidence/validator.py
class ResultsValidator:
    def __init__(self):
        self.rules = {
            'sql_injection': self.validate_sql_injection,
            'xss': self.validate_xss,
            'rce': self.validate_rce,
        }

    def validate_sql_injection(self, evidence: dict) -> dict:
        output = evidence['raw_output']

        success_indicators = [
            'SQL syntax error',
            'database version',
            'table dump successful',
            'authentication bypassed',
            'mysql_fetch',
            'ORA-',
            'Microsoft SQL'
        ]

        confidence = 0
        matched_indicators = []

        for indicator in success_indicators:
            if indicator.lower() in output.lower():
                confidence += 15
                matched_indicators.append(indicator)

        # Cross-validate with multiple payloads
        if evidence.get('metadata', {}).get('multiple_payloads_successful'):
            confidence += 25

        # Check for false positives
        false_positive_indicators = [
            'no results',
            'blocked by WAF',
            'permission denied'
        ]

        for fp_indicator in false_positive_indicators:
            if fp_indicator.lower() in output.lower():
                confidence -= 30

        return {
            'validated': confidence >= 60,
            'confidence': min(max(confidence, 0), 100),
            'indicators_matched': matched_indicators,
            'proof': self.extract_proof(output, matched_indicators)
        }

    def extract_proof(self, output: str, indicators: list) -> str:
        # Extract relevant lines containing indicators
        proof_lines = []
        for line in output.split('\n'):
            if any(ind.lower() in line.lower() for ind in indicators):
                proof_lines.append(line.strip())
        return '\n'.join(proof_lines[:10])  # First 10 lines
```

#### 3. Report Generator

**Report Structure:**
```python
# evidence/report_generator.py
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table
from reportlab.lib.styles import getSampleStyleSheet
from jinja2 import Template

class ReportGenerator:
    def generate_pdf_report(self, plan_id: int) -> str:
        # Load plan, executions, evidence, validations
        plan = get_attack_plan(plan_id)
        executions = get_attack_executions(plan_id)
        evidence = get_all_evidence(executions)
        validations = get_all_validations(evidence)

        # Build PDF
        pdf_path = f"/tmp/reports/plan_{plan_id}_report.pdf"
        doc = SimpleDocTemplate(pdf_path, pagesize=letter)
        story = []
        styles = getSampleStyleSheet()

        # 1. Executive Summary
        story.append(Paragraph("Executive Summary", styles['Heading1']))
        story.append(Paragraph(self.generate_executive_summary(validations), styles['BodyText']))
        story.append(Spacer(1, 12))

        # 2. Findings
        story.append(Paragraph("Findings", styles['Heading1']))
        for validation in validations:
            if validation['validated']:
                story.append(self.create_finding_section(validation, styles))

        # 3. Evidence Appendix
        story.append(Paragraph("Evidence Appendix", styles['Heading1']))
        # Add screenshots, outputs, etc.

        doc.build(story)
        return pdf_path

    def generate_executive_summary(self, validations: list) -> str:
        critical = sum(1 for v in validations if v['risk_level'] == 'critical' and v['validated'])
        high = sum(1 for v in validations if v['risk_level'] == 'high' and v['validated'])
        medium = sum(1 for v in validations if v['risk_level'] == 'medium' and v['validated'])
        low = sum(1 for v in validations if v['risk_level'] == 'low' and v['validated'])

        return f"""
        This penetration test identified {critical} critical, {high} high, {medium} medium,
        and {low} low severity vulnerabilities. Immediate remediation is recommended for
        critical and high severity findings.
        """
```

---

### Learning & Evolution Plane Components

#### 1. Attack Memory Store (MongoDB)

**Schema:**
```javascript
{
  "_id": ObjectId("..."),
  "attack_id": 123,
  "attack_name": "SQL Injection (UNION-based)",
  "category": "exploitation",

  "target_contexts": [
    {
      "context_id": "ctx_001",
      "tech_stack": ["PHP 7.4", "MySQL 5.7"],
      "security_measures": ["ModSecurity WAF"],
      "target_type": "web_application",

      "outcomes": [
        {
          "execution_id": 1001,
          "timestamp": ISODate("2025-01-15T10:30:00Z"),
          "success": false,
          "confidence_before": 65,
          "actual_result": "blocked",
          "failure_reason": "WAF detected"
        },
        {
          "execution_id": 1002,
          "timestamp": ISODate("2025-01-15T11:00:00Z"),
          "success": true,
          "confidence_before": 40,
          "actual_result": "database_dump",
          "success_reason": "WAF bypass via encoding"
        }
      ],

      "success_rate": 0.50,
      "total_attempts": 2
    }
  ],

  "global_stats": {
    "total_executions": 150,
    "overall_success_rate": 0.653,
    "avg_confidence_error": 12.5
  },

  "learning_insights": {
    "effective_techniques": ["URL encoding for WAF bypass"],
    "ineffective_techniques": ["Direct UNION without encoding"]
  }
}
```

#### 2. Feedback Loop Processor

**Implementation:**
```python
# learning/feedback_processor.py
from pymongo import MongoClient
from datetime import datetime

class FeedbackLoopProcessor:
    def __init__(self):
        self.mongo_client = MongoClient('mongodb://mongodb:27017/')
        self.db = self.mongo_client['aoptool']
        self.attack_memory = self.db['attack_memory']

    def process_validation_result(self, validation: dict):
        attack_id = validation['attack_id']
        execution = validation['execution']
        target_context = extract_context(execution['target_id'])

        # Update attack memory
        self.update_attack_memory(
            attack_id,
            target_context,
            validation['validated'],
            validation['confidence'],
            execution
        )

        # Check if success rate changed significantly
        memory = self.attack_memory.find_one({'attack_id': attack_id})
        old_rate = memory.get('global_stats', {}).get('overall_success_rate', 0)
        new_rate = self.recalculate_success_rate(memory)

        if abs(new_rate - old_rate) > 0.10:  # 10% change
            # Trigger model update
            trigger_model_update.delay(attack_id)

    def update_attack_memory(self, attack_id, context, success, confidence, execution):
        # Find or create memory record
        memory = self.attack_memory.find_one({'attack_id': attack_id})

        if not memory:
            memory = {
                'attack_id': attack_id,
                'attack_name': execution['attack_name'],
                'category': execution['category'],
                'target_contexts': []
            }

        # Find matching context or create new
        context_record = None
        for ctx in memory.get('target_contexts', []):
            if self.contexts_match(ctx, context):
                context_record = ctx
                break

        if not context_record:
            context_record = {
                'context_id': generate_context_id(context),
                'tech_stack': context['tech_stack'],
                'security_measures': context['security_measures'],
                'target_type': context['target_type'],
                'outcomes': [],
                'success_rate': 0.0,
                'total_attempts': 0
            }
            memory.setdefault('target_contexts', []).append(context_record)

        # Add outcome
        context_record['outcomes'].append({
            'execution_id': execution['execution_id'],
            'timestamp': datetime.utcnow(),
            'success': success,
            'confidence_before': confidence,
            'actual_result': execution['result']
        })

        # Recalculate success rate for this context
        context_record['total_attempts'] += 1
        successes = sum(1 for o in context_record['outcomes'] if o['success'])
        context_record['success_rate'] = successes / context_record['total_attempts']

        # Save to MongoDB
        self.attack_memory.replace_one(
            {'attack_id': attack_id},
            memory,
            upsert=True
        )
```

#### 3. Model Update Pipeline

**MLflow Integration:**
```python
# learning/model_update_pipeline.py
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
import pandas as pd

class ModelUpdatePipeline:
    def __init__(self):
        mlflow.set_tracking_uri('http://mlflow:5000')
        mlflow.set_experiment('confidence_predictor')

    def retrain_confidence_model(self, attack_id: int = None):
        # 1. Extract training data from Attack Memory
        data = self.extract_training_data(attack_id)

        # 2. Feature engineering
        X, y = self.prepare_features(data)

        # 3. Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

        # 4. Train model
        with mlflow.start_run():
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)

            # 5. Evaluate
            accuracy = model.score(X_test, y_test)
            mlflow.log_metric('accuracy', accuracy)

            # 6. Compare with current production model
            current_model = self.load_production_model()
            current_accuracy = current_model.score(X_test, y_test) if current_model else 0

            # 7. Deploy if better
            if accuracy > current_accuracy + 0.05:  # 5% improvement
                mlflow.sklearn.log_model(model, 'model')
                self.promote_to_production(mlflow.active_run().info.run_id)

                return {'deployed': True, 'accuracy': accuracy}
            else:
                return {'deployed': False, 'accuracy': accuracy}

    def prepare_features(self, data: pd.DataFrame) -> tuple:
        # Features: tech_stack (one-hot), security_measures (count),
        #           attack_category, historical_success_rate
        # Target: success (boolean)
        ...
```

---

## Database Schemas

### PostgreSQL Complete Schema

See earlier PostgreSQL schema section in the original prompt for complete table definitions.

**Key Tables:**
- `targets` - Target systems
- `attacks` - Attack library
- `attack_plans` - Planned attack sequences
- `attack_executions` - Execution records
- `evidence` - Evidence metadata
- `validations` - Validation results
- `audit_log` - All user actions
- `scope_whitelist` - Authorized targets

---

## API Specifications

### Control Plane REST API

**Base URL:** `http://localhost:8000`

**Authentication:** JWT Bearer Token

**Endpoints:**

```yaml
/token:
  POST:
    summary: Login and get JWT token
    request:
      username: string
      password: string
    response:
      access_token: string
      token_type: "bearer"

/targets:
  GET:
    summary: List all targets
    parameters:
      scope: optional (in_scope, out_of_scope)
    response:
      - target_id: int
        name: string
        url_or_ip: string
        scope: string

  POST:
    summary: Create new target
    request:
      name: string
      url_or_ip: string
      scope: string
      risk_tolerance: string
      owner_approval: boolean
    response:
      target_id: int
      status: "created"

/attack_plans:
  GET:
    summary: List attack plans
    parameters:
      target_id: optional int
      status: optional string
    response:
      - plan_id: int
        target_id: int
        attack_sequence: int[]
        status: string

  POST:
    summary: Create attack plan
    request:
      target_id: int
      attack_sequence: int[]
      scheduling: string
      max_risk_level: string
    response:
      plan_id: int
      status: string

/attack_plans/{plan_id}/approve:
  POST:
    summary: Approve pending plan
    response:
      message: string

/evidence:
  GET:
    summary: Get evidence records
    parameters:
      execution_id: optional int
      evidence_type: optional string
      validated: optional boolean
    response:
      - evidence_id: int
        execution_id: int
        evidence_type: string
        storage_path: string
        validated: boolean

/ws:
  WebSocket:
    summary: Real-time updates
    messages:
      - attack_started: {plan_id, execution_id}
      - attack_completed: {execution_id, success}
      - evidence_collected: {evidence_id}
      - validation_completed: {validation_id, validated}
```

---

## Security Architecture

### 1. Scope Validation (Primary Defense)

**Hard-stops:**
- All targets must be in whitelist (IP, CIDR, or domain)
- Validation happens before plan creation
- Re-validation before execution
- Audit log of all validation attempts

**Implementation:**
```python
def validate_scope_or_reject(target: str):
    if not scope_validator.validate_target(target):
        log_audit("scope_violation", target)
        raise HTTPException(403, "Out of scope")
```

### 2. Approval Workflows

**Risk-based approval:**
- Low/Medium: Auto-approve
- High: Require human approval
- Critical: Require multi-factor approval

**Implementation:**
```python
def create_attack_plan(plan: AttackPlan):
    if plan.max_risk_level in ['high', 'critical']:
        plan.status = 'pending'
        notify_admin_for_approval(plan.plan_id)
    else:
        plan.status = 'approved'
        trigger_execution(plan.plan_id)
```

### 3. Rate Limiting

**Prevent DoS:**
- Max 10 concurrent attacks per target
- Max 100 requests/minute per tool
- Exponential backoff on failures

### 4. Container Isolation

**Docker security:**
- Each tool in separate container
- No privileged mode except execution_plane (needs Docker socket)
- Network policies (only execution_plane can access external)

### 5. Secrets Management

**Environment variables:**
```bash
# .env file (never commit!)
POSTGRES_PASSWORD=<random>
MONGODB_PASSWORD=<random>
REDIS_PASSWORD=<random>
MINIO_PASSWORD=<random>
JWT_SECRET=<random>
CLAUDE_API_KEY=<api_key>
```

---

## Deployment Architecture

### Local Deployment (Docker Compose)

```yaml
services:
  postgres:
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  mongodb:
    ports: ["27017:27017"]
    volumes: [mongo_data:/data/db]

  redis:
    ports: ["6379:6379"]
    volumes: [redis_data:/data]

  minio:
    ports: ["9000:9000", "9001:9001"]
    volumes: [minio_data:/data]

  control_plane:
    build: ./control_plane
    ports: ["8000:8000"]
    depends_on: [postgres, redis]

  intelligence_plane:
    build: ./intelligence_plane
    depends_on: [postgres, mongodb]

  execution_plane:
    build: ./execution_plane
    depends_on: [redis, postgres, minio]
    volumes: [/var/run/docker.sock:/var/run/docker.sock]

  celery_worker:
    build: ./execution_plane
    command: celery -A tasks worker
    depends_on: [redis]

  web_dashboard:
    build: ./web_dashboard
    ports: ["3000:3000"]
    depends_on: [control_plane]
```

### Hybrid Cloud Deployment (Future)

**Architecture:**
- Control Plane: Local (laptop)
- Intelligence Plane: Local (GPU for custom models)
- Execution Plane: Cloud (scalable compute)
- Databases: Cloud (RDS/Cloud SQL)
- Storage: Cloud (S3/GCS)

**Benefits:**
- Local control and privacy
- Cloud scale for heavy execution
- Cost optimization (only pay for execution time)

---

## Network Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Network (aoptool_network)              │
│                                                                   │
│  ┌─────────────┐      ┌──────────────┐      ┌────────────────┐ │
│  │  PostgreSQL │◄─────┤ Control Plane├─────►│  Redis         │ │
│  │  :5432      │      │ :8000        │      │  :6379         │ │
│  └─────────────┘      └──────┬───────┘      └────────┬───────┘ │
│                               │                       │          │
│  ┌─────────────┐      ┌──────▼──────┐       ┌───────▼────────┐ │
│  │  MongoDB    │◄─────┤Intelligence │       │ Celery Worker  │ │
│  │  :27017     │      │ Plane       │       │                │ │
│  └─────────────┘      └─────────────┘       └────────────────┘ │
│                                                                   │
│  ┌─────────────┐      ┌──────────────┐                          │
│  │  MinIO      │◄─────┤  Execution   │                          │
│  │  :9000      │      │  Plane       │                          │
│  └─────────────┘      └──────┬───────┘                          │
│                               │                                   │
│                       ┌───────▼────────┐                         │
│                       │  Tool Executors│                         │
│                       │ (Nmap, SQLMap, │                         │
│                       │  Nuclei, etc.) │                         │
│                       └────────────────┘                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │
                        ┌───────▼────────┐
                        │ Web Dashboard  │
                        │ :3000          │
                        └────────────────┘
                                │
                                │
                        ┌───────▼────────┐
                        │  User Browser  │
                        └────────────────┘
```

---

**End of Architecture Documentation**

*This document will be updated as implementation progresses.*
