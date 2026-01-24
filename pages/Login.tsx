
import React from 'react';
import { User, UserRole } from '../types';
import UserGroupIcon from '../components/icons/UserGroupIcon';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const superAdmin = users.find(u => u.role === UserRole.SUPER_ADMIN);
  const gymOwner = users.find(u => u.role === UserRole.GYM_OWNER);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <UserGroupIcon className="h-12 w-12 mx-auto text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900 mt-2">GymSaaS</h1>
          <p className="text-gray-600">Please select your role to log in.</p>
        </div>
        <div className="space-y-4">
          {superAdmin && (
            <button
              onClick={() => onLogin(superAdmin)}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login as Super Admin
            </button>
          )}
          {gymOwner && (
            <button
              onClick={() => onLogin(gymOwner)}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login as Gym Owner
            </button>
          )}
        </div>
        <div className="text-center mt-6 text-xs text-gray-500">
            <p>Demo Credentials:</p>
            <p>admin@gymsaas.com (Super Admin)</p>
            <p>owner@powerhouse.com (Gym Owner)</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
