# 🧠 SkillBridge — AI-Powered Career Development Platform

### 📘 Bridging the Gap Between Graduate Skills and Industry Demand

**SkillBridge** is an advanced web platform that leverages AI to analyze your skillset through resume upload, identifies skill gaps with market requirements, and generates personalized learning roadmaps with downloadable PDF reports. Built with modern technologies and powered by Google's Gemini AI.

---

## 🚀 Current Features

### Core Functionality
* 📤 **Resume Upload & Analysis**: Upload PDF/DOCX resumes for AI-powered skill extraction
* 🤖 **AI-Powered Analysis**: Google Gemini integration for intelligent resume parsing
* 🎯 **Target Career Matching**: Specify desired career paths for personalized recommendations
* 📊 **Skill Gap Analysis**: Compare current skills with industry requirements
* 🗺️ **Personalized Roadmaps**: AI-generated learning paths with phases and milestones
* 📄 **PDF Export**: Download professional roadmap reports
* 📈 **Interactive Dashboard**: Visualize progress and skill development

### Advanced Features
* ⚡ **Async Processing**: Celery-powered background tasks for scalable performance
* 🔄 **Real-time Status Updates**: Polling-based status checking for long-running operations
* 🎨 **Modern UI**: React-based responsive interface with TailwindCSS
* 📱 **Multi-Frontend Support**: Both Vite and CRA-based frontend implementations
* 🔧 **Robust Backend**: Flask-based REST API with comprehensive error handling — MVP

### 📘 Bridging the Gap Between Graduate Skills and Industry Demand

**SkillBridge** is a web platform that analyzes a user’s current skillset (via manual input or resume upload), compares it with real-time job market requirements, and generates a personalized **Skill Gap Report** with recommended learning resources.

---

## 🚀 MVP Features

* 🔍 **Skill Input**: manual entry or CV upload
* 🧠 **NLP Skill Extraction** from uploaded CVs
* 🌐 **Job Data Loading**: mock job postings with in-demand skills
* 📊 **Skill Gap Analysis**: compare user skills with market needs
* 🎯 **Recommendations**: tutorials/courses for missing skills
* 📈 **Dashboard**: visualize owned vs missing skills

---

## 🧱 Project Structure

```
skillbridge/
│
├── frontend/                     # Vite + React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   ├── UploadForm.jsx
│   │   │   └── SkillChart.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UploadResume.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.jsx
│   ├── package.json
│   └── tailwind.config.js
│
├── superfrontend/                # CRA + React alternative frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── UploadResume.jsx
│   │   │   ├── RecommendedSkills.jsx
│   │   │   ├── Roadmap.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Profile.jsx
│   │   ├── hooks/
│   │   ├── styles/
│   │   └── axiosConfig.js
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                      # Flask + Celery backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── analysis.py       # Resume upload & analysis
│   │   │   ├── skills.py         # Skill recommendations
│   │   │   ├── roadmap.py        # Roadmap generation & PDF
│   │   │   ├── profile.py        # User profiles
│   │   │   └── jobdata.py        # Job market data
│   │   ├── services/
│   │   │   ├── ai_service.py     # AI integration layer
│   │   │   ├── gemini/           # Google Gemini integration
│   │   │   ├── nlp.py           # Natural language processing
│   │   │   └── resume_parser/    # Resume parsing utilities
│   │   ├── models.py            # SQLAlchemy database models
│   │   ├── tasks.py             # Celery async tasks
│   │   ├── celery_app.py        # Celery configuration
│   │   └── utils.py
│   ├── uploads/                  # Resume file storage
│   ├── instance/                 # SQLite database files
│   ├── requirements.txt
│   ├── run.py
│   ├── celery_worker.py         # Celery worker startup
│   ├── test_api.py              # API test suite
│   ├── SETUP_INSTRUCTIONS.md    # Backend setup guide
│   └── PDF_IMPLEMENTATION.md    # PDF generation docs
│
├── database/
│   └── schema.sql               # Database schema
│
├── docs/
│   ├── api_endpoints.md         # Complete API documentation
│   └── SkillBridgeUi/          # UI documentation
│
├── README.md
├── package.json                 # Root package configuration
├── eslint.config.mjs           # ESLint configuration
└── Style.css                   # Global styles
```

---

## ⚙️ Tech Stack

| Layer         | Technology                                |
| ------------- | ----------------------------------------- |
| **Frontend**  | React 18/19, Vite/CRA, TailwindCSS       |
| **Backend**   | Flask 3.1, Flask-RESTful, Flask-CORS     |
| **Database**  | SQLite (dev) / PostgreSQL (production)   |
| **AI/ML**     | Google Gemini API, spaCy, NLTK           |
| **Async**     | Celery 5.3, Redis 5.0                   |
| **PDF Gen**   | WeasyPrint, Jinja2 Templates            |
| **Auth**      | JWT (planned), OAuth (planned)           |
| **Testing**   | Jest, React Testing Library             |
| **Deployment** | Docker (planned), AWS/Render            |

---

## 🤞 API Overview

### Core Endpoints (✅ Implemented)

| Endpoint                         | Method | Description                           |
| -------------------------------- | ------ | ------------------------------------- |
| `/api/v1/upload-resume`          | POST   | Upload resume with target career      |
| `/api/v1/status/{analysis_id}`   | GET    | Check analysis processing status      |
| `/api/v1/skills/{analysis_id}`   | GET    | Get AI-recommended skills             |
| `/api/v1/confirm-recommendations`| POST   | Confirm skill selection & preferences |
| `/api/v1/roadmap/status/{job_id}`| GET    | Check roadmap generation status       |
| `/api/v1/roadmaps/{roadmap_id}`  | GET    | Get complete learning roadmap         |
| `/api/v1/roadmaps/{id}/generate-pdf` | POST | Generate PDF roadmap               |
| `/api/v1/pdf-status/{pdf_job_id}`| GET    | Check PDF generation status           |
| `/api/v1/download-pdf/{pdf_job_id}` | GET | Download generated PDF             |

