
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import DumbbellIcon from '../components/icons/DumbbellIcon';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (phone.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      setIsSubmitting(false);
      return;
    }

    // Map phone to pseudo-email for internal auth
    const email = `${phone}@gymstack.com`;
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        if (authError.message === 'Invalid login credentials') {
           setError('Invalid mobile number or password. If you are the Super Admin, ensure you have used the System Recovery tool below.');
        } else if (authError.message.includes('Email not confirmed')) {
           setError('Email verification required. Go to Supabase Dashboard > Auth > Providers > Email and disable "Confirm email".');
        } else {
           setError(authError.message);
        }
      } else {
        onLogin();
      }
    } catch (err) {
      setError('Connection failed. Check your internet or Supabase configuration.');
    } finally {
      setIsSubmitting(false);
    }
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
          <p className="text-slate-500 font-medium text-sm italic">Secure Cloud Entry</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg">
              <p className="text-[11px] text-red-700 font-black uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-xs font-bold text-slate-600 uppercase tracking-widest ml-1">
              Registered Mobile
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
              Password
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
              disabled={isSubmitting}
              className="w-full flex justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg shadow-brand/20 text-sm font-black uppercase tracking-widest text-charcoal bg-brand hover:bg-brand-600 hover:scale-[1.02] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying Account...' : 'Unlock Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
