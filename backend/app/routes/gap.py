
from flask import Blueprint, request, jsonify
from app.services.nlp import extract_skills
from app.utils import compare_skills, categorize_skills, find_similar_skills
from app.routes.jobdata import get_job_data

gap_bp = Blueprint('gap', __name__)


@gap_bp.route('/api/gap/analyze', methods=['POST'])
def analyze_gap():
    """
    Analyze the skill gap between user's resume and market/job requirements.
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

    # Suggest resources and similar skills for missing skills
    recommendations = []
    for skill in missing_skills:
        similar = find_similar_skills(skill, user_skills, threshold=0.5)
        recommendations.append({
            "skill": skill,
            "category": next((cat for cat, skills in categorized_missing_skills.items() if skill in skills), "Other"),
            "resource": f"Learn {skill} at https://www.google.com/search?q={skill}+tutorial",
            "similar_user_skills": [s for s, score in similar if score < 1.0]
        })

    return jsonify({
        "user_skills": user_skills,
        "categorized_user_skills": categorized_user_skills,
        "market_skills": market_skills,
        "missing_skills": missing_skills,
        "categorized_missing_skills": categorized_missing_skills,
        "recommendations": recommendations
    })

    # Looking for recommendations? haaa! No longer needed, they are generated inline above