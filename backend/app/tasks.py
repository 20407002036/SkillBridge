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
                selected_skill_ids=json.dumps(selected_skill_ids),  # Store selected skills
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
                    progress_percent=phase_data['progress_percent']
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


@celery.task(bind=True, name='app.tasks.generate_pdf_task')
def generate_pdf_task(self, pdf_job_id: str, roadmap_id: str):
    """
    Celery task to generate PDF for a roadmap
    """
    from app import create_app
    from app.models import db, PDFJob
    from datetime import datetime
    
    app = create_app()
    
    with app.app_context():
        try:
            # Get PDF job record
            pdf_job = PDFJob.query.get(pdf_job_id)
            if not pdf_job:
                return {"error": "PDF job not found"}
            
            # Get roadmap data
            roadmap_data = get_roadmap_data(roadmap_id)
            if not roadmap_data:
                pdf_job.status = 'failed'
                pdf_job.error_message = 'Roadmap not found'
                pdf_job.completed_at = datetime.utcnow()
                db.session.commit()
                return {"error": "Roadmap not found"}
            
            # Generate PDF content (this will be stored in memory, not saved to disk)
            pdf_content = generate_pdf_content(roadmap_data)
            
            # Mark as completed
            pdf_job.status = 'completed'
            pdf_job.completed_at = datetime.utcnow()
            db.session.commit()
            
            return {
                "status": "completed",
                "pdf_job_id": pdf_job_id,
                "roadmap_id": roadmap_id
            }
            
        except Exception as e:
            # Mark as failed
            try:
                pdf_job = PDFJob.query.get(pdf_job_id)
                if pdf_job:
                    pdf_job.status = 'failed'
                    pdf_job.error_message = str(e)
                    pdf_job.completed_at = datetime.utcnow()
                    db.session.commit()
            except Exception as rollback_error:
                print(f"Failed to update PDF job status after error: {rollback_error}")
                db.session.rollback()
            
            print(f"PDF generation error: {e}")
            return {"error": str(e)}


def get_roadmap_data(roadmap_id: str):
    """
    Retrieve complete roadmap data from database
    """
    from app.models import Roadmap, RoadmapPhase, Analysis, UserProfile, RecommendedSkill
    import json
    
    # Get roadmap with all related data
    roadmap = Roadmap.query.get(roadmap_id)
    if not roadmap:
        return None
    
    # Get analysis data
    analysis = Analysis.query.get(roadmap.analysis_id)
    user_profile = UserProfile.query.filter_by(analysis_id=roadmap.analysis_id).first()
    
    # Get selected skill IDs from roadmap
    selected_skill_ids = json.loads(roadmap.selected_skill_ids) if roadmap.selected_skill_ids else []
    
    # Filter recommended skills to only include selected ones
    if selected_skill_ids:
        recommended_skills = RecommendedSkill.query.filter(
            RecommendedSkill.analysis_id == roadmap.analysis_id,
            RecommendedSkill.skill_id.in_(selected_skill_ids)
        ).all()
    else:
        # Fallback: get all skills if no selection stored
        recommended_skills = RecommendedSkill.query.filter_by(analysis_id=roadmap.analysis_id).all()
    
    # Get phases
    phases = RoadmapPhase.query.filter_by(roadmap_id=roadmap_id).order_by(RoadmapPhase.phase_id).all()
    
    # Structure data for PDF
    roadmap_data = {
        'roadmap': {
            'id': roadmap.id,
            'title': roadmap.title,
            'estimated_total_duration_months': roadmap.estimated_total_duration_months,
            'created_at': roadmap.created_at.strftime('%B %d, %Y'),
            'notes': roadmap.notes
        },
        'user_profile': {
            'name': user_profile.name if user_profile else 'Anonymous User',
            'current_level': user_profile.current_level if user_profile else 'Beginner',
            'target_skill': analysis.target_skill if analysis else 'Professional Development'
        },
        'recommended_skills': [
            {
                'name': skill.name,
                'description': skill.description,
                'inferred_level': skill.inferred_level,
                'recommended_level': skill.recommended_level,
                'estimated_duration_weeks': skill.estimated_duration_weeks
            }
            for skill in recommended_skills
        ],
        'phases': []
    }
    
    # Add phases with parsed JSON data
    for phase in phases:
        phase_data = {
            'phase_id': phase.phase_id,
            'title': phase.title,
            'duration_weeks': phase.duration_weeks,
            'goals': json.loads(phase.goals) if phase.goals else [],
            'resources': json.loads(phase.resources) if phase.resources else [],
            'progress_percent': phase.progress_percent
        }
        roadmap_data['phases'].append(phase_data)
    
    return roadmap_data


def generate_pdf_content(roadmap_data):
    """
    Generate PDF content using WeasyPrint
    """
    try:
        from weasyprint import HTML, CSS
        from jinja2 import Template
        import os
        
        # Create HTML template for PDF
        html_template = get_pdf_template()
        
        # Render template with data
        template = Template(html_template)
        html_content = template.render(**roadmap_data)
        
        # Generate PDF
        html_doc = HTML(string=html_content)
        css_styles = CSS(string=get_pdf_styles())
        
        pdf_bytes = html_doc.write_pdf(stylesheets=[css_styles])
        
        return pdf_bytes
        
    except ImportError:
        # Fallback if WeasyPrint is not installed
        print("WeasyPrint not installed. Please install it: pip install weasyprint")
        raise Exception("PDF generation library not available")
    except Exception as e:
        print(f"PDF generation error: {e}")
        raise


