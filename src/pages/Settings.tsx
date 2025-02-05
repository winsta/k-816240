import React from 'react';

const Settings = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">General Settings</h2>
          <div className="p-4 border rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Theme</label>
              <select className="w-full p-2 border rounded">
                <option>Light</option>
                <option>Dark</option>
                <option>System</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;