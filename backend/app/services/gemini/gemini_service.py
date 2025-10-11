"""
Gemini AI Service for SkillBridge
Handles all Gemini API interactions for resume analysis and roadmap generation
"""
import os
import json
import time
from typing import Dict, List, Tuple, Optional
import google.generativeai as genai

class GeminiService:
    """
    Main Gemini service class for AI operations
    Handles resume analysis, skill recommendations, and roadmap generation
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini service
        
        Args:
            api_key: Gemini API key (if None, reads from environment)
        """
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("Gemini API key is required. Set GEMINI_API_KEY environment variable or pass api_key parameter.")
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        
        # Initialize model
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Retry configuration
        self.max_retries = 3
        self.retry_delay = 2  # seconds
    
    def analyze_resume(self, resume_text: str, target_skill: str) -> Tuple[Dict, List[Dict]]:
        """
        Analyze resume using Gemini and extract user profile + recommend skills
        
        Args:
            resume_text: Extracted text from uploaded resume
            target_skill: Target skill/role user wants to achieve
            
        Returns:
            Tuple of (user_profile, recommended_skills)
        """
        prompt = self._create_resume_analysis_prompt(resume_text, target_skill)
        
        try:
            response = self._call_gemini_with_retry(prompt)
            return self._parse_resume_analysis_response(response, target_skill)
        except Exception as e:
            print(f"Gemini resume analysis failed: {e}")
            # Fallback to mock data if Gemini fails
            return self._fallback_resume_analysis(target_skill)
    
    def generate_roadmap(self, selected_skills: List[str], preferences: Dict, user_profile: Dict) -> Dict:
        """
        Generate personalized learning roadmap using Gemini
        
        Args:
            selected_skills: List of selected skill IDs from recommendations
            preferences: User learning preferences
            user_profile: User profile from analysis
            
        Returns:
            Complete roadmap data structure
        """
        prompt = self._create_roadmap_generation_prompt(selected_skills, preferences, user_profile)
        
        try:
            response = self._call_gemini_with_retry(prompt)
            return self._parse_roadmap_response(response, preferences, user_profile)
        except Exception as e:
            print(f"Gemini roadmap generation failed: {e}")
            # Fallback to mock data if Gemini fails
            return self._fallback_roadmap_generation(selected_skills, preferences, user_profile)
    
    def _create_resume_analysis_prompt(self, resume_text: str, target_skill: str) -> str:
        """Create prompt for resume analysis"""
        return f"""
You are an expert career counselor and skills assessor. Analyze the following resume and provide insights for someone wanting to become a {target_skill}.

RESUME TEXT:
{resume_text}

TARGET ROLE: {target_skill}

Please analyze this resume and provide a JSON response with the following structure:

{{
    "user_profile": {{
        "name": "extracted name from resume",
        "current_level": "Beginner|Intermediate|Senior",
        "extracted_skills": [
            {{"skill": "skill_name", "confidence": 0.0-1.0}}
        ],
        "notes": "brief analysis of their background"
    }},
    "recommended_skills": [
        {{
            "skill_id": "sk_01",
            "name": "skill name",
            "description": "detailed description",
            "inferred_level": "None|Novice|Beginner|Intermediate",
            "recommended_level": "Beginner|Intermediate|Advanced",
            "estimated_duration_weeks": number,
            "score": 0.0-1.0
        }}
    ]
}}

Guidelines:
1. Extract actual name from resume (if not clear, use "Professional")
2. Assess current level based on experience, projects, and education
3. Extract 5-8 relevant technical skills with confidence scores
4. Recommend 4-6 skills specifically for the {target_skill} role
5. Score skills by relevance and impact for the target role
6. Provide realistic duration estimates
7. Ensure skill_ids are sequential (sk_01, sk_02, etc.)
7. IF THE resume_text DON'T RESEMBLE A RESUME, STO

Respond ONLY with valid JSON, no additional text.
"""
    
    def _create_roadmap_generation_prompt(self, selected_skills: List[str], preferences: Dict, user_profile: Dict) -> str:
        """Create prompt for roadmap generation"""
        weekly_hours = preferences.get('weekly_hours', 10)
        target_months = preferences.get('target_duration_months', 6)
        learning_style = preferences.get('learning_style', 'mixed')
        
        return f"""
You are an expert learning path designer. Analyze the following information and generate a personalized, realistic learning roadmap for the user.

Goal:
Design a structured roadmap that helps the user progress from their current level to mastery of the selected skills, considering their time availability and preferred learning style.

SELECTED SKILLS: {', '.join(selected_skills)}
USER PROFILE: {json.dumps(user_profile)}
PREFERENCES:
- Weekly hours: {weekly_hours}
- Target duration: {target_months} months
- Learning style: {learning_style}

Return ONLY valid JSON with this structure:

{{
  "title": "Descriptive roadmap title",
  "estimated_total_duration_months": {target_months},
  "phases": [
    {{
      "phase_id": "p1",
      "title": "Phase 1: Foundation Building",
      "duration_weeks": "number",
      "goals": [
        "specific learning goal 1",
        "specific learning goal 2"
      ],
      "resources": [
        {{
          "type": "COURSE|BOOK|PROJECT|ARTICLE|VIDEO|PRACTICE",
          "source": "platform or publisher",
          "title": "resource title",
          "url": "actual_url_if_available_or_blank",
          "estimated_hours": "number"
        }}
      ],
      "progress_percent": 0
    }}
  ],
  "notes": "personalized advice and tips"
}}

Guidelines:
1. Create 3-4 logical learning phases that build progressively.
2. Each phase should focus on 1-2 related skills.
3. Provide 3-4 actionable goals per phase.
4. Include at least 2 resource types per phase (e.g. COURSE + PROJECT + ARTICLE).
5. Use real, publicly available resources with legitimate URLs when possible.
6. If a specific link is unknown, leave the URL blank or use a verified domain homepage.
7. Consider user's current level, weekly hours, and target duration when allocating time.
8. Adapt recommendations based on learning style:
   - project_based → emphasize hands-on practice and projects
   - theory_first → prioritize structured courses and readings
   - mixed → balance both
9. Return only valid JSON — no explanations or text outside the JSON.

"""
    
    def _call_gemini_with_retry(self, prompt: str) -> str:
        """Call Gemini API with retry logic"""
        for attempt in range(self.max_retries):
            try:
                response = self.model.generate_content(prompt)
                if response.text:
                    return response.text
                else:
                    raise ValueError("Empty response from Gemini")
            except Exception as e:
                if attempt < self.max_retries - 1:
                    print(f"Gemini API attempt {attempt + 1} failed: {e}. Retrying in {self.retry_delay}s...")
                    time.sleep(self.retry_delay)
                else:
                    raise e
        
        raise Exception("All Gemini API attempts failed")
    
    def _parse_resume_analysis_response(self, response: str, target_skill: str) -> Tuple[Dict, List[Dict]]:
        """Parse Gemini response for resume analysis"""
        try:
            # Clean response (remove any markdown formatting)
            cleaned_response = response.strip()
            if cleaned_response.startswith('```json'):
                cleaned_response = cleaned_response[7:-3]
            elif cleaned_response.startswith('```'):
                cleaned_response = cleaned_response[3:-3]
            
            data = json.loads(cleaned_response)
            user_profile = data.get('user_profile', {})
            recommended_skills = data.get('recommended_skills', [])
            
            return user_profile, recommended_skills
            
        except json.JSONDecodeError as e:
            print(f"Failed to parse Gemini resume analysis response: {e}")
            return self._fallback_resume_analysis(target_skill)
    
    def _parse_roadmap_response(self, response: str, preferences: Dict, user_profile: Dict) -> Dict:
        """Parse Gemini response for roadmap generation"""
        try:
            # Clean response (remove any markdown formatting)
            cleaned_response = response.strip()
            if cleaned_response.startswith('```json'):
                cleaned_response = cleaned_response[7:-3]
            elif cleaned_response.startswith('```'):
                cleaned_response = cleaned_response[3:-3]
            
            roadmap = json.loads(cleaned_response)
            return roadmap
            
        except json.JSONDecodeError as e:
            print(f"Failed to parse Gemini roadmap response: {e}")
            return self._fallback_roadmap_generation([], preferences, user_profile)
    
    def _fallback_resume_analysis(self, target_skill: str) -> Tuple[Dict, List[Dict]]:
        """Fallback resume analysis if Gemini fails"""
        user_profile = {
            "name": "Professional",
            "current_level": "Beginner",
            "extracted_skills": [
                {"skill": "Communication", "confidence": 0.8},
                {"skill": "Problem Solving", "confidence": 0.7}
            ],
            "notes": f"Basic profile generated for {target_skill} aspirant"
        }
        
        recommended_skills = [
            {
                "skill_id": "sk_01",
                "name": "Core Fundamentals",
                "description": f"Essential skills for {target_skill}",
                "inferred_level": "Beginner",
                "recommended_level": "Intermediate",
                "estimated_duration_weeks": 8,
                "score": 0.9
            }
        ]
        
        return user_profile, recommended_skills
    
    def _fallback_roadmap_generation(self, selected_skills: List[str], preferences: Dict, user_profile: Dict) -> Dict:
        """Fallback roadmap generation if Gemini fails"""
        return {
            "title": f"Learning Path for {user_profile.get('name', 'You')}",
            "estimated_total_duration_months": preferences.get('target_duration_months', 6),
            "phases": [
                {
                    "phase_id": "p1",
                    "title": "Foundation Phase",
                    "duration_weeks": 8,
                    "goals": [
                        "Build fundamental knowledge",
                        "Complete introductory projects"
                    ],
                    "resources": [
                        {
                            "type": "COURSE",
                            "source": "Online Platform",
                            "title": "Getting Started Course",
                            "url": "https://example.com",
                            "estimated_hours": 20
                        }
                    ],
                    "progress_percent": 0
                }
            ],
            "notes": "This is a basic roadmap. For personalized recommendations, ensure Gemini API is working properly."
        }