/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { User, Home, Target, BookOpen } from "lucide-react";
import axios from "../axiosConfig";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [roadmap, setRoadmap] = useState({
    completed: [],
    current: {},
    upcoming: [],
  });

  // Fetch user and roadmap data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get("/api/user/profile");
        const roadmapRes = await axios.get("/api/roadmap/status");
        setUser(userRes.data);
        setRoadmap(roadmapRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  const progress =
    (roadmap.completed.length /
      (roadmap.completed.length + roadmap.upcoming.length + 1)) *
    100;

  // === HANDLERS ===
  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleEditRoadmap = () => {
    navigate("/roadmap");
  };

  const handleGetRecommendation = () => {
    navigate("/recommendation");
  };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
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
          <Link to="/dashboard" className="nav-item active">
            <User size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/roadmap" className="nav-item">
            <Target size={18} />
            <span>Roadmap</span>
          </Link>
          <Link to="/skills" className="nav-item">
            <BookOpen size={18} />
            <span>Skills</span>
          </Link>
        </nav>

        <div className="profile" onClick={handleProfileClick}>
          <User size={22} className="profile-icon" />
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="dashboard-body">
        {/* Progress Overview */}
        <section className="progress-card">
          <h2>Overall Progress</h2>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
          <p>{Math.round(progress)}% Completed</p>
        </section>

        {/* Current Skill Section */}
        <section className="current-skill-card">
          <h3>Current Stage</h3>
          {roadmap.current ? (
            <div className="current-skill">
              <p>
                You’re currently working on:{" "}
                <strong>{roadmap.current.name || "Loading..."}</strong>
              </p>
              <button
                className="continue-btn"
                onClick={() => navigate("/roadmap")}
              >
                Continue
              </button>
            </div>
          ) : (
            <p>No active skill in progress.</p>
          )}
        </section>

        {/* Completed Skills */}
        <section className="completed-skills">
          <h3>Completed Skills</h3>
          <ul>
            {roadmap.completed.length > 0 ? (
              roadmap.completed.map((skill, i) => <li key={i}>{skill}</li>)
            ) : (
              <p>No completed skills yet.</p>
            )}
          </ul>
        </section>

        {/* Upcoming Skills */}
        <section className="upcoming-skills">
          <h3>Upcoming Stage</h3>
          <ul>
            {roadmap.upcoming.length > 0 ? (
              roadmap.upcoming.map((skill, i) => <li key={i}>{skill}</li>)
            ) : (
              <p>No upcoming skills.</p>
            )}
          </ul>
        </section>
      </main>

      {/* Bottom Buttons */}
      <footer className="dashboard-footer">
        <button className="edit-btn" onClick={handleEditRoadmap}>
          Edit Roadmap
        </button>
        <button className="recommend-btn" onClick={handleGetRecommendation}>
          Get Skill Recommendation
        </button>
      </footer>
    </div>
  );
};

export default Dashboard;
