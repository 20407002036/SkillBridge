/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { useNavigate, Link } from "react-router-dom";
import { Home, Target, BookOpen, User, LogOut } from "lucide-react";
import "../styles/Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    bio: "",
    skills: [],
    social: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // === Fetch user info ===
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = {
      name: localStorage.getItem("username") || "",
      email: localStorage.getItem("email") || "",
    };
    setUser((prev) => ({ ...prev, ...storedUser }));

    const fetchUser = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchUser();
  }, []);

  // === Handle input changes ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // === Update profile ===
  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setMessage("Updating your profile...");

    try {
      const res = await axios.put(
        "http://127.0.0.1:5000/api/user/profile",
        {
          name: user.name,
          email: user.email,
          bio: user.bio,
          skills: user.skills,
          social: user.social,
        },
        {
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          withCredentials: true,
        }
      );

      // Update localStorage for instant sync
      localStorage.setItem("username", user.name);
      localStorage.setItem("email", user.email);

      setMessage("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error updating profile. Please try again.");
    }
  };

  // === Logout user ===
  const handleLogout = async () => {
    try {
      await axios.post("http://127.0.0.1:5000/api/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.warn("Logout request failed silently:", error);
    } finally {
      localStorage.clear();
      navigate("/auth");
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <h2>Loading your profile...</h2>
      </div>
    );
  }

  return (
    <div className="profile-container">
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
          <Link to="/dashboard" className="nav-item">
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

        <div className="profile-logout" onClick={handleLogout}>
          <LogOut size={22} />
        </div>
      </header>

      {/* Profile Body */}
      <main className="profile-body">
        <section className="profile-card">
          <div className="profile-header">
            <div className="avatar">
              <User size={40} />
            </div>
            <h2>{user.name || "User"}</h2>
            <p>{user.email}</p>
          </div>

          {editing ? (
            <form className="profile-form" onSubmit={handleUpdate}>
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </label>

              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </label>

              <label>
                Bio:
                <textarea
                  name="bio"
                  rows="3"
                  value={user.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                ></textarea>
              </label>

              <label>
                Skills (comma separated):
                <input
                  type="text"
                  name="skills"
                  value={user.skills.join(", ")}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      skills: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                  placeholder="e.g. Python, React, SQL"
                />
              </label>

              <label>
                Social Link:
                <input
                  type="text"
                  name="social"
                  value={user.social || ""}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourname"
                />
              </label>

              <label>
                Social Link:
                <input
                  type="text"
                  name="social"
                  value={user.social || ""}
                  onChange={handleChange}
                  placeholder="https://github.com/yourname"
                />
              </label>

              <label>
                Social Link:
                <input
                  type="text"
                  name="social"
                  value={user.social || ""}
                  onChange={handleChange}
                  placeholder="https://x.com/yourname"
                />
              </label>

              <button type="submit" className="save-btn">
                Save Changes
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="profile-info">
              <h3>About</h3>
              <p>{user.bio || "No bio provided yet."}</p>

              <h3>Skills</h3>
              {user.skills && user.skills.length > 0 ? (
                <ul>
                  {user.skills.map((skill, i) => (
                    <li key={i}>{skill}</li>
                  ))}
                </ul>
              ) : (
                <p>No skills listed yet.</p>
              )}

              <h3>Social</h3>
              {user.social ? (
                <a href={user.social} target="_blank" rel="noopener noreferrer">
                  {user.social}
                </a>
              ) : (
                <p>No social links provided yet.</p>
              )}

              <button className="edit-btn" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            </div>
          )}
        </section>

        {message && <p className="profile-message">{message}</p>}
      </main>
    </div>
  );
};

export default Profile;
