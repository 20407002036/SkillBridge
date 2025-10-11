import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../axiosConfig";
import "../styles/LoadingScreen.css";

const LoadingScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get('analysis_id');
  const roadmapJobId = searchParams.get('roadmap_job_id');
  const type = searchParams.get('type'); // 'analysis' or 'roadmap'
  
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Store analysis_id in localStorage if it's not already stored
    if (analysisId && !localStorage.getItem("current_analysis_id")) {
      localStorage.setItem("current_analysis_id", analysisId);
    }
    
    if (type === 'analysis' && analysisId) {
      pollAnalysisStatus(analysisId);
    } else if (type === 'roadmap' && roadmapJobId) {
      pollRoadmapStatus(roadmapJobId);
    } else {
      setError("Invalid loading parameters");
    }
  }, [type, analysisId, roadmapJobId]);

  // Poll analysis status every 2 seconds
  const pollAnalysisStatus = async (analysisId) => {
    const maxAttempts = 20; // Poll for up to 20 times (40 seconds)
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        setStatus(`Analyzing your resume... (${i + 1}/${maxAttempts})`);
        
        const response = await axios.get(`/api/v1/status/${analysisId}`);
        const { status: analysisStatus } = response.data;
        
        if (analysisStatus === 'completed') {
          setStatus("Analysis completed! Redirecting to recommended skills...");
          setTimeout(() => {
            navigate(`/recommended-skills?analysis_id=${analysisId}`);
          }, 1000);
          return;
        } else if (analysisStatus === 'failed') {
          setError("Analysis failed. Please try uploading again.");
          return;
        }
        
        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (err) {
        console.error("Error checking analysis status:", err);
        setError("Error checking analysis status. Please try again.");
        return;
      }
    }
    
    setError("Analysis timed out. Please try uploading again.");
  };

  // Poll roadmap generation status every 2 seconds
  const pollRoadmapStatus = async (roadmapJobId) => {
    const maxAttempts = 20; // Poll for up to 20 times (40 seconds)
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        setStatus(`Generating your personalized roadmap... (${i + 1}/${maxAttempts})`);
        
        const response = await axios.get(`/api/v1/roadmap/status/${roadmapJobId}`);
        const { status: roadmapStatus, roadmap_id } = response.data;
        
        if (roadmapStatus === 'completed' && roadmap_id) {
          setStatus("Roadmap completed! Redirecting to your personalized roadmap...");
          setTimeout(() => {
            navigate(`/roadmap?roadmap_id=${roadmap_id}`);
          }, 1000);
          return;
        } else if (roadmapStatus === 'failed') {
          setError("Roadmap generation failed. Please try again.");
          return;
        }
        
        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (err) {
        console.error("Error checking roadmap status:", err);
        setError("Error checking roadmap status. Please try again.");
        return;
      }
    }
    
    setError("Roadmap generation timed out. Please try again.");
  };

  if (error) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <p className="error-message">{error}</p>
          <button 
            onClick={() => navigate('/upload')} 
            className="retry-button"
          >
            Go Back to Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="spinner"></div>
        <h1 className="loading-title">
          {type === 'analysis' 
            ? "Analyzing your resume and generating skill recommendations…"
            : "Creating your personalized learning roadmap…"
          }
        </h1>
        <p className="loading-subtitle">
          This may take a few moments. Please don't close this page.
        </p>
        {status && (
          <p className="loading-status">{status}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;