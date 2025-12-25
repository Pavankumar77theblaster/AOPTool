"""
Timeline Builder
Creates chronological timeline of attack execution for reports
"""

from typing import List, Dict
from datetime import datetime


class TimelineBuilder:
    """Build attack execution timeline"""

    @staticmethod
    def build_timeline(attacks: List[Dict]) -> List[Dict]:
        """
        Build chronological timeline from attack list

        Args:
            attacks: List of attack dicts with started_at, completed_at, status, name

        Returns:
            List of timeline events sorted chronologically
        """
        timeline_events = []

        for attack in attacks:
            # Attack started event
            if attack.get("started_at"):
                timeline_events.append({
                    "timestamp": attack["started_at"],
                    "event_type": "attack_started",
                    "attack_id": attack.get("id"),
                    "attack_name": attack.get("name"),
                    "category": attack.get("category"),
                    "description": f"Started: {attack.get('name')}"
                })

            # Attack completed event
            if attack.get("completed_at"):
                status = attack.get("status", "unknown")
                timeline_events.append({
                    "timestamp": attack["completed_at"],
                    "event_type": f"attack_{status}",
                    "attack_id": attack.get("id"),
                    "attack_name": attack.get("name"),
                    "category": attack.get("category"),
                    "status": status,
                    "description": f"{status.capitalize()}: {attack.get('name')}",
                    "result": attack.get("result")
                })

        # Sort by timestamp
        timeline_events.sort(key=lambda x: x["timestamp"])

        return timeline_events

    @staticmethod
    def format_timeline_html(timeline: List[Dict]) -> str:
        """
        Format timeline as HTML for report

        Returns HTML string with timeline visualization
        """
        if not timeline:
            return "<p>No timeline data available</p>"

        html = """
        <div class="timeline">
            <style>
                .timeline {
                    position: relative;
                    padding: 20px 0;
                }
                .timeline::before {
                    content: '';
                    position: absolute;
                    left: 30px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: #374151;
                }
                .timeline-event {
                    position: relative;
                    padding-left: 60px;
                    margin-bottom: 30px;
                }
                .timeline-marker {
                    position: absolute;
                    left: 22px;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    border: 3px solid #111827;
                }
                .timeline-marker.started {
                    background: #06b6d4;
                }
                .timeline-marker.completed {
                    background: #10b981;
                }
                .timeline-marker.failed {
                    background: #dc2626;
                }
                .timeline-content {
                    background: #1f2937;
                    border: 1px solid #374151;
                    border-radius: 8px;
                    padding: 12px 16px;
                }
                .timeline-time {
                    font-size: 12px;
                    color: #9ca3af;
                    margin-bottom: 4px;
                }
                .timeline-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #e5e7eb;
                    margin-bottom: 4px;
                }
                .timeline-desc {
                    font-size: 13px;
                    color: #d1d5db;
                }
                .timeline-category {
                    display: inline-block;
                    font-size: 11px;
                    padding: 2px 8px;
                    border-radius: 4px;
                    background: #374151;
                    color: #9ca3af;
                    margin-top: 6px;
                }
            </style>
        """

        for event in timeline:
            timestamp = event["timestamp"]
            time_str = timestamp.strftime("%H:%M:%S")

            # Determine marker class
            if event["event_type"] == "attack_started":
                marker_class = "started"
            elif event.get("status") == "completed":
                marker_class = "completed"
            elif event.get("status") == "failed":
                marker_class = "failed"
            else:
                marker_class = "started"

            html += f"""
            <div class="timeline-event">
                <div class="timeline-marker {marker_class}"></div>
                <div class="timeline-content">
                    <div class="timeline-time">{time_str}</div>
                    <div class="timeline-title">{event.get('description', 'Unknown event')}</div>
                    <div class="timeline-desc">{event.get('attack_name', 'N/A')}</div>
            """

            if event.get("category"):
                html += f"""
                    <span class="timeline-category">{event['category']}</span>
                """

            html += """
                </div>
            </div>
            """

        html += "</div>"

        return html

    @staticmethod
    def get_execution_summary(timeline: List[Dict], execution: Dict) -> Dict:
        """
        Generate execution summary from timeline

        Returns:
            {
                "started_at": datetime,
                "completed_at": datetime,
                "duration_seconds": float,
                "total_events": int,
                "attacks_started": int,
                "attacks_completed": int,
                "attacks_failed": int
            }
        """
        if not timeline:
            return {
                "started_at": None,
                "completed_at": None,
                "duration_seconds": 0,
                "total_events": 0,
                "attacks_started": 0,
                "attacks_completed": 0,
                "attacks_failed": 0
            }

        started_at = min(e["timestamp"] for e in timeline)
        completed_at = max(e["timestamp"] for e in timeline)
        duration = (completed_at - started_at).total_seconds()

        attacks_started = len([e for e in timeline if e["event_type"] == "attack_started"])
        attacks_completed = len([e for e in timeline if e.get("status") == "completed"])
        attacks_failed = len([e for e in timeline if e.get("status") == "failed"])

        return {
            "started_at": started_at,
            "completed_at": completed_at,
            "duration_seconds": duration,
            "total_events": len(timeline),
            "attacks_started": attacks_started,
            "attacks_completed": attacks_completed,
            "attacks_failed": attacks_failed
        }


if __name__ == "__main__":
    # Example usage
    from datetime import datetime, timedelta

    # Sample attacks
    start_time = datetime.utcnow()
    sample_attacks = [
        {
            "id": 1,
            "name": "Nmap Port Scan",
            "category": "Reconnaissance",
            "started_at": start_time,
            "completed_at": start_time + timedelta(seconds=30),
            "status": "completed"
        },
        {
            "id": 2,
            "name": "SQL Injection Test",
            "category": "Web Application",
            "started_at": start_time + timedelta(seconds=35),
            "completed_at": start_time + timedelta(seconds=120),
            "status": "completed"
        },
        {
            "id": 3,
            "name": "XSS Detection",
            "category": "Web Application",
            "started_at": start_time + timedelta(seconds=125),
            "completed_at": start_time + timedelta(seconds=180),
            "status": "failed"
        }
    ]

    # Build timeline
    builder = TimelineBuilder()
    timeline = builder.build_timeline(sample_attacks)

    print("Timeline Events:")
    for event in timeline:
        print(f"  {event['timestamp'].strftime('%H:%M:%S')} - {event['description']}")

    # Get summary
    summary = builder.get_execution_summary(timeline, {})
    print(f"\nSummary:")
    print(f"  Duration: {summary['duration_seconds']}s")
    print(f"  Attacks Started: {summary['attacks_started']}")
    print(f"  Attacks Completed: {summary['attacks_completed']}")
    print(f"  Attacks Failed: {summary['attacks_failed']}")

    # Generate HTML
    html = builder.format_timeline_html(timeline)
    print(f"\nHTML Length: {len(html)} bytes")
