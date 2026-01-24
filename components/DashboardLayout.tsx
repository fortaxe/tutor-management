
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

  const navItems = user.role === UserRole.GYM_OWNER ? [
    { id: 'dashboard', label: 'Members', icon: '👥' },
    { id: 'earnings', label: 'Earnings', icon: '💰' },
  ] : [
    { id: 'dashboard', label: 'Gyms Ledger', icon: '🏢' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-800 text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-2">
          <DumbbellIcon className="h-6 w-6 text-brand-400" />
          <h1 className="text-xl font-bold">My Gym Members</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-700 rounded-md focus:outline-none"
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
        fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64 bg-gray-800 text-white h-full lg:min-h-screen p-6 flex flex-col justify-between
      `}>
        <div>
          <div className="hidden lg:flex items-center space-x-2 mb-10">
            <DumbbellIcon className="h-8 w-8 text-brand-400" />
            <h1 className="text-2xl font-bold">My Gym Members</h1>
          </div>
          
          <nav className="space-y-1">
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Main Menu</div>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange?.(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  activeView === item.id 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-700">
          <div className="mb-4 px-2">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Account</p>
            <p className="font-bold text-white truncate text-xs">{user.phone}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 bg-red-600/10 text-red-500 border border-red-600/20 rounded-xl hover:bg-red-600 hover:text-white transition-all text-xs font-black uppercase tracking-tighter"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-30 lg:hidden transition-opacity backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-100 p-4 lg:p-6 flex justify-between items-center">
          <h2 className="text-xl lg:text-2xl font-black text-gray-900 tracking-tighter truncate uppercase">{pageTitle}</h2>
          <div className="hidden sm:block">
             <div className="bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">
                  {user.role === UserRole.SUPER_ADMIN ? 'Platform Administrator' : 'Gym Manager'}
                </span>
             </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
