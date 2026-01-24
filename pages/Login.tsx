
import React, { useState } from 'react';
import { User } from '../types';
import UserGroupIcon from '../components/icons/UserGroupIcon';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const foundUser = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      onLogin(foundUser);
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-brand-50 rounded-full mb-4">
            <UserGroupIcon className="h-10 w-10 text-brand-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Gym Member</h1>
          <p className="text-gray-500 mt-2 font-medium">Management Portal Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              placeholder="admin@gymsaas.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
            >
              Sign In
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-3">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-2 bg-gray-50 rounded border border-gray-100">
              <p className="text-gray-900 font-bold">Super Admin</p>
              <p className="text-gray-600 truncate">admin@gymsaas.com</p>
              <p className="text-brand-600 font-mono">admin</p>
            </div>
            <div className="p-2 bg-gray-50 rounded border border-gray-100">
              <p className="text-gray-900 font-bold">Gym Owner</p>
              <p className="text-gray-600 truncate">owner@powerhouse.com</p>
              <p className="text-brand-600 font-mono">owner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;