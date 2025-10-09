import React from 'react';

const Loader = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[200px]">
    <svg
      className="animate-spin h-10 w-10 text-blue-600 mb-2"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
    <span className="text-blue-700 font-medium text-lg">{text}</span>
  </div>
);

export default Loader;
