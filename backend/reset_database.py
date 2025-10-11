#!/usr/bin/env python3
"""
Database reset script - removes existing database and creates new tables
Run this when you change database models
"""

import os
import sys

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app import create_app
from app.models import db

def reset_database():
    """Reset the database with new schema"""
    app = create_app()
    
    with app.app_context():
        # Database file path
        db_path = os.path.join(backend_dir, 'skillbridge.db')
        
        # Remove existing database file
        if os.path.exists(db_path):
            os.remove(db_path)
            print(f"✅ Removed existing database: {db_path}")
        
        # Create all tables with new schema
        db.create_all()
        print("✅ Created new database tables with updated schema")
        
        print("\n🎉 Database reset complete!")
        print("You can now restart your Flask app and Celery worker.")

if __name__ == "__main__":
    reset_database()