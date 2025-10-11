# User-Analysis Linking Feature

## Overview

This feature allows users who generate roadmaps anonymously to later create accounts and retain access to their previously generated analyses and roadmaps. This solves the problem of users losing their roadmap data when they decide to create an account after the fact.

## How It Works

### Scenario 1: Registration with Analysis Linking
1. User uploads resume and generates roadmap anonymously
2. User receives `analysis_id` (e.g., `"a3f9b231-23cd-45fe-a9b3-2345cfa21d22"`)
3. User decides to create account and includes `analysis_id` in registration
4. System links the analysis and all associated roadmaps to the new user account

### Scenario 2: Post-Registration Linking  
1. User creates account first
2. User has an `analysis_id` from previous anonymous session
3. User calls `/api/v1/auth/user/link-analysis` with the `analysis_id`
4. System links the analysis to their account

## Database Changes

### User Model Updates
```python
class User(db.Model):
    # ... existing fields ...
    linked_analysis_id = db.Column(db.String(36), db.ForeignKey('analysis.id'), nullable=True)
    
    # Relationship to the linked analysis
    linked_analysis = db.relationship('Analysis', foreign_keys=[linked_analysis_id], backref='linked_user')
```

### Bidirectional Linking
- `User.linked_analysis_id` → points to the primary analysis
- `Analysis.user_id` → points back to the user (existing field)
- All roadmaps associated with the analysis also get linked to the user

## API Endpoints

### Registration with Linking
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "analysis_id": "a3f9b231-23cd-45fe-a9b3-2345cfa21d22"  // optional
}
```

### Retrieve Linked Data
```http
GET /api/v1/auth/user/linked-analysis
Authorization: Bearer <token>
```

### Manual Linking
```http
POST /api/v1/auth/user/link-analysis
Authorization: Bearer <token>

{
  "analysis_id": "a3f9b231-23cd-45fe-a9b3-2345cfa21d22"
}
```

## Validation & Error Handling

### Registration Validation
- `analysis_id` must exist and be completed
- Analysis cannot already be linked to another user
- If analysis linking fails, user registration still succeeds (graceful fallback)

### Manual Linking Validation
- User must be authenticated
- Analysis must exist and be completed
- Analysis cannot be linked to a different user
- User cannot have multiple linked analyses (must unlink first)

## Migration

Run the migration script to add the new column:

```bash
cd backend
python migrate_add_linked_analysis.py
```

This will:
1. Create a backup of the database
2. Add `linked_analysis_id` column to the `user` table
3. Set up foreign key relationship
4. Verify the changes

## Benefits

1. **User Experience**: Users don't lose their roadmap progress when creating accounts
2. **Data Continuity**: Seamless transition from anonymous to authenticated usage
3. **Flexibility**: Multiple ways to link analyses (registration-time or post-registration)
4. **Data Integrity**: Proper validation prevents duplicate or invalid linkings

## Frontend Integration

### Usage in Registration Form
```javascript
// If user has an analysis_id from localStorage/sessionStorage
const registrationData = {
  username: 'johndoe',
  email: 'john@example.com', 
  password: 'password123'
};

// Include analysis_id if available
const savedAnalysisId = localStorage.getItem('current_analysis_id');
if (savedAnalysisId) {
  registrationData.analysis_id = savedAnalysisId;
}

const response = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(registrationData)
});
```

### Retrieving Linked Roadmaps
```javascript
// After login, check for linked analysis
const response = await fetch('/api/v1/auth/user/linked-analysis', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
if (data.linked_analysis_id) {
  // User has previous roadmaps - redirect to dashboard
  window.location.href = '/dashboard';
} else {
  // New user - show onboarding
  window.location.href = '/upload';
}
```

## Security Considerations

1. **JWT Authentication**: All linking operations require valid authentication
2. **Analysis Ownership**: Strict validation prevents linking others' analyses
3. **One-to-One Relationship**: Users can only link to one analysis at a time
4. **Graceful Failures**: Invalid analysis_id doesn't break registration
5. **Audit Trail**: All linking operations are logged in the database timestamps