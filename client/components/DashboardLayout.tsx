
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import Modal from './Modal';
import DashboardSidebar from './DashboardSidebar';
import BorderButton from './BorderButton';
import Input from './Input';
import Button from './Button';
import { useDispatch } from 'react-redux';
import { openAddMemberModal } from '../store/uiSlice';
import { MemberType } from '../types';
import MenuIcon from './icons/MenuIcon';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  pageTitle: string;
  activeView?: string;
  onViewChange?: (view: string) => void;
  onChangePassword?: (password: string) => void;
  children: React.ReactNode;
  gymName?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  onLogout,
  pageTitle,
  activeView = 'Overview',
  onViewChange,
  onChangePassword,
  children,
  gymName
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChangePassOpen, setChangePassOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();

  const handlePassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassError('Passwords do not match');
      return;
    }
    setPassError('');
    onChangePassword?.(newPassword);
    setChangePassOpen(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const closePassModal = () => {
    setChangePassOpen(false);
    setNewPassword('');
    setConfirmPassword('');
    setPassError('');
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col lg:flex-row overflow-hidden bg-[#F4F7FB]">
      <DashboardSidebar
        user={user}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeView={activeView}
        onViewChange={onViewChange}
        onLogout={onLogout}
        onChangePasswordRequest={() => setChangePassOpen(true)}
        isCollapsed={isCollapsed}
        gymName={gymName}
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
              <img src="/profile.png" alt="" className="size-[36px] rounded-main border-main" />
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
                      activeView === 'earnings' ? 'Earnings' : 'Overview'}
                </span>
              </h2>
            </div>
          </div>




          <div className="hidden sm:block pb-[10px]">
            {(user.role === UserRole.GYM_OWNER || user.role === UserRole.TRAINER) ? (
              <Button
                onClick={() => dispatch(openAddMemberModal())}
                className="uppercase"
              >
                <img src="/icons/plus.svg" alt="" className="w-5 h-5 mr-2" /> ADD MEMBER
              </Button>
            ) : (
              <BorderButton variant="green">
                {user.role === UserRole.SUPER_ADMIN ? 'Platform Administrator' : 'Staff Trainer'}
              </BorderButton>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto md:px-5 lg:px-0">
          <div className=' pb-5'>
            <h2 className="hidden md:block text-[32px] leading-[32px] font-semibold text-black">
              {pageTitle}
            </h2>
          </div>
          <div className="">
            {children}
          </div>
        </main>
      </div >

      <Modal isOpen={isChangePassOpen} onClose={closePassModal} title="Security Settings">
        <form onSubmit={handlePassSubmit} className="space-y-[15px]">
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (passError) setPassError('');
            }}
            required
            minLength={6}
            placeholder="Min 6 characters"
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (passError) setPassError('');
            }}
            required
            minLength={6}
            placeholder="Re-enter password"
            error={passError}
          />
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={closePassModal} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-charcoal text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-charcoal/20 active:scale-95 transition-all">Update Password</button>
          </div>
        </form>
      </Modal>
    </div >
  );
};

export default DashboardLayout;
