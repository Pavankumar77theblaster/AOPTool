"""
AOPTool Control Plane - Main Application
FastAPI backend for user interaction and orchestration
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import os
from datetime import datetime

# Initialize FastAPI app
app = FastAPI(
    title="AOPTool Control Plane API",
    description="Control and orchestration API for autonomous pentesting",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# MODELS
# ================================

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    service: str
    version: str

# ================================
# ROOT & HEALTH ENDPOINTS
# ================================

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API information"""
    return {
        "message": "AOPTool Control Plane API",
        "version": "1.0.0",
        "status": "operational",
        "documentation": "/docs",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint for container health monitoring"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        service="control_plane",
        version="1.0.0"
    )

# ================================
# STARTUP & SHUTDOWN EVENTS
# ================================

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("========================================")
    print("AOPTool Control Plane Starting")
    print("========================================")
    print(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"CORS Origins: {os.getenv('CORS_ORIGINS', 'http://localhost:3000')}")
    print("========================================")

    # TODO: Initialize database connection pool
    # TODO: Initialize Redis connection
    # TODO: Load initial configuration

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("========================================")
    print("AOPTool Control Plane Shutting Down")
    print("========================================")

    # TODO: Close database connections
    # TODO: Close Redis connections
    # TODO: Cleanup resources

# ================================
# ERROR HANDLERS
# ================================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    print(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc),
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# ================================
# PLACEHOLDER ENDPOINTS
# ================================
# These will be implemented in future phases

@app.get("/api/v1/status", tags=["Status"])
async def get_status():
    """Get overall system status"""
    return {
        "control_plane": "operational",
        "intelligence_plane": "not_connected",
        "execution_plane": "not_connected",
        "database": "not_connected",
        "message": "Placeholder endpoint - full implementation pending"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if os.getenv("ENVIRONMENT") == "development" else False
    )
