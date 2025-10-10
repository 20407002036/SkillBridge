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
  const [hasPendingAnalysis, setHasPendingAnalysis] = useState(false);
  const navigate = useNavigate();

  // Auto-redirect if user already authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("username");
    if (token && user) {
      // Use timeout to prevent navigation during initial render
      setTimeout(() => navigate("/dashboard"), 100);
    }

    // Check for pending analysis to link
    const pendingAnalysisId = localStorage.getItem("current_analysis_id") || 
                             sessionStorage.getItem("analysis_id");
    setHasPendingAnalysis(!!pendingAnalysisId);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Check if there's a pending analysis_id to link (from previous roadmap generation)
      const pendingAnalysisId = localStorage.getItem("current_analysis_id") || 
                               sessionStorage.getItem("analysis_id");
      
      console.log("Pending analysis ID for linking:", pendingAnalysisId);

      // Prepare payload
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { 
            username: form.username, 
            email: form.email, 
            password: form.password,
            // Include analysis_id for registration if available
            ...(pendingAnalysisId && { analysis_id: pendingAnalysisId })
          };
      
      console.log("Auth payload:", payload);

      // API endpoint
      const url = isLogin
        ? "http://127.0.0.1:5000/api/auth/login"
        : "http://127.0.0.1:5000/api/auth/register";

      // Send request
      const res = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      console.log("Auth response:", res.data);

      const userData = res.data.user || res.data;

      // Store persistent user info in localStorage
      const userObj = {
        id: userData.id || "",
        username: userData.username || userData.name || "",
        email: userData.email || form.email,
      };

      localStorage.setItem("token", res.data.token || "");
      localStorage.setItem("user", JSON.stringify(userObj));
      localStorage.setItem("username", userObj.username);
      localStorage.setItem("email", userObj.email);
      localStorage.setItem("userId", userObj.id);

      // Handle success messages
      let successMessage = "";
      if (isLogin) {
        successMessage = `Welcome back, ${userObj.username || "User"}!`;
      } else {
        // Registration success message
        if (res.data.linked_analysis_id) {
          successMessage = "Registration successful! Your previous roadmap has been linked to your account.";
          // Clear the pending analysis_id since it's now linked
          localStorage.removeItem("current_analysis_id");
          sessionStorage.removeItem("analysis_id");
        } else {
          successMessage = "Registration successful! Redirecting to your dashboard...";
        }
      }

      setMessage(successMessage);

      // For login, check if user has linked analysis and redirect accordingly
      if (isLogin) {
        try {
          // Check for linked analysis
          const linkedAnalysisRes = await axios.get("/api/auth/user/linked-analysis", {
            headers: { "Authorization": `Bearer ${res.data.token}` }
          });
          
          if (linkedAnalysisRes.data.linked_analysis_id) {
            setMessage(`Welcome back, ${userObj.username}! Your previous roadmaps are ready.`);
          }
        } catch (error) {
          // If linked analysis check fails, continue with normal flow
          console.log("No linked analysis found or error:", error.response?.data);
        }
      }

      // Redirect after success - always go to dashboard
      setTimeout(() => navigate("/dashboard"), 1200);

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

        {/* Show pending analysis notification for registration */}
        {!isLogin && hasPendingAnalysis && (
          <div className="pending-analysis-notice">
            <p>🎯 <strong>Great news!</strong> Your roadmap will be linked to your new account.</p>
          </div>
        )}

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
