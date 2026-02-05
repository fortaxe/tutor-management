import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';
import DashboardSidebar from './DashboardSidebar';
import BorderButton from './BorderButton';
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
  gymName?: string;
  gymLogo?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  onLogout,
  pageTitle,
  onOpenChangePass,
  children,
  gymName,
  gymLogo
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();

  const location = useLocation();
  const activeView = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);

  return (
    <div className="h-screen bg-slate-50 flex flex-col lg:flex-row overflow-hidden bg-[#F4F7FB]">
      <DashboardSidebar
        user={user}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={onLogout}
        onChangePasswordRequest={onOpenChangePass}
        isCollapsed={isCollapsed}
        gymName={gymName}
        gymLogo={gymLogo}
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-charcoal/80 z-30 lg:hidden transition-opacity backdrop-blur-md"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pl-0 lg:pl-[32px] pb-[10px] md:py-5 pr-0 lg:pr-5">
        <div className="lg:hidden flex  bg-black md:bg-transparent items-center justify-between px-4 md:px-5 py-[10px] md:pb-5">
          <div className='flex  items-center gap-2 md:gap-3'>
            <div>
              <img src={gymLogo || "/profile.png"} alt="" className="size-[36px] rounded-main border-main object-cover" />
            </div>
            <span className="text-[16px] leading-[22px] text-white font-semibold">{pageTitle}</span>
          </div>

          <MenuIcon
            className='text-white md:text-black cursor-pointer'
            onClick={() => setIsSidebarOpen(true)}
          />
        </div>

        <header className="hidden lg:flex justify-between items-start sticky top-0 z-10 ">
          <div className="flex flex-col items-start ">
            <div className='flex flex-row gap-[10px]'>
              <img
                src='/icons/toggle.svg'
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="size-[26px] cursor-pointer"
              />
              <h2 className="primary-descripiton uppercase font-grotesk font-bold ">
                Dashboard / <span className='text-black'>
                  {activeView === 'dashboard' ? 'Members' :
                    activeView === 'staff' ? 'Staff' :
                      activeView === 'earnings' ? 'Earnings' :
                        activeView === 'profile' ? "Owner's Profile" : 'Overview'}
                </span>
              </h2>
            </div>
          </div>

          <div className="hidden sm:block pb-[10px] ">
            {(user.role === UserRole.GYM_OWNER || user.role === UserRole.TRAINER) ? (
              activeView === 'dashboard' ? (
                <Button
                  onClick={() => dispatch(openAddMemberModal())}
                  className="uppercase"
                >
                  <img src="/icons/plus.svg" alt="" className="w-5 h-5 mr-2" /> ADD MEMBER
                </Button>
              ) : (
                user.role === UserRole.GYM_OWNER && activeView === 'profile' && (
                  <div className='flex gap-[5px]'>
                    <Button
                      variant="secondary"
                      className='border border-[#22C55E] text-[#22C55E]'
                      onClick={onOpenChangePass}
                    >
                      Change Password
                    </Button>
                  </div>
                )
              )
            ) : (
              <BorderButton variant="green">
                {user.role === UserRole.SUPER_ADMIN ? 'Platform Administrator' : 'Staff Trainer'}
              </BorderButton>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto md:px-5 lg:px-0 no-scrollbar">
          <div className='pt-4 md:pt-[20px] pb-5'>
            <h2 className="hidden md:block text-[32px] leading-[32px] font-semibold text-black">
              {pageTitle}
            </h2>
          </div>
          <div className="">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
