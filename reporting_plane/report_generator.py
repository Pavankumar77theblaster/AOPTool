"""
Report Generator
Core module for generating penetration test reports in multiple formats
"""

from typing import Dict, Optional, List
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
import os

from evidence_aggregator import EvidenceAggregator
from vulnerability_scorer import score_vulnerability, CVSSScorer
from utils.chart_generator import ChartGenerator
from utils.timeline_builder import TimelineBuilder
from exporters.pdf_exporter import PDFExporter
from exporters.html_exporter import HTMLExporter
from exporters.json_exporter import JSONExporter
from exporters.csv_exporter import CSVExporter


class ReportGenerator:
    """Generate comprehensive penetration test reports"""

    def __init__(
        self,
        db_url: str,
        template_dir: str = "templates",
        output_dir: str = "reports"
    ):
        self.db_url = db_url
        self.template_dir = template_dir
        self.output_dir = output_dir

        # Create output directory
        os.makedirs(output_dir, exist_ok=True)

        # Initialize components
        self.aggregator = None  # Initialized in async context
        self.chart_generator = ChartGenerator(dark_theme=True)
        self.timeline_builder = TimelineBuilder()

        # Initialize exporters
        self.pdf_exporter = PDFExporter(template_dir)
        self.html_exporter = HTMLExporter(template_dir)

        # Initialize Jinja2
        self.jinja_env = Environment(loader=FileSystemLoader(template_dir))

    async def initialize(self):
        """Initialize async components"""
        self.aggregator = EvidenceAggregator(self.db_url)
        await self.aggregator.connect()

    async def close(self):
        """Close connections"""
        if self.aggregator:
            await self.aggregator.close()

    async def generate_full_report(
        self,
        execution_id: int,
        report_name: Optional[str] = None,
        formats: Optional[List[str]] = None
    ) -> Dict[str, str]:
        """
        Generate complete report in multiple formats

        Args:
            execution_id: ID of attack execution
            report_name: Custom report name (default: auto-generated)
            formats: List of formats to generate ['pdf', 'html', 'json', 'csv']
                    Default: all formats

        Returns:
            Dict mapping format to file path
        """
        if formats is None:
            formats = ['pdf', 'html', 'json', 'csv']

        # Gather all report data
        report_data = await self._prepare_report_data(execution_id)

        # Generate report name
        if not report_name:
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            report_name = f"pentest_report_{execution_id}_{timestamp}"

        # Generate reports in requested formats
        output_files = {}

        if 'json' in formats:
            json_path = os.path.join(self.output_dir, f"{report_name}.json")
            JSONExporter.export(report_data, json_path)
            output_files['json'] = json_path

        if 'csv' in formats:
            # Export findings CSV
            csv_path = os.path.join(self.output_dir, f"{report_name}_findings.csv")
            CSVExporter.export_findings(report_data['findings'], csv_path)
            output_files['csv_findings'] = csv_path

            # Export statistics CSV
            stats_csv_path = os.path.join(self.output_dir, f"{report_name}_statistics.csv")
            CSVExporter.export_statistics(report_data['statistics'], stats_csv_path)
            output_files['csv_statistics'] = stats_csv_path

        if 'html' in formats:
            html_path = os.path.join(self.output_dir, f"{report_name}.html")
            await self._generate_html_report(report_data, html_path)
            output_files['html'] = html_path

        if 'pdf' in formats:
            pdf_path = os.path.join(self.output_dir, f"{report_name}.pdf")
            await self._generate_pdf_report(report_data, pdf_path)
            output_files['pdf'] = pdf_path

        return output_files

    async def _prepare_report_data(self, execution_id: int) -> Dict:
        """Prepare all data needed for report generation"""
        # Aggregate base data
        data = await self.aggregator.aggregate_for_report(execution_id)

        # Score vulnerabilities
        scored_findings = []
        for finding in data['findings']:
            # Get CVSS score
            cvss = CVSSScorer.auto_score_from_attack(
                finding['attack_name'],
                success=True
            )
            finding['cvss'] = cvss
            scored_findings.append(finding)

        data['findings'] = scored_findings

        # Build timeline
        timeline = self.timeline_builder.build_timeline(data['attacks'])
        timeline_html = self.timeline_builder.format_timeline_html(timeline)

        data['timeline'] = timeline
        data['timeline_html'] = timeline_html

        # Generate charts
        charts = self._generate_charts(data)
        data['charts'] = charts

        return data

    def _generate_charts(self, data: Dict) -> Dict[str, str]:
        """Generate all charts for report"""
        charts = {}

        # Severity pie chart
        if data['statistics']['total_findings'] > 0:
            severity_chart = self.chart_generator.generate_severity_pie_chart(
                data['statistics']['findings_by_severity'],
                title="Findings by Severity"
            )
            charts['severity_chart'] = severity_chart

        # Category bar chart
        if data['statistics']['findings_by_category']:
            category_chart = self.chart_generator.generate_category_bar_chart(
                data['statistics']['findings_by_category'],
                title="Findings by Category"
            )
            charts['category_chart'] = category_chart

        # Success rate gauge
        success_chart = self.chart_generator.generate_success_rate_gauge(
            data['statistics']['success_rate'],
            title="Attack Success Rate"
        )
        charts['success_chart'] = success_chart

        # Attack timeline
        if data.get('attacks'):
            timeline_chart = self.chart_generator.generate_attack_timeline(
                data['attacks'],
                title="Attack Execution Timeline"
            )
            charts['timeline_chart'] = timeline_chart

        return charts

    async def _generate_html_report(self, data: Dict, output_path: str):
        """Generate HTML report"""
        # Render technical report template
        template = self.jinja_env.get_template('technical_report.html')
        html_content = template.render(**data)

        # Export
        self.html_exporter.export(html_content, output_path)

    async def _generate_pdf_report(self, data: Dict, output_path: str):
        """Generate PDF report"""
        # Render executive summary template
        template = self.jinja_env.get_template('executive_summary.html')
        html_content = template.render(**data)

        # Convert to PDF
        self.pdf_exporter.export(html_content, output_path)

    async def generate_executive_summary(
        self,
        execution_id: int,
        output_format: str = 'pdf'
    ) -> str:
        """
        Generate executive summary report

        Args:
            execution_id: ID of attack execution
            output_format: 'pdf' or 'html'

        Returns:
            Path to generated report
        """
        # Prepare data
        data = await self._prepare_report_data(execution_id)

        # Render template
        template = self.jinja_env.get_template('executive_summary.html')
        html_content = template.render(**data)

        # Generate output
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        base_name = f"executive_summary_{execution_id}_{timestamp}"

        if output_format == 'pdf':
            output_path = os.path.join(self.output_dir, f"{base_name}.pdf")
            self.pdf_exporter.export(html_content, output_path)
        else:
            output_path = os.path.join(self.output_dir, f"{base_name}.html")
            self.html_exporter.export(html_content, output_path)

        return output_path


if __name__ == "__main__":
    import asyncio

    async def test():
        db_url = os.getenv("DATABASE_URL", "postgresql://aoptool_user:changeme@localhost:5432/aoptool")

        generator = ReportGenerator(db_url)
        await generator.initialize()

        try:
            # Generate full report for execution ID 1
            output_files = await generator.generate_full_report(
                execution_id=1,
                formats=['json', 'csv', 'html', 'pdf']
            )

            print("Generated reports:")
            for format_type, file_path in output_files.items():
                print(f"  {format_type}: {file_path}")

        finally:
            await generator.close()

    asyncio.run(test())
