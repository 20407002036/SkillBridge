import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';
import Signup from './features/auth/Signup';
import Login from './features/auth/Login';
import Profile from './features/profile/Profile';
import Recommendations from './pages/Recommendations';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadResume />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;