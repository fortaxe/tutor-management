
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import DumbbellIcon from './icons/DumbbellIcon';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  pageTitle: string;
  activeView?: string;
  onViewChange?: (view: string) => void;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, 
  onLogout, 
  pageTitle, 
  activeView = 'dashboard', 
  onViewChange,
  children 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isOwner = user.role === UserRole.GYM_OWNER;
  const isTrainer = user.role === UserRole.TRAINER;

  const navItems = (isOwner || isTrainer) ? [
    { id: 'dashboard', label: 'Members', icon: '👥' },
    ...(isOwner ? [
      { id: 'staff', label: 'Staff', icon: '🛡️' },
      { id: 'earnings', label: 'Earnings', icon: '💰' }
    ] : []),
  ] : [
    { id: 'dashboard', label: 'Gym Ledger', icon: '🏢' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-charcoal text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-2">
          <DumbbellIcon className="h-6 w-6 text-brand" />
          <h1 className="text-xl font-extrabold tracking-tight">Gym Stack</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-slate-800 rounded-lg focus:outline-none transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar / Drawer */}
      <div className={`
        fixed inset-0 z-40 transform transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-72 bg-charcoal text-white h-full lg:min-h-screen p-8 flex flex-col justify-between shadow-2xl lg:shadow-none
      `}>
        <div>
          <div className="hidden lg:flex items-center space-x-3 mb-12">
            <DumbbellIcon className="h-9 w-9 text-brand" />
            <h1 className="text-2xl font-black tracking-tighter uppercase">Gym <span className="text-brand">Stack</span></h1>
          </div>
          
          <nav className="space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 pl-2">Navigation</div>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange?.(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm ${
                  activeView === item.id 
                    ? 'bg-brand text-charcoal shadow-lg shadow-brand/10' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span className="text-lg opacity-80">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto pt-8 border-t border-slate-800">
          <div className="mb-6 px-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Connected Account</p>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-brand">
                {user.phone.slice(-2)}
              </div>
              <p className="font-bold text-white truncate text-sm">{user.phone}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full px-5 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-charcoal/80 z-30 lg:hidden transition-opacity backdrop-blur-md"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200/60 p-5 lg:px-10 lg:py-7 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xl bg-white/80">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-950 tracking-tight truncate">{pageTitle}</h2>
          <div className="hidden sm:block">
             <div className="bg-brand/10 px-4 py-1.5 rounded-full border border-brand/20">
                <span className="text-[11px] font-bold text-brand-700 uppercase tracking-widest">
                  {user.role === UserRole.SUPER_ADMIN ? 'Platform Administrator' : 
                   user.role === UserRole.GYM_OWNER ? 'Gym Manager' : 'Staff Trainer'}
                </span>
             </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
