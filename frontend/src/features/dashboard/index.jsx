
import React, { useEffect, useState } from 'react';
import { getProfile, getJobData, getRecommendations } from '../../services/api';
import Loader from '../../components/Loader';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [profile, setProfile] = useState(null);
    const [jobData, setJobData] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError('');
        let loaded = 0;
        let tempProfile = null, tempJobData = [], tempRecommendations = [];

        const handleDone = () => {
            loaded++;
            if (loaded === 3 && isMounted) {
                setProfile(tempProfile);
                setJobData(tempJobData);
                setRecommendations(tempRecommendations);
                setLoading(false);
                if (!tempProfile && !tempJobData.length && !tempRecommendations.length) {
                    setError('Failed to load dashboard data.');
                }
            }
        };


        getProfile()
            .then(res => { tempProfile = res.data; })
            .catch(() => { tempProfile = null; })
            .finally(handleDone);

        getJobData()
            .then(res => { tempJobData = res.data; })
            .catch(() => { tempJobData = []; })
            .finally(handleDone);

        getRecommendations()
            .then(res => { tempRecommendations = res.data; })
            .catch(() => { tempRecommendations = []; })
            .finally(handleDone);

        return () => { isMounted = false; };
    }, []);

    if (loading) return <Loader text="Loading dashboard..." />;
    if (error) return <div className="text-red-600 text-center mt-8">{error}</div>;

    return (
        <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded shadow">
            <h2 className="text-3xl font-bold mb-6">Welcome, {profile?.name || 'User'}!</h2>
            <div className="grid md:grid-cols-2 gap-8">
                {/* Profile Summary */}
                <div className="bg-blue-50 p-4 rounded shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">Profile Overview</h3>
                    <div><span className="font-medium">Email:</span> {profile.email}</div>
                    <div><span className="font-medium">Location:</span> {profile.location}</div>
                    <div><span className="font-medium">Skills:</span> {profile.skills?.join(', ') || 'N/A'}</div>
                    <div className="mt-2">
                        <Link to="/profile" className="text-blue-600 hover:underline font-medium">View/Edit Profile</Link>
                    </div>
                </div>
                {/* Recommendations */}
                <div className="bg-green-50 p-4 rounded shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">Skill Recommendations</h3>
                    {(() => {
                        console.log('Recommendations:', recommendations);
                        if (!Array.isArray(recommendations)) {
                            return <div className="text-red-600">Error: Recommendations data is invalid.</div>;
                        }
                        if (recommendations.length === 0) {
                            return <div>No recommendations at this time.</div>;
                        }
                        return (
                            <ul className="list-disc ml-6">
                                {recommendations.map((rec, idx) => (
                                    <li key={idx}>
                                        <span className="font-medium">{rec.skill}:</span>{' '}
                                        <a href={rec.resource} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">Resource</a>
                                    </li>
                                ))}
                            </ul>
                        );
                    })()}
                </div>
            </div>
            {/* Job Data Section */}
            <div className="mt-10">
                <h3 className="text-xl font-semibold mb-4">Job Market Opportunities</h3>
                {jobData.length === 0 ? (
                    <div>No job data available.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border">
                            <thead>
                                <tr className="bg-blue-100">
                                    <th className="py-2 px-4 border">Title</th>
                                    <th className="py-2 px-4 border">Company</th>
                                    <th className="py-2 px-4 border">Location</th>
                                    <th className="py-2 px-4 border">Skills</th>
                                    <th className="py-2 px-4 border">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobData.map((job, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50">
                                        <td className="py-2 px-4 border font-medium">{job.title}</td>
                                        <td className="py-2 px-4 border">{job.company}</td>
                                        <td className="py-2 px-4 border">{job.location}</td>
                                        <td className="py-2 px-4 border">{job.skills?.join(', ')}</td>
                                        <td className="py-2 px-4 border">
                                            <button
                                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                                                onClick={() => alert(`Description: ${job.description}\n\nRequirements: ${job.requirements?.join(', ')}`)}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;