import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../axiosConfig";
import { Loader2, ArrowRight, Brain, Sparkles } from "lucide-react";
import "../styles/Recommendation.css";

const Recommendation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Resume data passed from UploadResume page
  const uploadedResume = location.state?.resumeFile || null;

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        setLoading(true);

        // Send resume file to NLP backend
        const formData = new FormData();
        formData.append("resume", uploadedResume);

        const response = await axios.post("http://127.0.0.1:5000/api/recommendation", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setRecommendation(response.data);
      } catch (err) {
        console.error("Error fetching recommendation:", err);
        setError("Failed to generate recommendations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (uploadedResume) fetchRecommendation();
    else setLoading(false);
  }, [uploadedResume]);

  const handleGenerateRoadmap = () => {
    // Navigate to roadmap page with recommended data
    navigate("/roadmap", { state: { recommendation } });
  };

  if (loading)
    return (
      <div className="rec-container center">
        <Loader2 className="spin" size={40} />
        <p>Analyzing your resume using NLP...</p>
      </div>
    );

  if (error)
    return (
      <div className="rec-container center">
        <p className="error">{error}</p>
      </div>
    );

  if (!recommendation)
    return (
      <div className="rec-container center">
        <p>No data found. Please upload your resume again.</p>
      </div>
    );

  return (
    <div className="rec-container">
      <header className="rec-header">
        <h1>
          <Brain size={36} className="icon" /> AI Skill Recommendation
        </h1>
        <p>Your personalized learning insight based on resume analysis</p>
      </header>

      <section className="rec-section">
        <div className="card soft">
          <h3>
            <Sparkles size={24} /> Soft Skills Identified
          </h3>
          <ul>
            {recommendation.soft_skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </div>

        <div className="card tech">
          <h3>
            <Sparkles size={24} /> Technical Skills Extracted
          </h3>
          <ul>
            {recommendation.technical_skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </div>

        <div className="card insight">
          <h3>
            <Sparkles size={24} /> Recommended Path
          </h3>
          <p>{recommendation.recommended_path}</p>
        </div>
      </section>

      <div className="btn-section">
        <button className="btn-primary" onClick={handleGenerateRoadmap}>
          Generate Roadmap <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Recommendation;
