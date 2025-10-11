# SkillBridge API Documentation

## 🎯 Overview
SkillBridge helps students and graduates identify skill gaps and create personalized learning roadmaps. Upload your resume, get AI-powered skill recommendations, and receive a customized learning path to achieve your career goals.

### 🔄 Workflow
1. **Upload Resume** → 2. **Get AI Analysis** → 3. **Select Skills** → 4. **Generate Roadmap** → 5. **Track Progress**

---

## 🌐 Base URLs
- **Development**: `http://localhost:5000/api/v1`
- **Production**: `https://api.skillbridge.tech/api/v1` *(planned)*

## 🔐 Authentication
- **Method**: JWT Bearer Token *(planned)*
- **Header**: `Authorization: Bearer <TOKEN>` *(planned)*
- **Note**: Currently anonymous; authentication coming in future releases

---

## 📚 Core API Endpoints (✅ Implemented)

### 1. Resume Upload & Analysis

#### 📤 Upload Resume
```http
POST /api/v1/upload-resume
```

Upload your resume and specify target career goal for AI analysis.

**Request**
```bash
Content-Type: multipart/form-data

# Fields:
resume        (file, required)   # PDF or DOCX file
target_skill  (string, required) # e.g., "Python Developer", "Data Scientist"
```

**Response** `201 Created`
```json
{
  "message": "Resume uploaded successfully",
  "analysis_id": "a3f9b231-23cd-45fe-a9b3-2345cfa21d22",
  "status": "processing"
}
```

#### 🔍 Check Analysis Status
```http
GET /api/v1/status/{analysis_id}
```

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
GET /api/v1/skills/{analysis_id}
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
    }
  ],
  "notes": "Strong foundation in web technologies. Focus on Python and algorithms."
}
```

---

### 3. Roadmap Generation

#### ✅ Confirm Skill Selection
```http
POST /api/v1/confirm-recommendations
```

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

#### ⏳ Check Roadmap Status
```http
GET /api/v1/roadmap/status/{roadmap_job_id}
```

**Response** `200 OK`
```json
{
  "roadmap_job_id": "job_55f3d2",
  "status": "completed",  // "generating" | "completed" | "failed"
  "roadmap_id": "rm_8523ab"
}
```

#### 🗺️ Get Complete Roadmap
```http
GET /api/v1/roadmaps/{roadmap_id}
```

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
        }
      ],
      "progress_percent": 0
    }
  ],
  "notes": "Focus on hands-on projects. Practice coding daily for best results."
}
```

---

## 📊 Legacy Endpoints (✅ Maintained for Backward Compatibility)

### Profile Management

#### Upload Resume (Legacy)
```http
POST /api/v1/profile/upload
```
Legacy resume upload endpoint for existing integrations.

#### Add Manual Skills
```http
POST /api/v1/profile/skills
```
Add skills manually to user profile.

### Skill Gap Analysis

#### Analyze Skills (Legacy)
```http
GET /api/v1/gap/analyze
```
Compare user skills against job market requirements.

### Recommendations (Legacy)

#### Get Recommendations
```http
GET /api/v1/recommendations
```
Retrieve learning resource recommendations.

#### Add Recommendation
```http
POST /api/v1/recommendations
```
Add new learning recommendations.

### Job Data

#### Get Job Data
```http
GET /api/v1/jobdata
```
Retrieve mock job posting data with required skills.

---

## 🚧 Planned Endpoints (Coming Soon)

### User Authentication & Management

#### Register User
```http
POST /api/v1/auth/register
```
Register new user account with optional analysis linking.

**Request** `application/json`
```json
{
  "username": "johndoe",
  "email": "john@example.com", 
  "password": "securepassword123",
  "analysis_id": "a3f9b231-23cd-45fe-a9b3-2345cfa21d22"  // optional - links previous roadmap
}
```

**Response** `201 Created`
```json
{
  "message": "User registered successfully and linked to previous roadmap analysis",
  "linked_analysis_id": "a3f9b231-23cd-45fe-a9b3-2345cfa21d22"
}
```

#### Login User
```http
POST /api/v1/auth/login
```
Authenticate user and return JWT token.

