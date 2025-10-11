#!/usr/bin/env python3
"""
Force database reset script - explicitly drops and recreates tables
"""

import os
import sys

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app import create_app
from app.models import db

def force_reset_database():
    """Force reset the database by dropping and recreating all tables"""
    app = create_app()
    
    with app.app_context():
        # Database file path
        db_path = os.path.join(backend_dir, 'skillbridge.db')
        
        # Remove existing database file completely
        if os.path.exists(db_path):
            os.remove(db_path)
            print(f"✅ Removed existing database: {db_path}")
        
        # Force drop all tables if they exist
        try:
            db.drop_all()
            print("✅ Dropped all existing tables")
        except Exception as e:
            print(f"Note: {e}")
        
        # Create all tables with fresh schema
        db.create_all()
        print("✅ Created new database tables with updated schema")
        
        # Verify the schema
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        
        print("\n📋 Verifying RoadmapPhase table schema:")
        try:
            cols = inspector.get_columns('roadmap_phase')
            for col in cols:
                print(f"- {col['name']} ({col['type']})")
        except Exception as e:
            print(f"Error inspecting table: {e}")
        
        print("\n🎉 Database force reset complete!")
        print("You can now restart your Flask app and Celery worker.")

if __name__ == "__main__":
    force_reset_database()