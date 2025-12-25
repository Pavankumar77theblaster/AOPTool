"""
AOPTool Control Plane - Authentication
JWT-based authentication with password hashing
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import os
from loguru import logger

from models import TokenData

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "changeme_to_secure_random_string")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "changeme")

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ================================
# Password Utilities
# ================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

# ================================
# User Authentication
# ================================

# For now, we have a simple in-memory user (admin)
# In production, this would query the database
def authenticate_user(username: str, password: str) -> Optional[str]:
    """
    Authenticate a user

    Args:
        username: Username
        password: Plain text password

    Returns:
        username if authentication successful, None otherwise
    """
    if username == "admin" and password == ADMIN_PASSWORD:
        return username
    return None

# ================================
# Token Management
# ================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token

    Args:
        data: Data to encode in token
        expires_delta: Optional expiration time delta

    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    logger.debug(f"Created JWT token for user: {data.get('sub')}")

    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    """
    Validate JWT token and return current user

    Args:
        token: JWT token from Authorization header

    Returns:
        Username

    Raises:
        HTTPException: If token is invalid or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")

        if username is None:
            logger.warning("Token missing 'sub' claim")
            raise credentials_exception

        token_data = TokenData(username=username)

    except JWTError as e:
        logger.warning(f"JWT validation error: {e}")
        raise credentials_exception

    return token_data.username

async def get_current_active_user(current_user: str = Depends(get_current_user)) -> str:
    """
    Get current active user (placeholder for future user status checks)

    Args:
        current_user: Current authenticated user

    Returns:
        Username
    """
    # In the future, check if user is active in database
    return current_user

# ================================
# Admin-Only Dependency
# ================================

async def require_admin(current_user: str = Depends(get_current_active_user)) -> str:
    """
    Require admin privileges

    Args:
        current_user: Current authenticated user

    Returns:
        Username if admin

    Raises:
        HTTPException: If user is not admin
    """
    if current_user != "admin":
        logger.warning(f"User {current_user} attempted admin-only action")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user
