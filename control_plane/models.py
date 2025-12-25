"""
AOPTool Control Plane - Data Models
Pydantic models for request/response validation
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import ipaddress
import re

# ================================
# Authentication Models
# ================================

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

# ================================
# Target Models
# ================================

class TargetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Target name")
    url_or_ip: str = Field(..., min_length=1, max_length=500, description="Target URL or IP address")
    scope: str = Field(default="out_of_scope", description="Scope status")
    risk_tolerance: str = Field(default="low", description="Risk tolerance level")
    owner_approval: bool = Field(default=False, description="Owner approval status")

    @validator('scope')
    def validate_scope(cls, v):
        if v not in ['in_scope', 'out_of_scope']:
            raise ValueError('scope must be in_scope or out_of_scope')
        return v

    @validator('risk_tolerance')
    def validate_risk_tolerance(cls, v):
        if v not in ['low', 'medium', 'high']:
            raise ValueError('risk_tolerance must be low, medium, or high')
        return v

class TargetCreate(TargetBase):
    pass

class TargetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    url_or_ip: Optional[str] = Field(None, min_length=1, max_length=500)
    scope: Optional[str] = None
    risk_tolerance: Optional[str] = None
    owner_approval: Optional[bool] = None

    @validator('scope')
    def validate_scope(cls, v):
        if v is not None and v not in ['in_scope', 'out_of_scope']:
            raise ValueError('scope must be in_scope or out_of_scope')
        return v

    @validator('risk_tolerance')
    def validate_risk_tolerance(cls, v):
        if v is not None and v not in ['low', 'medium', 'high']:
            raise ValueError('risk_tolerance must be low, medium, or high')
        return v

class Target(TargetBase):
    target_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ================================
# Attack Plan Models
# ================================

class AttackPlanBase(BaseModel):
    target_id: int
    attack_sequence: List[int] = Field(..., description="List of attack IDs to execute")
    scheduling: str = Field(default="manual_trigger", description="Scheduling type")
    max_risk_level: str = Field(..., description="Maximum risk level allowed")

    @validator('scheduling')
    def validate_scheduling(cls, v):
        if v not in ['immediate', 'scheduled', 'manual_trigger']:
            raise ValueError('scheduling must be immediate, scheduled, or manual_trigger')
        return v

    @validator('max_risk_level')
    def validate_max_risk_level(cls, v):
        if v not in ['low', 'medium', 'high', 'critical']:
            raise ValueError('max_risk_level must be low, medium, high, or critical')
        return v

class AttackPlanCreate(AttackPlanBase):
    pass

class AttackPlan(AttackPlanBase):
    plan_id: int
    status: str
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True

# ================================
# Scope Whitelist Models
# ================================

class ScopeWhitelistBase(BaseModel):
    entry_type: str = Field(..., description="Type of entry")
    value: str = Field(..., description="Whitelist value")
    description: Optional[str] = Field(None, description="Description of entry")

    @validator('entry_type')
    def validate_entry_type(cls, v):
        if v not in ['cidr', 'domain', 'ip']:
            raise ValueError('entry_type must be cidr, domain, or ip')
        return v

    @validator('value')
    def validate_value(cls, v, values):
        entry_type = values.get('entry_type')

        if entry_type == 'cidr':
            try:
                ipaddress.ip_network(v)
            except ValueError:
                raise ValueError('Invalid CIDR notation')

        elif entry_type == 'ip':
            try:
                ipaddress.ip_address(v)
            except ValueError:
                raise ValueError('Invalid IP address')

        elif entry_type == 'domain':
            if not re.match(r'^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9]$', v):
                raise ValueError('Invalid domain name')

        return v

class ScopeWhitelistCreate(ScopeWhitelistBase):
    pass

class ScopeWhitelist(ScopeWhitelistBase):
    whitelist_id: int
    added_by: Optional[str] = None
    added_at: datetime

    class Config:
        from_attributes = True

# ================================
# Response Models
# ================================

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    service: str
    version: str
    database: Optional[str] = None

class MessageResponse(BaseModel):
    message: str
    details: Optional[dict] = None

class ErrorResponse(BaseModel):
    error: str
    message: str
    timestamp: str
    details: Optional[dict] = None
