"""
AI Service - Main interface for AI operations
This module provides interfaces for resume analysis and roadmap generation
Integrates with multiple LLM providers (Gemini, etc.)
"""
import json
import os
from typing import Dict, List, Tuple

# Import LLM services
from .gemini import GeminiService
from dotenv import load_dotenv

class AIService:
    """
    Main AI service that can work with multiple LLM providers
    Currently supports Gemini, easily extensible for other providers
    """
    
    def __init__(self):
        """Initialize AI service with available LLM providers"""
        self.gemini_service = None

        load_dotenv()
        
        # Initialize Gemini if API key is available
        try:
            if os.getenv('GEMINI_API_KEY') or os.environ.get("GEMINI_API_KEY"):
                self.gemini_service = GeminiService()
                print("✅ Gemini service initialized")
            else:
                print("⚠️  GEMINI_API_KEY not found, using fallback mode")
        except Exception as e:
            print(f"⚠️  Gemini initialization failed: {e}, using fallback mode")
    
    @staticmethod
    def analyze_resume(resume_text: str, target_skill: str) -> Tuple[Dict, List[Dict]]:
        """
        Analyze resume and extract user profile + recommend skills
        
        Args:
            resume_text: Extracted text from uploaded resume
            target_skill: Target skill/role user wants to achieve
            
        Returns:
            Tuple of (user_profile, recommended_skills)
        """
        # Create service instance to access LLM providers
        service = AIService()
        
        if service.gemini_service:
            try:
                return service.gemini_service.analyze_resume(resume_text, target_skill)
            except Exception as e:
                print(f"Gemini analysis failed: {e}, falling back to mock data")
        
        # Fallback to mock implementation
        return AIService._fallback_analyze_resume(resume_text, target_skill)
    
    @staticmethod
    def generate_roadmap(selected_skills: List[str], preferences: Dict, user_profile: Dict) -> Dict:
        """
        Generate personalized learning roadmap
        
        Args:
            selected_skills: List of selected skill IDs from recommendations
            preferences: User learning preferences (weekly_hours, target_duration_months, etc.)
            user_profile: User profile from analysis
            
        Returns:
            Roadmap data structure
        """
        # Create service instance to access LLM providers
        service = AIService()
        
        # Try Gemini first
        if service.gemini_service:
            try:
                return service.gemini_service.generate_roadmap(selected_skills, preferences, user_profile)
            except Exception as e:
                print(f"Gemini roadmap generation failed: {e}, falling back to mock data")
        
        # Fallback to mock implementation
        return AIService._fallback_generate_roadmap(selected_skills, preferences, user_profile)
    
    @staticmethod
    def _fallback_analyze_resume(resume_text: str, target_skill: str) -> Tuple[Dict, List[Dict]]:
        """
        Analyze resume and extract user profile + recommend skills
        
        Args:
            resume_text: Extracted text from uploaded resume
            target_skill: Target skill/role user wants to achieve
            
        Returns:
            Tuple of (user_profile, recommended_skills)
        """
        # TODO: Replace this with your LLM implementation
        
        # Mock user profile extraction
        user_profile = {
            "name": "John Doe",  # Extract from resume
            "current_level": "Beginner",  # Infer from experience
            "extracted_skills": [
                {"skill": "Python", "confidence": 0.8},
                {"skill": "HTML", "confidence": 0.9},
                {"skill": "SQL", "confidence": 0.7}
            ],
            "notes": f"User has basic experience and wants to become a {target_skill}"
        }
        
        # Mock skill recommendations
        recommended_skills = [
            {
                "skill_id": "sk_01",
                "name": "Advanced Python",
                "description": "Deep dive into Python frameworks and best practices",
                "inferred_level": "Beginner",
                "recommended_level": "Intermediate",
                "estimated_duration_weeks": 8,
                "score": 0.95
            },
            {
                "skill_id": "sk_02", 
                "name": "Data Structures & Algorithms",
                "description": "Core CS concepts for problem solving",
                "inferred_level": "Novice",
                "recommended_level": "Intermediate", 
                "estimated_duration_weeks": 12,
                "score": 0.87
            },
            {
                "skill_id": "sk_03",
                "name": "Web Development",
                "description": "Full-stack web development skills",
                "inferred_level": "Beginner",
                "recommended_level": "Advanced",
                "estimated_duration_weeks": 16,
                "score": 0.82
            }
        ]
        


        return user_profile, recommended_skills
    
    @staticmethod
    def _fallback_generate_roadmap(selected_skills: List[str], preferences: Dict, user_profile: Dict) -> Dict:
        """
        Fallback roadmap generation when LLM services are unavailable
        
        Args:
            selected_skills: List of selected skill IDs from recommendations
            preferences: User learning preferences (weekly_hours, target_duration_months, etc.)
            user_profile: User profile from analysis
            
        Returns:
            Roadmap data structure
        """
        # TODO: Replace this with your LLM implementation
        
        weekly_hours = preferences.get('weekly_hours', 10)
        target_months = preferences.get('target_duration_months', 6)
        learning_style = preferences.get('learning_style', 'project_based')
        
        # Mock roadmap generation
        phases = []
        for i, skill_id in enumerate(selected_skills[:3], 1):  # Limit to 3 phases for demo
            phase = {
                "phase_id": f"p{i}",
                "title": f"Phase {i}: Master Core Skills",
                "duration_weeks": 8,
                "goals": [
                    f"Complete foundational learning for skill {skill_id}",
                    "Build practical project",
                    "Practice and reinforce concepts"
                ],
                "resources": [
                    {
                        "type": "COURSE",
                        "source": "Udemy",
                        "title": f"Complete {skill_id} Course",
                        "url": "https://udemy.com/sample-course",
                        "estimated_hours": 30
                    },
                    {
                        "type": "ARTICLE",
                        "source": "Documentation",
                        "title": f"Official {skill_id} Docs",
                        "url": "https://docs.example.com"
                    }
                ],
                "progress_percent": 0
            }
            phases.append(phase)
        
        roadmap = {
            "title": f"Roadmap to {user_profile.get('name', 'Your Goal')}",
            "estimated_total_duration_months": target_months,
            "phases": phases,
            "notes": f"Tailored for {learning_style} learning style with {weekly_hours} hours per week"
        }
        
        return roadmap

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    try:
        import PyPDF2
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
        return text
    except Exception as e:
        return f"Error extracting PDF: {str(e)}"

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file"""
    try:
        from docx import Document
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        return f"Error extracting DOCX: {str(e)}"