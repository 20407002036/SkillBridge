
from flask import Blueprint, jsonify, request
from app.services.nlp import extract_skills
from app.utils import compare_skills, categorize_skills
from app.routes.jobdata import get_job_data

recommend_bp = Blueprint('recommend', __name__)

@recommend_bp.route('/api/recommendations', methods=['GET'])
def get_recommendations_default():
    """
    Return default/sample recommendations for GET requests.
    """
    recommendations = [
        {"skill": "Flask", "resource": "Flask Mega Tutorial"},
        {"skill": "React", "resource": "React Docs Tutorial"},
        {"skill": "Django", "resource": "Django Official Tutorial"},
        {"skill": "Vue.js", "resource": "Vue.js Guide"},
        {"skill": "Angular", "resource": "Angular Tutorial"}
    ]
    return jsonify(recommendations)

@recommend_bp.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """
    Generate detailed skill recommendations based on user's resume text and job market data.
    Expects JSON: {"resume_text": str, "job_titles": [str]}
    """
    data = request.get_json()
    resume_text = data.get('resume_text', '')
    job_titles = data.get('job_titles', [])

    # Extract user skills from resume
    user_skills = extract_skills(resume_text)

    # Get job data (mocked from jobdata route)
    job_data = get_job_data().json
    market_skills = set()
    for job in job_data:
        if not job_titles or job['title'] in job_titles:
            market_skills.update(job['skills'])
    market_skills = list(market_skills)

    # Find missing skills
    missing_skills = compare_skills(user_skills, market_skills)

    # Categorize user and missing skills
    categorized_user_skills = categorize_skills(user_skills)
    categorized_missing_skills = categorize_skills(missing_skills)

    # Suggest resources for missing skills (mocked)
    recommendations = [
        {
            "skill": skill,
            "category": next((cat for cat, skills in categorized_missing_skills.items() if skill in skills), "Other"),
            "resource": f"Learn {skill} at https://www.google.com/search?q={skill}+tutorial"
        }
        for skill in missing_skills
    ]

    return jsonify({
        "user_skills": user_skills,
        "categorized_user_skills": categorized_user_skills,
        "market_skills": market_skills,
        "missing_skills": missing_skills,
        "categorized_missing_skills": categorized_missing_skills,
        "recommendations": recommendations
    })

@recommend_bp.route('/api/recommendations/manual', methods=['POST'])
def add_recommendation():
    """
    Add a manual recommendation (for admin or testing purposes).
    Expects JSON: {"skill": str, "resource": str}
    """
    data = request.get_json()
    # Here you would typically add the recommendation to a database
    return jsonify({"message": "Recommendation added", "data": data}), 201