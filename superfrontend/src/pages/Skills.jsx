import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import { Home, User, Target, LayoutDashboard } from "lucide-react";
import "../styles/Skills.css";

const Skills = () => {
  const [technicalSkills, setTechnicalSkills] = useState([]);
  const [softSkills, setSoftSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [category, setCategory] = useState("technical");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSkills = async () => {
      if (!userId) {
        setError("User not logged in. Please log in first.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/profile/${userId}/skills`);
        setTechnicalSkills(res.data.technical || []);
        setSoftSkills(res.data.soft || []);
      } catch (err) {
        console.error("Error fetching skills:", err);
        setError("Failed to load skills. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [userId]);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    try {
      await axios.post(`http://localhost:5000/api/profile/${userId}/skills`, {
        skill: newSkill,
        category,
      });

      if (category === "technical") {
        setTechnicalSkills((prev) => [...prev, newSkill]);
      } else {
        setSoftSkills((prev) => [...prev, newSkill]);
      }

      setNewSkill("");
    } catch (err) {
      console.error("Error adding skill:", err);
      setError("Failed to add skill. Try again.");
    }
  };

  if (loading) return <p className="loading">Loading skills...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="skills-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">
          <div className="dot"></div>
          <h1>SkillBridge</h1>
        </div>

        <nav className="nav-links">
          <Link to="/" className="nav-item"><Home size={18} /><span>Home</span></Link>
          <Link to="/dashboard" className="nav-item"><LayoutDashboard size={18} /><span>Dashboard</span></Link>
          <Link to="/roadmap" className="nav-item"><Target size={18} /><span>Roadmap</span></Link>
          <Link to="/skills" className="nav-item active"><User size={18} /><span>Skills</span></Link>
        </nav>

        <div className="profile-icon" onClick={() => navigate("/profile")}>
          <User size={22} />
        </div>
      </header>

      {/* Body */}
      <main className="skills-body">
        <h2>Your Skills</h2>
        <p className="subtitle">Manage and track your technical and soft skills.</p>

        <section className="skills-section">
          <div className="skills-column">
            <h3>🧠 Technical Skills</h3>
            {technicalSkills.length ? (
              <ul>
                {technicalSkills.map((skill, index) => (
                  <li key={index} className="skill-item tech">{skill}</li>
                ))}
              </ul>
            ) : (
              <p>No technical skills added yet.</p>
            )}
          </div>

          <div className="skills-column">
            <h3>💬 Soft Skills</h3>
            {softSkills.length ? (
              <ul>
                {softSkills.map((skill, index) => (
                  <li key={index} className="skill-item soft">{skill}</li>
                ))}
              </ul>
            ) : (
              <p>No soft skills added yet.</p>
            )}
          </div>
        </section>

        {/* Add Skill Form */}
        <section className="add-skill-section">
          <h3>Add a New Skill</h3>
          <form onSubmit={handleAddSkill} className="add-skill-form">
            <input
              type="text"
              placeholder="Enter skill name"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="technical">Technical</option>
              <option value="soft">Soft</option>
            </select>
            <button type="submit">Add Skill</button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Skills;
