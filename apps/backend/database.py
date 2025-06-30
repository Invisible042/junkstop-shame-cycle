import os
from dotenv import load_dotenv
load_dotenv()
from supabase import create_client, Client
from typing import Optional
import asyncio
from datetime import datetime

# Supabase client
_supabase_client: Optional[Client] = None

def get_supabase_client() -> Client:
    """Get Supabase client with fallback to local storage"""
    global _supabase_client
    
    if _supabase_client is None:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_ANON_KEY")
        
        if supabase_url and supabase_key and supabase_url.startswith("http"):
            try:
                _supabase_client = create_client(supabase_url, supabase_key)
            except Exception as e:
                print(f"Failed to connect to Supabase: {e}")
                _supabase_client = LocalStorageClient()
        else:
            # Fallback to in-memory storage for local development
            _supabase_client = LocalStorageClient()
    
    return _supabase_client

class LocalStorageClient:
    """Local storage fallback for development without Supabase"""
    
    def __init__(self):
        self.data = {
            "users": [],
            "junk_food_logs": [],
            "community_posts": [],
            "achievements": [],
            "ai_insights": [],
            "community_post_likes": [],
            "community_post_replies": []
        }
        self.next_ids = {table: 1 for table in self.data.keys()}
    
    def table(self, table_name: str):
        return LocalTable(self.data, table_name, self.next_ids)

class LocalTable:
    """Local table implementation for fallback storage"""
    
    def __init__(self, data_store, table_name, next_ids):
        self.data_store = data_store
        self.table_name = table_name
        self.next_ids = next_ids
    
    def select(self, columns="*"):
        return LocalQuery(self.data_store, self.table_name, "select", columns)
    
    def insert(self, data):
        if isinstance(data, dict):
            data["id"] = self.next_ids[self.table_name]
            self.next_ids[self.table_name] += 1
            self.data_store[self.table_name].append(data)
            return LocalResult([data])
        return LocalResult([])
    
    def update(self, data):
        return LocalQuery(self.data_store, self.table_name, "update", data)
    
    def delete(self):
        return LocalQuery(self.data_store, self.table_name, "delete")

class LocalQuery:
    """Local query builder for fallback storage"""
    
    def __init__(self, data_store, table_name, operation, data=None):
        self.data_store = data_store
        self.table_name = table_name
        self.operation = operation
        self.data = data
        self.filters = []
        self.order_field = None
        self.order_desc = False
        self.limit_count = None
        self.range_start = None
        self.range_end = None
    
    def eq(self, field, value):
        self.filters.append(("eq", field, value))
        return self
    
    def gte(self, field, value):
        self.filters.append(("gte", field, value))
        return self
    
    def lte(self, field, value):
        self.filters.append(("lte", field, value))
        return self
    
    def order(self, field, desc=False):
        self.order_field = field
        self.order_desc = desc
        return self
    
    def limit(self, count):
        self.limit_count = count
        return self
    
    def range(self, start, end):
        self.range_start = start
        self.range_end = end
        return self
    
    def execute(self):
        records = self.data_store[self.table_name]
        
        # Apply filters
        filtered_records = []
        for record in records:
            match = True
            for filter_type, field, value in self.filters:
                if filter_type == "eq" and record.get(field) != value:
                    match = False
                    break
                elif filter_type == "gte" and record.get(field, "") < value:
                    match = False
                    break
                elif filter_type == "lte" and record.get(field, "") > value:
                    match = False
                    break
            if match:
                filtered_records.append(record)
        
        # Handle operations
        if self.operation == "update":
            for record in filtered_records:
                record.update(self.data)
            return LocalResult(filtered_records)
        
        elif self.operation == "delete":
            for record in filtered_records:
                self.data_store[self.table_name].remove(record)
            return LocalResult([])
        
        # Apply ordering
        if self.order_field:
            filtered_records.sort(
                key=lambda x: x.get(self.order_field, ""),
                reverse=self.order_desc
            )
        
        # Apply range/limit
        if self.range_start is not None and self.range_end is not None:
            filtered_records = filtered_records[self.range_start:self.range_end + 1]
        elif self.limit_count:
            filtered_records = filtered_records[:self.limit_count]
        
        return LocalResult(filtered_records)

class LocalResult:
    """Local result wrapper for fallback storage"""
    
    def __init__(self, data):
        self.data = data

# Database schema creation
DATABASE_SCHEMA = {
    "users": """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(100) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            streak_count INTEGER DEFAULT 0,
            best_streak INTEGER DEFAULT 0,
            total_guilt_score FLOAT DEFAULT 0,
            accountability_partner_id INTEGER,
            ai_coaching_enabled BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """,
    "junk_food_logs": """
        CREATE TABLE IF NOT EXISTS junk_food_logs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            photo_url TEXT,
            food_type VARCHAR(255) NOT NULL,
            guilt_rating INTEGER CHECK (guilt_rating >= 1 AND guilt_rating <= 10),
            regret_rating INTEGER CHECK (regret_rating >= 1 AND regret_rating <= 10),
            estimated_cost DECIMAL(10,2) DEFAULT 0,
            estimated_calories INTEGER DEFAULT 0,
            location TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """,
    "achievements": """
        CREATE TABLE IF NOT EXISTS achievements (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            badge_type VARCHAR(100) NOT NULL,
            badge_name VARCHAR(255) NOT NULL,
            description TEXT,
            earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """,
    "community_posts": """
        CREATE TABLE IF NOT EXISTS community_posts (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            photo_url TEXT,
            is_anonymous BOOLEAN DEFAULT true,
            likes_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """,
    "ai_insights": """
        CREATE TABLE IF NOT EXISTS ai_insights (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            insight_text TEXT NOT NULL,
            insight_type VARCHAR(100),
            generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """,
    "community_post_likes": """
        CREATE TABLE IF NOT EXISTS community_post_likes (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (user_id, post_id)
        );
    """,
    "community_post_replies": """
        CREATE TABLE IF NOT EXISTS community_post_replies (
            id SERIAL PRIMARY KEY,
            post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            is_anonymous BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """
}

async def create_tables():
    """Create database tables if using Supabase"""
    supabase = get_supabase_client()
    
    # If using real Supabase, tables should be created via Supabase dashboard
    # This is mainly for documentation of the schema
    if hasattr(supabase, 'rpc'):
        print("Using Supabase - ensure tables are created via dashboard")
    else:
        print("Using local storage fallback - tables created in memory")