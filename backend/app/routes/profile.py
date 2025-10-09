from flask import Blueprint, request, jsonify, current_app
from app.models import db, User, Skill
import jwt, json

profile_bp = Blueprint('profile', __name__)

# ------------------- AUTH HELPER -------------------
def get_user_from_token():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.get(payload['user_id'])
        return user
    except Exception as e:
        print(f"JWT decode error: {e}")
        return None


# ------------------- RESUME UPLOAD -------------------
@profile_bp.route('/upload', methods=['POST'])
def upload_resume():
    user = get_user_from_token()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    file = request.files.get('resume')
    if not file:
        return jsonify({"error": "No resume file provided."}), 400

    filename = f"user_{user.id}_resume.pdf"
    filepath = f"static/resumes/{filename}"
    file.save(filepath)
    user.resume_url = f"/{filepath}"
    db.session.commit()

    return jsonify({
        "message": "Resume uploaded successfully.",
        "resume_url": user.resume_url
    }), 201


# ------------------- SKILLS MANAGEMENT -------------------

# Add new skills (soft or technical)
@profile_bp.route('/skills', methods=['POST'])
def add_skills():
    user = get_user_from_token()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    skills = request.json.get('skills', [])
    if not isinstance(skills, list):
        return jsonify({"error": "Skills must be a list."}), 400

    added = []
    existing = {s.name.lower() for s in user.skills}

    for skill in skills:
        name = skill.get('name')
        skill_type = skill.get('type', 'technical').lower()  # default to technical

        if name and name.lower() not in existing:
            db.session.add(Skill(name=name, type=skill_type, user_id=user.id))
            added.append(name)

    db.session.commit()
    return jsonify({
        "message": "Skills added successfully.",
        "added": added,
        "skills": [{"name": s.name, "type": s.type} for s in user.skills]
    }), 201


# Get all skills
@profile_bp.route('/skills', methods=['GET'])
def get_skills():
    user = get_user_from_token()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    all_skills = [{"name": s.name, "type": s.type} for s in user.skills]
    soft = [s for s in all_skills if s["type"] == "soft"]
    technical = [s for s in all_skills if s["type"] == "technical"]

    return jsonify({
        "skills": all_skills,
        "soft_skills": soft,
        "technical_skills": technical
    }), 200


# Remove a single skill by name
@profile_bp.route('/skills', methods=['DELETE'])
def remove_skill():
    user = get_user_from_token()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    skill_name = request.json.get('skill')
    if not skill_name:
        return jsonify({'error': 'Skill name required.'}), 400

    skill = Skill.query.filter_by(user_id=user.id, name=skill_name).first()
    if not skill:
        return jsonify({'error': 'Skill not found.'}), 404

    db.session.delete(skill)
    db.session.commit()

    return jsonify({
        'message': f"Skill '{skill_name}' removed.",
        'skills': [{"name": s.name, "type": s.type} for s in user.skills]
    }), 200


# Replace all skills
@profile_bp.route('/skills', methods=['PUT'])
def set_skills():
    user = get_user_from_token()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    skills = request.json.get('skills', [])
    if not isinstance(skills, list):
        return jsonify({"error": "Skills must be a list."}), 400

    # Wipe all old skills
    Skill.query.filter_by(user_id=user.id).delete()

    for skill in skills:
        name = skill.get('name')
        skill_type = skill.get('type', 'technical').lower()
        if name:
            db.session.add(Skill(name=name, type=skill_type, user_id=user.id))

    db.session.commit()
    return jsonify({
        "message": "Skills updated successfully.",
        "skills": [{"name": s.name, "type": s.type} for s in user.skills]
    }), 200


# ------------------- PROFILE MANAGEMENT -------------------

@profile_bp.route('/profile', methods=['GET'])
def get_profile():
    user = get_user_from_token()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    profile = {
        'id': user.id,
        'name': user.username,
        'email': user.email,
        'location': user.location,
        'bio': user.bio,
        'skills': [{"name": s.name, "type": s.type} for s in user.skills],
        'education': json.loads(user.education) if user.education else [],
        'experience': json.loads(user.experience) if user.experience else [],
        'resume_url': user.resume_url,
        'image_url': user.image_url
    }
    return jsonify(profile), 200


@profile_bp.route('/profile', methods=['PUT'])
def update_profile():
    user = get_user_from_token()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()

    # Update allowed fields
    user.username = data.get('name', user.username)
    user.email = data.get('email', user.email)
    user.location = data.get('location', user.location)
    user.bio = data.get('bio', user.bio)
    user.image_url = data.get('image_url', user.image_url)
    if 'education' in data:
        user.education = json.dumps(data['education'])
    if 'experience' in data:
        user.experience = json.dumps(data['experience'])

    db.session.commit()

    profile = {
        'id': user.id,
        'name': user.username,
        'email': user.email,
        'location': user.location,
        'bio': user.bio,
        'skills': [{"name": s.name, "type": s.type} for s in user.skills],
        'education': json.loads(user.education) if user.education else [],
        'experience': json.loads(user.experience) if user.experience else [],
        'resume_url': user.resume_url,
        'image_url': user.image_url
    }

    return jsonify({'message': 'Profile updated successfully.', 'profile': profile}), 200


@profile_bp.route('/profile', methods=['DELETE'])
def delete_profile():
    user = get_user_from_token()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Profile deleted successfully."}), 200
