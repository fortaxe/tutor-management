
import React, { useState } from 'react';
import DumbbellIcon from '../components/icons/DumbbellIcon';

interface LoginProps {
  onLogin: (creds: { phone: string; password: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (phone.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    onLogin({ phone, password });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      <div className="absolute top-0 -left-10 w-72 h-72 bg-brand/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 -right-10 w-96 h-96 bg-blue-100 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-charcoal rounded-2xl mb-6 shadow-xl shadow-charcoal/20">
            <DumbbellIcon className="h-10 w-10 text-brand" />
          </div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight mb-2 uppercase">Gym <span className="text-brand">Stack</span></h1>
          <p className="text-slate-500 font-medium text-sm">Professional Membership Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4 rounded-r-lg">
              <p className="text-sm text-orange-700 font-semibold">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-xs font-bold text-slate-600 uppercase tracking-widest ml-1">
              Mobile Number
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              required
              maxLength={10}
              value={phone}
              onChange={handlePhoneChange}
              className="appearance-none block w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-bold text-slate-900"
              placeholder="0000000000"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs font-bold text-slate-600 uppercase tracking-widest ml-1">
              Secret Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-slate-900"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg shadow-brand/20 text-sm font-black uppercase tracking-widest text-charcoal bg-brand hover:bg-brand-600 hover:scale-[1.02] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
            >
              Unlock Dashboard
            </button>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-6">Demo Access Credentials</p>
          <div className="grid grid-cols-1 gap-4 text-xs font-bold text-slate-400 italic">
             Accounts are now managed via the database.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
