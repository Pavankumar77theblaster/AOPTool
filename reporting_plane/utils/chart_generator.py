"""
Chart Generator
Creates visualizations for penetration test reports
"""

import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from typing import Dict, List, Optional
import io
import base64


class ChartGenerator:
    """Generate charts for penetration test reports"""

    # Color scheme for dark theme reports
    COLORS = {
        "critical": "#dc2626",  # Red
        "high": "#ea580c",      # Orange
        "medium": "#f59e0b",    # Yellow
        "low": "#10b981",       # Green
        "none": "#6b7280",      # Gray
        "primary": "#06b6d4",   # Cyan
        "background": "#111827",
        "text": "#e5e7eb"
    }

    def __init__(self, dark_theme: bool = True):
        self.dark_theme = dark_theme
        if dark_theme:
            plt.style.use('dark_background')

    def generate_severity_pie_chart(
        self,
        findings_by_severity: Dict[str, int],
        title: str = "Findings by Severity"
    ) -> str:
        """
        Generate pie chart of findings by severity

        Returns base64-encoded PNG image
        """
        # Filter out zero values
        data = {k: v for k, v in findings_by_severity.items() if v > 0}

        if not data:
            return None

        fig, ax = plt.subplots(figsize=(8, 6))

        # Get colors for each severity
        colors = [self.COLORS.get(severity, self.COLORS["none"]) for severity in data.keys()]

        # Create pie chart
        wedges, texts, autotexts = ax.pie(
            data.values(),
            labels=[f"{k.upper()}\n({v})" for k, v in data.items()],
            colors=colors,
            autopct='%1.1f%%',
            startangle=90,
            textprops={'color': self.COLORS["text"], 'fontsize': 10}
        )

        # Make percentage text bold
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')

        ax.set_title(title, color=self.COLORS["text"], fontsize=14, fontweight='bold', pad=20)

        # Convert to base64
        return self._fig_to_base64(fig)

    def generate_category_bar_chart(
        self,
        findings_by_category: Dict[str, int],
        title: str = "Findings by Category"
    ) -> str:
        """
        Generate horizontal bar chart of findings by category

        Returns base64-encoded PNG image
        """
        if not findings_by_category:
            return None

        fig, ax = plt.subplots(figsize=(10, 6))

        categories = list(findings_by_category.keys())
        counts = list(findings_by_category.values())

        # Create horizontal bar chart
        bars = ax.barh(categories, counts, color=self.COLORS["primary"], edgecolor=self.COLORS["text"], linewidth=0.5)

        # Add value labels on bars
        for i, (bar, count) in enumerate(zip(bars, counts)):
            ax.text(
                count + 0.1,
                i,
                str(count),
                va='center',
                color=self.COLORS["text"],
                fontweight='bold'
            )

        ax.set_xlabel('Number of Findings', color=self.COLORS["text"], fontsize=11)
        ax.set_title(title, color=self.COLORS["text"], fontsize=14, fontweight='bold', pad=20)
        ax.tick_params(colors=self.COLORS["text"])

        # Style grid
        ax.grid(axis='x', alpha=0.3, linestyle='--')
        ax.set_axisbelow(True)

        plt.tight_layout()

        return self._fig_to_base64(fig)

    def generate_attack_timeline(
        self,
        attacks: List[Dict],
        title: str = "Attack Execution Timeline"
    ) -> str:
        """
        Generate timeline visualization of attack execution

        attacks: List of attacks with started_at, completed_at, status
        """
        if not attacks:
            return None

        fig, ax = plt.subplots(figsize=(12, max(6, len(attacks) * 0.4)))

        # Sort attacks by start time
        sorted_attacks = sorted(
            [a for a in attacks if a.get("started_at")],
            key=lambda x: x["started_at"]
        )

        y_positions = list(range(len(sorted_attacks)))

        for i, attack in enumerate(sorted_attacks):
            started_at = attack.get("started_at")
            completed_at = attack.get("completed_at")
            status = attack.get("status", "unknown")

            if not started_at:
                continue

            # Calculate duration (in seconds from first attack start)
            first_start = sorted_attacks[0]["started_at"]
            start_offset = (started_at - first_start).total_seconds()

            if completed_at:
                duration = (completed_at - started_at).total_seconds()
            else:
                # Still running or unknown
                duration = 10  # Default bar width

            # Color based on status
            if status == "completed":
                color = self.COLORS["primary"]
            elif status == "failed":
                color = self.COLORS["critical"]
            elif status == "running":
                color = self.COLORS["medium"]
            else:
                color = self.COLORS["none"]

            # Draw horizontal bar
            ax.barh(i, duration, left=start_offset, height=0.6, color=color, edgecolor=self.COLORS["text"], linewidth=0.5)

            # Add attack name label
            attack_name = attack.get("name", "Unknown")[:40]  # Truncate long names
            ax.text(
                start_offset - 5,
                i,
                attack_name,
                va='center',
                ha='right',
                color=self.COLORS["text"],
                fontsize=8
            )

        ax.set_yticks(y_positions)
        ax.set_yticklabels([])  # Names are already added as text
        ax.set_xlabel('Time (seconds from start)', color=self.COLORS["text"], fontsize=11)
        ax.set_title(title, color=self.COLORS["text"], fontsize=14, fontweight='bold', pad=20)
        ax.tick_params(colors=self.COLORS["text"])
        ax.grid(axis='x', alpha=0.3, linestyle='--')
        ax.set_axisbelow(True)

        # Add legend
        legend_elements = [
            mpatches.Patch(color=self.COLORS["primary"], label='Completed'),
            mpatches.Patch(color=self.COLORS["critical"], label='Failed'),
            mpatches.Patch(color=self.COLORS["medium"], label='Running')
        ]
        ax.legend(handles=legend_elements, loc='upper right', facecolor=self.COLORS["background"], edgecolor=self.COLORS["text"])

        plt.tight_layout()

        return self._fig_to_base64(fig)

    def generate_success_rate_gauge(
        self,
        success_rate: float,
        title: str = "Attack Success Rate"
    ) -> str:
        """
        Generate gauge/donut chart for success rate

        success_rate: Percentage (0-100)
        """
        fig, ax = plt.subplots(figsize=(6, 4))

        # Create donut chart
        sizes = [success_rate, 100 - success_rate]
        colors = [self.COLORS["primary"], self.COLORS["none"]]

        wedges, texts = ax.pie(
            sizes,
            colors=colors,
            startangle=90,
            counterclock=False,
            wedgeprops=dict(width=0.4, edgecolor=self.COLORS["text"], linewidth=2)
        )

        # Add percentage text in center
        ax.text(
            0, 0,
            f"{success_rate:.1f}%",
            ha='center',
            va='center',
            fontsize=32,
            fontweight='bold',
            color=self.COLORS["text"]
        )

        ax.set_title(title, color=self.COLORS["text"], fontsize=14, fontweight='bold', pad=20)

        return self._fig_to_base64(fig)

    def _fig_to_base64(self, fig) -> str:
        """Convert matplotlib figure to base64-encoded PNG"""
        buf = io.BytesIO()
        fig.savefig(buf, format='png', dpi=100, bbox_inches='tight', facecolor=self.COLORS["background"] if self.dark_theme else 'white')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close(fig)
        return f"data:image/png;base64,{img_base64}"


if __name__ == "__main__":
    # Example usage
    generator = ChartGenerator(dark_theme=True)

    # Severity pie chart
    findings_by_severity = {
        "critical": 2,
        "high": 5,
        "medium": 8,
        "low": 12
    }
    severity_chart = generator.generate_severity_pie_chart(findings_by_severity)
    print(f"Severity chart generated: {len(severity_chart)} bytes")

    # Category bar chart
    findings_by_category = {
        "Web Application": 10,
        "Network": 7,
        "Reconnaissance": 5,
        "Vulnerability Scanning": 5
    }
    category_chart = generator.generate_category_bar_chart(findings_by_category)
    print(f"Category chart generated: {len(category_chart)} bytes")

    # Success rate gauge
    success_chart = generator.generate_success_rate_gauge(75.5)
    print(f"Success rate chart generated: {len(success_chart)} bytes")

    print("\nAll charts generated successfully!")
