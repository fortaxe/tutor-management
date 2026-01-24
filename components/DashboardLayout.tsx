
import React from 'react';
import { User } from '../types';
import UserGroupIcon from './icons/UserGroupIcon';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  pageTitle: string;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout, pageTitle, children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white min-h-screen p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-10">
              <UserGroupIcon className="h-8 w-8 text-indigo-400" />
              <h1 className="text-2xl font-bold">GymSaaS</h1>
            </div>
             {/* Navigation can be added here if needed */}
          </div>
          <div className="text-sm text-gray-400">
             <p>Logged in as</p>
             <p className="font-medium text-white break-words">{user.email}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">{pageTitle}</h2>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Logout
            </button>
          </header>
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
