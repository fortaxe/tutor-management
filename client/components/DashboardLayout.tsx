
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import Modal from './Modal';
import DashboardSidebar from './DashboardSidebar';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  pageTitle: string;
  activeView?: string;
  onViewChange?: (view: string) => void;
  onChangePassword?: (password: string) => void;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  onLogout,
  pageTitle,
  activeView = 'dashboard',
  onViewChange,
  onChangePassword,
  children
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChangePassOpen, setChangePassOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);


  return (
    <div className="h-screen bg-slate-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile Header */}
      <DashboardSidebar
        user={user}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeView={activeView}
        onViewChange={onViewChange}
        onLogout={onLogout}
        onChangePasswordRequest={() => setChangePassOpen(true)}
        isCollapsed={isCollapsed}
      />

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
          <div className="flex items-center gap-4">
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:block text-slate-500 hover:text-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-950 tracking-tight truncate">{pageTitle}</h2>
          </div>
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
      <Modal isOpen={isChangePassOpen} onClose={() => { setChangePassOpen(false); setNewPassword(''); }} title="Change Password">
        <form onSubmit={(e) => { e.preventDefault(); onChangePassword?.(newPassword); setChangePassOpen(false); setNewPassword(''); }} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand/5 outline-none transition-all text-slate-900"
              placeholder="••••••••"
            />
          </div>
          <div className="flex gap-4 pt-2">
            <button type="button" onClick={() => { setChangePassOpen(false); setNewPassword(''); }} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-charcoal text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-charcoal/20 active:scale-95 transition-all">Update</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardLayout;
