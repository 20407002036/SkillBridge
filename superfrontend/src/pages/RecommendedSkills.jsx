import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../axiosConfig";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";
import "../styles/RecommendedSkills.css";

const RecommendedSkills = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get('analysis_id');
  
  const [recommendedSkills, setRecommendedSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preferences, setPreferences] = useState({
    weekly_hours: 10,
    target_duration_months: 6,
    learning_style: "project_based"
  });

  useEffect(() => {
    if (!analysisId) {
      setError("No analysis ID found. Please start from resume upload.");
      setLoading(false);
      return;
    }

    const fetchRecommendedSkills = async () => {
      try {
        const response = await axios.get(`/api/v1/skills/${analysisId}`);
        const skills = response.data.recommended_skills || [];
        setRecommendedSkills(skills);
        
        // Pre-select first 2 skills as default
        if (skills.length >= 2) {
          setSelectedSkills([skills[0].skill_id, skills[1].skill_id]);
        }
      } catch (err) {
        console.error("Error fetching recommended skills:", err);
        setError("Failed to load recommended skills. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedSkills();
  }, [analysisId]);

  const toggleSkillSelection = (skillId) => {
    setSelectedSkills(prev => {
      if (prev.includes(skillId)) {
        return prev.filter(id => id !== skillId);
      } else {
        return [...prev, skillId];
      }
    });
  };

  const handleConfirmRecommendations = async () => {
    if (selectedSkills.length === 0) {
      setError("Please select at least one skill to continue.");
      return;
    }

    try {
      const response = await axios.post('/api/v1/confirm-recommendations', {
        analysis_id: analysisId,
        selected_skill_ids: selectedSkills,
        preferences: preferences
      });

      const roadmapJobId = response.data.roadmap_job_id;
      
      // Navigate to loading screen with roadmap job ID
      navigate(`/loading?roadmap_job_id=${roadmapJobId}&type=roadmap`);
      
    } catch (err) {
      console.error("Error confirming recommendations:", err);
      setError("Failed to confirm recommendations. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="recommended-skills-loading">
        <div className="spinner"></div>
        <p>Loading recommended skills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommended-skills-error">
        <p>{error}</p>
        <button onClick={() => navigate('/upload')}>Go Back to Upload</button>
      </div>
    );
  }

  return (
    <div className="recommended-skills-container">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="dot"></div>
            <h1>SkillBridge</h1>
          </div>
          <nav className="nav-links">
            <a href="/" className="nav-link">Home</a>
            <a href="/dashboard" className="nav-link">Dashboard</a>
            <a href="/roadmaps" className="nav-link active">Roadmaps</a>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="content-wrapper">
          {/* Progress Indicator */}
          <div className="progress-section">
            <p className="progress-text">Step 2 of 3</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '66%' }}></div>
            </div>
          </div>

          {/* Title Section */}
          <div className="title-section">
            <h2>Recommended Skills</h2>
            <p>Based on your resume and goal, we recommend the following skills to enhance your profile. Select the ones you want to include in your personalized roadmap.</p>
          </div>

          {/* Skills List */}
          <div className="skills-list">
            {recommendedSkills.map((skill) => (
              <div key={skill.skill_id} className="skill-card">
                <div className="skill-content">
                  <div className="skill-icon">
                    <div className="icon-placeholder">
                      {skill.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  </div>
                  <div className="skill-details">
                    <h3>{skill.name}</h3>
                    <p>{skill.description || 'Essential skill for your career path'}</p>
                    <p className="skill-meta">
                      Current Level: <span className="level">Beginner</span> | 
                      Est. Duration: <span className="duration">4 weeks</span>
                    </p>
                  </div>
                </div>
                <div 
                  className="skill-checkbox"
                  onClick={() => toggleSkillSelection(skill.skill_id)}
                >
                  {selectedSkills.includes(skill.skill_id) ? (
                    <CheckCircle className="checkbox-icon selected" />
                  ) : (
                    <Circle className="checkbox-icon" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Preferences Section */}
          <div className="preferences-section">
            <h3>Learning Preferences</h3>
            <div className="preferences-grid">
              <div className="preference-item">
                <label>Weekly Hours</label>
                <select 
                  value={preferences.weekly_hours}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev, 
                    weekly_hours: parseInt(e.target.value)
                  }))}
                >
                  <option value={5}>5 hours/week</option>
                  <option value={10}>10 hours/week</option>
                  <option value={15}>15 hours/week</option>
                  <option value={20}>20 hours/week</option>
                </select>
              </div>
              <div className="preference-item">
                <label>Target Duration</label>
                <select 
                  value={preferences.target_duration_months}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev, 
                    target_duration_months: parseInt(e.target.value)
                  }))}
                >
                  <option value={3}>3 months</option>
                  <option value={6}>6 months</option>
                  <option value={9}>9 months</option>
                  <option value={12}>12 months</option>
                </select>
              </div>
              <div className="preference-item">
                <label>Learning Style</label>
                <select 
                  value={preferences.learning_style}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev, 
                    learning_style: e.target.value
                  }))}
                >
                  <option value="project_based">Project-based</option>
                  <option value="tutorial_based">Tutorial-based</option>
                  <option value="theoretical">Theoretical</option>
                  <option value="hands_on">Hands-on</option>
                </select>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="continue-section">
            <button 
              className="continue-button"
              onClick={handleConfirmRecommendations}
              disabled={selectedSkills.length === 0}
            >
              Create My Roadmap
              <ArrowRight className="button-icon" />
            </button>
            <p className="selected-count">
              {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecommendedSkills;