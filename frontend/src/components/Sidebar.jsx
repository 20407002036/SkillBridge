import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => (
  <aside className="w-64 h-full bg-gray-900 text-white flex flex-col py-8 px-4 fixed left-0 top-0 min-h-screen">
    <div className="mb-8 text-2xl font-bold text-center tracking-wide">SkillBridge</div>
    <nav className="flex-1 space-y-4">
      <NavLink to="/profile" className={({isActive}) => isActive ? 'block bg-gray-800 px-4 py-2 rounded font-semibold' : 'block px-4 py-2 rounded hover:bg-gray-800'}>Profile</NavLink>
      <NavLink to="/dashboard" className={({isActive}) => isActive ? 'block bg-gray-800 px-4 py-2 rounded font-semibold' : 'block px-4 py-2 rounded hover:bg-gray-800'}>Dashboard</NavLink>
      <NavLink to="/upload" className={({isActive}) => isActive ? 'block bg-gray-800 px-4 py-2 rounded font-semibold' : 'block px-4 py-2 rounded hover:bg-gray-800'}>Upload Resume</NavLink>
      <NavLink to="/recommendations" className={({isActive}) => isActive ? 'block bg-gray-800 px-4 py-2 rounded font-semibold' : 'block px-4 py-2 rounded hover:bg-gray-800'}>Recommendations</NavLink>
      <NavLink to="/login" className={({isActive}) => isActive ? 'block bg-gray-800 px-4 py-2 rounded font-semibold' : 'block px-4 py-2 rounded hover:bg-gray-800'}>Logout</NavLink>
    </nav>
  </aside>
);

export default Sidebar;
