"""
AOPTool Intelligence Plane - Main Service
AI-driven reasoning, attack planning, and learning
"""

import os
import asyncio
from datetime import datetime
from typing import List, Dict, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_engine import AIEngine
from database import DatabaseManager


# ================================
# Pydantic Models
# ================================

class TranslateRequest(BaseModel):
    description: str
    target_id: int
    risk_level: str = "medium"


class TranslateResponse(BaseModel):
    success: bool
    attack_plan_id: Optional[int] = None
    attack_sequence: List[int]
    reasoning: str
    estimated_duration_minutes: int
    risk_assessment: str
    ai_model: str


class AnalyzeRequest(BaseModel):
    attack_id: int
    target_id: int
    execution_results: Dict


class AnalyzeResponse(BaseModel):
    success: bool
    severity: str
    findings: List[str]
    recommendations: List[str]
    summary: Optional[str] = None


# ================================
# Global State
# ================================

db_manager = DatabaseManager()
ai_engine = AIEngine()


# ================================
# Lifespan Management
# ================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("========================================")
    print("AOPTool Intelligence Plane Starting")
    print("========================================")
    print(f"Timestamp: {datetime.utcnow().isoformat()}")
    print(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")

    # Initialize database connections
    try:
        await db_manager.connect()
        print("✓ Database connections established")
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        raise

    print("========================================")
    print("Intelligence Plane Ready!")
    print("========================================")

    yield

    # Shutdown
    print("\nIntelligence Plane shutting down...")
    await db_manager.close()


# ================================
# FastAPI App
# ================================

app = FastAPI(
    title="AOPTool Intelligence Plane",
    description="AI-powered attack planning and reasoning",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================================
# API Endpoints
# ================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "intelligence_plane",
        "version": "1.0.0",
        "ai_enabled": ai_engine.use_ai,
        "claude_available": ai_engine.claude_client is not None,
        "openai_available": ai_engine.openai_client is not None
    }


@app.post("/translate", response_model=TranslateResponse)
async def translate_natural_language(request: TranslateRequest):
    """
    Translate natural language attack description to executable attack plan

    This is the core AI reasoning endpoint that:
    1. Takes natural language description
    2. Uses AI to understand intent
    3. Maps to available attack techniques
    4. Creates ordered attack sequence
    5. Stores plan in database
    """
    try:
        # Get target information
        target = await db_manager.get_target_by_id(request.target_id)
        if not target:
            raise HTTPException(status_code=404, detail="Target not found")

        # Get available attacks
        all_attacks = await db_manager.get_all_attacks()
        if not all_attacks:
            raise HTTPException(
                status_code=500,
                detail="No attacks available in database"
            )

        # Determine target type from URL/IP
        target_type = "web_app"  # Default
        if target.get('metadata'):
            target_type = target['metadata'].get('type', 'web_app')

        # Translate using AI
        translation = await ai_engine.translate_natural_language_to_attacks(
            description=request.description,
            target_type=target_type,
            available_attacks=all_attacks,
            risk_level=request.risk_level
        )

        # Validate attack sequence
        attack_ids = translation['attack_sequence']
        if not attack_ids:
            raise HTTPException(
                status_code=400,
                detail="Could not generate valid attack sequence"
            )

        # Create attack plan in database
        plan_metadata = {
            'description': request.description,
            'reasoning': translation['reasoning'],
            'estimated_duration': translation['estimated_duration_minutes'],
            'prerequisites': translation.get('prerequisites', []),
            'expected_outcomes': translation.get('expected_outcomes', []),
            'risk_assessment': translation['risk_assessment'],
            'ai_model': translation.get('ai_model', 'unknown'),
            'translation_method': translation.get('translation_method', 'unknown')
        }

        plan_id = await db_manager.create_attack_plan(
            target_id=request.target_id,
            attack_sequence=attack_ids,
            description=request.description,
            metadata=plan_metadata
        )

        print(f"✓ Created attack plan {plan_id} with {len(attack_ids)} attacks")

        return TranslateResponse(
            success=True,
            attack_plan_id=plan_id,
            attack_sequence=attack_ids,
            reasoning=translation['reasoning'],
            estimated_duration_minutes=translation['estimated_duration_minutes'],
            risk_assessment=translation['risk_assessment'],
            ai_model=translation.get('ai_model', 'rule_based')
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_attack_results(request: AnalyzeRequest):
    """
    Analyze attack execution results using AI

    Provides intelligent analysis of:
    - Attack success/failure
    - Vulnerabilities found
    - Severity assessment
    - Recommendations
    """
    try:
        # Get attack and target information
        attack = await db_manager.get_attack_by_id(request.attack_id)
        target = await db_manager.get_target_by_id(request.target_id)

        if not attack or not target:
            raise HTTPException(status_code=404, detail="Attack or target not found")

        # Analyze using AI
        analysis = await ai_engine.analyze_attack_results(
            attack_id=request.attack_id,
            target_info=target,
            execution_results=request.execution_results
        )

        # Store learning in MongoDB
        await db_manager.store_attack_memory(
            attack_id=request.attack_id,
            target_type=target.get('metadata', {}).get('type', 'unknown'),
            success=analysis.get('success', False),
            learned_info={
                'severity': analysis.get('severity'),
                'findings': analysis.get('findings', []),
                'vulnerabilities': analysis.get('vulnerabilities', [])
            }
        )

        return AnalyzeResponse(
            success=analysis.get('success', False),
            severity=analysis.get('severity', 'info'),
            findings=analysis.get('findings', []),
            recommendations=analysis.get('recommendations', []),
            summary=analysis.get('summary')
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/attacks")
async def list_available_attacks():
    """List all available attack techniques"""
    try:
        attacks = await db_manager.get_all_attacks()
        return {
            "success": True,
            "count": len(attacks),
            "attacks": attacks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/attacks/{attack_id}")
async def get_attack_details(attack_id: int):
    """Get details of specific attack"""
    try:
        attack = await db_manager.get_attack_by_id(attack_id)
        if not attack:
            raise HTTPException(status_code=404, detail="Attack not found")
        return attack
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history/{attack_id}")
async def get_attack_history(attack_id: int, limit: int = 10):
    """Get historical execution data for an attack"""
    try:
        history = await db_manager.get_attack_history(attack_id, limit)
        return {
            "success": True,
            "attack_id": attack_id,
            "count": len(history),
            "history": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/learn")
async def store_learning(data: Dict):
    """Store learning data from successful/failed attacks"""
    try:
        await db_manager.store_attack_memory(
            attack_id=data.get('attack_id'),
            target_type=data.get('target_type'),
            success=data.get('success', False),
            learned_info=data.get('learned_info', {})
        )
        return {"success": True, "message": "Learning stored"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ================================
# Main Entry Point
# ================================

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv('PORT', 5000))

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
