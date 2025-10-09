// Upload avatar image
export const uploadAvatar = (formData) => {
  // POST /api/avatar/upload_avatar
  return api.post('/api/avatar/upload_avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
// Change user password
export const changePassword = (passwordData) => {
  // POST /api/password/change_password
  return api.post('/api/password/change_password', passwordData);
};
import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add a request interceptor to include JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// ------------------- PROFILE & AUTH -------------------

// Register a new user (Signup)
export const registerUser = (userData) => {
  // POST /api/auth/register
  return api.post('/api/auth/register', userData);
};

// Login user
export const loginUser = (credentials) => {
  // POST /api/auth/login
  return api.post('/api/auth/login', credentials);
};

// Get user profile
export const getProfile = () => {
  // GET /api/profile/profile
  return api.get('/api/profile/profile');
};

// Update user profile
export const updateProfile = (profileData) => {
  // PUT /api/profile/profile
  return api.put('/api/profile/profile', profileData);
};

// Delete user profile
export const deleteProfile = () => {
  // DELETE /api/profile/profile
  return api.delete('/api/profile/profile');
};

// Upload resume file
export const uploadResume = (formData) => {
  // POST /api/profile/upload
  return api.post('/api/profile/upload', formData);
};

// Add manual skills
export const addSkills = (skills) => {
  // POST /api/profile/skills
  return api.post('/api/profile/skills', { skills });
};

// Get all skills for the current user
export const getSkills = () => {
  // GET /api/profile/profile (skills are part of profile)
  return api.get('/api/profile/profile').then(res => res.data.skills);
};

// Remove a skill for the current user
export const removeSkill = (skill) => {
  // DELETE /api/profile/skills
  return api.delete('/api/profile/skills', { data: { skill } });
};

// ------------------- JOB DATA -------------------

// Get job market data
export const getJobData = () => {
  // GET /api/jobdata
  return api.get('/api/jobdata');
};

// ------------------- GAP ANALYSIS -------------------

// Analyze skill gap (POST recommended for detailed input)
export const analyzeGap = (data) => {
  // POST /api/gap/analyze
  return api.post('/api/gap/analyze', data);
};

// ------------------- RECOMMENDATIONS -------------------

// Get learning recommendations (POST for detailed, GET for default)
export const getRecommendations = (data) => {
  // POST /api/recommendations (detailed), GET /api/recommendations (default)
  if (data) {
    return api.post('/api/recommendations', data);
  }
  return api.get('/api/recommendations');
};

// Add a manual recommendation (admin/testing)
export const addManualRecommendation = (rec) => {
  // POST /api/recommendations/manual
  return api.post('/api/recommendations/manual', rec);
};