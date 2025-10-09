import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import { Home, User, BookOpen, LayoutDashboard } from "lucide-react";
import "../styles/Roadmap.css";

const Roadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId"); // stored at login
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!userId) {
        setError("User not logged in. Please log in first.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/roadmap/${userId}`);
        setRoadmap(response.data);
      } catch (err) {
        console.error("Error fetching roadmap:", err);
        setError("Failed to load roadmap. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [userId]);

  const handleProfileClick = () => navigate("/profile");

  if (loading) {
    return (
      <div className="roadmap-loading">
        <div className="spinner"></div>
        <p>Fetching your roadmap...</p>
      </div>
    );
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!roadmap) {
    return <p className="no-data">No roadmap available. Upload a resume to generate one!</p>;
  }

  const { completedSkills = [], currentStage, upcomingSkills = [], progress = 0 } = roadmap;

  return (
    <div className="roadmap-container">
      {/* ===== Navbar ===== */}
      <header className="navbar">
        <div className="logo">
          <div className="dot"></div>
          <h1>SkillBridge</h1>
        </div>

        <nav className="nav-links">
          <Link to="/" className="nav-item">
            <Home size={18} />
            <span>Home</span>
          </Link>
          <Link to="/dashboard" className="nav-item">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/skills" className="nav-item">
            <BookOpen size={18} />
            <span>Skills</span>
          </Link>
        </nav>

        <div className="profile-icon" onClick={handleProfileClick} title="View Profile">
          <User size={24} className="icon-hover" />
        </div>
      </header>

      {/* ===== Header ===== */}
      <header className="roadmap-header">
        <h2>Your Learning Roadmap</h2>
        <p className="subtitle">Track your learning journey and progress.</p>
      </header>

      {/* ===== Progress Overview ===== */}
      <section className="progress-section">
        <h3>Overall Progress</h3>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p>{progress}% completed</p>
      </section>

      {/* ===== Current Stage ===== */}
      <section className="current-stage">
        <h3>Current Stage</h3>
        {currentStage ? (
          <div className="stage-card">
            <h4>{currentStage.title}</h4>
            <p>{currentStage.description}</p>
            <button className="btn-continue">Continue Learning</button>
          </div>
        ) : (
          <p>No current stage. Select a skill to begin!</p>
        )}
      </section>

      {/* ===== Completed Skills ===== */}
      <section className="completed-section">
        <h3>Completed Skills</h3>
        {completedSkills.length > 0 ? (
          <ul className="skills-list">
            {completedSkills.map((skill, index) => (
              <li key={index} className="skill-item completed">{skill}</li>
            ))}
          </ul>
        ) : (
          <p>No completed skills yet.</p>
        )}
      </section>

      {/* ===== Upcoming Skills ===== */}
      <section className="upcoming-section">
        <h3>Upcoming Skills</h3>
        {upcomingSkills.length > 0 ? (
          <ul className="skills-list">
            {upcomingSkills.map((skill, index) => (
              <li key={index} className="skill-item upcoming">{skill}</li>
            ))}
          </ul>
        ) : (
          <p>You are all caught up! 🎉</p>
        )}
      </section>

      {/* ===== Action Buttons ===== */}
      <div className="roadmap-actions">
        <button className="btn-edit">Edit Roadmap</button>
        <button className="btn-recommend">Get Skill Recommendation</button>
      </div>
    </div>
  );
};

export default Roadmap;
