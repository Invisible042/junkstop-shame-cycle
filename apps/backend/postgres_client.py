import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Dict, Any, Optional
import bcrypt
from datetime import datetime

class PostgreSQLClient:
    """PostgreSQL client for JunkStop app using the existing Replit database"""
    
    def __init__(self):
        self.connection_string = os.getenv("DATABASE_URL")
        
    def get_connection(self):
        return psycopg2.connect(
            self.connection_string,
            cursor_factory=RealDictCursor
        )
    
    def execute_query(self, query: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
        """Execute a SELECT query and return results"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                results = cursor.fetchall()
                return [dict(row) for row in results]
    
    def execute_insert(self, query: str, params: Optional[tuple] = None) -> Optional[Dict[str, Any]]:
        """Execute an INSERT query and return the inserted row"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                conn.commit()
                result = cursor.fetchone()
                return dict(result) if result else None
    
    def execute_update(self, query: str, params: Optional[tuple] = None) -> int:
        """Execute an UPDATE query and return affected rows count"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                conn.commit()
                return cursor.rowcount

# Global client instance
db_client = PostgreSQLClient()