### Workflow
1. **Upload Resume** → 2. **AI Analysis** → 3. **Select Skills** → 4. **Generate Roadmap** → 5. **Download PDF**

See [`docs/api_endpoints.md`](docs/api_endpoints.md) for complete API documentation.

---

## 🧰 Setup Instructions

### 💻 Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

**Required Environment Variables**
```bash
FLASK_ENV=development
DATABASE_URL=sqlite:///skillbridge.db
GEMINI_API_KEY=your_gemini_api_key_here
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### 🔄 Start Services

**1. Start Redis (Required for Celery)**
```bash
# Ubuntu/Debian
sudo apt install redis-server && redis-server

# macOS
brew install redis && brew services start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

**2. Start Celery Worker (Terminal 1)**
```bash
cd backend
celery -A app.celery_app worker --loglevel=info
```

**3. Start Flask API (Terminal 2)**
```bash
cd backend
python run.py
```

### 🖥️ Frontend Setup

**Option 1: Vite Frontend (Recommended)**
```bash
cd frontend
npm install
npm run dev
```

**Option 2: CRA Frontend**
```bash
cd superfrontend
npm install
npm start
```

**Environment Variables**
```bash
# frontend/.env or superfrontend/.env
VITE_API_URL=http://127.0.0.1:5000/api/v1
REACT_APP_API_URL=http://127.0.0.1:5000/api/v1
```

---

## 🧠 How It Works

### AI-Powered Workflow

1. **Resume Upload & Parsing**
   - Upload PDF/DOCX resume with target career goal
   - Google Gemini AI extracts skills, experience, and profile data
   - Async processing with real-time status updates

2. **Intelligent Skill Analysis**
   - AI compares current skills with target career requirements
   - Generates confidence scores and difficulty assessments
   - Provides realistic learning timelines

3. **Personalized Roadmap Generation**
   - Creates multi-phase learning paths
   - Includes specific goals, resources, and milestones
   - Estimates time commitments and prerequisites

4. **Professional PDF Reports**
   - Download beautifully formatted roadmap PDFs
   - Includes complete learning plan and resource links
   - Professional layout suitable for career planning

---

## 🧪 Example API Response

### Skill Recommendations
```json
{
  "user_profile": {
    "name": "John Doe",
    "experience_level": "Entry Level",
    "current_skills": ["Python", "SQL", "Git"]
  },
  "recommended_skills": [
    {
      "skill_id": "sk_001",
      "name": "Flask",
      "confidence": 0.85,
      "difficulty": "Intermediate",
      "estimated_hours": 40
    },
    {
      "skill_id": "sk_002", 
      "name": "React",
      "confidence": 0.92,
      "difficulty": "Intermediate",
      "estimated_hours": 60
    }
  ]
}
```

### Generated Roadmap
```json
{
  "roadmap": {
    "title": "Python Developer Learning Path",
    "total_weeks": 16,
    "phases": [
      {
        "name": "Foundation Phase",
        "duration_weeks": 4,
        "goals": [
          {
            "title": "Master Flask Framework",
            "resources": ["Flask Mega Tutorial", "Official Documentation"],
            "estimated_hours": 40
          }
        ]
      }
    ]
  }
}
```

---

## 🧭 Development Roadmap

### ✅ Completed (v1.0)
- Resume upload and AI-powered analysis
- Google Gemini integration for skill extraction
- Personalized learning roadmap generation
- PDF export functionality
- Async processing with Celery
- Comprehensive REST API
- Dual frontend implementations (Vite + CRA)
- Professional UI with TailwindCSS

### � In Progress (v1.1)
- User authentication and profiles
- Progress tracking and analytics
- Enhanced AI recommendations
- Mobile responsiveness improvements

### 📋 Planned (v2.0)
- Real-time job market data integration
- LinkedIn/Indeed API connections
- Social features and mentor matching
- Gamification and achievement system
- Advanced analytics dashboard
- Multi-language support

---

## 🧪 Testing

### Backend Testing
```bash
cd backend
python test_api.py  # Complete API test suite
```

### Frontend Testing  
```bash
cd superfrontend
npm test  # React component tests
```

---

## 📚 Documentation

- [`docs/api_endpoints.md`](docs/api_endpoints.md) - Complete API documentation
- [`backend/SETUP_INSTRUCTIONS.md`](backend/SETUP_INSTRUCTIONS.md) - Backend setup guide  
- [`backend/PDF_IMPLEMENTATION.md`](backend/PDF_IMPLEMENTATION.md) - PDF generation system
- [`backend/app/services/gemini/README.md`](backend/app/services/gemini/README.md) - Gemini AI integration

---

## 👥 Contributors

- **Team SkillBridge** – AI-Powered Career Development Platform
- **Current Branch**: `feature/improved-backend-for-super-frontend`
- **Repository**: [SkillBridge](https://github.com/20407002036/SkillBridge)

### Tech Stack Summary
- **Frontend**: React 18/19 + TailwindCSS + Vite/CRA
- **Backend**: Flask 3.1 + Celery + Redis  
- **AI**: Google Gemini API + spaCy + NLTK
- **Database**: SQLite (dev) + SQLAlchemy
- **PDF**: WeasyPrint + Jinja2

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.