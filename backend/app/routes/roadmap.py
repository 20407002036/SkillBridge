from flask import Blueprint, request, jsonify
from app.models import db, Analysis, RoadmapJob, Roadmap, RoadmapPhase
from app.tasks import generate_roadmap_task
import uuid
import json

roadmap_bp = Blueprint('roadmap', __name__)

@roadmap_bp.route('/confirm-recommendations', methods=['POST'])
def confirm_recommendations():
    """
    Endpoint 4: POST /confirm-recommendations
    User confirms selected recommended skills and requests generation of a personalized roadmap
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        analysis_id = data.get('analysis_id')
        selected_skill_ids = data.get('selected_skill_ids', [])
        user_id = data.get('user_id')
        preferences = data.get('preferences', {})
        
        if not analysis_id:
            return jsonify({"error": "analysis_id is required"}), 400
        
        if not selected_skill_ids:
            return jsonify({"error": "At least one skill must be selected"}), 400
        
        # Verify analysis exists and is completed
        analysis = Analysis.query.get(analysis_id)
        if not analysis:
            return jsonify({"error": "Analysis not found"}), 404
        
        if analysis.status != 'completed':
            return jsonify({"error": "Analysis not completed yet"}), 400
        
        # Update analysis with user_id if provided
        if user_id:
            analysis.user_id = user_id
        
        # Create roadmap job
        roadmap_job_id = f"job_{uuid.uuid4().hex[:6]}"
        roadmap_job = RoadmapJob(
            id=roadmap_job_id,
            analysis_id=analysis_id,
            status='generating'
        )
        
        db.session.add(roadmap_job)
        db.session.commit()
        
        # Start asynchronous roadmap generation
        generate_roadmap_task.delay(
            roadmap_job_id, 
            analysis_id, 
            selected_skill_ids, 
            preferences
        )
        
        return jsonify({
            "message": "Roadmap generation started",
            "roadmap_job_id": roadmap_job_id,
            "roadmap_id": None,
            "status": "generating"
        }), 202
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@roadmap_bp.route('/roadmap/status/<roadmap_job_id>', methods=['GET'])
def get_roadmap_status(roadmap_job_id):
    """
    Endpoint 5: GET /roadmap/status/{roadmap_job_id}
    Poll the job status for roadmap generation
    """
    try:
        roadmap_job = RoadmapJob.query.get(roadmap_job_id)
        
        if not roadmap_job:
            return jsonify({"error": "Roadmap job not found"}), 404
        
        response_data = {
            "roadmap_job_id": roadmap_job_id,
            "status": roadmap_job.status
        }
        
        if roadmap_job.roadmap_id:
            response_data["roadmap_id"] = roadmap_job.roadmap_id
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@roadmap_bp.route('/roadmaps/<roadmap_id>', methods=['GET'])
def get_roadmap(roadmap_id):
    """
    Endpoint 6: GET /roadmaps/{roadmap_id}
    Fetch the generated personalized roadmap for display
    """
    try:
        # Get roadmap record
        roadmap = Roadmap.query.get(roadmap_id)
        
        if not roadmap:
            return jsonify({"error": "Roadmap not found"}), 404
        
        # Get roadmap phases
        phases = RoadmapPhase.query.filter_by(roadmap_id=roadmap_id).order_by(RoadmapPhase.order_index).all()
        
        # Format phases data
        phases_data = []
        for phase in phases:
            phase_data = {
                "phase_id": phase.id,
                "title": phase.title,
                "duration_weeks": phase.duration_weeks,
                "goals": json.loads(phase.goals or "[]"),
                "resources": json.loads(phase.resources or "[]"),
                "progress_percent": phase.progress_percent
            }
            phases_data.append(phase_data)
        
        # Format roadmap response
        response_data = {
            "roadmap_id": roadmap.id,
            "analysis_id": roadmap.analysis_id,
            "user_id": roadmap.user_id,
            "title": roadmap.title,
            "estimated_total_duration_months": roadmap.estimated_total_duration_months,
            "created_at": roadmap.created_at.isoformat() + "Z",
            "phases": phases_data,
            "notes": roadmap.notes
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500