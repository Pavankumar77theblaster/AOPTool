"""
HTML Exporter
Generates standalone HTML reports
"""

from typing import Dict
import os


class HTMLExporter:
    """Export reports to HTML format"""

    def __init__(self, template_dir: str):
        self.template_dir = template_dir

    def export(
        self,
        html_content: str,
        output_path: str,
        standalone: bool = True
    ) -> str:
        """
        Export HTML content to file

        Args:
            html_content: HTML string
            output_path: Path to save HTML file
            standalone: If True, wrap in full HTML document

        Returns:
            Path to generated HTML file
        """
        # Create output directory
        os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)

        if standalone and not html_content.strip().startswith('<!DOCTYPE'):
            # Wrap in full HTML document
            html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Penetration Test Report</title>
    <style>
        {self._get_default_styles()}
    </style>
</head>
<body>
    {html_content}
</body>
</html>
"""

        # Write to file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        return output_path

    def export_from_template(
        self,
        template_name: str,
        context: Dict,
        output_path: str
    ) -> str:
        """
        Export HTML from Jinja2 template

        Args:
            template_name: Name of template file
            context: Template context data
            output_path: Path to save HTML

        Returns:
            Path to generated HTML
        """
        from jinja2 import Environment, FileSystemLoader

        # Load template
        env = Environment(loader=FileSystemLoader(self.template_dir))
        template = env.get_template(template_name)

        # Render HTML
        html_content = template.render(**context)

        # Save to file
        return self.export(html_content, output_path, standalone=False)

    def _get_default_styles(self) -> str:
        """Get default CSS styles for standalone HTML"""
        return """
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background: #f9fafb;
                padding: 20px;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 {
                color: #1e40af;
                border-bottom: 3px solid #06b6d4;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            h2 {
                color: #1e40af;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 8px;
                margin-top: 30px;
                margin-bottom: 15px;
            }
            h3 {
                color: #374151;
                margin-top: 20px;
                margin-bottom: 10px;
            }
            p {
                margin-bottom: 12px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            th, td {
                border: 1px solid #d1d5db;
                padding: 12px;
                text-align: left;
            }
            th {
                background-color: #f3f4f6;
                font-weight: 600;
            }
            tr:nth-child(even) {
                background-color: #f9fafb;
            }
            .severity-critical {
                background-color: #fee2e2;
                color: #991b1b;
                padding: 4px 8px;
                border-radius: 4px;
                font-weight: 600;
                display: inline-block;
            }
            .severity-high {
                background-color: #fed7aa;
                color: #9a3412;
                padding: 4px 8px;
                border-radius: 4px;
                font-weight: 600;
                display: inline-block;
            }
            .severity-medium {
                background-color: #fef3c7;
                color: #92400e;
                padding: 4px 8px;
                border-radius: 4px;
                font-weight: 600;
                display: inline-block;
            }
            .severity-low {
                background-color: #d1fae5;
                color: #065f46;
                padding: 4px 8px;
                border-radius: 4px;
                font-weight: 600;
                display: inline-block;
            }
            .code-block {
                background-color: #1f2937;
                color: #e5e7eb;
                border-radius: 6px;
                padding: 16px;
                font-family: 'Courier New', monospace;
                font-size: 13px;
                overflow-x: auto;
                margin: 15px 0;
            }
            .finding {
                border-left: 4px solid #06b6d4;
                padding-left: 20px;
                margin: 20px 0;
                background: #f9fafb;
                padding: 15px 15px 15px 20px;
                border-radius: 4px;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }
            .stat-card {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
            }
            .stat-value {
                font-size: 32px;
                font-weight: bold;
                color: #06b6d4;
                margin-bottom: 5px;
            }
            .stat-label {
                font-size: 14px;
                color: #6b7280;
            }
            .chart-container {
                text-align: center;
                margin: 30px 0;
            }
            .chart-container img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
            }
        """


if __name__ == "__main__":
    # Example usage
    exporter = HTMLExporter(template_dir="../templates")

    html = """
    <div class="container">
        <h1>Penetration Test Report</h1>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">27</div>
                <div class="stat-label">Total Findings</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">2</div>
                <div class="stat-label">Critical</div>
            </div>
        </div>

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
        </table>
    </div>
    """

    output = exporter.export(html, "test_report.html")
    print(f"HTML generated: {output}")
