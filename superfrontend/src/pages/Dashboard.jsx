/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Home, Target, BookOpen, Bell, Check, ChevronRight, Edit, Sparkles } from "lucide-react";
import axios from "../axiosConfig";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [roadmapData, setRoadmapData] = useState(null);
  const [linkedAnalysis, setLinkedAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  // Fetch user and roadmap data from backend
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token"); // Use "token" to match AuthPage
      if (!token) {
        setAuthChecked(true);
        setLoading(false);
        // Use a timeout to prevent navigation during initial render
        setTimeout(() => navigate("/auth"), 100);
        return;
      }

      setAuthChecked(true);

      try {
        setLoading(true);
        
        // Get user's linked analysis and roadmaps directly
        try {
          console.log("Fetching linked analysis for user...");
          const linkedRes = await axios.get("/api/auth/user/linked-analysis", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          
          setLinkedAnalysis(linkedRes.data);
          console.log("Linked analysis response:", linkedRes.data);
          
          // If user has a linked analysis, get the user profile for additional details
          if (linkedRes.data.linked_analysis_id) {
            console.log("User has linked analysis:", linkedRes.data.linked_analysis_id);
            try {
              const profileRes = await axios.get("/api/user/profile", {
                headers: { "Authorization": `Bearer ${token}` }
              });
              setUser(profileRes.data);
              console.log("User profile:", profileRes.data);
            } catch (profileError) {
              console.log("Could not fetch user profile:", profileError);
              // Set basic user info from token if available
              setUser({ username: localStorage.getItem("username") || "User" });
            }
            
            // If user has roadmaps, get the first one's details
            if (linkedRes.data.roadmaps && linkedRes.data.roadmaps.length > 0) {
              const firstRoadmap = linkedRes.data.roadmaps[0];
              console.log("First roadmap from linked analysis:", firstRoadmap);
              try {
                const roadmapRes = await axios.get(`/api/roadmap/${firstRoadmap.roadmap_id}`, {
                  headers: { "Authorization": `Bearer ${token}` }
                });
                console.log("Roadmap details from API:", roadmapRes.data);
                setRoadmapData(roadmapRes.data);
              } catch (roadmapError) {
                console.log("Could not fetch roadmap details:", roadmapError);
              }
            } else {
              console.log("No roadmaps found in linked analysis");
            }
          } else {
            console.log("User has no linked analysis");
            setError("No roadmap found. Create your first roadmap!");
            // Still get user profile for display
            try {
              const profileRes = await axios.get("/api/user/profile", {
                headers: { "Authorization": `Bearer ${token}` }
              });
              setUser(profileRes.data);
            } catch (profileError) {
              console.log("Could not fetch user profile:", profileError);
              setUser({ username: localStorage.getItem("username") || "User" });
            }
          }
        } catch (linkedError) {
          console.log("Error fetching linked analysis:", linkedError);
          if (linkedError.response?.status === 401) {
            localStorage.clear();
            setTimeout(() => navigate("/auth"), 100);
          } else {
            setError("No roadmap found. Create your first roadmap!");
            // Try to get user profile anyway
            try {
              const profileRes = await axios.get("/api/user/profile", {
                headers: { "Authorization": `Bearer ${token}` }
              });
              setUser(profileRes.data);
            } catch (profileError) {
              console.log("Could not fetch user profile:", profileError);
              setUser({ username: localStorage.getItem("username") || "User" });
            }
          }
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  // Calculate progress
  const getProgress = () => {
    if (!roadmapData || !roadmapData.phases) return { percentage: 0, completed: 0, total: 0 };
    
    const totalPhases = roadmapData.phases.length;
    const completedPhases = roadmapData.phases.filter(phase => phase.progress_percent === 100).length;
    const percentage = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;
    
    return { percentage, completed: completedPhases, total: totalPhases };
  };

  const { percentage, completed, total } = getProgress();

  // Get completed and upcoming phases
  const getPhaseData = () => {
    if (!roadmapData || !roadmapData.phases) return { completedPhases: [], currentPhase: null, upcomingPhases: [] };
    
    const completedPhases = roadmapData.phases.filter(phase => phase.progress_percent === 100);
    const inProgressPhase = roadmapData.phases.find(phase => phase.progress_percent > 0 && phase.progress_percent < 100);
    const currentPhase = inProgressPhase || roadmapData.phases.find(phase => phase.progress_percent === 0);
    const upcomingPhases = roadmapData.phases.filter(phase => 
      phase.progress_percent === 0 && phase.phase_id !== currentPhase?.phase_id
    );
    
    return { completedPhases, currentPhase, upcomingPhases };
  };

  const { completedPhases, currentPhase, upcomingPhases } = getPhaseData();

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If no token, show loading while redirecting
  if (!localStorage.getItem("token")) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between whitespace-nowrap border-b border-gray-200/80 dark:border-gray-700/80 bg-gray-50/80 dark:bg-gray-900/80 px-10 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="text-blue-600 h-8 w-8">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">SkillBridge</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/dashboard" className="text-blue-600 font-semibold">Roadmaps</Link>
            <Link to="/user-skills" className="hover:text-blue-600 transition-colors">Skills</Link>
            <a href="#" className="hover:text-blue-600 transition-colors">Community</a>
          </nav>
          
          <div className="flex items-center gap-4">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <Bell size={20} />
            </button>
            <div 
              className="h-10 w-10 aspect-square rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold cursor-pointer"
              onClick={() => navigate("/profile")}
            >
              {user?.name?.[0] || user?.username?.[0] || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 sm:px-6 md:px-10 lg:px-20 xl:px-40">
        <div className="mx-auto max-w-5xl">
          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">My Roadmap</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              {linkedAnalysis?.analysis?.target_skill || roadmapData?.title || "Learning Journey"}
            </p>
          </div>

          {error && !roadmapData ? (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <BookOpen size={48} className="text-gray-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Roadmap Found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Start your learning journey by creating your first personalized roadmap.</p>
                <Link 
                  to="/upload" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Sparkles size={20} />
                  Create Your First Roadmap
                </Link>
              </div>
            </div>
          ) : roadmapData ? (
            <>
              {/* Progress Overview */}
              <div className="mb-10 rounded-xl bg-white dark:bg-gray-800/50 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Overall Progress</p>
                  <p className="font-bold text-lg text-blue-600">{percentage}%</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {completed} of {total} phases completed
                </p>
              </div>
              {/* Completed Skills */}
              {completedPhases.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Completed Skills</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {completedPhases.map((phase) => (
                      <div key={phase.phase_id} className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4 hover:shadow-md transition-shadow">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/10 text-blue-600">
                          <Check size={16} />
                        </div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{phase.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current and Upcoming Stages */}
              <div className="space-y-8">
                {/* Current Stage */}
                {currentPhase && (
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Current Stage</h3>
                    <div className="flex flex-col md:flex-row items-stretch gap-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-6 overflow-hidden">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{currentPhase.title}</h4>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          {currentPhase.goals?.[0] || "Continue your learning journey with this phase."}
                        </p>
                        <button 
                          className="flex items-center justify-center rounded-lg h-10 px-5 bg-blue-600 text-white text-sm font-bold shadow-sm hover:bg-blue-700 transition-all"
                          onClick={() => navigate("/roadmap")}
                        >
                          Continue Learning
                        </button>
                      </div>
                      <div className="md:w-1/3 h-48 md:h-auto rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Sparkles size={48} className="text-white opacity-60" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Upcoming Stages */}
                {upcomingPhases.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Upcoming Stages</h3>
                    <div className="space-y-4">
                      {upcomingPhases.slice(0, 2).map((phase) => (
                        <div key={phase.phase_id} className="flex flex-col md:flex-row items-center gap-6 rounded-lg p-4 border border-transparent hover:bg-white dark:hover:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                          <div className="md:w-1/3 h-32 md:h-24 w-full rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                            <Sparkles size={24} className="text-white opacity-60" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200">{phase.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {phase.goals?.[0] || "Upcoming learning phase in your roadmap."}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-8">
                <button 
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  onClick={() => navigate("/roadmap")}
                >
                  <Edit size={16} />
                  Edit Roadmap
                </button>
                <button 
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all"
                  onClick={() => navigate("/upload")}
                >
                  <Sparkles size={16} />
                  Get Skill Recommendations
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <BookOpen size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">Loading roadmap data...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;