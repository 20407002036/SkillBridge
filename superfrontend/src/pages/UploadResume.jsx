/* eslint-disable react/react-in-jsx-scope */
import { useState } from "react";
import axios from "../axiosConfig";
import "../styles/UploadResume.css";

export default function UploadResume() {
  const [skill, setSkill] = useState("");
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const data = new FormData();
    data.append("resume", file);
    data.append("skill", skill);
    const res = await axios.post("/api/roadmap/upload", data);
    console.log(res.data);
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Create Your Learning Roadmap</h2>
        <p>
          Upload your resume to get a personalized roadmap. We support PDF and
          DOCX files.
        </p>

        <div className="upload-box">
          <input
            type="file"
            id="resume"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <label htmlFor="resume">Upload a file</label>
          <p>PDF, DOCX up to 10MB</p>
        </div>

        <input
          type="text"
          placeholder="Desired Skill or Career"
          onChange={(e) => setSkill(e.target.value)}
        />

        <button onClick={handleUpload}>Generate My Roadmap</button>
      </div>
    </div>
  );
}
