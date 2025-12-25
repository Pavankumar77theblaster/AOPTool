"""
AOPTool Reporting Plane
FastAPI service for generating penetration test reports
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
import os
import asyncio
import uvicorn

from report_generator import ReportGenerator

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://aoptool_user:changeme@postgres:5432/aoptool")
OUTPUT_DIR = os.getenv("REPORT_OUTPUT_DIR", "./reports")
PORT = int(os.getenv("PORT", "6000"))

# Initialize FastAPI
app = FastAPI(
    title="AOPTool Reporting Plane",
    description="Professional penetration test report generation service",
    version="1.0.0"
)

# Initialize Report Generator
report_generator: Optional[ReportGenerator] = None


# Pydantic Models
class ReportRequest(BaseModel):
    """Request to generate a report"""
    execution_id: int = Field(..., description="ID of attack execution")
    formats: Optional[List[str]] = Field(
        default=['pdf', 'html', 'json', 'csv'],
        description="Output formats: pdf, html, json, csv"
    )
    report_name: Optional[str] = Field(None, description="Custom report name")


class ReportResponse(BaseModel):
    """Response after report generation"""
    execution_id: int
    report_id: str
    formats: Dict[str, str]  # format -> file path
    generated_at: datetime
    status: str


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    timestamp: datetime


@app.on_event("startup")
async def startup():
    """Initialize reporting service"""
    global report_generator

    print(f"Starting Reporting Plane on port {PORT}...")
    print(f"Database: {DATABASE_URL}")
    print(f"Output Directory: {OUTPUT_DIR}")

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Initialize report generator
    report_generator = ReportGenerator(
        db_url=DATABASE_URL,
        template_dir="templates",
        output_dir=OUTPUT_DIR
    )
    await report_generator.initialize()

    print("Reporting Plane ready!")


@app.on_event("shutdown")
async def shutdown():
    """Cleanup on shutdown"""
    global report_generator
    if report_generator:
        await report_generator.close()


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="reporting_plane",
        timestamp=datetime.utcnow()
    )


@app.post("/reports/generate", response_model=ReportResponse)
async def generate_report(request: ReportRequest):
    """
    Generate penetration test report

    Generates comprehensive reports in multiple formats (PDF, HTML, JSON, CSV)
    from attack execution data.
    """
    try:
        # Validate formats
        valid_formats = {'pdf', 'html', 'json', 'csv'}
        invalid_formats = set(request.formats) - valid_formats
        if invalid_formats:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid formats: {invalid_formats}. Valid: {valid_formats}"
            )

        # Generate reports
        output_files = await report_generator.generate_full_report(
            execution_id=request.execution_id,
            report_name=request.report_name,
            formats=request.formats
        )

        # Create report ID
        report_id = f"RPT-{request.execution_id}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

        return ReportResponse(
            execution_id=request.execution_id,
            report_id=report_id,
            formats=output_files,
            generated_at=datetime.utcnow(),
            status="completed"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate report: {str(e)}"
        )


@app.get("/reports/{execution_id}/download/{format}")
async def download_report(execution_id: int, format: str):
    """
    Download generated report file

    Supports: pdf, html, json, csv
    """
    # Validate format
    if format not in ['pdf', 'html', 'json', 'csv']:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid format: {format}"
        )

    # Find most recent report file for this execution
    pattern = f"*{execution_id}*.{format}"
    import glob
    files = glob.glob(os.path.join(OUTPUT_DIR, pattern))

    if not files:
        raise HTTPException(
            status_code=404,
            detail=f"No {format} report found for execution {execution_id}"
        )

    # Get most recent file
    latest_file = max(files, key=os.path.getctime)

    # Determine media type
    media_types = {
        'pdf': 'application/pdf',
        'html': 'text/html',
        'json': 'application/json',
        'csv': 'text/csv'
    }

    return FileResponse(
        path=latest_file,
        media_type=media_types[format],
        filename=os.path.basename(latest_file)
    )


@app.post("/reports/{execution_id}/executive-summary")
async def generate_executive_summary(
    execution_id: int,
    format: str = 'pdf'
):
    """
    Generate executive summary report

    Quick summary report for management/non-technical stakeholders
    """
    try:
        if format not in ['pdf', 'html']:
            raise HTTPException(
                status_code=400,
                detail="Executive summary only supports pdf or html format"
            )

        output_path = await report_generator.generate_executive_summary(
            execution_id=execution_id,
            output_format=format
        )

        return {
            "execution_id": execution_id,
            "report_type": "executive_summary",
            "format": format,
            "file_path": output_path,
            "generated_at": datetime.utcnow()
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate executive summary: {str(e)}"
        )


@app.get("/reports/list")
async def list_reports():
    """
    List all generated reports

    Returns list of all report files in the output directory
    """
    import glob

    all_files = glob.glob(os.path.join(OUTPUT_DIR, "*.*"))

    reports = []
    for file_path in all_files:
        file_stats = os.stat(file_path)
        reports.append({
            "filename": os.path.basename(file_path),
            "path": file_path,
            "size_bytes": file_stats.st_size,
            "created_at": datetime.fromtimestamp(file_stats.st_ctime),
            "format": os.path.splitext(file_path)[1][1:]  # Remove leading dot
        })

    # Sort by created_at descending
    reports.sort(key=lambda x: x['created_at'], reverse=True)

    return {
        "total_reports": len(reports),
        "reports": reports
    }


@app.delete("/reports/{filename}")
async def delete_report(filename: str):
    """
    Delete a report file

    Permanently removes a report file from the system
    """
    file_path = os.path.join(OUTPUT_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail=f"Report file not found: {filename}"
        )

    # Security: Only allow deletion of files in output directory
    if not os.path.abspath(file_path).startswith(os.path.abspath(OUTPUT_DIR)):
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    try:
        os.remove(file_path)
        return {
            "message": "Report deleted successfully",
            "filename": filename
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete report: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=PORT,
        reload=True,
        log_level="info"
    )
