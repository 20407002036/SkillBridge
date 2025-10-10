from flask import Blueprint, request, jsonify, send_file
from app.models import db, Analysis, RoadmapJob, Roadmap, RoadmapPhase, PDFJob
from app.tasks import generate_roadmap_task, generate_pdf_task
import uuid
import json
import io

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
        phases = RoadmapPhase.query.filter_by(roadmap_id=roadmap_id).order_by(RoadmapPhase.phase_id).all()
        
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
            "weekly_hours": roadmap.weekly_hours,
            "selected_skill_ids": json.loads(roadmap.selected_skill_ids or "[]"),
            "created_at": roadmap.created_at.isoformat() + "Z",
            "phases": phases_data,
            "notes": roadmap.notes
        }

        print("*"*80)
        print(json.dumps(response_data, indent=4))
        print("*"*80)
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@roadmap_bp.route('/roadmaps/<roadmap_id>/generate-pdf', methods=['POST'])
def generate_pdf(roadmap_id):
    """
    Generate PDF for a specific roadmap
    """
    try:
        # Check if roadmap exists
        roadmap = Roadmap.query.get(roadmap_id)
        if not roadmap:
            return jsonify({"error": "Roadmap not found"}), 404
        
        # Generate unique PDF job ID
        pdf_job_id = f"pdf_job_{uuid.uuid4().hex[:8]}"
        
        # Create PDF job record
        pdf_job = PDFJob(
            id=pdf_job_id,
            roadmap_id=roadmap_id,
            status='generating'
        )
        
        db.session.add(pdf_job)
        db.session.commit()
        
        # Start async PDF generation task
        generate_pdf_task.delay(pdf_job_id, roadmap_id)
        
        return jsonify({
            "pdf_job_id": pdf_job_id,
            "status": "generating"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@roadmap_bp.route('/pdf-status/<pdf_job_id>', methods=['GET'])
def get_pdf_status(pdf_job_id):
    """
    Check PDF generation status
    """
    try:
        pdf_job = PDFJob.query.get(pdf_job_id)
        if not pdf_job:
            return jsonify({"error": "PDF job not found"}), 404
        
        response_data = {
            "pdf_job_id": pdf_job_id,
            "status": pdf_job.status,
            "created_at": pdf_job.created_at.isoformat() + "Z"
        }
        
        if pdf_job.completed_at:
            response_data["completed_at"] = pdf_job.completed_at.isoformat() + "Z"
        
        if pdf_job.status == 'failed' and pdf_job.error_message:
            response_data["error_message"] = pdf_job.error_message
        
        if pdf_job.status == 'completed':
            response_data["download_url"] = f"/api/v1/download-pdf/{pdf_job_id}"
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@roadmap_bp.route('/download-pdf/<pdf_job_id>', methods=['GET'])
def download_pdf(pdf_job_id):
    """
    Download generated PDF
    """
    try:
        pdf_job = PDFJob.query.get(pdf_job_id)
        if not pdf_job:
            return jsonify({"error": "PDF job not found"}), 404
        
        if pdf_job.status != 'completed':
            return jsonify({"error": "PDF not ready for download"}), 400
        
        # Get roadmap data for filename
        roadmap = Roadmap.query.get(pdf_job.roadmap_id)
        if not roadmap:
            return jsonify({"error": "Associated roadmap not found"}), 404
        
        # Generate PDF content using the same task logic
        from app.tasks import get_roadmap_data, generate_pdf_content
        
        roadmap_data = get_roadmap_data(pdf_job.roadmap_id)
        pdf_content = generate_pdf_content(roadmap_data)
        
        # Create filename
        safe_title = "".join(c for c in roadmap.title if c.isalnum() or c in (' ', '-', '_')).rstrip()
        filename = f"SkillBridge_Roadmap_{safe_title}_{roadmap.id}.pdf"
        
        # Return PDF as download
        return send_file(
            io.BytesIO(pdf_content),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500