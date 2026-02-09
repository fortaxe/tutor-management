import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';
import DashboardSidebar from './DashboardSidebar';
import Button from './Button';
import { useDispatch } from 'react-redux';
import { openAddMemberModal } from '../store/uiSlice';
import MenuIcon from './icons/MenuIcon';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  pageTitle: string;
  onOpenChangePass: () => void;
  children: React.ReactNode;
  tutorName?: string;
  tutorLogo?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  onLogout,
  pageTitle,
  onOpenChangePass,
  children,
  tutorName,
  tutorLogo
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();

  const location = useLocation();
  const path = location.pathname.substring(1) || 'dashboard';
  const activeView = path.split('/')[0] || 'dashboard';

  return (
    <div className="h-screen bg-slate-50 flex flex-col lg:flex-row overflow-hidden">
      <DashboardSidebar
        user={user}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={onLogout}
        onChangePasswordRequest={onOpenChangePass}
        isCollapsed={isCollapsed}
        tutorName={tutorName}
        tutorLogo={tutorLogo}
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pl-0 lg:pl-[32px] pb-[10px] md:py-5 pr-0 lg:pr-5">
        <div className="lg:hidden flex bg-black items-center justify-between px-4 py-3">
          <div className='flex items-center gap-3'>
            <img src={tutorLogo || "/profile.png"} alt="Logo" className="w-8 h-8 rounded-lg border border-slate-700 object-cover" />
            <span className="text-sm font-black text-yellow-400 uppercase tracking-widest">{pageTitle}</span>
          </div>

          <button onClick={() => setIsSidebarOpen(true)}>
            <MenuIcon className='text-yellow-400 w-6 h-6' />
          </button>
        </div>

        <header className="hidden lg:flex justify-between items-center sticky top-0 z-10 mb-6 px-1">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <img src='/icons/toggle.svg' alt="Toggle" className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {tutorName} / <span className='text-black'>
                  {activeView === 'dashboard' ? 'Students' :
                    activeView === 'staff' ? 'Assistant' :
                      activeView === 'earnings' ? 'Earnings' :
                        activeView === 'profile' ? "Tutor Profile" : 'Overview'}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(user.role === UserRole.TUTOR || user.role === UserRole.ASSISTANT) ? (
              activeView === 'dashboard' ? (
                <Button
                  onClick={() => dispatch(openAddMemberModal())}
                  className="bg-yellow-400 text-black border-none hover:bg-yellow-500 font-black px-6 rounded-xl shadow-lg shadow-yellow-100 uppercase tracking-widest text-[11px]"
                >
                  {/* <img src="/icons/plus.svg" alt="" className="w-4 h-4 mr-2" />  */}
                  ADD STUDENT
                </Button>
              ) : (
                user.role === UserRole.TUTOR && activeView === 'profile' && (
                  <Button
                    onClick={onOpenChangePass}
                    className="bg-black text-white border-none hover:bg-slate-800 font-bold px-6 rounded-xl shadow-lg shadow-slate-200 uppercase tracking-widest text-[11px]"
                  >
                    Change Password
                  </Button>
                )
              )
            ) : (
              <div className="px-4 py-2 bg-black rounded-xl border border-slate-800">
                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.2em]">
                  {user.role === UserRole.SUPER_ADMIN ? 'PLATFORM ADMIN' : 'ASSISTANT'}
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto md:px-5 lg:px-1 no-scrollbar">
          <div className='pb-6'>
            <h1 className="hidden md:block text-3xl font-black text-slate-900 tracking-tight">
              {pageTitle}
            </h1>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
