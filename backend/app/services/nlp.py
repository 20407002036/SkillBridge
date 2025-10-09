"""
NLP Engine for Skill Extraction and Profile Intelligence
--------------------------------------------------------
This module leverages spaCy and intelligent keyword analysis
to extract technical and soft skills, detect entities, 
and summarize user resume or text input for recommendation systems.

Author: Dr. John | SkillBridge AI
"""

import re
import spacy
from typing import List, Dict, Any, Tuple
from collections import Counter

# Load spaCy model once at module level for performance
nlp = spacy.load("en_core_web_sm")

# ------------------------------------------------------------------
# 🔹 SKILL TAXONOMY (can be moved to a JSON or DB in production)
# ------------------------------------------------------------------
TECHNICAL_SKILLS = [
    "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "SQL", "NoSQL",
    "Flask", "Django", "FastAPI", "React", "Next.js", "Node.js", "Angular", "Vue",
    "HTML", "CSS", "Bootstrap", "Tailwind", "Git", "GitHub", "Linux", "Docker",
    "Kubernetes", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Matplotlib",
    "Data Science", "Machine Learning", "Deep Learning", "Data Visualization",
    "PostgreSQL", "MongoDB", "Redis", "AWS", "Azure", "Google Cloud",
    "CI/CD", "REST API", "GraphQL", "Figma", "Redux", "JIRA"
]

SOFT_SKILLS = [
    "Communication", "Leadership", "Problem Solving", "Creativity",
    "Teamwork", "Critical Thinking", "Adaptability", "Collaboration",
    "Decision Making", "Empathy", "Time Management", "Work Ethic",
    "Attention to Detail", "Emotional Intelligence", "Conflict Resolution",
    "Negotiation", "Flexibility", "Self Motivation"
]

# ------------------------------------------------------------------
# 🔹 TEXT PREPROCESSING
# ------------------------------------------------------------------
def clean_text(text: str) -> str:
    """Normalize and clean input text."""
    text = text.lower()
    text = re.sub(r"http\S+", "", text)  # remove URLs
    text = re.sub(r"[^a-z0-9\s\+\#\.]", " ", text)  # keep + and #
    text = re.sub(r"\s+", " ", text).strip()
    return text

# ------------------------------------------------------------------
# 🔹 ENTITY EXTRACTION
# ------------------------------------------------------------------
def extract_entities(text: str) -> List[Dict[str, Any]]:
    """
    Extract named entities (like organizations, skills, locations) using spaCy.
    """
    doc = nlp(text)
    entities = [
        {"text": ent.text, "label": ent.label_}
        for ent in doc.ents
        if ent.label_ in {"ORG", "PERSON", "GPE", "WORK_OF_ART", "FAC", "PRODUCT"}
    ]
    return entities

# ------------------------------------------------------------------
# 🔹 SKILL EXTRACTION ENGINE
# ------------------------------------------------------------------
def extract_skills(text: str) -> Dict[str, List[str]]:
    """
    Extract both technical and soft skills using a hybrid of keyword, 
    pattern, and NLP-based extraction.
    Returns structured dict of technical & soft skills.
    """
    cleaned = clean_text(text)
    doc = nlp(cleaned)

    found_technical = set()
    found_soft = set()

    # Token & phrase matching
    for token in doc:
        token_text = token.text.lower()
        for skill in TECHNICAL_SKILLS:
            if skill.lower() == token_text:
                found_technical.add(skill)
        for skill in SOFT_SKILLS:
            if skill.lower() == token_text:
                found_soft.add(skill)

    # Phrase-based (multiword skills)
    for skill in TECHNICAL_SKILLS + SOFT_SKILLS:
        if " " in skill and skill.lower() in cleaned:
            if skill in TECHNICAL_SKILLS:
                found_technical.add(skill)
            else:
                found_soft.add(skill)

    return {
        "technical_skills": sorted(found_technical),
        "soft_skills": sorted(found_soft),
    }

# ------------------------------------------------------------------
# 🔹 KEYWORD & TOPIC MINING
# ------------------------------------------------------------------
def extract_keywords(text: str, top_n: int = 10) -> List[str]:
    """
    Extract top recurring noun-based keywords for resume/topic summarization.
    """
    doc = nlp(text)
    freq = Counter(
        chunk.text.lower().strip()
        for chunk in doc.noun_chunks
        if len(chunk.text) > 2
    )
    top_keywords = [kw for kw, _ in freq.most_common(top_n)]
    return top_keywords

# ------------------------------------------------------------------
# 🔹 CAREER PATH RECOMMENDER (Basic Rule-based)
# ------------------------------------------------------------------
def recommend_path(technical_skills: List[str]) -> str:
    """
    Recommend a learning or career path based on dominant technical skills.
    """
    lower_skills = [s.lower() for s in technical_skills]

    if any(x in lower_skills for x in ["python", "pandas", "ml", "tensorflow", "data science"]):
        return "Pursue a career in Data Science or Machine Learning. Focus on Python, NumPy, and Model Deployment."
    elif any(x in lower_skills for x in ["react", "javascript", "node.js", "html", "css"]):
        return "Advance as a Full Stack Developer. Deepen skills in React, Node.js, and cloud deployment."
    elif any(x in lower_skills for x in ["java", "spring", "kotlin"]):
        return "Follow a Backend Engineering track with Java and Spring Boot."
    elif any(x in lower_skills for x in ["aws", "docker", "kubernetes"]):
        return "Explore a DevOps or Cloud Engineering career path focusing on AWS, CI/CD, and container orchestration."
    else:
        return "Focus on strengthening your core technical foundations. Explore Full Stack or Data Analytics pathways."

# ------------------------------------------------------------------
# 🔹 MASTER PIPELINE FUNCTION
# ------------------------------------------------------------------
def analyze_resume(text: str) -> Dict[str, Any]:
    """
    Full pipeline to extract skills, entities, keywords, and recommendations.
    Ideal for /api/recommendation endpoint.
    """
    cleaned = clean_text(text)
    entities = extract_entities(cleaned)
    skills = extract_skills(cleaned)
    keywords = extract_keywords(cleaned)
    recommended_path = recommend_path(skills["technical_skills"])

    return {
        "entities": entities,
        "technical_skills": skills["technical_skills"],
        "soft_skills": skills["soft_skills"],
        "keywords": keywords,
        "recommended_path": recommended_path,
    }

# ------------------------------------------------------------------
# 🔹 EXAMPLE USAGE
# ------------------------------------------------------------------
if __name__ == "__main__":
    sample_text = """
    John is a passionate software engineer skilled in Python, React, and Docker.
    He has experience in building REST APIs with Flask and deploying to AWS.
    Strong communication, leadership, and teamwork abilities.
    """
    result = analyze_resume(sample_text)
    import json
    print(json.dumps(result, indent=4))
