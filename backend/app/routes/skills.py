from flask import Blueprint, jsonify
from app.models import db, Analysis, UserProfile, RecommendedSkill
import json

skills_bp = Blueprint('skills', __name__)

@skills_bp.route('/skills/<analysis_id>', methods=['GET'])
def get_recommended_skills(analysis_id):
    """
    Endpoint 3: GET /skills/{analysis_id}
    Retrieve AI-generated recommended skills and inferred profile after analysis completes
    """
    try:
        # Get analysis record
        analysis = Analysis.query.get(analysis_id)
        
        if not analysis:
            return jsonify({"error": "Analysis not found"}), 404
        
        if analysis.status != 'completed':
            return jsonify({
                "analysis_id": analysis_id,
                "status": analysis.status,
                "message": "Analysis not yet completed"
            }), 202
        
        # Get user profile
        user_profile = analysis.user_profile
        if not user_profile:
            return jsonify({"error": "User profile not found"}), 404
        
        # Get recommended skills
        recommended_skills = RecommendedSkill.query.filter_by(analysis_id=analysis_id).all()
        
        # Format user profile
        user_profile_data = {
            "name": user_profile.name,
            "target_skill": analysis.target_skill,
            "current_level": user_profile.current_level,
            "extracted_skills": json.loads(user_profile.extracted_skills or "[]")
        }
        
        # Format recommended skills
        recommended_skills_data = []
        for skill in recommended_skills:
            recommended_skills_data.append({
                "skill_id": skill.skill_id,  # Changed from skill.id to skill.skill_id
                "name": skill.name,
                "description": skill.description,
                "inferred_level": skill.inferred_level,
                "recommended_level": skill.recommended_level,
                "estimated_duration_weeks": skill.estimated_duration_weeks,
                "score": skill.score
            })
        
        # Sort by score (highest first)
        recommended_skills_data.sort(key=lambda x: x['score'], reverse=True)
        
        response_data = {
            "analysis_id": analysis_id,
            "message": "Analysis complete",
            "user_profile": user_profile_data,
            "recommended_skills": recommended_skills_data,
            "notes": user_profile.notes
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500