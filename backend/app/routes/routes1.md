# SkillBridge API Documentation

## 🎯 Overview
SkillBridge helps students and graduates identify skill gaps and create personalized learning roadmaps. Upload your resume, get AI-powered skill recommendations, and receive a customized learning path to achieve your career goals.

### 🔄 Workflow
1. **Upload Resume** → 2. **Get AI Analysis** → 3. **Select Skills** → 4. **Generate Roadmap** → 5. **Track Progress**

---

## 🌐 Base URLs
- **Production**: `https://api.skillbridge.tech/api/v1`
- **Development**: `http://localhost:5000/api/v1`

## 🔐 Authentication
- **Method**: JWT Bearer Token
- **Header**: `Authorization: Bearer <TOKEN>`
- **Note**: Anonymous users can create roadmaps; authentication required for saving/tracking

---

## 📚 API Endpoints

### 1. Resume Upload & Analysis

#### 📤 Upload Resume
```http
POST /upload-resume
```

Upload your resume and specify target career goal for AI analysis.

**Request**
```bash
Content-Type: multipart/form-data

# Fields:
resume        (file, required)   # PDF or DOCX file
target_skill  (string, required) # e.g., "Python Developer", "Data Scientist"
```

**Example**
```bash
curl -X POST \
  -F "resume=@/path/to/resume.pdf" \
  -F "target_skill=Python Developer" \
  http://localhost:5000/api/v1/upload-resume
```

**Response** `201 Created`
```json
{
  "message": "Resume uploaded successfully",
  "analysis_id": "a3f9b231-23cd-45fe-a9b3-2345cfa21d22",
  "status": "processing"
}
```

---

#### 🔍 Check Analysis Status
```http
GET /status/{analysis_id}
```

Poll this endpoint to check if resume analysis is complete.

**Response** `200 OK`
```json
{
  "analysis_id": "a3f9b231-23cd-45fe-a9b3-2345cfa21d22",
  "status": "processing"  // "processing" | "completed" | "failed"
}
```

---

### 2. Skill Recommendations

#### 🎯 Get Recommended Skills
```http
GET /skills/{analysis_id}
```

Retrieve AI-generated skill recommendations after analysis completes.

**Response** `200 OK`
```json
{
  "analysis_id": "a3f9b231-23cd-45fe-a9b3-2345cfa21d22",
  "message": "Analysis complete",
  "user_profile": {
    "name": "John Doe",
    "target_skill": "Python Developer",
    "current_level": "Beginner",
    "extracted_skills": [
      {"skill": "HTML", "confidence": 0.92},
      {"skill": "SQL", "confidence": 0.78}
    ]
  },
  "recommended_skills": [
    {
      "skill_id": "sk_01",
      "name": "Python Programming",
      "description": "Master Python fundamentals and advanced concepts",
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
    }
  ],
  "notes": "Strong foundation in web technologies. Focus on Python and algorithms."
}
```

---

### 3. Roadmap Generation

#### ✅ Confirm Skill Selection
```http
POST /confirm-recommendations
```

Select desired skills and preferences to generate personalized roadmap.

**Request** `application/json`
```json
{
  "analysis_id": "a3f9b231-23cd-45fe-a9b3-2345cfa21d22",
  "selected_skill_ids": ["sk_01", "sk_02"],
  "user_id": "12345",  // optional
  "preferences": {
    "weekly_hours": 10,
    "target_duration_months": 6,
    "learning_style": "project_based"  // "project_based" | "theory_first" | "mixed"
  }
}
```

**Response** `202 Accepted`
```json
{
  "message": "Roadmap generation started",
  "roadmap_job_id": "job_55f3d2",
  "roadmap_id": null,
  "status": "generating"
}
```

---

#### ⏳ Check Roadmap Status
```http
GET /roadmap/status/{roadmap_job_id}
```

Poll roadmap generation progress.

**Response** `200 OK`
```json
{
  "roadmap_job_id": "job_55f3d2",
  "status": "completed",  // "generating" | "completed" | "failed"
  "roadmap_id": "rm_8523ab"
}
```

---

#### 🗺️ Get Complete Roadmap
```http
GET /roadmaps/{roadmap_id}
```

Fetch the generated personalized learning roadmap.

