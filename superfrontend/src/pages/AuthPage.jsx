/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosConfig";
import "../styles/AuthPage.css";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-redirect if user already authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("username");
    if (token && user) {
      navigate("/profile"); // persistent login redirect
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Prepare payload
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { username: form.username, email: form.email, password: form.password };

      // API endpoint
      const url = isLogin
        ? "http://127.0.0.1:5000/api/auth/login"
        : "http://127.0.0.1:5000/api/auth/register";

      // Send request
      const res = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const userData = res.data.user || res.data;

      // Store persistent user info in localStorage
      const userObj = {
        id: userData.id || "",
        username: userData.username || userData.name || "",
        email: userData.email || form.email,
      };

      localStorage.setItem("token", res.data.token || "");
      localStorage.setItem("user", JSON.stringify(userObj));

      setMessage(
        isLogin
          ? `Welcome back, ${userObj.username || "User"}!`
          : "Registration successful! Redirecting to your profile..."
      );

      // Redirect after success
      setTimeout(() => navigate("/profile"), 1200);

    } catch (err) {
      console.error("Auth error:", err.response?.data || err.message);
      if (err.response?.status === 409)
        setMessage("User already exists. Try logging in instead.");
      else if (err.response?.status === 401)
        setMessage("Invalid email or password.");
      else setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Toggle login/register */}
        <div className="toggle-buttons">
          <button
            onClick={() => setIsLogin(false)}
            className={!isLogin ? "active" : ""}
          >
            Sign Up
          </button>
          <button
            onClick={() => setIsLogin(true)}
            className={isLogin ? "active" : ""}
          >
            Log In
          </button>
        </div>

        <h2>{isLogin ? "Welcome Back" : "Create an Account"}</h2>
        <p>
          {isLogin
            ? "Log in to continue your journey"
            : "Start your learning adventure today"}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}
      </div>
    </div>
  );
}
