"""
AOPTool Intelligence Plane - Database Connections
PostgreSQL for attack library, MongoDB for learning/memory
"""

import os
import asyncpg
from motor import motor_asyncio
from typing import List, Dict, Optional
import json


class DatabaseManager:
    """Manages connections to PostgreSQL and MongoDB"""

    def __init__(self):
        self.pg_pool = None
        self.mongo_client = None
        self.mongo_db = None

    async def connect(self):
        """Initialize database connections"""
        await self._connect_postgres()
        await self._connect_mongodb()

    async def _connect_postgres(self):
        """Connect to PostgreSQL"""
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            raise ValueError("DATABASE_URL environment variable not set")

        try:
            self.pg_pool = await asyncpg.create_pool(
                database_url,
                min_size=2,
                max_size=10,
                command_timeout=30
            )
            print("✓ Connected to PostgreSQL")

            # Test connection
            async with self.pg_pool.acquire() as conn:
                version = await conn.fetchval("SELECT version()")
                print(f"  PostgreSQL version: {version.split(',')[0]}")

        except Exception as e:
            print(f"✗ PostgreSQL connection failed: {e}")
            raise

    async def _connect_mongodb(self):
        """Connect to MongoDB"""
        mongodb_url = os.getenv('MONGODB_URL')
        if not mongodb_url:
            raise ValueError("MONGODB_URL environment variable not set")

        try:
            self.mongo_client = motor_asyncio.AsyncIOMotorClient(mongodb_url)
            db_name = os.getenv('MONGODB_DATABASE', 'aoptool')
            self.mongo_db = self.mongo_client[db_name]

            # Test connection
            await self.mongo_client.admin.command('ping')
            print("✓ Connected to MongoDB")

        except Exception as e:
            print(f"✗ MongoDB connection failed: {e}")
            raise

    async def close(self):
        """Close database connections"""
        if self.pg_pool:
            await self.pg_pool.close()
        if self.mongo_client:
            self.mongo_client.close()

    # ================================
    # PostgreSQL Operations
    # ================================

    async def get_all_attacks(self) -> List[Dict]:
        """Retrieve all available attacks from PostgreSQL"""
        query = """
            SELECT attack_id as id, name, description, category, target_type,
                   risk_level, tool_name, command_template, prerequisites
            FROM attacks
            WHERE enabled = true
            ORDER BY category, attack_id
        """

        async with self.pg_pool.acquire() as conn:
            rows = await conn.fetch(query)
            return [dict(row) for row in rows]

    async def get_attack_by_id(self, attack_id: int) -> Optional[Dict]:
        """Get specific attack details"""
        query = """
            SELECT attack_id as id, name, description, category, target_type,
                   risk_level, tool_name, command_template, prerequisites,
                   expected_output, parsing_rules
            FROM attacks
            WHERE attack_id = $1 AND enabled = true
        """

        async with self.pg_pool.acquire() as conn:
            row = await conn.fetchrow(query, attack_id)
            return dict(row) if row else None

    async def get_target_by_id(self, target_id: int) -> Optional[Dict]:
        """Get target information"""
        query = """
            SELECT target_id as id, name, url_or_ip, scope, risk_tolerance,
                   owner_approval, metadata
            FROM targets
            WHERE target_id = $1
        """

        async with self.pg_pool.acquire() as conn:
            row = await conn.fetchrow(query, target_id)
            return dict(row) if row else None

    async def create_attack_plan(
        self,
        target_id: int,
        attack_sequence: List[int],
        description: str,
        metadata: Dict
    ) -> int:
        """Create a new attack plan"""
        query = """
            INSERT INTO attack_plans (
                target_id, attack_sequence, scheduling,
                max_risk_level, metadata, status, created_at
            )
            VALUES ($1, $2, 'manual_trigger', $3, $4, 'pending', NOW())
            RETURNING plan_id
        """

        risk_level = metadata.get('risk_assessment', 'medium')

        async with self.pg_pool.acquire() as conn:
            plan_id = await conn.fetchval(
                query,
                target_id,
                attack_sequence,
                risk_level,
                json.dumps(metadata)
            )
            return plan_id

    async def log_execution(
        self,
        plan_id: int,
        attack_id: int,
        target_id: int,
        status: str,
        result_data: Dict
    ) -> int:
        """Log attack execution"""
        query = """
            INSERT INTO attack_executions (
                plan_id, attack_id, target_id, status,
                started_at, completed_at, output
            )
            VALUES ($1, $2, $3, $4, NOW(), NOW(), $5)
            RETURNING execution_id
        """

        async with self.pg_pool.acquire() as conn:
            exec_id = await conn.fetchval(
                query,
                plan_id,
                attack_id,
                target_id,
                status,
                json.dumps(result_data)
            )
            return exec_id

    # ================================
    # MongoDB Operations (Learning & Memory)
    # ================================

    async def store_attack_memory(
        self,
        attack_id: int,
        target_type: str,
        success: bool,
        learned_info: Dict
    ):
        """Store learned information from attack execution"""
        collection = self.mongo_db['attack_memory']

        document = {
            'attack_id': attack_id,
            'target_type': target_type,
            'success': success,
            'learned_info': learned_info,
            'timestamp': datetime.utcnow(),
            'version': 1
        }

        await collection.insert_one(document)
        print(f"✓ Stored attack memory for attack {attack_id}")

    async def get_attack_history(self, attack_id: int, limit: int = 10) -> List[Dict]:
        """Retrieve historical data for specific attack"""
        collection = self.mongo_db['attack_memory']

        cursor = collection.find(
            {'attack_id': attack_id}
        ).sort('timestamp', -1).limit(limit)

        return await cursor.to_list(length=limit)

    async def store_training_resource(self, resource_data: Dict):
        """Store training resource for model improvement"""
        collection = self.mongo_db['training_resources']
        await collection.insert_one(resource_data)

    async def get_similar_attacks(
        self,
        target_type: str,
        attack_category: str,
        limit: int = 5
    ) -> List[Dict]:
        """Find similar successful attacks from history"""
        collection = self.mongo_db['attack_memory']

        cursor = collection.find({
            'target_type': target_type,
            'learned_info.category': attack_category,
            'success': True
        }).sort('timestamp', -1).limit(limit)

        return await cursor.to_list(length=limit)


# Import datetime for MongoDB operations
from datetime import datetime
