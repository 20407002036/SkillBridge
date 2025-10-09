# Gemini Integration Guide

## Setup

1. **Install Dependencies**
   ```bash
   pip install google-generativeai==0.8.3
   ```

2. **Set API Key**
   ```bash
   export GEMINI_API_KEY="your_api_key_here"
   ```
   
   Or create `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

## Usage

The integration is automatic! The `AIService` class will:

1. **Auto-detect Gemini API key** and initialize the service
2. **Try Gemini first** for all AI operations
3. **Fallback gracefully** to mock data if Gemini fails

### Direct Usage (Optional)

```python
from app.services.gemini import GeminiService

# Initialize Gemini service
gemini = GeminiService(api_key="your_key")

# Analyze resume
user_profile, skills = gemini.analyze_resume(resume_text, "Python Developer")

# Generate roadmap
roadmap = gemini.generate_roadmap(["sk_01", "sk_02"], preferences, user_profile)
```

## Features

### Resume Analysis
- **Extracts user profile** (name, experience level, current skills)
- **Generates skill recommendations** with confidence scores
- **Provides realistic timelines** and difficulty assessments

### Roadmap Generation
- **Creates phased learning paths** based on selected skills
- **Adapts to learning styles** (project-based, theory-first, mixed)
- **Includes real resources** with URLs and time estimates
- **Considers user preferences** (weekly hours, target duration)

## Error Handling

- **Automatic retries** with exponential backoff
- **Graceful fallbacks** to mock data when API fails
- **Detailed error logging** for debugging
- **JSON response validation** and cleanup

## Prompts

### Resume Analysis Prompt
- Extracts structured data from resume text
- Analyzes experience level and current skills
- Generates targeted skill recommendations
- Returns JSON with user profile and skill suggestions

### Roadmap Generation Prompt  
- Creates personalized learning phases
- Suggests real learning resources
- Adapts to user preferences and learning style
- Provides actionable goals and timelines

## Testing

```bash
# Test with real resume
python test_api.py

# Check logs for Gemini status
# ✅ Gemini service initialized  (working)
# ⚠️  GEMINI_API_KEY not found   (fallback mode)
```

## Extending

To add another LLM provider:

1. Create `app/services/openai/openai_service.py`
2. Update `AIService` to try multiple providers
3. Add fallback chain: Gemini → OpenAI → Mock

```python
# In AIService.analyze_resume()
if service.gemini_service:
    return service.gemini_service.analyze_resume(...)
elif service.openai_service:
    return service.openai_service.analyze_resume(...)
else:
    return AIService._fallback_analyze_resume(...)
```