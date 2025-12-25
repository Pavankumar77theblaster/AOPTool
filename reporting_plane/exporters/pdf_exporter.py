"""
PDF Exporter
Generates PDF reports using WeasyPrint
"""

from weasyprint import HTML, CSS
from typing import Dict
import os
from datetime import datetime


class PDFExporter:
    """Export reports to PDF format"""

    def __init__(self, template_dir: str):
        self.template_dir = template_dir

    def export(
        self,
        html_content: str,
        output_path: str,
        css_file: Optional[str] = None
    ) -> str:
        """
        Export HTML content to PDF

        Args:
            html_content: HTML string to convert
            output_path: Path to save PDF file
            css_file: Optional custom CSS file path

        Returns:
            Path to generated PDF file
        """
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)

        # Default CSS for PDF styling
        default_css = CSS(string='''
            @page {
                size: A4;
                margin: 2cm;
                @bottom-right {
                    content: "Page " counter(page) " of " counter(pages);
                    font-size: 10px;
                    color: #666;
                }
            }
            body {
                font-family: Arial, sans-serif;
                font-size: 11px;
                line-height: 1.6;
                color: #333;
            }
            h1 {
                color: #1e40af;
                border-bottom: 3px solid #06b6d4;
                padding-bottom: 10px;
                margin-top: 0;
            }
            h2 {
                color: #1e40af;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 5px;
                margin-top: 25px;
            }
            h3 {
                color: #374151;
                margin-top: 20px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
                page-break-inside: avoid;
            }
            th, td {
                border: 1px solid #d1d5db;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #f3f4f6;
                font-weight: bold;
            }
            .severity-critical {
                background-color: #fee2e2;
                color: #991b1b;
                padding: 2px 8px;
                border-radius: 4px;
                font-weight: bold;
            }
            .severity-high {
                background-color: #fed7aa;
                color: #9a3412;
                padding: 2px 8px;
                border-radius: 4px;
                font-weight: bold;
            }
            .severity-medium {
                background-color: #fef3c7;
                color: #92400e;
                padding: 2px 8px;
                border-radius: 4px;
                font-weight: bold;
            }
            .severity-low {
                background-color: #d1fae5;
                color: #065f46;
                padding: 2px 8px;
                border-radius: 4px;
                font-weight: bold;
            }
            .code-block {
                background-color: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                padding: 12px;
                font-family: 'Courier New', monospace;
                font-size: 10px;
                overflow-x: auto;
                page-break-inside: avoid;
            }
            .finding {
                border-left: 4px solid #06b6d4;
                padding-left: 15px;
                margin: 15px 0;
                page-break-inside: avoid;
            }
            .chart-container {
                text-align: center;
                margin: 20px 0;
                page-break-inside: avoid;
            }
            .chart-container img {
                max-width: 100%;
                height: auto;
            }
        ''')

        # Load custom CSS if provided
        stylesheets = [default_css]
        if css_file and os.path.exists(css_file):
            stylesheets.append(CSS(filename=css_file))

        # Generate PDF
        html = HTML(string=html_content)
        html.write_pdf(output_path, stylesheets=stylesheets)

        return output_path

    def export_from_template(
        self,
        template_name: str,
        context: Dict,
        output_path: str
    ) -> str:
        """
        Export PDF from Jinja2 template

        Args:
            template_name: Name of template file (e.g., 'executive_summary.html')
            context: Template context data
            output_path: Path to save PDF

        Returns:
            Path to generated PDF
        """
        from jinja2 import Environment, FileSystemLoader

        # Load template
        env = Environment(loader=FileSystemLoader(self.template_dir))
        template = env.get_template(template_name)

        # Render HTML
        html_content = template.render(**context)

        # Export to PDF
        return self.export(html_content, output_path)


if __name__ == "__main__":
    # Example usage
    exporter = PDFExporter(template_dir="../templates")

    # Simple HTML to PDF
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Test Report</title>
    </head>
    <body>
        <h1>Penetration Test Report</h1>
        <h2>Executive Summary</h2>
        <p>This is a test report generated by AOPTool.</p>

        <h2>Findings</h2>
        <table>
            <tr>
                <th>Severity</th>
                <th>Finding</th>
                <th>CVSS</th>
            </tr>
            <tr>
                <td><span class="severity-critical">CRITICAL</span></td>
                <td>SQL Injection</td>
                <td>9.8</td>
            </tr>
            <tr>
                <td><span class="severity-high">HIGH</span></td>
                <td>XSS Vulnerability</td>
                <td>7.3</td>
            </tr>
        </table>
    </body>
    </html>
    """

    output = exporter.export(html, "test_report.pdf")
    print(f"PDF generated: {output}")
