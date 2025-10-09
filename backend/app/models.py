
from flask_sqlalchemy import SQLAlchemy
import uuid
from datetime import datetime

db = SQLAlchemy()



class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(120))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    skills = db.relationship('Skill', backref='user', lazy=True)
    roadmaps = db.relationship('Roadmap', backref='user', lazy=True)

class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class JobPosting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    required_skills = db.relationship('RequiredSkill', backref='job_posting', lazy=True)

class RequiredSkill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    skill_name = db.Column(db.String(100), nullable=False)
    job_posting_id = db.Column(db.Integer, db.ForeignKey('job_posting.id'), nullable=False)

# New models for endpoints 1-6
class Analysis(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    target_skill = db.Column(db.String(200), nullable=False)
    resume_filename = db.Column(db.String(255), nullable=False)
    resume_path = db.Column(db.String(500), nullable=False)
    status = db.Column(db.String(20), default='processing')  # processing, completed, failed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    # Relationships
    user_profile = db.relationship('UserProfile', backref='analysis', uselist=False)
    recommended_skills = db.relationship('RecommendedSkill', backref='analysis', lazy=True)

class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    analysis_id = db.Column(db.String(36), db.ForeignKey('analysis.id'), nullable=False)
    name = db.Column(db.String(100))
    current_level = db.Column(db.String(50))
    extracted_skills = db.Column(db.Text)  # JSON string
    notes = db.Column(db.Text)

class RecommendedSkill(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Auto-generated unique ID
    skill_id = db.Column(db.String(10), nullable=False)  # sk_01, sk_02, etc. (per analysis)
    analysis_id = db.Column(db.String(36), db.ForeignKey('analysis.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    inferred_level = db.Column(db.String(50))
    recommended_level = db.Column(db.String(50))
    estimated_duration_weeks = db.Column(db.Integer)
    score = db.Column(db.Float)
    
    # Create unique constraint on skill_id + analysis_id combination
    __table_args__ = (db.UniqueConstraint('skill_id', 'analysis_id', name='uq_skill_analysis'),)

class RoadmapJob(db.Model):
    id = db.Column(db.String(20), primary_key=True)  # job_55f3d2
    analysis_id = db.Column(db.String(36), db.ForeignKey('analysis.id'), nullable=False)
    status = db.Column(db.String(20), default='generating')  # generating, completed, failed
    roadmap_id = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

class Roadmap(db.Model):
    id = db.Column(db.String(20), primary_key=True)  # rm_8523ab
    analysis_id = db.Column(db.String(36), db.ForeignKey('analysis.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    estimated_total_duration_months = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)
    is_saved = db.Column(db.Boolean, default=False)
    
    # Relationships
    phases = db.relationship('RoadmapPhase', backref='roadmap', lazy=True, cascade='all, delete-orphan')

class RoadmapPhase(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Auto-generated unique ID
    phase_id = db.Column(db.String(10), nullable=False)  # p1, p2, etc. (per roadmap)
    roadmap_id = db.Column(db.String(20), db.ForeignKey('roadmap.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    duration_weeks = db.Column(db.Integer)
    goals = db.Column(db.Text)  # JSON string
    resources = db.Column(db.Text)  # JSON string
    progress_percent = db.Column(db.Integer, default=0)
    order_index = db.Column(db.Integer)
    
    # Create unique constraint on phase_id + roadmap_id combination
    __table_args__ = (db.UniqueConstraint('phase_id', 'roadmap_id', name='uq_phase_roadmap'),)