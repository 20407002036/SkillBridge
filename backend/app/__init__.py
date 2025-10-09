from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_mapping(
        SECRET_KEY='your_secret_key',
        SQLALCHEMY_DATABASE_URI='sqlite:///skillbridge.db',
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        UPLOAD_FOLDER=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads'),
        MAX_CONTENT_LENGTH=16 * 1024 * 1024  # 16MB max file size
    )
    
    # Enable CORS
    CORS(app)
    
    # Initialize database
    from .models import db
    db.init_app(app)
    
    # Create upload directory
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Create tables
    with app.app_context():
        db.create_all()

    # Register blueprints
    from .routes import profile, jobdata, gap, recommend
    from .routes import analysis, skills, roadmap  # New routes
    
    app.register_blueprint(profile.profile_bp, url_prefix='/api/v1')
    app.register_blueprint(jobdata.jobdata_bp, url_prefix='/api/v1')
    app.register_blueprint(gap.gap_bp, url_prefix='/api/v1')
    app.register_blueprint(recommend.recommend_bp, url_prefix='/api/v1')
    
    # Register new blueprints for endpoints 1-6
    app.register_blueprint(analysis.analysis_bp, url_prefix='/api/v1')
    app.register_blueprint(skills.skills_bp, url_prefix='/api/v1')
    app.register_blueprint(roadmap.roadmap_bp, url_prefix='/api/v1')

    return app