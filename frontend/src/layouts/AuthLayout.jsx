import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      <header className="py-6 bg-blue-700 text-white text-center text-2xl font-bold shadow">
        SkillBridge
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-lg p-6">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
