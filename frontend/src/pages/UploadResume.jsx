import React from 'react';
import UploadForm from '../components/UploadForm';
import Sidebar from '../components/Sidebar';

const UploadResume = () => {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-10 bg-gray-50">
                <div className="max-w-2xl mx-auto bg-white rounded shadow p-8">
                    <h1 className="text-2xl font-bold mb-6 text-center">Upload Your Resume</h1>
                    <UploadForm />
                </div>
            </main>
        </div>
    );
};

export default UploadResume;