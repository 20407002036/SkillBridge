/* eslint-disable react/react-in-jsx-scope */
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import UploadResume from "./pages/UploadResume";
import LoadingScreen from "./pages/LoadingScreen";
import RecommendedSkills from "./pages/RecommendedSkills";
import Dashboard from "./pages/Dashboard";
import Roadmap from "./pages/Roadmap";
import UserSkills from "./pages/UserSkills";
import Profile from "./pages/Profile";
import Recommendation from "./pages/Recommendation";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Resume Upload */}
        <Route path="/upload" element={<UploadResume />} />

        {/* Loading Screen for Analysis and Roadmap Generation */}
        <Route path="/loading" element={<LoadingScreen />} />

        {/* Recommended Skills Selection */}
        <Route path="/recommended-skills" element={<RecommendedSkills />} />

        {/* User Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Learning Roadmap */}
        <Route path="/roadmap" element={<Roadmap />} />

        {/* User Skills Management */}
        <Route path="/user-skills" element={<UserSkills />} />

        {/* User Profile */}
        <Route path="/profile" element={<Profile />} />

        {/* Recommendations (Legacy) */}
        <Route path="/recommendation" element={<Recommendation />} />

        {/* Protected Routes Example */}
        <Route path="/protected" element={<ProtectedRoute />} />
      </Routes>
    </Router>
  );
}

export default App;
