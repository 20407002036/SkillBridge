"""
Celery tasks for SkillBridge application
"""
import os
import json
import uuid
from datetime import datetime

# Import celery instance from the correct module
from app.celery_app import celery

@celery.task(bind=True, name='app.tasks.process_resume_analysis')
def process_resume_analysis(self, analysis_id: str):
    """
    Celery task to process resume analysis
    This runs asynchronously after file upload
    """
    # Import Flask app and models inside task to avoid circular imports
    from app import create_app
    from app.models import db, Analysis, UserProfile, RecommendedSkill
    from app.services.ai_service import AIService, extract_text_from_pdf, extract_text_from_docx
    
    app = create_app()
    
    with app.app_context():
        try:
            # Get analysis record
            analysis = Analysis.query.get(analysis_id)
            if not analysis:
                return {"error": "Analysis not found"}
            
            # Extract text from resume file
            file_extension = os.path.splitext(analysis.resume_filename)[1].lower()
            
            if file_extension == '.pdf':
                resume_text = extract_text_from_pdf(analysis.resume_path)
            elif file_extension in ['.docx', '.doc']:
                resume_text = extract_text_from_docx(analysis.resume_path)
            else:
                analysis.status = 'failed'
                db.session.commit()
                return {"error": "Unsupported file format"}
            
            # Use AI service to analyze resume (placeholder for your LLM)
            user_profile_data, recommended_skills_data = AIService.analyze_resume(
                resume_text, analysis.target_skill
            )
            
            # Save user profile
            user_profile = UserProfile(
                analysis_id=analysis_id,
                name=user_profile_data.get('name'),
                current_level=user_profile_data.get('current_level'),
                extracted_skills=json.dumps(user_profile_data.get('extracted_skills', [])),
                notes=user_profile_data.get('notes')
            )
            db.session.add(user_profile)
            
            # Save recommended skills
            for skill_data in recommended_skills_data:
                recommended_skill = RecommendedSkill(
                    skill_id=skill_data['skill_id'],  # Changed from 'id' to 'skill_id'
                    analysis_id=analysis_id,
                    name=skill_data['name'],
                    description=skill_data['description'],
                    inferred_level=skill_data['inferred_level'],
                    recommended_level=skill_data['recommended_level'],
                    estimated_duration_weeks=skill_data['estimated_duration_weeks'],
                    score=skill_data['score']
                )
                db.session.add(recommended_skill)
            
            # Update analysis status
            analysis.status = 'completed'
            analysis.completed_at = datetime.utcnow()
            db.session.commit()
            
            return {"status": "completed", "analysis_id": analysis_id}
            
        except Exception as e:
            # Rollback the session in case of any error
            db.session.rollback()
            
            # Mark analysis as failed
            try:
                analysis = Analysis.query.get(analysis_id)
                if analysis:
                    analysis.status = 'failed'
                    db.session.commit()
            except Exception as rollback_error:
                print(f"Failed to update analysis status after error: {rollback_error}")
                db.session.rollback()
            
            print(f"Resume analysis error: {e}")
            return {"error": str(e)}

@celery.task(bind=True, name='app.tasks.generate_roadmap_task')
def generate_roadmap_task(self, roadmap_job_id: str, analysis_id: str, selected_skill_ids: list, preferences: dict):
    """
    Celery task to generate personalized roadmap
    This runs asynchronously after user confirms skill selection
    """
    # Import Flask app and models inside task to avoid circular imports
    from app import create_app
    from app.models import db, Analysis, RoadmapJob, Roadmap, RoadmapPhase
    from app.services.ai_service import AIService
    
    app = create_app()
    
    with app.app_context():
        try:
            # Get roadmap job record
            roadmap_job = RoadmapJob.query.get(roadmap_job_id)
            if not roadmap_job:
                return {"error": "Roadmap job not found"}
            
            # Get analysis and user profile
            analysis = Analysis.query.get(analysis_id)
            if not analysis or not analysis.user_profile:
                roadmap_job.status = 'failed'
                db.session.commit()
                return {"error": "Analysis or user profile not found"}
            
            user_profile_data = {
                "name": analysis.user_profile.name,
                "current_level": analysis.user_profile.current_level,
                "extracted_skills": json.loads(analysis.user_profile.extracted_skills or "[]"),
                "notes": analysis.user_profile.notes
            }
            
            # Generate roadmap using AI service (placeholder for your LLM)
            roadmap_data = AIService.generate_roadmap(
                selected_skill_ids, preferences, user_profile_data
            )
            
            # Create roadmap record
            roadmap_id = f"rm_{uuid.uuid4().hex[:6]}"
            roadmap = Roadmap(
                id=roadmap_id,
                analysis_id=analysis_id,
                user_id=analysis.user_id,
                title=roadmap_data['title'],
                estimated_total_duration_months=roadmap_data['estimated_total_duration_months'],
                notes=roadmap_data['notes']
            )
            db.session.add(roadmap)
            
            # Create roadmap phases
            for i, phase_data in enumerate(roadmap_data['phases']):
                phase = RoadmapPhase(
                    phase_id=phase_data['phase_id'],  # Use phase_id instead of id
                    roadmap_id=roadmap_id,
                    title=phase_data['title'],
                    duration_weeks=phase_data['duration_weeks'],
                    goals=json.dumps(phase_data['goals']),
                    resources=json.dumps(phase_data['resources']),
                    progress_percent=phase_data['progress_percent'],
                    order_index=i
                )
                db.session.add(phase)
            
            # Update roadmap job
            roadmap_job.status = 'completed'
            roadmap_job.roadmap_id = roadmap_id
            roadmap_job.completed_at = datetime.utcnow()
            
            db.session.commit()
            
            return {"status": "completed", "roadmap_id": roadmap_id}
            
        except Exception as e:
            # Rollback the session in case of any error
            db.session.rollback()
            
            # Mark roadmap job as failed
            try:
                roadmap_job = RoadmapJob.query.get(roadmap_job_id)
                if roadmap_job:
                    roadmap_job.status = 'failed'
                    db.session.commit()
            except Exception as rollback_error:
                print(f"Failed to update roadmap job status after error: {rollback_error}")
                db.session.rollback()
            
            print(f"Roadmap generation error: {e}")
            return {"error": str(e)}