**Request** `application/json`
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response** `200 OK`
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 123,
    "username": "johndoe", 
    "email": "john@example.com"
  }
}
```

#### Get User's Linked Analysis
```http
GET /api/v1/auth/user/linked-analysis
Authorization: Bearer <token>
```
Retrieve the user's linked analysis and associated roadmaps.

**Response** `200 OK`
```json
{
  "user_id": 123,
  "linked_analysis_id": "a3f9b231-23cd-45fe-a9b3-2345cfa21d22",
  "analysis": {
    "target_skill": "Python Developer",
    "status": "completed",
    "created_at": "2025-10-08T10:30:00Z",
    "completed_at": "2025-10-08T10:35:00Z"
  },
  "roadmaps": [
    {
      "roadmap_id": "rm_8523ab",
      "title": "Python Developer Roadmap",
      "estimated_total_duration_months": 6,
      "created_at": "2025-10-08T10:40:00Z",
      "is_saved": true
    }
  ],
  "message": "Linked analysis and roadmaps retrieved successfully"
}
```

#### Link Analysis to User
```http
POST /api/v1/auth/user/link-analysis
Authorization: Bearer <token>
```
Manually link an existing analysis to the authenticated user.

**Request** `application/json`
```json
{
  "analysis_id": "a3f9b231-23cd-45fe-a9b3-2345cfa21d22"
}
```

**Response** `200 OK`
```json
{
  "message": "Analysis linked to user successfully",
  "analysis_id": "a3f9b231-23cd-45fe-a9b3-2345cfa21d22",
  "linked_roadmaps_count": 2
}
```

#### Unlink Analysis from User
```http
POST /api/v1/auth/user/unlink-analysis
Authorization: Bearer <token>
```
Unlink the current analysis from the authenticated user.

**Response** `200 OK`
```json
{
  "message": "Analysis unlinked from user successfully",
  "unlinked_analysis_id": "a3f9b231-23cd-45fe-a9b3-2345cfa21d22"
}
```

#### Get User Profile
```http
GET /api/v1/users/profile
```
*(Planned)* Retrieve authenticated user's profile.

### Progress Tracking

#### Update Progress
```http
PUT /api/v1/roadmaps/{roadmap_id}/phases/{phase_id}/progress
```
*(Planned)* Update learning progress for a roadmap phase.

#### Get Learning Statistics
```http
GET /api/v1/users/stats
```
*(Planned)* Get user's learning statistics and achievements.

### Roadmap Management

#### Save Roadmap
```http
POST /api/v1/roadmaps/{roadmap_id}/save
```
*(Planned)* Save roadmap to user account.

#### Get User Roadmaps
```http
GET /api/v1/users/roadmaps
```
*(Planned)* Retrieve all saved roadmaps for authenticated user.

#### Update Roadmap
```http
PUT /api/v1/roadmaps/{roadmap_id}
```
*(Planned)* Modify existing roadmap phases or preferences.

### Social Features

#### Share Roadmap
```http
POST /api/v1/roadmaps/{roadmap_id}/share
```
*(Planned)* Generate shareable link for roadmap.

#### Community Recommendations
```http
GET /api/v1/community/recommendations
```
*(Planned)* Get crowd-sourced learning recommendations.

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
| `401` | Unauthorized | Authentication required *(planned)* |
| `403` | Forbidden | Access denied *(planned)* |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource already exists |
| `429` | Too Many Requests | Rate limit exceeded *(planned)* |
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

## 🚀 Quick Start Examples

### Complete API Workflow (JavaScript)

```javascript
// 1. Upload Resume
const formData = new FormData();
formData.append('resume', file);
formData.append('target_skill', 'Python Developer');

const uploadResponse = await fetch('/api/v1/upload-resume', {
  method: 'POST',
  body: formData
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

// 4. Generate Roadmap
const selectedSkills = recommended_skills.slice(0, 3).map(s => s.skill_id);
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

// 5. Poll Roadmap Generation
let roadmap_ready = false;
let roadmap_id;
while (!roadmap_ready) {
  const roadmapStatusResponse = await fetch(`/api/v1/roadmap/status/${roadmap_job_id}`);
  const roadmapStatus = await roadmapStatusResponse.json();
  roadmap_ready = (roadmapStatus.status === 'completed');
  if (roadmap_ready) roadmap_id = roadmapStatus.roadmap_id;
  else await new Promise(r => setTimeout(r, 2000));
}

// 6. Get Final Roadmap
const roadmapResponse = await fetch(`/api/v1/roadmaps/${roadmap_id}`);
const roadmap = await roadmapResponse.json();
```

### cURL Examples

```bash
# Upload resume
curl -X POST \
  -F "resume=@resume.pdf" \
  -F "target_skill=Data Scientist" \
  http://localhost:5000/api/v1/upload-resume

# Check status
curl http://localhost:5000/api/v1/status/YOUR_ANALYSIS_ID

# Get recommendations
curl http://localhost:5000/api/v1/skills/YOUR_ANALYSIS_ID
```

---

## 📖 Implementation Notes

### Current Features (✅ Live)
- **Async Processing**: Resume analysis and roadmap generation via Celery
- **AI Integration**: Gemini API with intelligent fallbacks
- **File Support**: PDF and DOCX resume parsing
- **Real-time Status**: WebSocket-style polling for job status
- **Comprehensive Error Handling**: Proper HTTP status codes and messages

### Architecture
- **Backend**: Flask + SQLAlchemy + Celery + Redis
- **AI Service**: Google Gemini API with fallback mock data
- **Database**: SQLite (development), PostgreSQL (production ready)
- **File Storage**: Local filesystem with secure filename handling

### Rate Limits *(Planned)*
- **Anonymous users**: 100 requests per hour
- **Authenticated users**: 1000 requests per hour
- **File uploads**: 5 per minute

### Data Retention
- **Anonymous analyses**: Deleted after 24 hours
- **User accounts**: Persistent storage *(planned)*
- **File cleanup**: Automatic cleanup of old resume files

---

## 🔧 Development Status

| Component | Status | Notes |
|-----------|--------|-------|
| Core API (1-6) | ✅ Complete | Production ready |
| Legacy Endpoints | ✅ Complete | Backward compatible |
| Authentication | 🚧 Planned | JWT-based system |
| Progress Tracking | 🚧 Planned | Phase completion tracking |
| Social Features | 📋 Backlog | Community recommendations |
| Rate Limiting | 🚧 Planned | API protection |
| WebSocket Support | 📋 Backlog | Real-time updates |

---

*Last updated: October 9, 2025*  
*API Version: v1*  
*Backend Version: 1.0.0*