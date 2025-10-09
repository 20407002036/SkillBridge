from flask import Blueprint, jsonify

jobdata_bp = Blueprint('jobdata', __name__)

@jobdata_bp.route('/api/jobdata', methods=['GET'])
def get_job_data():
    # More detailed mock job data
    job_data = [
        {
            "title": "Software Engineer",
            "company": "TechNova",
            "location": "Remote",
            "salary_range": "Ksh.80,000 - Ksh.120,000",
            "description": "Develop and maintain scalable web applications using Python and modern frameworks.",
            "requirements": [
                "Bachelor's degree in Computer Science or related field",
                "3+ years experience in software development",
                "Strong problem-solving skills"
            ],
            "skills": ["Python", "Flask", "React", "Docker", "Git", "REST APIs", "Unit Testing"]
        },
        {
            "title": "Data Scientist",
            "company": "Insight Analytics",
            "location": "Nairobi, Kenya",
            "salary_range": "Ksh.70,000 - Ksh.110,000",
            "description": "Analyze large datasets to extract actionable insights and build predictive models.",
            "requirements": [
                "Master's degree in Data Science, Statistics, or related field",
                "Experience with machine learning algorithms",
                "Excellent communication skills"
            ],
            "skills": ["Python", "SQL", "Machine Learning", "Pandas", "TensorFlow", "Data Visualization", "Statistics"]
        },
        {
            "title": "Frontend Developer",
            "company": "WebWorks",
            "location": "Hybrid (Nairobi/Remote)",
            "salary_range": "Ksh.60,000 - Ksh.90,000",
            "description": "Design and implement user interfaces for web applications using modern JavaScript frameworks.",
            "requirements": [
                "2+ years experience in frontend development",
                "Portfolio of web projects",
                "Attention to detail"
            ],
            "skills": ["JavaScript", "React", "CSS", "HTML", "Redux", "Figma", "Responsive Design"]
        },
        {
            "title": "DevOps Engineer",
            "company": "CloudOps Ltd.",
            "location": "Remote",
            "salary_range": "Ksh.85,000 - Ksh.130,000",
            "description": "Automate deployment pipelines and manage cloud infrastructure for high-availability systems.",
            "requirements": [
                "Experience with AWS or Azure",
                "Knowledge of CI/CD tools",
                "Scripting skills (Bash, Python)"
            ],
            "skills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux", "Terraform", "Python"]
        },
        {
            "title": "Backend Developer",
            "company": "FinTech Solutions",
            "location": "Nairobi, Kenya",
            "salary_range": "Ksh.75,000 - Ksh.115,000",
            "description": "Build robust backend services and APIs for financial applications.",
            "requirements": [
                "Experience with RESTful API design",
                "Familiarity with databases (SQL/NoSQL)",
                "Strong debugging skills"
            ],
            "skills": ["Python", "Django", "PostgreSQL", "REST APIs", "Celery", "Redis", "Unit Testing"]
        }
    ]
    return jsonify(job_data)