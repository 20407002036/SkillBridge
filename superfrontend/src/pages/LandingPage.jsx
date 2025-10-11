/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, MousePointerClick, Target } from "lucide-react";
import ProgressImage from "../assets/ProgressRoadmap.jpeg";

const LandingPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  // Check auth status on mount
  useEffect(() => {
    const token = localStorage.getItem("token"); // Use correct token key
    const username = localStorage.getItem("username");
    setIsAuthenticated(!!(token && username));
    
    // If authenticated, redirect to dashboard
    if (token && username) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Real logout
  const handleLogout = () => {
    localStorage.clear(); // Clear all stored data
    setIsAuthenticated(false);
    navigate("/"); // Redirect to home
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light text-content-light font-display">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background-light/80 backdrop-blur-sm border-b border-border-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
              </svg>
              <h1 className="text-xl font-bold">SkillBridge</h1>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              {isAuthenticated ? (
                <>
                  <Link to="/" className="text-sm font-medium text-subtle-light hover:text-primary transition-colors">
                    Home
                  </Link>
                  <Link to="/dashboard" className="text-sm font-medium text-subtle-light hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/roadmaps" className="text-sm font-medium text-subtle-light hover:text-primary transition-colors">
                    Roadmaps
                  </Link>
                  <Link to="/skills" className="text-sm font-medium text-subtle-light hover:text-primary transition-colors">
                    Skills
                  </Link>
                  <Link to="/profile" className="text-sm font-medium text-subtle-light hover:text-primary transition-colors">
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="text-sm font-medium text-subtle-light hover:text-primary transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a className="text-sm font-medium text-subtle-light hover:text-primary transition-colors" href="#product">Product</a>
                  <a className="text-sm font-medium text-subtle-light hover:text-primary transition-colors" href="#solutions">Solutions</a>
                  <a className="text-sm font-medium text-subtle-light hover:text-primary transition-colors" href="#resources">Resources</a>
                  <a className="text-sm font-medium text-subtle-light hover:text-primary transition-colors" href="#pricing">Pricing</a>
                </>
              )}
            </nav>
            <div className="flex items-center gap-4">
              {!isAuthenticated ? (
                <Link to="/auth" className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                  Get Started
                </Link>
              ) : (
                <Link to="/dashboard" className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 sm:py-24 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter">
                  Bridge the Gap Between Your <span className="text-primary">Education and Career</span>
                </h1>
                <p className="mt-4 max-w-xl mx-auto lg:mx-0 text-lg text-subtle-light">
                  SkillBridge helps university students and graduates generate personalized learning roadmaps using AI. Our platform provides a step-by-step guide to help you achieve your career goals.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  {!isAuthenticated ? (
                    <>
                      <Link to="/auth" className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors text-center">
                        Get Started for Free
                      </Link>
                      <Link to="/upload" className="bg-white hover:bg-gray-50 text-primary border-2 border-primary font-bold py-3 px-6 rounded-lg text-lg transition-colors text-center">
                        Try Without Account
                      </Link>
                    </>
                  ) : (
                    <Link to="/dashboard" className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors text-center">
                      Go to Dashboard
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-md h-auto aspect-square bg-cover bg-center rounded-xl" 
                     style={{backgroundImage: `url(${ProgressImage})`}}>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 sm:py-24 bg-background-light/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
              <p className="mt-3 max-w-2xl mx-auto text-lg text-subtle-light">A simple, three-step process to your personalized career roadmap.</p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <Link to="/upload" className="bg-background-light hover:bg-white p-8 rounded-lg border border-border-light text-center shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <div className="flex justify-center items-center bg-primary/10 group-hover:bg-primary/20 w-16 h-16 rounded-full mx-auto transition-colors">
                  <Upload className="text-primary" size={32} />
                </div>
                <h3 className="mt-6 text-xl font-bold">1. Upload Resume</h3>
                <p className="mt-2 text-subtle-light">Upload your resume to let our AI analyze your skills and experience.</p>
                <span className="mt-3 inline-block text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to try now →
                </span>
              </Link>
              <div className="bg-background-light p-8 rounded-lg border border-border-light text-center shadow-sm">
                <div className="flex justify-center items-center bg-primary/10 w-16 h-16 rounded-full mx-auto">
                  <MousePointerClick className="text-primary" size={32} />
                </div>
                <h3 className="mt-6 text-xl font-bold">2. Choose Skill</h3>
                <p className="mt-2 text-subtle-light">Select the skill you want to learn or improve for your desired career path.</p>
              </div>
              <div className="bg-background-light p-8 rounded-lg border border-border-light text-center shadow-sm">
                <div className="flex justify-center items-center bg-primary/10 w-16 h-16 rounded-full mx-auto">
                  <Target className="text-primary" size={32} />
                </div>
                <h3 className="mt-6 text-xl font-bold">3. Get Roadmap</h3>
                <p className="mt-2 text-subtle-light">Receive a personalized, step-by-step learning roadmap to achieve your goals.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl p-8 md:p-12 shadow-lg max-w-4xl mx-auto">
              <div className="text-center md:text-left md:flex md:items-center md:justify-between">
                <div className="mb-6 md:mb-0">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Ready to get your personalized roadmap?
                  </h3>
                  <p className="mt-2 text-lg text-gray-600 max-w-2xl">
                    Upload your resume and tell us the skill you want to master — we'll generate a step-by-step learning plan.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link 
                    to="/upload" 
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-colors text-center"
                  >
                    Upload Resume
                  </Link>
                  {!isAuthenticated && (
                    <Link 
                      to="/auth" 
                      className="bg-white hover:bg-gray-50 text-primary border-2 border-primary font-bold py-3 px-6 rounded-lg transition-colors text-center"
                    >
                      Sign Up
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background-light/50 border-t border-border-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <a className="text-sm text-subtle-light hover:text-primary transition-colors" href="#product">Product</a>
              <a className="text-sm text-subtle-light hover:text-primary transition-colors" href="#solutions">Solutions</a>
              <a className="text-sm text-subtle-light hover:text-primary transition-colors" href="#resources">Resources</a>
              <a className="text-sm text-subtle-light hover:text-primary transition-colors" href="#pricing">Pricing</a>
            </nav>
            <p className="text-sm text-subtle-light">© {currentYear} SkillBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
