"""
AOPTool Control Plane - Database Connection
Async PostgreSQL connection pool management
"""

import asyncpg
import os
from typing import Optional
from loguru import logger

class Database:
    """Database connection pool manager"""

    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
        self.database_url = os.getenv("DATABASE_URL")

    async def connect(self):
        """Create database connection pool"""
        try:
            logger.info("Connecting to PostgreSQL...")
            self.pool = await asyncpg.create_pool(
                self.database_url,
                min_size=5,
                max_size=20,
                command_timeout=60,
                server_settings={
                    'application_name': 'aoptool_control_plane'
                }
            )
            logger.info("✓ PostgreSQL connection pool created")

            # Test connection
            async with self.pool.acquire() as conn:
                version = await conn.fetchval("SELECT version()")
                logger.info(f"PostgreSQL version: {version.split(',')[0]}")

        except Exception as e:
            logger.error(f"✗ Failed to connect to PostgreSQL: {e}")
            raise

    async def disconnect(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("PostgreSQL connection pool closed")

    async def execute(self, query: str, *args):
        """Execute a query without returning results"""
        async with self.pool.acquire() as conn:
            return await conn.execute(query, *args)

    async def fetch(self, query: str, *args):
        """Fetch multiple rows"""
        async with self.pool.acquire() as conn:
            return await conn.fetch(query, *args)

    async def fetchrow(self, query: str, *args):
        """Fetch single row"""
        async with self.pool.acquire() as conn:
            return await conn.fetchrow(query, *args)

    async def fetchval(self, query: str, *args):
        """Fetch single value"""
        async with self.pool.acquire() as conn:
            return await conn.fetchval(query, *args)

# Global database instance
db = Database()
