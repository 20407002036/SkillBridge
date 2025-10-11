import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../axiosConfig";
import { CheckCircle, Circle, Clock, BookOpen, Target, Calendar } from "lucide-react";
import "../styles/Roadmap.css";

const Roadmap = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roadmapId = searchParams.get('roadmap_id');
  
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    setIsAuthenticated(!!(token && username));

    if (!roadmapId) {
      setError("No roadmap ID found. Please start from resume upload.");
      setLoading(false);
      return;
    }

    const fetchRoadmap = async () => {
      try {
        const response = await axios.get(`/api/v1/roadmaps/${roadmapId}`);
        console.log("Roadmap API response:", response.data); // Debug log
        setRoadmap(response.data);
      } catch (err) {
        console.error("Error fetching roadmap:", err);
        setError("Failed to load roadmap. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [roadmapId]);

  const handleStartLearning = () => {
    // Navigate to dashboard with the roadmap
    navigate('/dashboard');
  };

  const handleCreateNewRoadmap = () => {
    navigate('/upload');
  };

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      
      // Extract roadmap_id from URL params (assuming it's in the URL)
      const currentRoadmapId = roadmapId || roadmap?.id;
      if (!currentRoadmapId) {
        setError("No roadmap ID available for PDF generation");
        return;
      }
      
      // Start PDF generation
      const response = await axios.post(`/api/v1/roadmaps/${currentRoadmapId}/generate-pdf`);
      const { pdf_job_id } = response.data;
      
      // Poll for PDF completion
      const pollPDFStatus = async () => {
        try {
          const statusResponse = await axios.get(`/api/v1/pdf-status/${pdf_job_id}`);
          const { status, download_url } = statusResponse.data;
          
          if (status === 'completed') {
            // Download the PDF
            const downloadResponse = await axios.get(`/api/v1/download-pdf/${pdf_job_id}`, {
              responseType: 'blob'
            });
            
            // Create download link
            const blob = new Blob([downloadResponse.data], { type: 'application/pdf' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `SkillBridge_Roadmap_${currentRoadmapId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            
            setLoading(false);
          } else if (status === 'failed') {
            setError("PDF generation failed. Please try again.");
            setLoading(false);
          } else {
            // Still processing, poll again
            setTimeout(pollPDFStatus, 2000);
          }
        } catch (err) {
          console.error("Error checking PDF status:", err);
          setError("Failed to check PDF status. Please try again.");
          setLoading(false);
        }
      };
      
      // Start polling
      setTimeout(pollPDFStatus, 1000);
      
    } catch (err) {
      console.error("Error starting PDF generation:", err);
      setError("Failed to start PDF generation. Please try again.");
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    // Navigate to authentication page with signup mode
    navigate('/auth?mode=signup');
  };

  if (loading) {
    return (
      <div className="roadmap-loading">
        <div className="spinner"></div>
        <p>Loading your personalized roadmap...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="roadmap-error">
        <p>{error}</p>
        <button onClick={handleCreateNewRoadmap} className="retry-button">
          Create New Roadmap
        </button>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="roadmap-error">
        <p>No roadmap data available.</p>
        <button onClick={handleCreateNewRoadmap} className="retry-button">
          Create New Roadmap
        </button>
      </div>
    );
  }

  const { 
    title,
    notes,
    phases = [],
    estimated_total_duration_months,
    weekly_hours,
    selected_skill_ids = [],
    roadmap_id,
    analysis_id
  } = roadmap || {};

  // Debug logging
  console.log("Roadmap API data:", roadmap);
  console.log("Roadmap phases:", phases);
  console.log("Phases length:", phases?.length);

  // Map API phases to display format
  const apiPhases = phases.map((phase, index) => ({
    id: phase.phase_id,
    title: phase.title,
    duration: `${phase.duration_weeks} weeks`,
    description: phase.goals ? phase.goals.slice(0, 2).join('. ') + '...' : '', // Show first 2 goals as description
    status: phase.progress_percent > 0 ? 'completed' : (index === 0 ? 'current' : 'upcoming'),
    skills: phase.goals || [], // Keep goals as individual items for the skills list
    resources: phase.resources ? phase.resources.map(resource => ({
      title: resource.title,
      url: resource.url,
      type: resource.type.toLowerCase()
    })) : [],
    progress_percent: phase.progress_percent || 0
  }));

  // Only use mock data if no phases exist from API (development/testing)
  const mockPhases = process.env.NODE_ENV === 'development' ? [
    {
      id: 1,
      title: "Month 1-2: Foundations",
      duration: "2 months",
      description: "Learn the fundamentals and build a strong foundation",
      status: "completed",
      skills: [
        { name: "HTML/CSS", difficulty: "beginner" },
        { name: "JavaScript Basics", difficulty: "beginner" }
      ],
      resources: [
        { title: "MDN Web Docs", url: "https://developer.mozilla.org", type: "documentation" },
        { title: "freeCodeCamp", url: "https://freecodecamp.org", type: "tutorial" }
      ]
    },
    {
      id: 2,
      title: "Month 3-4: Intermediate Skills", 
      duration: "2 months",
      description: "Build upon your foundation with more advanced concepts",
      status: "current",
      skills: [
        { name: "React", difficulty: "intermediate" },
        { name: "State Management", difficulty: "intermediate" }
      ],
      resources: [
        { title: "React Documentation", url: "https://reactjs.org", type: "documentation" },
        { title: "React Tutorial", url: "https://reactjs.org/tutorial", type: "tutorial" }
      ]
    },
    {
      id: 3,
      title: "Month 5-6: Advanced Topics",
      duration: "2 months", 
      description: "Master advanced concepts and best practices",
      status: "upcoming",
      skills: [
        { name: "Testing", difficulty: "advanced" },
        { name: "Performance Optimization", difficulty: "advanced" }
      ],
      resources: [
        { title: "Jest Documentation", url: "https://jestjs.io", type: "documentation" },
        { title: "Web Performance", url: "https://web.dev/performance", type: "guide" }
      ]
    }
  ] : [];

  // Use API phases if they exist and have content, otherwise use mock data in development
  const displayPhases = (apiPhases && apiPhases.length > 0) ? apiPhases : mockPhases;
  
  console.log("Using phases:", displayPhases.length > 0 ? (apiPhases.length > 0 ? "API data" : "Mock data") : "No data");
  console.log("Display phases:", displayPhases);
  
  // Calculate dynamic progress
  const completedPhases = displayPhases.filter(p => p.status === 'completed').length;
  const totalPhases = displayPhases.length || 1;
  const progressPercent = Math.round((completedPhases / totalPhases) * 100);
  
  // Dynamic skill count - count goals/skills from all phases
  const skillCount = displayPhases.reduce((acc, phase) => acc + (phase.skills?.length || 0), 0);
  
  // Provide meaningful fallbacks for display
  const displayTitle = title || "Your Learning Roadmap";
  const displayDescription = notes || "Follow this roadmap to master the skills you need for your career goals.";
  const displayTargetRole = selected_skill_ids.length > 0 ? `${selected_skill_ids.join(', ')} Specialist` : "Your Target Role";
  const displayDuration = estimated_total_duration_months ? `${estimated_total_duration_months} months` : "6 months";
  const displayCommitment = weekly_hours ? `${weekly_hours} hours` : "10 hours"; // Use API data or fallback

  return (
    <div className="roadmap-container">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="dot"></div>
            <h1>SkillBridge</h1>
          </div>
          <nav className="nav-links">
            <a href="/" className="nav-link">Home</a>
            {isAuthenticated && (
              <>
                <a href="/dashboard" className="nav-link">Dashboard</a>
                <a href="/roadmaps" className="nav-link active">Roadmaps</a>
                <a href="/profile" className="nav-link">Profile</a>
              </>
            )}
          </nav>
          <div className="header-actions">
            {isAuthenticated ? (
              <button 
                className="logout-button"
                onClick={() => {
                  localStorage.clear();
                  setIsAuthenticated(false);
                  navigate('/');
                }}
              >
                Logout
              </button>
            ) : (
              <>
                <button 
                  className="login-button"
                  onClick={() => navigate('/auth')}
                >
                  Log in
                </button>
                <button 
                  className="signup-button"
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="content-wrapper">
          {/* Title Section */}
          <div className="title-section">
            <h2>{displayTitle}</h2>
            {/* <p>{displayDescription}</p> */}
          </div>

          {/* Roadmap Summary */}
          <div className="roadmap-summary">
            {/* <div className="summary-card">
              <Target className="summary-icon" />
              <div>
                <h3>Target Role</h3>
                <p>{displayTargetRole}</p>
              </div>
            </div> */}
            <div className="summary-card">
              <Calendar className="summary-icon" />
              <div>
                <h3>Duration</h3>
                <p>{displayDuration}</p>
              </div>
            </div>
            <div className="summary-card">
              <Clock className="summary-icon" />
              <div>
                <h3>Weekly Commitment</h3>
                <p>{displayCommitment} hours</p>
              </div>
            </div>
            <div className="summary-card">
              <BookOpen className="summary-icon" />
              <div>
                <h3>Total Skills</h3>
                <p>{skillCount} skills</p>
              </div>
            </div>
          </div>

          {/* Roadmap Timeline */}
          <div className="roadmap-timeline">
            <div className="timeline-line"></div>
            
            {displayPhases.map((phase, index) => (
              <div key={phase.id || index} className="timeline-phase">
                <div className="phase-marker">
                  {phase.status === 'completed' ? (
                    <CheckCircle className="marker-icon completed" />
                  ) : phase.status === 'current' ? (
                    <div className="marker-icon current"></div>
                  ) : (
                    <Circle className="marker-icon upcoming" />
                  )}
                </div>
                
                <div className="phase-content">
                  <div className="phase-header">
                    <h3>{phase.title}</h3>
                    <span className="phase-duration">{phase.duration}</span>
                  </div>
                  <p className="phase-description">{phase.description}</p>
                  
                  {/* Skills in this phase */}
                  {phase.skills && phase.skills.length > 0 && (
                    <div className="phase-skills">
                      <h4>Goals for this Phase:</h4>
                      <ul className="skills-list">
                        {phase.skills.map((skill, skillIndex) => (
                          <li key={skillIndex} className="skill-item">
                            <span className="skill-name">{typeof skill === 'string' ? skill : skill.name}</span>
                            {skill.difficulty && (
                              <span className={`skill-difficulty ${skill.difficulty.toLowerCase()}`}>
                                {skill.difficulty}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Resources */}
                  {phase.resources && phase.resources.length > 0 && (
                    <div className="phase-resources">
                      <h4>Recommended Resources:</h4>
                      <ul className="resources-list">
                        {phase.resources.map((resource, resourceIndex) => (
                          <li key={resourceIndex} className="resource-item">
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="resource-link"
                            >
                              {resource.title}
                            </a>
                            <span className="resource-type">{resource.type}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Phase Actions */}
                  {phase.status === 'current' && (
                    <div className="phase-actions">
                      <button className="start-phase-button">
                        Start This Phase
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Recommended Resources Section */}
          {roadmap?.recommended_resources && roadmap.recommended_resources.length > 0 ? (
            <div className="recommended-resources">
              <h3>Recommended Resources</h3>
              <div className="resources-grid">
                {roadmap.recommended_resources.map((resource, index) => (
                  <a 
                    key={index}
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="resource-card"
                  >
                    <h4>{resource.title}</h4>
                    <p>{resource.description}</p>
                    <span className="resource-type">{resource.type}</span>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="recommended-resources">
              <h3>Recommended Resources</h3>
              <div className="resources-grid">
                <a href="https://www.udemy.com" target="_blank" rel="noopener noreferrer" className="resource-card">
                  <h4>Udemy Courses</h4>
                  <p>In-depth video courses on various tech stacks.</p>
                </a>
                <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="resource-card">
                  <h4>YouTube Tutorials</h4>
                  <p>Free video content from top creators and educators.</p>
                </a>
                <a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer" className="resource-card">
                  <h4>Official Docs</h4>
                  <p>The primary source of truth for any technology.</p>
                </a>
              </div>
            </div>
          )}

          {/* Overall Progress */}
          <div className="overall-progress">
            <div className="progress-header">
              <h4>Overall Progress</h4>
              <span className="progress-percentage">{progressPercent}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          {/* Action Buttons - Dynamic based on auth status */}
          <div className="roadmap-actions">
            <button 
              className="secondary-button"
              onClick={handleDownloadPDF}
              disabled={loading}
            >
              {loading ? 'Generating PDF...' : 'Download PDF'}
            </button>
            {!isAuthenticated ? (
              <button 
                className="primary-button"
                onClick={handleCreateAccount}
              >
                Create Account to Track Progress
              </button>
            ) : (
              <button 
                className="primary-button"
                onClick={handleStartLearning}
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;
