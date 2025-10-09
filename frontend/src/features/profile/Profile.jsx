import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, deleteProfile } from '../../services/api';
import EditProfile from './EditProfile';
import Loader from '../../components/Loader';
import Sidebar from '../../components/Sidebar';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getProfile();
        setProfile(res.data);
        setForm(res.data);
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Helper for safe JSON parse
  const safeJsonParse = (val, fallback) => {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };
  const handleCancel = () => {
    setEditMode(false);
    setForm(profile);
  };

  const handleSave = async (updatedForm) => {
    setLoading(true);
    setError('');
    try {
      const res = await updateProfile(updatedForm);
      // Re-fetch profile to ensure latest data (name, skills, etc)
      const fresh = await getProfile();
      setProfile(fresh.data);
      setEditMode(false);
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile?')) return;
    setLoading(true);
    setError('');
    try {
      await deleteProfile();
      localStorage.removeItem('user');
      navigate('/signup');
    } catch (err) {
      setError('Failed to delete profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading profile..." />;
  if (error) return <div className="text-red-600 text-center mt-8">{error}</div>;
  if (!profile) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-10 bg-gray-50">
        <div>
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden mb-4 border-4 border-blue-200">
              {/* Show avatar image if available, else show initials */}
              {profile.image_url ? (
                <img
                  src={profile.image_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.name || 'User') + '&background=0D8ABC&color=fff&size=128'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <h2 className="text-3xl font-bold mb-2 text-center">{profile.name}</h2>
            <div className="text-gray-600 text-center">{profile.email}</div>
          </div>
          {editMode ? (
            <EditProfile profile={profile} onSave={handleSave} onCancel={handleCancel} />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded p-4 shadow">
                  <div className="font-semibold mb-2">Profile Info</div>
                  <div><span className="font-medium">Name:</span> {profile.name}</div>
                  <div><span className="font-medium">Email:</span> {profile.email}</div>
                  <div><span className="font-medium">Location:</span> {profile.location}</div>
                  <div><span className="font-medium">Bio:</span> {profile.bio}</div>
                </div>
                <div className="bg-gray-50 rounded p-4 shadow">
                  <div className="font-semibold mb-2">Skills</div>
                  <ul className="list-disc ml-6">
                    {profile.skills?.map((skill, idx) => <li key={idx}>{skill}</li>) || <li>N/A</li>}
                  </ul>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded p-4 shadow">
                  <div className="font-semibold mb-2">Education</div>
                  <ul className="list-disc ml-6">
                    {profile.education?.map((edu, idx) => (
                      <li key={idx}>{edu.degree} - {edu.institution} ({edu.year})</li>
                    )) || <li>N/A</li>}
                  </ul>
                </div>
                <div className="bg-gray-50 rounded p-4 shadow">
                  <div className="font-semibold mb-2">Experience</div>
                  <ul className="list-disc ml-6">
                    {profile.experience?.map((exp, idx) => (
                      <li key={idx}>{exp.title} at {exp.company} ({exp.years})</li>
                    )) || <li>N/A</li>}
                  </ul>
                </div>
              </div>
              {profile.resume_url && (
                <div className="bg-gray-50 rounded p-4 shadow">
                  <span className="font-medium">Resume:</span>{' '}
                  <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Resume</a>
                </div>
              )}
              <div className="flex gap-4 mt-4">
                <button onClick={handleEdit} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition">Edit Profile</button>
                <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 transition">Delete Profile</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