def get_pdf_template():
    """
    HTML template for PDF generation
    """
    return """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ roadmap.title }} - SkillBridge Roadmap</title>
</head>
<body>
    <div class="header">
        <div class="logo">
            <h1>SkillBridge</h1>
            <p>Personalized Learning Roadmap</p>
        </div>
        <div class="user-info">
            <h2>{{ user_profile.name }}</h2>
            <p>Target: {{ user_profile.target_skill }}</p>
            <p>Current Level: {{ user_profile.current_level }}</p>
        </div>
    </div>
    
    <div class="roadmap-title">
        <h1>{{ roadmap.title }}</h1>
        <p class="duration">Estimated Duration: {{ roadmap.estimated_total_duration_months }} months</p>
        <p class="created">Generated on {{ roadmap.created_at }}</p>
    </div>
    
    <div class="skills-overview">
        <h2>Recommended Skills</h2>
        <div class="skills-grid">
            {% for skill in recommended_skills %}
            <div class="skill-card">
                <h3>{{ skill.name }}</h3>
                <p class="description">{{ skill.description }}</p>
                <div class="skill-details">
                    <span class="level">{{ skill.inferred_level }} → {{ skill.recommended_level }}</span>
                    <span class="duration">{{ skill.estimated_duration_weeks }} weeks</span>
                </div>
            </div>
            {% endfor %}
        </div>
    </div>
    
    <div class="roadmap-phases">
        <h2>Learning Phases</h2>
        {% for phase in phases %}
        <div class="phase">
            <div class="phase-header">
                <h3>{{ phase.title }}</h3>
                <span class="phase-duration">{{ phase.duration_weeks }} weeks</span>
            </div>
            
            {% if phase.goals %}
            <div class="phase-goals">
                <h4>Goals:</h4>
                <ul>
                    {% for goal in phase.goals %}
                    <li>{{ goal }}</li>
                    {% endfor %}
                </ul>
            </div>
            {% endif %}
            
            {% if phase.resources %}
            <div class="phase-resources">
                <h4>Resources:</h4>
                <ul>
                    {% for resource in phase.resources %}
                    <li>
                        <strong>{{ resource.title }}</strong>
                        {% if resource.url %} - {{ resource.url }}{% endif %}
                        {% if resource.type %} ({{ resource.type }}){% endif %}
                    </li>
                    {% endfor %}
                </ul>
            </div>
            {% endif %}
        </div>
        {% endfor %}
    </div>
    
    <div class="footer">
        <p>Generated by SkillBridge - Your AI-Powered Learning Companion</p>
        <p>Visit us at skillbridge.ai for more personalized roadmaps</p>
    </div>
</body>
</html>
"""


def get_pdf_styles():
    """
    CSS styles for PDF
    """
    return """
@page {
    size: A4;
    margin: 2cm;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
    margin: 0;
    padding: 0;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid #137fec;
    padding-bottom: 20px;
    margin-bottom: 30px;
}

.logo h1 {
    color: #137fec;
    font-size: 24px;
    margin: 0;
}

.logo p {
    color: #666;
    margin: 5px 0 0 0;
    font-size: 14px;
}

.user-info {
    text-align: right;
}

.user-info h2 {
    margin: 0;
    font-size: 18px;
    color: #333;
}

.user-info p {
    margin: 3px 0;
    font-size: 12px;
    color: #666;
}

.roadmap-title {
    text-align: center;
    margin-bottom: 40px;
}

.roadmap-title h1 {
    color: #137fec;
    font-size: 28px;
    margin-bottom: 10px;
}

.duration, .created {
    color: #666;
    font-size: 14px;
    margin: 5px 0;
}

.skills-overview {
    margin-bottom: 40px;
}

.skills-overview h2 {
    color: #333;
    border-bottom: 2px solid #137fec;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

.skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
}

.skill-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 15px;
    background: #f9f9f9;
}

.skill-card h3 {
    margin: 0 0 10px 0;
    color: #137fec;
    font-size: 16px;
}

.skill-card .description {
    font-size: 12px;
    color: #666;
    margin-bottom: 10px;
}

.skill-details {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
}

.level {
    color: #137fec;
    font-weight: bold;
}

.duration {
    color: #666;
}

.roadmap-phases h2 {
    color: #333;
    border-bottom: 2px solid #137fec;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

.phase {
    margin-bottom: 30px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    background: #fff;
}

.phase-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

.phase-header h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
}

.phase-duration {
    background: #137fec;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
}

.phase-goals, .phase-resources {
    margin-bottom: 15px;
}

.phase-goals h4, .phase-resources h4 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 14px;
}

.phase-goals ul, .phase-resources ul {
    margin: 0;
    padding-left: 20px;
}

.phase-goals li, .phase-resources li {
    margin-bottom: 5px;
    font-size: 12px;
}

.footer {
    margin-top: 50px;
    text-align: center;
    border-top: 1px solid #e0e0e0;
    padding-top: 20px;
    color: #666;
    font-size: 11px;
}

.footer p {
    margin: 5px 0;
}
"""