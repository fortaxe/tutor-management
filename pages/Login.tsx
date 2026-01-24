
import React, { useState } from 'react';
import { User } from '../types';
import DumbbellIcon from '../components/icons/DumbbellIcon';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const foundUser = users.find(
      u => u.phone === phone && u.password === password
    );

    if (foundUser) {
      onLogin(foundUser);
    } else {
      setError('Invalid mobile number or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-brand-50 rounded-full mb-4">
            <DumbbellIcon className="h-10 w-10 text-brand-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Gym Members</h1>
          <p className="text-gray-500 mt-2 font-medium">Management Portal Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-bold"
              placeholder="Enter mobile number"
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-black uppercase tracking-widest text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
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
              <p className="text-brand-700 font-mono">9999999999</p>
              <p className="text-gray-500 font-mono">admin</p>
            </div>
            <div className="p-2 bg-gray-50 rounded border border-gray-100">
              <p className="text-gray-900 font-bold">Gym Owner</p>
              <p className="text-brand-700 font-mono">8888888888</p>
              <p className="text-gray-500 font-mono">owner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
