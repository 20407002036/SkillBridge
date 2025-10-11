from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from app.models import db, Analysis
from app.tasks import process_resume_analysis
import os
import uuid

analysis_bp = Blueprint('analysis', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@analysis_bp.route('/upload-resume', methods=['POST'])
def upload_resume():
    """
    Endpoint 1: POST /upload-resume
    Upload a resume and target skill for analysis
    """
    try:
        # Check if the post request has the file part
        if 'resume' not in request.files:
            return jsonify({"error": "No resume file provided"}), 400
        
        file = request.files['resume']
        target_skill = request.form.get('target_skill')
        
        if not target_skill:
            return jsonify({"error": "Target skill is required"}), 400
        
        # If user does not select file, browser also submits an empty part without filename
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if file and allowed_file(file.filename):
            # Generate unique analysis ID
            analysis_id = str(uuid.uuid4())
            
            # Secure the filename and create unique filename
            filename = secure_filename(file.filename)
            unique_filename = f"{analysis_id}_{filename}"
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
            
            # Save the file
            file.save(file_path)
            
            # Create analysis record
            analysis = Analysis(
                id=analysis_id,
                target_skill=target_skill,
                resume_filename=filename,
                resume_path=file_path,
                status='processing'
            )
            
            db.session.add(analysis)
            db.session.commit()
            
            # Start asynchronous processing
            process_resume_analysis.delay(analysis_id)
            
            return jsonify({
                "message": "Resume uploaded successfully",
                "analysis_id": analysis_id,
                "status": "processing"
            }), 201
        else:
            return jsonify({"error": "File type not allowed. Please upload PDF or DOCX files."}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@analysis_bp.route('/status/<analysis_id>', methods=['GET'])
def get_analysis_status(analysis_id):
    """
    Endpoint 2: GET /status/{analysis_id}
    Check processing status of resume analysis
    """
    try:
        analysis = Analysis.query.get(analysis_id)
        
        if not analysis:
            return jsonify({"error": "Analysis not found"}), 404
        
        return jsonify({
            "analysis_id": analysis_id,
            "status": analysis.status
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500