**Response** `200 OK`
```json
{
  "roadmap_id": "rm_8523ab",
  "analysis_id": "a3f9b231-23cd-45fe-a9b3-2345cfa21d22",
  "user_id": "12345",
  "title": "Python Developer Roadmap",
  "estimated_total_duration_months": 6,
  "created_at": "2025-10-08T12:34:56Z",
  "phases": [
    {
      "phase_id": "p1",
      "title": "Python Fundamentals",
      "duration_weeks": 8,
      "goals": [
        "Master Python syntax and data types",
        "Build 3 small automation projects",
        "Understand OOP concepts"
      ],
      "resources": [
        {
          "type": "COURSE",
          "source": "Coursera",
          "title": "Python for Everybody",
          "url": "https://coursera.org/...",
          "estimated_hours": 40
        },
        {
          "type": "PROJECT",
          "source": "GitHub",
          "title": "Python Mini Projects",
          "url": "https://github.com/..."
        }
      ],
      "progress_percent": 0
    },
    {
      "phase_id": "p2",
      "title": "Data Structures & Algorithms",
      "duration_weeks": 12,
      "goals": [
        "Implement core data structures",
        "Solve 50 coding problems",
        "Optimize algorithm complexity"
      ],
      "resources": [
        {
          "type": "BOOK",
          "source": "O'Reilly",
          "title": "Algorithms in Python",
          "url": "https://oreilly.com/..."
        }
      ],
      "progress_percent": 0
    }
  ],
  "notes": "Focus on hands-on projects. Practice coding daily for best results."
}
```

---

## 🔄 Complete API Workflow

### Step-by-Step Integration

```javascript
// 1. Upload Resume
const uploadResponse = await fetch('/api/v1/upload-resume', {
  method: 'POST',
  body: formData // contains resume file + target_skill
});
const { analysis_id } = await uploadResponse.json();

// 2. Poll Analysis Status
let analysis_complete = false;
while (!analysis_complete) {
  const statusResponse = await fetch(`/api/v1/status/${analysis_id}`);
  const { status } = await statusResponse.json();
  analysis_complete = (status === 'completed');
  if (!analysis_complete) await new Promise(r => setTimeout(r, 2000));
}

// 3. Get Skill Recommendations  
const skillsResponse = await fetch(`/api/v1/skills/${analysis_id}`);
const { recommended_skills } = await skillsResponse.json();

// 4. User Selects Skills (Frontend UI)
const selectedSkills = recommended_skills.slice(0, 3).map(s => s.skill_id);

// 5. Generate Roadmap
const confirmResponse = await fetch('/api/v1/confirm-recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    analysis_id,
    selected_skill_ids: selectedSkills,
    preferences: { weekly_hours: 10, target_duration_months: 6 }
  })
});
const { roadmap_job_id } = await confirmResponse.json();

// 6. Poll Roadmap Generation
let roadmap_ready = false;
let roadmap_id;
while (!roadmap_ready) {
  const roadmapStatusResponse = await fetch(`/api/v1/roadmap/status/${roadmap_job_id}`);
  const roadmapStatus = await roadmapStatusResponse.json();
  roadmap_ready = (roadmapStatus.status === 'completed');
  if (roadmap_ready) roadmap_id = roadmapStatus.roadmap_id;
  else await new Promise(r => setTimeout(r, 2000));
}

// 7. Get Final Roadmap
const roadmapResponse = await fetch(`/api/v1/roadmaps/${roadmap_id}`);
const roadmap = await roadmapResponse.json();
```

---

## 📋 Resource Types

| Type | Description | Example |
|------|-------------|---------|
| `COURSE` | Online courses | Coursera, Udemy, edX |
| `BOOK` | Books and eBooks | O'Reilly, technical books |
| `PROJECT` | Hands-on projects | GitHub repos, tutorials |
| `ARTICLE` | Blog posts, documentation | Medium, official docs |
| `VIDEO` | YouTube videos, talks | Conference talks, tutorials |
| `PRACTICE` | Coding platforms | LeetCode, HackerRank |

---

## ⚠️ Error Handling

### Common HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created successfully |
| `202` | Accepted | Request accepted, processing |
| `400` | Bad Request | Invalid input data |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource already exists |
| `500` | Server Error | Internal server error |

### Error Response Format
```json
{
  "error": "Analysis not found",
  "code": 404,
  "details": "The provided analysis_id does not exist or has expired"
}
```

---

## 🚀 Getting Started

### Quick Test with cURL

```bash
# 1. Upload resume
curl -X POST \
  -F "resume=@resume.pdf" \
  -F "target_skill=Data Scientist" \
  http://localhost:5000/api/v1/upload-resume

# 2. Check status (replace with your analysis_id)
curl http://localhost:5000/api/v1/status/YOUR_ANALYSIS_ID

# 3. Get recommendations
curl http://localhost:5000/api/v1/skills/YOUR_ANALYSIS_ID
```

### Frontend Integration Tips

- **Polling**: Use reasonable intervals (2-5 seconds) when polling status endpoints
- **File Upload**: Show progress bars for resume uploads
- **Skill Selection**: Present recommendations as interactive cards with checkboxes
- **Roadmap Display**: Render as timeline or kanban-style phases
- **Error Handling**: Implement retry logic for failed requests

---

## 📖 Additional Notes

- **File Limits**: Resume files must be under 16MB
- **Supported Formats**: PDF, DOCX, DOC
- **Analysis Time**: Typically 10-30 seconds depending on file size
- **Roadmap Generation**: Usually 5-15 seconds
- **Rate Limiting**: 100 requests per minute per IP
- **Data Retention**: Anonymous analyses deleted after 24 hours
