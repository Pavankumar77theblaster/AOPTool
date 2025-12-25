"""
JSON Exporter
Exports report data as JSON for API consumption and integration
"""

import json
from typing import Dict, Any
from datetime import datetime
import os


class JSONExporter:
    """Export reports to JSON format"""

    @staticmethod
    def export(data: Dict[str, Any], output_path: str, pretty: bool = True) -> str:
        """
        Export data to JSON file

        Args:
            data: Dictionary to export
            output_path: Path to save JSON file
            pretty: If True, use indentation for readability

        Returns:
            Path to generated JSON file
        """
        # Create output directory
        os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)

        # Convert datetime objects to ISO format strings
        cleaned_data = JSONExporter._clean_data(data)

        # Write JSON
        with open(output_path, 'w', encoding='utf-8') as f:
            if pretty:
                json.dump(cleaned_data, f, indent=2, ensure_ascii=False)
            else:
                json.dump(cleaned_data, f, ensure_ascii=False)

        return output_path

    @staticmethod
    def _clean_data(obj: Any) -> Any:
        """
        Recursively clean data for JSON serialization

        Converts datetime objects to ISO strings
        """
        if isinstance(obj, datetime):
            return obj.isoformat()
        elif isinstance(obj, dict):
            return {k: JSONExporter._clean_data(v) for k, v in obj.items()}
        elif isinstance(obj, (list, tuple)):
            return [JSONExporter._clean_data(item) for item in obj]
        else:
            return obj

    @staticmethod
    def to_string(data: Dict[str, Any], pretty: bool = True) -> str:
        """
        Convert data to JSON string

        Args:
            data: Dictionary to convert
            pretty: If True, use indentation

        Returns:
            JSON string
        """
        cleaned_data = JSONExporter._clean_data(data)

        if pretty:
            return json.dumps(cleaned_data, indent=2, ensure_ascii=False)
        else:
            return json.dumps(cleaned_data, ensure_ascii=False)


if __name__ == "__main__":
    # Example usage
    sample_data = {
        "report_id": "RPT-2025-001",
        "generated_at": datetime.utcnow(),
        "target": {
            "name": "example.com",
            "url": "https://example.com"
        },
        "findings": [
            {
                "severity": "critical",
                "name": "SQL Injection",
                "cvss": 9.8,
                "discovered_at": datetime.utcnow()
            },
            {
                "severity": "high",
                "name": "XSS",
                "cvss": 7.3,
                "discovered_at": datetime.utcnow()
            }
        ],
        "statistics": {
            "total_findings": 2,
            "critical": 1,
            "high": 1
        }
    }

    output = JSONExporter.export(sample_data, "test_report.json")
    print(f"JSON generated: {output}")

    # Also as string
    json_str = JSONExporter.to_string(sample_data)
    print(f"\nJSON string ({len(json_str)} bytes)")
