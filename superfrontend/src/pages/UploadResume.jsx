/* eslint-disable react/react-in-jsx-scope */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosConfig";
import "../styles/UploadResume.css";

export default function UploadResume() {
  const [skill, setSkill] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume file.");
      return;
    }
    
    if (!skill.trim()) {
      setError("Please enter your desired skill or career.");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("Uploading resume...");

    try {
      const data = new FormData();
      data.append("resume", file);
      data.append("target_skill", skill);
      
      const res = await axios.post("/api/v1/upload-resume", data);
      console.log("Upload response:", res.data);
      
      if (res.status === 201) {
        const { analysis_id } = res.data;
        setStatus("Resume uploaded successfully! Redirecting to analysis...");
        
        // Navigate to loading screen with analysis_id
        setTimeout(() => {
          navigate(`/loading?analysis_id=${analysis_id}&type=analysis`);
        }, 1000);
      }
      
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Create Your Learning Roadmap</h2>
        <p>
          Upload your resume to get a personalized roadmap. We support PDF and
          DOCX files.
        </p>

        {/* Status Messages */}
        {loading && (
          <div className="status-message loading">
            <div className="spinner"></div>
            <p>{status}</p>
          </div>
        )}
        
        {error && (
          <div className="status-message error">
            <p>{error}</p>
          </div>
        )}

        <div className="upload-box">
          <input
            type="file"
            id="resume"
            className="hidden"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files[0])}
            disabled={loading}
          />
          <label htmlFor="resume" className={loading ? "disabled" : ""}>
            {file ? file.name : "Upload a file"}
          </label>
          <p>PDF, DOCX up to 10MB</p>
        </div>

        <input
          type="text"
          placeholder="Desired Skill or Career"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          disabled={loading}
        />

        <button 
          onClick={handleUpload} 
          disabled={loading || !file || !skill.trim()}
          className={loading ? "loading" : ""}
        >
          {loading ? "Processing..." : "Generate My Roadmap"}
        </button>
      </div>
    </div>
  );
}
