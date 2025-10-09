"""
Celery application initialization
This file ensures proper task registration and Flask integration
"""
import os
from celery import Celery

def create_celery_app():
    """Create and configure Celery app"""
    
    # Create celery instance
    celery = Celery('skillbridge')
    
    # Configure Celery
    celery.conf.update(
        broker_url=os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
        result_backend=os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0'),
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,
        task_track_started=True,
        task_time_limit=30 * 60,  # 30 minutes
        task_soft_time_limit=25 * 60,  # 25 minutes
        include=['app.tasks']  # Auto-discover tasks
    )
    
    # Import tasks to register them
    from app import tasks
    
    return celery

# Create the celery app instance
celery = create_celery_app()