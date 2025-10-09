import React from 'react';

const Footer = () => (
  <footer className="bg-blue-800 text-white py-4 mt-10 shadow-inner">
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center px-4">
      <div className="mb-2 md:mb-0">&copy; {new Date().getFullYear()} SkillBridge. All rights reserved.</div>
      <div className="flex gap-4 text-sm">
        <a href="/about" className="hover:underline">About</a>
        <a href="/contact" className="hover:underline">Contact</a>
        <a href="/privacy" className="hover:underline">Privacy Policy</a>
      </div>
    </div>
  </footer>
);

export default Footer;
