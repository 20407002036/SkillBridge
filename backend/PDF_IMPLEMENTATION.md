# PDF Generation Implementation

## Overview
This document outlines the PDF generation system added to SkillBridge, allowing users to download their personalized learning roadmaps as PDF files.

## System Architecture

### Backend Components

#### 1. Database Model (`app/models.py`)
- **PDFJob**: New model to track PDF generation jobs
  - `id`: Unique job identifier (pdf_job_abc123)
  - `roadmap_id`: Associated roadmap
  - `status`: generating, completed, failed
  - `created_at`, `completed_at`: Timestamps
  - `error_message`: Error details if generation fails

#### 2. API Endpoints (`app/routes/roadmap.py`)

**POST `/api/v1/roadmaps/{roadmap_id}/generate-pdf`**
- Initiates PDF generation for a roadmap
- Creates PDFJob record
- Starts async Celery task
- Returns: `{"pdf_job_id": "pdf_job_abc123", "status": "generating"}`

**GET `/api/v1/pdf-status/{pdf_job_id}`**
- Polls PDF generation status
- Returns job status and download URL when complete
- Response includes error message if generation failed

**GET `/api/v1/download-pdf/{pdf_job_id}`**
- Downloads generated PDF file
- Streams PDF directly with proper headers
- Filename includes roadmap title and ID

#### 3. Celery Tasks (`app/tasks.py`)

**`generate_pdf_task(pdf_job_id, roadmap_id)`**
- Async task for PDF generation
- Uses WeasyPrint to convert HTML/CSS to PDF
- Updates PDFJob status upon completion/failure
- 60-second timeout for reasonable processing time

**Helper Functions:**
- `get_roadmap_data()`: Retrieves complete roadmap data from database
- `generate_pdf_content()`: Creates PDF using HTML template
- `get_pdf_template()`: HTML template with roadmap structure
- `get_pdf_styles()`: CSS styles for professional PDF layout

#### 4. Dependencies (`requirements.txt`)
- `weasyprint==62.3`: HTML/CSS to PDF conversion
- `jinja2==3.1.4`: Template rendering

### Frontend Components

#### 1. Roadmap Component (`src/pages/Roadmap.jsx`)

**Updated Features:**
- **Download PDF Button**: Matches mockup design (secondary button style)
- **Loading States**: Shows "Generating PDF..." during processing
- **Error Handling**: Displays errors if PDF generation fails
- **Auto-download**: Automatically triggers file download when ready

**PDF Generation Flow:**
1. User clicks "Download PDF" button
2. Component calls backend generate-pdf endpoint
3. Polls pdf-status endpoint every 2 seconds
4. On completion, downloads PDF file automatically
5. Shows loading state throughout process

#### 2. Styling (`src/styles/Roadmap.css`)
- **Button States**: Disabled state for PDF button during generation
- **Responsive Design**: Buttons stack on mobile, side-by-side on desktop
- **Visual Feedback**: Loading text and disabled styling

## PDF Content Structure

### 1. Header Section
- SkillBridge branding and logo
- User information (name, target skill, current level)
- Generation date

### 2. Roadmap Overview
- Roadmap title and estimated duration
- Recommended skills with difficulty levels
- Skills grid layout

### 3. Learning Phases
- Phase-by-phase breakdown
- Goals and objectives for each phase
- Resource links and types
- Duration estimates

### 4. Footer
- SkillBridge branding
- Website reference

### 5. Professional Styling
- Clean, printable layout
- Consistent typography and spacing
- SkillBridge color scheme (#137fec)
- Grid-based responsive design

## Security & Performance

### 1. Data Handling
- PDFs generated in memory (not saved to disk)
- Temporary job tracking for status polling
- Automatic cleanup of job records (can be implemented)

### 2. Error Handling
- Graceful fallbacks if WeasyPrint unavailable
- Comprehensive error messaging
- Database rollback on failures

### 3. Performance
- Async processing via Celery
- Non-blocking API calls
- Reasonable timeout limits

## Testing

### 1. Backend Testing (`test_api.py`)
- **`test_pdf_generation()`**: End-to-end PDF generation test
- Tests all three endpoints
- Verifies PDF file creation and download
- Saves test PDF for manual verification

### 2. Integration Testing
- Works with existing roadmap generation flow
- Compatible with authentication system
- Maintains existing API patterns

## Usage Instructions

### 1. Installation
```bash
# Install dependencies
pip install -r requirements.txt

# Reset database to include new PDFJob model
python force_reset_db.py
```

### 2. Testing
```bash
# Start backend services
python run.py
celery -A app.celery_app worker --loglevel=info

# Run tests
python test_api.py
```

### 3. Frontend Usage
- User completes roadmap generation process
- On roadmap page, clicks "Download PDF" button
- System generates and downloads PDF automatically
- PDF includes complete roadmap with SkillBridge branding

## Future Enhancements

### 1. Possible Improvements
- PDF template customization options
- Multiple format support (A4, Letter)
- Progress tracking within PDF
- QR codes for resource links
- User profile photos

### 2. Performance Optimizations
- PDF caching for repeated downloads
- Background job cleanup
- Template pre-compilation

### 3. Feature Extensions
- Email PDF delivery
- Cloud storage integration
- Batch PDF generation
- Custom branding options

## API Documentation

### Complete PDF Generation Flow
```
1. POST /api/v1/roadmaps/{roadmap_id}/generate-pdf
   → {"pdf_job_id": "pdf_job_abc123", "status": "generating"}

2. GET /api/v1/pdf-status/{pdf_job_id} (poll until completed)
   → {"status": "completed", "download_url": "/api/v1/download-pdf/{pdf_job_id}"}

3. GET /api/v1/download-pdf/{pdf_job_id}
   → PDF file download
```

This implementation provides a robust, scalable PDF generation system that maintains consistency with the existing SkillBridge architecture while delivering professional-quality roadmap documents.