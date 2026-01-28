
import React from 'react';
import { User, UserRole } from '../types';
import DumbbellIcon from './icons/DumbbellIcon';

interface DashboardSidebarProps {
    user: User;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    activeView: string;
    onViewChange?: (view: string) => void;
    onLogout: () => void;
    onChangePasswordRequest: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    user,
    isSidebarOpen,
    setIsSidebarOpen,
    activeView,
    onViewChange,
    onLogout,
    onChangePasswordRequest,
}) => {
    const isOwner = user.role === UserRole.GYM_OWNER;
    const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
    const isTrainer = user.role === UserRole.TRAINER;

    const navItems = (isOwner || isTrainer) ? [
        { id: 'dashboard', label: 'Members', icon: '/icons/sidebar/members.svg' },
        ...(isOwner ? [
            { id: 'staff', label: 'Staff', icon: '/icons/sidebar/staffs.svg' },
            { id: 'earnings', label: 'Earnings', icon: '/icons/sidebar/earnings.svg' }
        ] : []),
    ] : [
        { id: 'dashboard', label: 'Gym Ledger', icon: '/icons/sidebar/members.svg' },
    ];

    return (
        <>
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
        w-72 bg-gradient-to-b from-black to-[#1C1C1C] text-white h-full lg:min-h-screen p-5 flex flex-col justify-between shadow-2xl lg:shadow-none overflow-y-auto
      `}>
                <div>
                    <span className="text-white font-semibold text-[24px] leading-[24px] " >Gym <span className="text-brand-500">Stack</span></span>

                    <nav className="space-y-[5px] mt-[33px]">

                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onViewChange?.(item.id);
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-4 px-[10px] py-[15px] rounded-main transition-all font-medium primary-description text-white ${activeView === item.id
                                    && 'bg-[#242424]  '

                                    }`}
                            >
                                <img src={item.icon} alt={item.label} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto flex flex-col gap-[6px]">
                    <div className='p-[10px] rounded-main bg-[#F8FAFC] flex gap-[8px] items-center'>
                        <div>
                            <img src="/profile.png" alt="" className="w-[46px] h-[46px] rounded-main border-main" />
                        </div>

                        <div>
                            <p className="tertiary-description text-[#0F172A] font-medium">
                                {user.role === UserRole.SUPER_ADMIN ? 'Super Admin' : user.role === UserRole.GYM_OWNER ? 'Gym Owner' : (user.name || 'Staff')}
                            </p>
                            <p className="text-[12px]  leading-[18px] text-[#9CA3AF]" >{user.phone}</p>
                        </div>

                    </div>
                    {/* <div className="mb-6 px-2">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Connected Account</p>
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-brand">
                                {user.phone.slice(-2)}
                            </div>
                            <p className="font-bold text-white truncate text-sm">{user.phone}</p>
                        </div>
                    </div>
                    {isSuperAdmin && (
                        <button
                            onClick={onChangePasswordRequest}
                            className="w-full mb-3 px-5 py-3 bg-slate-800/50 text-slate-400 border border-slate-700/50 rounded-2xl hover:bg-slate-800 hover:text-white transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                            </svg>
                            Change Password
                        </button>
                    )} */}
                    <button
                        onClick={onLogout}
                        className="w-full px-5 py-3 bg-[#EF44441A] !text-[#EF4444] border border-[#EF444433] rounded-[10px]  primary-description"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default DashboardSidebar;
