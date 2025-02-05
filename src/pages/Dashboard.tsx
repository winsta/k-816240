import React from 'react';
import KanbanBoard from '../components/KanbanBoard';

const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <KanbanBoard />
    </div>
  );
};

export default Dashboard;