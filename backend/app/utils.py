import re
import difflib

from typing import List, Dict, Set, Tuple, Any
from app.services import nlp


def some_utility_function():
    # This function can be used for various utility tasks
    pass


def compare_skills(user_skills: List[str], market_skills: List[str]) -> List[str]:
    """
    Compare user skills with market demands and return missing skills (case-insensitive, normalized).
    Args:
        user_skills: List of skills the user currently has
        market_skills: List of skills demanded by the market/job
    Returns:
        List of skills that are missing from user's skillset
    """
    user_skills_normalized = {normalize_skill_name(skill) for skill in user_skills}
    market_skills_normalized = {normalize_skill_name(skill) for skill in market_skills}
    missing_skills = market_skills_normalized - user_skills_normalized
    # Return original case market skills that are missing
    missing_original = []
    for market_skill in market_skills:
        if normalize_skill_name(market_skill) in missing_skills:
            missing_original.append(market_skill)
    return missing_original


def normalize_skill_name(skill: str) -> str:
    """
    Normalize skill names for better matching.
    
    Args:
        skill: Raw skill name
    
    Returns:
        Normalized skill name
    """
    # Remove special characters and normalize whitespace
    normalized = re.sub(r'[^\w\s+#.]', '', skill)
    normalized = re.sub(r'\s+', ' ', normalized).strip()
    return normalized.lower()


def calculate_skill_similarity(skill1: str, skill2: str) -> float:
    """
    Calculate similarity between two skills using fuzzy matching.
    
    Args:
        skill1: First skill to compare
        skill2: Second skill to compare
    
    Returns:
        Similarity score between 0 and 1
    """
    normalized1 = normalize_skill_name(skill1)
    normalized2 = normalize_skill_name(skill2)
    
    return difflib.SequenceMatcher(None, normalized1, normalized2).ratio()


def find_similar_skills(target_skill: str, skill_list: List[str], threshold: float = 0.7) -> List[Tuple[str, float]]:
    """
    Find skills similar to the target skill.
    
    Args:
        target_skill: The skill to find matches for
        skill_list: List of skills to search in
        threshold: Minimum similarity threshold (0-1)
    
    Returns:
        List of tuples (skill, similarity_score) sorted by similarity
    """
    similarities = []
    
    for skill in skill_list:
        similarity = calculate_skill_similarity(target_skill, skill)
        if similarity >= threshold:
            similarities.append((skill, similarity))
    
    # Sort by similarity score (descending)
    similarities.sort(key=lambda x: x[1], reverse=True)
    
    return similarities


def extract_skills_from_text(text: str, skill_keywords: List[str] = None) -> List[str]:
    """
    Extract skills from text using the enhanced NLP module (token, phrase, and keyword matching).
    Args:
        text: Text to extract skills from
        skill_keywords: List of known skill keywords (optional)
    Returns:
        List of found skills
    """
    return nlp.extract_skills(text, skill_keywords)

def extract_entities_from_text(text: str) -> List[Dict[str, Any]]:
    """
    Extract named entities from text using the NLP module.
    Args:
        text: Text to extract entities from
    Returns:
        List of entities (dicts with 'text' and 'label')
    """
    return nlp.extract_entities(text)

def extract_keywords_from_text(text: str, top_n: int = 10) -> List[str]:
    """
    Extract top keywords from text using the NLP module.
    Args:
        text: Text to extract keywords from
        top_n: Number of keywords to return
    Returns:
        List of keywords
    """
    return nlp.extract_keywords(text, top_n=top_n)

def clean_and_normalize_text(text: str) -> str:
    """
    Clean and normalize text for NLP processing using the NLP module.
    Args:
        text: Raw text
    Returns:
        Cleaned text
    """
    return nlp.clean_text(text)

# High-level helper for skill gap analysis
def get_skill_gap_analysis(user_text: str, job_text: str, skill_keywords: List[str] = None) -> Dict[str, Any]:
    """
    Extract skills from user and job text, compare, and return gap analysis.
    Args:
        user_text: Resume or profile text
        job_text: Job description text
        skill_keywords: Optional list of skills to match
    Returns:
        Dict with user_skills, job_skills, missing_skills, and recommendations
    """
    user_skills = extract_skills_from_text(user_text, skill_keywords)
    job_skills = extract_skills_from_text(job_text, skill_keywords)
    missing_skills = compare_skills(user_skills, job_skills)
    recommendations = [
        {
            "skill": skill,
            "resource": f"Learn {skill} at https://www.google.com/search?q={skill}+tutorial"
        }
        for skill in missing_skills
    ]
    return {
        "user_skills": user_skills,
        "job_skills": job_skills,
        "missing_skills": missing_skills,
        "recommendations": recommendations
    }


def categorize_skills(skills: List[str]) -> Dict[str, List[str]]:
    """
    Categorize skills into different types.
    
    Args:
        skills: List of skills to categorize
    
    Returns:
        Dictionary with skill categories as keys and skill lists as values
    """
    # Predefined skill categories with common keywords
    categories = {
        'Programming Languages': ['python', 'java', 'javascript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'scala'],
        'Web Technologies': ['html', 'css', 'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask'],
        'Databases': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle'],
        'Cloud Platforms': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform'],
        'Data Science': ['pandas', 'numpy', 'sklearn', 'tensorflow', 'pytorch', 'tableau', 'power bi'],
        'Tools & DevOps': ['git', 'jenkins', 'ci/cd', 'linux', 'bash', 'vim', 'jira'],
        'Soft Skills': ['communication', 'leadership', 'teamwork', 'problem solving', 'project management']
    }
    
    categorized = {category: [] for category in categories.keys()}
    categorized['Other'] = []
    
    for skill in skills:
        skill_lower = skill.lower()
        categorized_flag = False
        
        for category, keywords in categories.items():
            if any(keyword in skill_lower for keyword in keywords):
                categorized[category].append(skill)
                categorized_flag = True
                break
        
        if not categorized_flag:
            categorized['Other'].append(skill)
    
    # Remove empty categories
    return {k: v for k, v in categorized.items() if v}


# Additional utility functions can be added here as needed.