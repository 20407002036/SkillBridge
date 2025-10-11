#!/usr/bin/env python3
"""
Celery worker startup script that properly registers tasks

Run this script to start the Celery worker:
    python celery_worker.py
"""

import os
import sys

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Import and configure the Celery app
from app.celery_app import celery

# Import tasks to register them with Celery
import app.tasks

if __name__ == '__main__':
    print("Starting Celery worker with task registration...")
    print("Registered tasks:", list(celery.tasks.keys()))
    
    # Start the worker using the worker_main method
    try:
        celery.worker_main(['worker', '--loglevel=info', '--concurrency=1'])
    except KeyboardInterrupt:
        print("\nShutting down Celery worker...")