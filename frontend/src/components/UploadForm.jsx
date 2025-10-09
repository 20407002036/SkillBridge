import React, { useState } from 'react';
import { uploadResume, addSkills } from '../services/api';
import { useNavigate } from 'react-router-dom';

const UploadForm = () => {
    const [file, setFile] = useState(null);
    const [skills, setSkills] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSkillsChange = (e) => {
        setSkills(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (file) {
                const formData = new FormData();
                formData.append('resume', file);
                await uploadResume(formData);
            } else if (skills.trim()) {
                const skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean);
                await addSkills(skillsArr);
            } else {
                setError('Please upload a resume or enter skills.');
                setLoading(false);
                return;
            }
            navigate('/recommendations');
        } catch (err) {
            setError('Failed to upload. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col items-center">
                <label htmlFor="resume-upload" className="block mb-4 text-lg font-medium text-gray-700">Upload Resume</label>
                <div className="flex justify-center">
                    <label htmlFor="resume-upload" className="flex items-center justify-center w-24 h-24 bg-blue-100 border-2 border-blue-400 rounded-lg cursor-pointer shadow-md hover:bg-blue-200 transition">
                        {/* Cloud upload icon */}
                        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M16 16v-2a4 4 0 00-8 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 12v6m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <input
                            type="file"
                            id="resume-upload"
                            accept=".pdf, .doc, .docx"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                </div>
                {file && <div className="mt-2 text-green-700 text-sm">Selected: {file.name}</div>}
            </div>
            <div>
                <label htmlFor="manual-skills" className="block mb-2 text-lg font-medium text-gray-700">Or Enter Skills Manually</label>
                <textarea
                    id="manual-skills"
                    value={skills}
                    onChange={handleSkillsChange}
                    placeholder="Enter your skills separated by commas"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                />
            </div>
            {error && <div className="text-red-600 text-center">{error}</div>}
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition flex items-center justify-center"
                disabled={loading}
            >
                {loading ? (
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                ) : null}
                {loading ? 'Uploading...' : 'Submit'}
            </button>
        </form>
    );
};

export default UploadForm;