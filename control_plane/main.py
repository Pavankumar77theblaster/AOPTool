"""
AOPTool Control Plane - Main Application
FastAPI backend with full CRUD operations
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime, timedelta
import os

from loguru import logger

# Import local modules
from database import db
from models import *
from auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_current_active_user,
    require_admin
)
from scope_validator import scope_validator

# ================================
# Initialize FastAPI
# ================================

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
# Startup & Shutdown Events
# ================================

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("========================================")
    logger.info("AOPTool Control Plane Starting")
    logger.info("========================================")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"CORS Origins: {os.getenv('CORS_ORIGINS', 'http://localhost:3000')}")

    # Connect to database
    await db.connect()

    # Load scope whitelist
    await scope_validator.load_whitelist()

    logger.info("========================================")
    logger.info("Control Plane Ready!")
    logger.info("========================================")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Control Plane Shutting Down...")
    await db.disconnect()

# ================================
# Root & Health Endpoints
# ================================

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "AOPTool Control Plane API",
        "version": "1.0.0",
        "status": "operational",
        "documentation": "/docs",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check for container monitoring"""
    db_status = "connected" if db.pool else "disconnected"

    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        service="control_plane",
        version="1.0.0",
        database=db_status
    )

# ================================
# Authentication Endpoints
# ================================

