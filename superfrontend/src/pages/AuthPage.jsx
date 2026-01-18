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
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState("");
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

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setVerifyingOtp(true);
    setMessage("");

    try {
      const res = await axios.post("/api/auth/verifyOTP", {
        email: registrationEmail,
        otp: otp
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      console.log("OTP verification response:", res.data);
      
      // Expected response from backend:
      // {
      //   "message": "Email verified successfully",
      //   "token": "jwt_access_token",
      //   "user": {
      //     "id": "user_id",
      //     "username": "username", 
      //     "email": "user@email.com",
      //     "verified": true
      //   }
      // }

      // Update stored user data with verified token and user info
      if (res.data.token && res.data.user) {
        const userObj = {
          id: res.data.user.id,
          username: res.data.user.username,
          email: res.data.user.email,
          verified: true
        };

        // Store verified user data and token
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(userObj));
        localStorage.setItem("username", userObj.username);
        localStorage.setItem("email", userObj.email);
        localStorage.setItem("userId", userObj.id.toString());
        
        // Update axios default authorization header for immediate use
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }
      
      setMessage("Email verified successfully! Redirecting to dashboard...");
      setShowOtpPopup(false);
      
      // Redirect to dashboard after successful verification
      setTimeout(() => navigate("/dashboard"), 1200);

    } catch (err) {
      console.error("OTP verification error:", err.response?.data || err.message);
      if (err.response?.status === 400) {
        setMessage("Invalid or expired OTP. Please try again.");
      } else {
        setMessage("OTP verification failed. Please try again.");
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

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

      if (isLogin) {
        // Handle login flow
        const userObj = {
          id: userData.id || "",
          username: userData.username || userData.name || "",
          email: userData.email || form.email,
        };

        localStorage.setItem("token", res.data.token || "");
        localStorage.setItem("user", JSON.stringify(userObj));
        localStorage.setItem("username", userObj.username);
        localStorage.setItem("email", userObj.email);
        localStorage.setItem("userId", userObj.id.toString());

        // Update axios default authorization header for immediate use
        if (res.data.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        }

        let successMessage = `Welcome back, ${userObj.username || "User"}!`;
        setMessage(successMessage);

        // Check for linked analysis
        try {
          const linkedAnalysisRes = await axios.get("/api/auth/user/linked-analysis", {
            headers: { "Authorization": `Bearer ${res.data.token}` }
          });
          
          if (linkedAnalysisRes.data.linked_analysis_id) {
            setMessage(`Welcome back, ${userObj.username}! Your previous roadmaps are ready.`);
          }
        } catch (error) {
          console.log("No linked analysis found or error:", error.response?.data);
        }

        // Redirect after login
        setTimeout(() => navigate("/dashboard"), 1200);

      } else {
        // Handle registration flow - show OTP popup
        setRegistrationEmail(form.email);
        setShowOtpPopup(true);
        setMessage("Registration successful! Please check your email for the verification code.");

        // DON'T store token/user data yet - wait for OTP verification
        // The actual token and verified user data will be stored after OTP verification

        // Clear pending analysis if it was linked
        if (res.data.linked_analysis_id) {
          localStorage.removeItem("current_analysis_id");
          sessionStorage.removeItem("analysis_id");
        }
      }

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

      {/* OTP Verification Popup */}
      {showOtpPopup && (
        <div className="otp-popup-overlay">
          <div className="otp-popup">
            <h3>Verify Your Email</h3>
            <p>We've sent a verification code to <strong>{registrationEmail}</strong></p>
            <form onSubmit={handleOtpVerification}>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="10"
                required
                autoFocus
              />
              <div className="otp-buttons">
                <button type="submit" disabled={verifyingOtp}>
                  {verifyingOtp ? "Verifying..." : "Verify"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowOtpPopup(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
