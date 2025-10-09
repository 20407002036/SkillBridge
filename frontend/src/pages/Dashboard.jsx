import React from 'react';
import DashboardComponent from '../features/dashboard/index.jsx';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-10 bg-gray-50">
        <DashboardComponent />
      </main>
    </div>
  );
};

export default Dashboard;