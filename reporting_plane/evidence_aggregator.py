"""
Evidence Aggregator
Collects and organizes evidence from attack executions for reporting
"""

import asyncio
from typing import List, Dict, Optional
from datetime import datetime
import asyncpg
import os


class EvidenceAggregator:
    """Aggregate evidence from database for report generation"""

    def __init__(self, db_url: str):
        self.db_url = db_url
        self.pool: Optional[asyncpg.Pool] = None

    async def connect(self):
        """Establish database connection pool"""
        self.pool = await asyncpg.create_pool(self.db_url)

    async def close(self):
        """Close database connection"""
        if self.pool:
            await self.pool.close()

    async def get_execution_details(self, execution_id: int) -> Dict:
        """Get full execution details"""
        async with self.pool.acquire() as conn:
            execution = await conn.fetchrow("""
                SELECT
                    ae.*,
                    t.name as target_name,
                    t.url_or_ip as target_url,
                    t.scope as target_scope,
                    ap.name as plan_name,
                    ap.description as plan_description,
                    ap.risk_level as plan_risk_level
                FROM attack_executions ae
                LEFT JOIN targets t ON ae.target_id = t.id
                LEFT JOIN attack_plans ap ON ae.plan_id = ap.id
                WHERE ae.id = $1
            """, execution_id)

            if not execution:
                return None

            return dict(execution)

    async def get_execution_attacks(self, execution_id: int) -> List[Dict]:
        """Get all attacks in execution with results"""
        async with self.pool.acquire() as conn:
            attacks = await conn.fetch("""
                SELECT
                    a.id,
                    a.name,
                    a.description,
                    a.category,
                    a.risk_level,
                    a.attack_type,
                    pas.sequence_order,
                    ae.status,
                    ae.started_at,
                    ae.completed_at,
                    ae.result
                FROM attack_executions ae
                JOIN attack_plans ap ON ae.plan_id = ap.id
                JOIN plan_attack_sequences pas ON ap.id = pas.plan_id
                JOIN attacks a ON pas.attack_id = a.id
                WHERE ae.id = $1
                ORDER BY pas.sequence_order
            """, execution_id)

            return [dict(attack) for attack in attacks]

    async def get_execution_evidence(self, execution_id: int) -> List[Dict]:
        """Get all evidence files for execution"""
        async with self.pool.acquire() as conn:
            evidence = await conn.fetch("""
                SELECT
                    id,
                    execution_id,
                    attack_id,
                    evidence_type,
                    file_path,
                    file_name,
                    file_size,
                    mime_type,
                    description,
                    created_at
                FROM evidence
                WHERE execution_id = $1
                ORDER BY created_at
            """, execution_id)

            return [dict(e) for e in evidence]

    async def get_target_details(self, target_id: int) -> Dict:
        """Get target information"""
        async with self.pool.acquire() as conn:
            target = await conn.fetchrow("""
                SELECT
                    id,
                    name,
                    url_or_ip,
                    description,
                    scope,
                    risk_tolerance,
                    owner_approval,
                    created_at
                FROM targets
                WHERE id = $1
            """, target_id)

            return dict(target) if target else None

    async def aggregate_for_report(self, execution_id: int) -> Dict:
        """
        Aggregate all data needed for report generation

        Returns:
            {
                "execution": {...},
                "target": {...},
                "attacks": [...],
                "evidence": [...],
                "findings": [...],
                "statistics": {...}
            }
        """
        # Get execution details
        execution = await self.get_execution_details(execution_id)
        if not execution:
            raise ValueError(f"Execution {execution_id} not found")

        # Get target details
        target = await self.get_target_details(execution["target_id"])

        # Get attacks and results
        attacks = await self.get_execution_attacks(execution_id)

        # Get evidence
        evidence = await self.get_execution_evidence(execution_id)

        # Analyze findings (successful attacks)
        findings = self._analyze_findings(attacks, evidence)

        # Calculate statistics
        statistics = self._calculate_statistics(execution, attacks, findings)

        return {
            "execution": execution,
            "target": target,
            "attacks": attacks,
            "evidence": evidence,
            "findings": findings,
            "statistics": statistics,
            "generated_at": datetime.utcnow().isoformat()
        }

    def _analyze_findings(self, attacks: List[Dict], evidence: List[Dict]) -> List[Dict]:
        """
        Analyze attacks to extract findings/vulnerabilities

        A finding is a successful attack that discovered a vulnerability
        """
        findings = []

        for attack in attacks:
            if attack["status"] == "completed" and attack.get("result"):
                result = attack["result"]

                # Check if attack was successful
                if isinstance(result, dict):
                    success = result.get("success", False)
                    details = result.get("details", "")
                else:
                    # Simple heuristic
                    success = "success" in str(result).lower()
                    details = str(result)

                if success:
                    # Get related evidence
                    related_evidence = [
                        e for e in evidence
                        if e.get("attack_id") == attack["id"]
                    ]

                    finding = {
                        "attack_id": attack["id"],
                        "attack_name": attack["name"],
                        "category": attack["category"],
                        "risk_level": attack["risk_level"],
                        "description": attack["description"],
                        "details": details,
                        "evidence_count": len(related_evidence),
                        "evidence_files": [e["file_name"] for e in related_evidence],
                        "discovered_at": attack.get("completed_at", attack.get("started_at"))
                    }

                    findings.append(finding)

        return findings

    def _calculate_statistics(
        self,
        execution: Dict,
        attacks: List[Dict],
        findings: List[Dict]
    ) -> Dict:
        """Calculate report statistics"""

        total_attacks = len(attacks)
        completed_attacks = len([a for a in attacks if a["status"] == "completed"])
        failed_attacks = len([a for a in attacks if a["status"] == "failed"])
        total_findings = len(findings)

        # Count by severity
        findings_by_severity = {
            "critical": len([f for f in findings if f["risk_level"] == "critical"]),
            "high": len([f for f in findings if f["risk_level"] == "high"]),
            "medium": len([f for f in findings if f["risk_level"] == "medium"]),
            "low": len([f for f in findings if f["risk_level"] == "low"])
        }

        # Count by category
        findings_by_category = {}
        for finding in findings:
            category = finding["category"]
            findings_by_category[category] = findings_by_category.get(category, 0) + 1

        # Calculate duration
        if execution.get("started_at") and execution.get("completed_at"):
            duration = execution["completed_at"] - execution["started_at"]
            duration_seconds = duration.total_seconds()
        else:
            duration_seconds = 0

        return {
            "total_attacks": total_attacks,
            "completed_attacks": completed_attacks,
            "failed_attacks": failed_attacks,
            "success_rate": round((completed_attacks / total_attacks * 100) if total_attacks > 0 else 0, 1),
            "total_findings": total_findings,
            "findings_by_severity": findings_by_severity,
            "findings_by_category": findings_by_category,
            "duration_seconds": duration_seconds,
            "duration_formatted": self._format_duration(duration_seconds)
        }

    @staticmethod
    def _format_duration(seconds: float) -> str:
        """Format duration in human-readable format"""
        if seconds < 60:
            return f"{int(seconds)}s"
        elif seconds < 3600:
            minutes = int(seconds / 60)
            secs = int(seconds % 60)
            return f"{minutes}m {secs}s"
        else:
            hours = int(seconds / 3600)
            minutes = int((seconds % 3600) / 60)
            return f"{hours}h {minutes}m"


async def get_report_data(execution_id: int, db_url: str) -> Dict:
    """
    Convenience function to get report data for an execution

    Usage:
        data = await get_report_data(123, DATABASE_URL)
    """
    aggregator = EvidenceAggregator(db_url)
    await aggregator.connect()

    try:
        data = await aggregator.aggregate_for_report(execution_id)
        return data
    finally:
        await aggregator.close()


if __name__ == "__main__":
    # Example usage
    async def test():
        import os
        db_url = os.getenv("DATABASE_URL", "postgresql://aoptool_user:changeme@localhost:5432/aoptool")

        # Test with execution ID 1
        try:
            data = await get_report_data(1, db_url)
            print("Report Data:")
            print(f"  Execution: {data['execution']['id']}")
            print(f"  Target: {data['target']['name']}")
            print(f"  Total Attacks: {data['statistics']['total_attacks']}")
            print(f"  Total Findings: {data['statistics']['total_findings']}")
            print(f"  Duration: {data['statistics']['duration_formatted']}")
        except Exception as e:
            print(f"Error: {e}")

    asyncio.run(test())
