import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/upload', label: 'Upload Resume' },
    { to: '/recommendations', label: 'Recommendations' },
    { to: '/profile', label: 'Profile' },
  ];
  return (
    <nav className="bg-blue-700 text-white px-6 py-3 shadow flex items-center justify-between">
      <div className="font-bold text-xl">
        <Link to="/">SkillBridge</Link>
      </div>
      <div className="flex gap-6 items-center">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`hover:underline transition font-medium ${location.pathname === link.to ? 'underline' : ''}`}
          >
            {link.label}
          </Link>
        ))}
        <Link
          to="/login"
          className="ml-4 bg-white text-blue-700 px-4 py-1 rounded font-semibold hover:bg-blue-100 transition"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="bg-yellow-400 text-blue-900 px-4 py-1 rounded font-semibold hover:bg-yellow-300 transition"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
