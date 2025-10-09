import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { getSkills, addSkills, removeSkill as removeSkillApi, changePassword, uploadAvatar } from '../../services/api';

const initialState = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    website: "",
    linkedin: "",
    twitter: "",
    github: "",
    avatar: null,
    experience: [],
    education: [],
    skills: [],
};

export default function EditProfile({ profile = {}, onSave, onCancel }) {
    const [form, setForm] = useState({
        ...initialState,
        ...profile,
        experience: Array.isArray(profile.experience) ? profile.experience : [],
        education: Array.isArray(profile.education) ? profile.education : [],
        skills: Array.isArray(profile.skills) ? profile.skills : [],
    });
    const [avatarPreview, setAvatarPreview] = useState(profile.avatar || null);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showPassword, setShowPassword] = useState({ current: true, new: false, confirm: false });
    const [successMsg, setSuccessMsg] = useState("");

    const handleChange = async (e) => {
        const { name, value, files } = e.target;
        if (name === "avatar" && files && files[0]) {
            setAvatarPreview(URL.createObjectURL(files[0]));
            // Upload avatar to backend
            const formData = new FormData();
            formData.append('avatar', files[0]);
            try {
                const res = await uploadAvatar(formData);
                setForm((f) => ({ ...f, image_url: res.data.image_url, avatar: files[0] }));
            } catch (err) {
                setForm((f) => ({ ...f, avatar: files[0] }));
            }
        } else {
            setForm((f) => ({ ...f, [name]: value }));
        }
    };

    // Experience
    const handleExpChange = (idx, field, value) => {
        const updated = form.experience.map((exp, i) => i === idx ? { ...exp, [field]: value } : exp);
        setForm(f => ({ ...f, experience: updated }));
    };
    const addExp = () => setForm(f => ({ ...f, experience: [...f.experience, { title: '', company: '', years: '' }] }));
    const removeExp = idx => setForm(f => ({ ...f, experience: f.experience.filter((_, i) => i !== idx) }));

    // Education
    const handleEduChange = (idx, field, value) => {
        const updated = form.education.map((edu, i) => i === idx ? { ...edu, [field]: value } : edu);
        setForm(f => ({ ...f, education: updated }));
    };
    const addEdu = () => setForm(f => ({ ...f, education: [...f.education, { degree: '', institution: '', year: '' }] }));
    const removeEdu = idx => setForm(f => ({ ...f, education: f.education.filter((_, i) => i !== idx) }));

    // Skills
    const handleSkillChange = (idx, value) => {
        const updated = form.skills.map((s, i) => i === idx ? value : s);
        setForm(f => ({ ...f, skills: updated }));
    };
    const addSkill = async () => {
        const newSkill = '';
        setForm(f => ({ ...f, skills: [...f.skills, newSkill] }));
    };
    // Save new skills to backend if not empty and not already present
    const saveSkill = async (idx, value) => {
        if (!value || form.skills.includes(value)) return;
        await addSkills([value]);
        const skills = await getSkills();
        setForm(f => ({ ...f, skills: skills }));
    };
    const removeSkill = async (idx) => {
        const skillToRemove = form.skills[idx];
        await removeSkillApi(skillToRemove);
        const skills = await getSkills();
        setForm(f => ({ ...f, skills: skills }));
    };

    // Password change
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(p => ({ ...p, [name]: value }));
    };

    // Save handlers for each section
    const handleProfileSave = async (e) => {
        e.preventDefault();
        if (onSave) {
            await onSave({ ...form, name: `${form.firstName} ${form.lastName}`.trim(), image_url: form.image_url, section: 'profile' });
        }
    };
    const handleSocialsSave = (e) => {
        e.preventDefault();
        if (onSave) onSave({
            website: form.website,
            linkedin: form.linkedin,
            twitter: form.twitter,
            github: form.github,
            section: 'socials',
        });
    };
    const handleExpEduSkillsSave = async (e) => {
        e.preventDefault();
        if (onSave) {
            await onSave({
                experience: form.experience,
                education: form.education,
                skills: form.skills,
                section: 'expEduSkills',
            });
        }
    };
    const handlePasswordSave = async (e) => {
        e.preventDefault();
        setSuccessMsg("");
        if (passwords.current && passwords.new && passwords.confirm) {
            try {
                const res = await changePassword(passwords);
                setSuccessMsg(res.data.message || "Password changed successfully.");
                setPasswords({ current: '', new: '', confirm: '' });
            } catch (err) {
                setSuccessMsg(err.response?.data?.error || "Password change failed.");
            }
        }
    };

    const togglePassword = (field) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    // Fetch skills from backend on mount
    useEffect(() => {
        getSkills().then(skills => {
            setForm(f => ({ ...f, skills: skills || [] }));
        });
    }, []);

    return (
    <div className="edit-profile-form bg-white rounded shadow p-8 max-w-2xl mx-auto mt-8">
        <button type="button" onClick={onCancel} className="mb-4 flex items-center text-blue-600 hover:underline">
            <FaArrowLeft className="mr-2" /> Back to Profile
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>
        {/* Profile Credentials */}
        <form onSubmit={handleProfileSave} className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avatar and Bio */}
                <div className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1">Avatar</label>
                        {avatarPreview && (
                            <img src={avatarPreview} alt="Avatar Preview" className="w-20 h-20 rounded-full object-cover mb-2" />
                        )}
                        <input type="file" name="avatar" accept="image/*" onChange={handleChange} className="block" />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Bio</label>
                        <textarea name="bio" value={form.bio} onChange={handleChange} className="w-full border px-3 py-2 rounded" rows={4} />
                    </div>
                </div>
                {/* Main Info */}
                <div className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1">First Name</label>
                        <input name="firstName" value={form.firstName} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Last Name</label>
                        <input name="lastName" value={form.lastName} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Phone</label>
                        <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Location</label>
                        <input name="location" value={form.location} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
                    </div>
                </div>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition mt-4 block mx-auto">Save Profile</button>
        </form>

        {/* Socials */}
        <form onSubmit={handleSocialsSave} className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                    <label className="block font-medium mb-1">Website</label>
                    <input name="website" value={form.website} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                    <label className="block font-medium mb-1">LinkedIn</label>
                    <input name="linkedin" value={form.linkedin} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                    <label className="block font-medium mb-1">GitHub</label>
                    <input name="github" value={form.github} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                    <label className="block font-medium mb-1">Twitter</label>
                    <input name="twitter" value={form.twitter} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
                </div>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition mt-4 block mx-auto">Save Socials</button>
        </form>

        {/* Experience, Education, Skills */}
        <form onSubmit={handleExpEduSkillsSave} className="mb-6">
            {/* Experience Section */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Experience</h3>
                    <button type="button" onClick={addExp} className="text-blue-600 hover:underline">Add Experience</button>
                </div>
                {form.experience.map((exp, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-2 mb-2 bg-gray-50 p-3 rounded">
                        <input className="border px-2 py-1 rounded flex-1" placeholder="Title" value={exp.title} onChange={e => handleExpChange(idx, 'title', e.target.value)} />
                        <input className="border px-2 py-1 rounded flex-1" placeholder="Company" value={exp.company} onChange={e => handleExpChange(idx, 'company', e.target.value)} />
                        <input className="border px-2 py-1 rounded w-24" placeholder="Years" value={exp.years} onChange={e => handleExpChange(idx, 'years', e.target.value)} />
                        <button type="button" onClick={() => removeExp(idx)} className="text-red-600 hover:underline ml-2">Remove</button>
                    </div>
                ))}
            </div>

            {/* Education Section */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Education</h3>
                    <button type="button" onClick={addEdu} className="text-blue-600 hover:underline">Add Education</button>
                </div>
                {form.education.map((edu, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-2 mb-2 bg-gray-50 p-3 rounded">
                        <input className="border px-2 py-1 rounded flex-1" placeholder="Degree" value={edu.degree} onChange={e => handleEduChange(idx, 'degree', e.target.value)} />
                        <input className="border px-2 py-1 rounded flex-1" placeholder="Institution" value={edu.institution} onChange={e => handleEduChange(idx, 'institution', e.target.value)} />
                        <input className="border px-2 py-1 rounded w-24" placeholder="Year" value={edu.year} onChange={e => handleEduChange(idx, 'year', e.target.value)} />
                        <button type="button" onClick={() => removeEdu(idx)} className="text-red-600 hover:underline ml-2">Remove</button>
                    </div>
                ))}
            </div>

            {/* Skills Section */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Skills</h3>
                    <button type="button" onClick={addSkill} className="text-blue-600 hover:underline">Add Skill</button>
                </div>
                {form.skills.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2 bg-gray-50 p-3 rounded">
                        <input className="border px-2 py-1 rounded flex-1" placeholder="Skill" value={skill} onChange={e => handleSkillChange(idx, e.target.value)} onBlur={e => saveSkill(idx, e.target.value)} />
                        <button type="button" onClick={() => removeSkill(idx)} className="text-red-600 hover:underline ml-2">Remove</button>
                    </div>
                ))}
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition mt-4 block mx-auto">Save Experience, Education & Skills</button>
        </form>

        {/* Password Change Section */}
        <form onSubmit={handlePasswordSave} className="mb-6">
            {successMsg && (
                <div className={`text-center mb-2 ${successMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{successMsg}</div>
            )}
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <input type={showPassword.current ? "text" : "password"} name="current" value={passwords.current} onChange={handlePasswordChange} placeholder="Current Password" className="border px-2 py-1 rounded w-full pr-8" />
                        <span className="absolute right-2 top-2 cursor-pointer" onClick={() => togglePassword('current')}>
                            {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <div className="relative">
                        <input type={showPassword.new ? "text" : "password"} name="new" value={passwords.new} onChange={handlePasswordChange} placeholder="New Password" className="border px-2 py-1 rounded w-full pr-8" />
                        <span className="absolute right-2 top-2 cursor-pointer" onClick={() => togglePassword('new')}>
                            {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <div className="relative">
                        <input type={showPassword.confirm ? "text" : "password"} name="confirm" value={passwords.confirm} onChange={handlePasswordChange} placeholder="Confirm New Password" className="border px-2 py-1 rounded w-full pr-8" />
                        <span className="absolute right-2 top-2 cursor-pointer" onClick={() => togglePassword('confirm')}>
                            {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition mt-4 block mx-auto">Save Password</button>
            </div>
        </form>
    </div>
);
}