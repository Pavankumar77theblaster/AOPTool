"""
CSV Exporter
Exports findings data as CSV for spreadsheet analysis
"""

import csv
from typing import List, Dict, Any
from datetime import datetime
import os


class CSVExporter:
    """Export report findings to CSV format"""

    @staticmethod
    def export_findings(
        findings: List[Dict],
        output_path: str,
        include_headers: bool = True
    ) -> str:
        """
        Export findings to CSV file

        Args:
            findings: List of finding dictionaries
            output_path: Path to save CSV file
            include_headers: Include column headers

        Returns:
            Path to generated CSV file
        """
        # Create output directory
        os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)

        if not findings:
            # Create empty file with headers only
            with open(output_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                if include_headers:
                    writer.writerow(['ID', 'Severity', 'Name', 'Category', 'CVSS', 'Description', 'Evidence Count', 'Discovered At'])
            return output_path

        # Define column headers
        headers = [
            'ID',
            'Severity',
            'Name',
            'Category',
            'CVSS Score',
            'CVSS Vector',
            'Description',
            'Details',
            'Evidence Count',
            'Evidence Files',
            'Discovered At'
        ]

        # Write CSV
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)

            if include_headers:
                writer.writerow(headers)

            for idx, finding in enumerate(findings, 1):
                # Extract CVSS data
                cvss_data = finding.get('cvss', {})
                cvss_score = cvss_data.get('base_score', 'N/A') if isinstance(cvss_data, dict) else 'N/A'
                cvss_vector = cvss_data.get('vector_string', 'N/A') if isinstance(cvss_data, dict) else 'N/A'

                # Format evidence files
                evidence_files = finding.get('evidence_files', [])
                evidence_str = ', '.join(evidence_files) if evidence_files else 'None'

                # Format timestamp
                discovered_at = finding.get('discovered_at')
                if isinstance(discovered_at, datetime):
                    discovered_str = discovered_at.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    discovered_str = str(discovered_at) if discovered_at else 'Unknown'

                row = [
                    finding.get('attack_id', idx),
                    finding.get('risk_level', finding.get('severity', 'Unknown')).upper(),
                    finding.get('attack_name', finding.get('name', 'Unknown')),
                    finding.get('category', 'Unknown'),
                    cvss_score,
                    cvss_vector,
                    finding.get('description', ''),
                    finding.get('details', ''),
                    finding.get('evidence_count', len(evidence_files)),
                    evidence_str,
                    discovered_str
                ]

                writer.writerow(row)

        return output_path

    @staticmethod
    def export_statistics(
        statistics: Dict[str, Any],
        output_path: str
    ) -> str:
        """
        Export statistics to CSV file

        Args:
            statistics: Statistics dictionary
            output_path: Path to save CSV file

        Returns:
            Path to generated CSV file
        """
        # Create output directory
        os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)

        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)

            # Headers
            writer.writerow(['Metric', 'Value'])

            # Overall statistics
            writer.writerow(['Total Attacks', statistics.get('total_attacks', 0)])
            writer.writerow(['Completed Attacks', statistics.get('completed_attacks', 0)])
            writer.writerow(['Failed Attacks', statistics.get('failed_attacks', 0)])
            writer.writerow(['Success Rate (%)', statistics.get('success_rate', 0)])
            writer.writerow(['Total Findings', statistics.get('total_findings', 0)])
            writer.writerow(['Duration', statistics.get('duration_formatted', 'Unknown')])

            # Blank row
            writer.writerow([])

            # Findings by severity
            writer.writerow(['Severity Breakdown', ''])
            findings_by_severity = statistics.get('findings_by_severity', {})
            for severity, count in findings_by_severity.items():
                writer.writerow([f'  {severity.upper()}', count])

            # Blank row
            writer.writerow([])

            # Findings by category
            writer.writerow(['Category Breakdown', ''])
            findings_by_category = statistics.get('findings_by_category', {})
            for category, count in findings_by_category.items():
                writer.writerow([f'  {category}', count])

        return output_path


if __name__ == "__main__":
    # Example usage
    sample_findings = [
        {
            "attack_id": 1,
            "attack_name": "SQL Injection Test",
            "category": "Web Application",
            "risk_level": "critical",
            "cvss": {
                "base_score": 9.8,
                "vector_string": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
            },
            "description": "SQL injection vulnerability in login form",
            "details": "The application is vulnerable to SQL injection attacks",
            "evidence_count": 3,
            "evidence_files": ["sqli_1.txt", "sqli_2.txt", "sqli_screenshot.png"],
            "discovered_at": datetime.utcnow()
        },
        {
            "attack_id": 2,
            "attack_name": "XSS Detection",
            "category": "Web Application",
            "risk_level": "high",
            "cvss": {
                "base_score": 7.3,
                "vector_string": "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N"
            },
            "description": "Cross-site scripting vulnerability",
            "details": "Reflected XSS in search parameter",
            "evidence_count": 2,
            "evidence_files": ["xss_1.html", "xss_screenshot.png"],
            "discovered_at": datetime.utcnow()
        }
    ]

    sample_statistics = {
        "total_attacks": 10,
        "completed_attacks": 8,
        "failed_attacks": 2,
        "success_rate": 80.0,
        "total_findings": 2,
        "duration_formatted": "5m 32s",
        "findings_by_severity": {
            "critical": 1,
            "high": 1
        },
        "findings_by_category": {
            "Web Application": 2
        }
    }

    # Export findings
    findings_output = CSVExporter.export_findings(sample_findings, "test_findings.csv")
    print(f"Findings CSV generated: {findings_output}")

    # Export statistics
    stats_output = CSVExporter.export_statistics(sample_statistics, "test_statistics.csv")
    print(f"Statistics CSV generated: {stats_output}")
