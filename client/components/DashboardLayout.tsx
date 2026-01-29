
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import Modal from './Modal';
import DashboardSidebar from './DashboardSidebar';
import BorderButton from './BorderButton';

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
  activeView = 'Overview',
  onViewChange,
  onChangePassword,
  children
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChangePassOpen, setChangePassOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);


  return (
    <div className="h-screen bg-slate-50 flex flex-col lg:flex-row overflow-hidden bg-[#F4F7FB]">
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pl-[32px] py-5 pr-5">
        <header className=" flex justify-between items-start sticky top-0 z-10 ">
          <div className="flex flex-col items-start ">
            <div className='flex flex-row gap-[10px]'>
              <img
                src='/icons/toggle.svg'
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="size-[26px] cursor-pointer"
              />
              <h2 className="primary-descripiton font-medium ">
                Dashboard / <span className='text-black'>
                  {activeView === 'dashboard' ? 'Members' :
                    activeView === 'staff' ? 'Staff' :
                      activeView === 'earnings' ? 'Earnings' : 'Overview'}
                </span>
              </h2>
            </div>
            <div className='mt-[30px] pb-5'>
              <h2 className="text-[32px] leading-[32px] font-medium text-black">{pageTitle}</h2>
            </div>
          </div>




          <div className="hidden sm:block">
            <BorderButton variant="green">
              {user.role === UserRole.SUPER_ADMIN ? 'Platform Administrator' :
                user.role === UserRole.GYM_OWNER ? 'Gym Manager' : 'Staff Trainer'}
            </BorderButton>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto ">
          <div className="">
            {children}
          </div>
        </main>
      </div >
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
    </div >
  );
};

export default DashboardLayout;
