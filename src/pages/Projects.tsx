import React from 'react';

const Projects = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Sample project cards */}
        <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold mb-2">Project Alpha</h3>
          <p className="text-sm text-gray-600 mb-4">A brief description of Project Alpha and its current status.</p>
          <div className="flex justify-between items-center">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
            <span className="text-sm text-gray-500">5 tasks</span>
          </div>
        </div>
        {/* Add more project cards as needed */}
      </div>
    </div>
  );
};

export default Projects;