@app.post("/token", response_model=Token, tags=["Authentication"])
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login endpoint - Get JWT access token

    Default credentials:
    - Username: admin
    - Password: (set in .env as ADMIN_PASSWORD)
    """
    user = authenticate_user(form_data.username, form_data.password)

    if not user:
        logger.warning(f"Failed login attempt for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user})

    logger.info(f"User logged in: {user}")

    return Token(access_token=access_token, token_type="bearer")

@app.get("/me", tags=["Authentication"])
async def read_users_me(current_user: str = Depends(get_current_active_user)):
    """Get current user information"""
    return {"username": current_user}

# ================================
# Scope Whitelist Endpoints
# ================================

@app.post("/scope/whitelist", status_code=status.HTTP_201_CREATED, tags=["Scope"])
async def add_to_whitelist(
    entry: ScopeWhitelistCreate,
    current_user: str = Depends(require_admin)
):
    """Add entry to scope whitelist (Admin only)"""
    try:
        whitelist_id = await scope_validator.add_to_whitelist(
            entry.entry_type,
            entry.value,
            current_user,
            entry.description
        )

        if not whitelist_id:
            return {"message": "Entry already exists in whitelist"}

        return {
            "whitelist_id": whitelist_id,
            "message": "Entry added to whitelist successfully"
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/scope/whitelist", response_model=List[ScopeWhitelist], tags=["Scope"])
async def get_whitelist(
    entry_type: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    """Get scope whitelist entries"""
    if entry_type:
        entries = await db.fetch(
            "SELECT * FROM scope_whitelist WHERE entry_type = $1 ORDER BY added_at DESC",
            entry_type
        )
    else:
        entries = await db.fetch("SELECT * FROM scope_whitelist ORDER BY added_at DESC")

    return [dict(entry) for entry in entries]

@app.delete("/scope/whitelist/{whitelist_id}", tags=["Scope"])
async def delete_from_whitelist(
    whitelist_id: int,
    current_user: str = Depends(require_admin)
):
    """Remove entry from whitelist (Admin only)"""
    result = await db.execute(
        "DELETE FROM scope_whitelist WHERE whitelist_id = $1",
        whitelist_id
    )

    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Whitelist entry not found")

    # Reload whitelist
    await scope_validator.load_whitelist()

    return {"message": "Entry removed from whitelist"}

# ================================
# Target Endpoints
# ================================

@app.post("/targets", status_code=status.HTTP_201_CREATED, response_model=Target, tags=["Targets"])
async def create_target(
    target: TargetCreate,
    current_user: str = Depends(get_current_user)
):
    """Create a new target"""

    # Validate scope
    is_valid, reason = await scope_validator.validate_target(target.url_or_ip)

    if not is_valid:
        logger.warning(f"Scope validation failed for {target.url_or_ip}: {reason}")

        # Log to audit trail
        await db.execute(
            """
            INSERT INTO audit_log (user_id, action, details)
            VALUES ($1, $2, $3)
            """,
            current_user,
            "target_creation_blocked",
            {"target": target.url_or_ip, "reason": reason}
        )

        raise HTTPException(
            status_code=403,
            detail=f"Target is out of authorized scope: {reason}. Add to whitelist first."
        )

    # Create target
    target_id = await db.fetchval(
        """
        INSERT INTO targets (name, url_or_ip, scope, risk_tolerance, owner_approval)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING target_id
        """,
        target.name,
        target.url_or_ip,
        target.scope,
        target.risk_tolerance,
        target.owner_approval
    )

    # Log to audit trail
    await db.execute(
        """
        INSERT INTO audit_log (user_id, action, target_id, details)
        VALUES ($1, $2, $3, $4)
        """,
        current_user,
        "target_created",
        target_id,
        {"name": target.name}
    )

    # Fetch created target
    target_row = await db.fetchrow("SELECT * FROM targets WHERE target_id = $1", target_id)

    logger.info(f"Target created: {target.name} (ID: {target_id}) by {current_user}")

    return dict(target_row)

@app.get("/targets", response_model=List[Target], tags=["Targets"])
async def list_targets(
    scope: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    """List all targets"""
    if scope:
        targets = await db.fetch(
            "SELECT * FROM targets WHERE scope = $1 ORDER BY created_at DESC",
            scope
        )
    else:
        targets = await db.fetch("SELECT * FROM targets ORDER BY created_at DESC")

    return [dict(target) for target in targets]

@app.get("/targets/{target_id}", response_model=Target, tags=["Targets"])
async def get_target(
    target_id: int,
    current_user: str = Depends(get_current_user)
):
    """Get specific target"""
    target = await db.fetchrow("SELECT * FROM targets WHERE target_id = $1", target_id)

    if not target:
        raise HTTPException(status_code=404, detail="Target not found")

    return dict(target)

@app.put("/targets/{target_id}", response_model=Target, tags=["Targets"])
async def update_target(
    target_id: int,
    target_update: TargetUpdate,
    current_user: str = Depends(get_current_user)
):
    """Update target"""
    # Check if target exists
    existing = await db.fetchrow("SELECT * FROM targets WHERE target_id = $1", target_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Target not found")

    # Build update query
    updates = []
    values = []
    param_count = 1

    for field, value in target_update.dict(exclude_unset=True).items():
        if value is not None:
            updates.append(f"{field} = ${param_count}")
            values.append(value)
            param_count += 1

    if not updates:
        return dict(existing)

    values.append(target_id)

    query = f"""
        UPDATE targets
        SET {', '.join(updates)}
        WHERE target_id = ${param_count}
        RETURNING *
    """

    updated = await db.fetchrow(query, *values)

    logger.info(f"Target updated: {target_id} by {current_user}")

    return dict(updated)

@app.delete("/targets/{target_id}", tags=["Targets"])
async def delete_target(
    target_id: int,
    current_user: str = Depends(get_current_user)
):
    """Delete target"""
    result = await db.execute("DELETE FROM targets WHERE target_id = $1", target_id)

    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Target not found")

    # Log to audit trail
    await db.execute(
        """
        INSERT INTO audit_log (user_id, action, target_id)
        VALUES ($1, $2, $3)
        """,
        current_user,
        "target_deleted",
        target_id
    )

    logger.info(f"Target deleted: {target_id} by {current_user}")

    return {"message": "Target deleted successfully"}

# ================================
# Attack Plan Endpoints
# ================================

@app.post("/attack_plans", status_code=status.HTTP_201_CREATED, response_model=AttackPlan, tags=["Attack Plans"])
async def create_attack_plan(
    plan: AttackPlanCreate,
    current_user: str = Depends(get_current_user)
):
    """Create attack plan"""

    # Verify target exists
    target = await db.fetchrow("SELECT * FROM targets WHERE target_id = $1", plan.target_id)
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")

    # Check if high-risk attacks require approval
    if plan.max_risk_level in ['critical', 'high'] and not target['owner_approval']:
        raise HTTPException(
            status_code=403,
            detail="Owner approval required for high-risk attacks"
        )

    # Verify all attacks exist
    for attack_id in plan.attack_sequence:
        attack = await db.fetchrow("SELECT * FROM attacks WHERE attack_id = $1", attack_id)
        if not attack:
            raise HTTPException(status_code=404, detail=f"Attack ID {attack_id} not found")

    # Create plan
    plan_id = await db.fetchval(
        """
        INSERT INTO attack_plans (target_id, attack_sequence, scheduling, max_risk_level, status)
        VALUES ($1, $2, $3, $4, 'pending')
        RETURNING plan_id
        """,
        plan.target_id,
        plan.attack_sequence,
        plan.scheduling,
        plan.max_risk_level
    )

    # Log to audit trail
    await db.execute(
        """
        INSERT INTO audit_log (user_id, action, target_id, plan_id)
        VALUES ($1, $2, $3, $4)
        """,
        current_user,
        "attack_plan_created",
        plan.target_id,
        plan_id
    )

    # TODO: Trigger orchestration if scheduling is immediate
    # from celery_integration import orchestrate_attack
    # if plan.scheduling == "immediate":
    #     orchestrate_attack.delay(plan_id)

    # Fetch created plan
    plan_row = await db.fetchrow("SELECT * FROM attack_plans WHERE plan_id = $1", plan_id)

    logger.info(f"Attack plan created: {plan_id} by {current_user}")

    return dict(plan_row)

@app.get("/attack_plans", response_model=List[AttackPlan], tags=["Attack Plans"])
async def list_attack_plans(
    target_id: Optional[int] = None,
    plan_status: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    """List attack plans"""
    conditions = []
    params = []

    if target_id:
        conditions.append(f"target_id = ${len(params) + 1}")
        params.append(target_id)

    if plan_status:
        conditions.append(f"status = ${len(params) + 1}")
        params.append(plan_status)

    query = "SELECT * FROM attack_plans"
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY created_at DESC"

    plans = await db.fetch(query, *params)

    return [dict(plan) for plan in plans]

@app.post("/attack_plans/{plan_id}/approve", tags=["Attack Plans"])
async def approve_attack_plan(
    plan_id: int,
    current_user: str = Depends(get_current_user)
):
    """Approve pending attack plan"""
    plan = await db.fetchrow("SELECT * FROM attack_plans WHERE plan_id = $1", plan_id)

    if not plan:
        raise HTTPException(status_code=404, detail="Attack plan not found")

    if plan['status'] != 'pending':
        raise HTTPException(status_code=400, detail=f"Cannot approve plan in '{plan['status']}' status")

    # Update plan status
    await db.execute(
        """
        UPDATE attack_plans
        SET status = 'approved', approved_by = $1, approved_at = NOW()
        WHERE plan_id = $2
        """,
        current_user,
        plan_id
    )

    # Log to audit trail
    await db.execute(
        """
        INSERT INTO audit_log (user_id, action, plan_id)
        VALUES ($1, $2, $3)
        """,
        current_user,
        "attack_plan_approved",
        plan_id
    )

    # TODO: Trigger orchestration
    # from celery_integration import orchestrate_attack
    # orchestrate_attack.delay(plan_id)

    logger.info(f"Attack plan approved: {plan_id} by {current_user}")

    return {"message": "Attack plan approved and queued for execution"}

# ================================
# Error Handler
# ================================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")

    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc),
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# ================================
# Main Entry Point
# ================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if os.getenv("ENVIRONMENT") == "development" else False
    )
