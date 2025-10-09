/* eslint-disable react/react-in-jsx-scope */
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import UploadResume from "./pages/UploadResume";
import Dashboard from "./pages/Dashboard";
import Roadmap from "./pages/Roadmap";
import Skills from "./pages/Skills";
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

        {/* User Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Learning Roadmap */}
        <Route path="/roadmap" element={<Roadmap />} />

        {/* Skills Management */}
        <Route path="/skills" element={<Skills />} />

        {/* User Profile */}
        <Route path="/profile" element={<Profile />} />

        {/* Recommendations */}
        <Route path="/recommendation" element={<Recommendation />} />

        {/* Protected Routes Example */}
        <Route path="/protected" element={<ProtectedRoute />} />
      </Routes>
    </Router>
  );
}

export default App;
