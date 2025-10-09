/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, MousePointerClick, Target } from "lucide-react";
import "../styles/LandingPage.css";
import ProgressImage from "../assets/ProgressRoadmap.jpeg";

const LandingPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  // Check auth status on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  // Real logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user"); // optional, clears cached user info
    setIsAuthenticated(false);
    navigate("/"); // Redirect to home
  };

  return (
    <div className="landing-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-inner">
          <div className="logo">
            <div className="dot"></div>
            <h1>SkillBridge</h1>
          </div>

          <nav className="nav-links">
            {isAuthenticated ? (
              <>
                <Link to="/" className="nav-link">
                  Home
                </Link>
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                <Link to="/roadmaps" className="nav-link">
                  Roadmaps
                </Link>
                <Link to="/skills" className="nav-link">
                  Skills
                </Link>
                <Link to="/profile" className="nav-link">
                  Profile
                </Link>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth" className="btn-primary">
                Get Started
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-text">
          <h2>
            Bridge the Gap <br />
            Between Your <br />
            <span>Education and Career</span>
          </h2>
          <p>
            SkillBridge helps university students and graduates generate
            personalized learning roadmaps using AI. Our platform provides a
            step-by-step guide to help you achieve your career goals.
          </p>
          <div className="hero-buttons">
            {!isAuthenticated ? (
              <>
                <Link to="/auth" className="btn-primary large">
                  Get Started for Free
                </Link>
                <a href="#how" className="btn-outline large">
                  How it works
                </a>
              </>
            ) : (
              <Link to="/dashboard" className="btn-primary large">
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* FIXED IMAGE RENDERING */}
        <div className="hero-image">
          <img
            src={ProgressImage}
            alt="Progress Roadmap"
            loading="lazy"
            style={{
              borderRadius: "12px",
              objectFit: "cover",
              maxWidth: "100%",
            }}
          />
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="how-section">
        <h3>How It Works</h3>
        <p>A simple, three-step process to your personalized career roadmap.</p>

        <div className="steps">
          <div className="step">
            <Upload className="icon" size={48} />
            <h4>1. Upload Resume</h4>
            <p>
              Upload your resume to let our AI analyze your skills and
              experience.
            </p>
          </div>

          <div className="step">
            <MousePointerClick className="icon" size={48} />
            <h4>2. Choose Skill</h4>
            <p>
              Select the skill you want to learn or improve for your desired
              career path.
            </p>
          </div>

          <div className="step">
            <Target className="icon" size={48} />
            <h4>3. Get Roadmap</h4>
            <p>
              Receive a personalized, step-by-step learning roadmap to achieve
              your goals.
            </p>
          </div>
        </div>
      </section>

      {/* Upload Resume CTA */}
      <section className="cta-section">
        <div className="cta-box">
          <div className="cta-text">
            <h3>Ready to get your personalized roadmap?</h3>
            <p>
              Upload your resume and tell us the skill you want to master —
              we'll generate a step-by-step learning plan.
            </p>
          </div>
          <div className="cta-buttons">
            <Link to="/upload" className="btn-outline">
              Upload Resume
            </Link>
            {!isAuthenticated && (
              <Link to="/auth" className="btn-primary">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>
          © {currentYear} <span>SkillBridge</span>. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
