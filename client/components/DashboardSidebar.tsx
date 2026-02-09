import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import BorderButton from './BorderButton';

const StudentsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.25 6.75H6.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.5208 7.375H11.8942C10.7791 7.375 9.875 8.21444 9.875 9.25C9.875 10.2856 10.7791 11.125 11.8942 11.125H13.5208C13.5729 11.125 13.5989 11.125 13.6209 11.1237C13.958 11.1031 14.2264 10.8539 14.2486 10.5409C14.25 10.5204 14.25 10.4963 14.25 10.4479V8.05206C14.25 8.00375 14.25 7.97956 14.2486 7.95913C14.2264 7.64613 13.958 7.39688 13.6209 7.37631C13.5989 7.375 13.5729 7.375 13.5208 7.375Z" stroke="currentColor" strokeWidth="1.3" />
        <path d="M13.6031 7.375C13.5546 6.20481 13.3979 5.48734 12.8927 4.98223C12.1606 4.25 10.982 4.25 8.625 4.25H6.75C4.39298 4.25 3.21447 4.25 2.48223 4.98223C1.75 5.71447 1.75 6.893 1.75 9.25C1.75 11.607 1.75 12.7856 2.48223 13.5177C3.21447 14.25 4.39298 14.25 6.75 14.25H8.625C10.982 14.25 12.1606 14.25 12.8927 13.5177C13.3979 13.0127 13.5546 12.2952 13.6031 11.125" stroke="currentColor" strokeWidth="1.3" />
        <path d="M4.25 4.25L6.58468 2.70196C7.24212 2.26601 8.13288 2.26601 8.79031 2.70196L11.125 4.25" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M11.7445 9.25H11.7501" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const AssistantIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.5 4.25C5.5 4.91304 5.76339 5.54893 6.23223 6.01777C6.70107 6.48661 7.33696 6.75 8 6.75C8.66304 6.75 9.29893 6.48661 9.76777 6.01777C10.2366 5.54893 10.5 4.91304 10.5 4.25C10.5 3.58696 10.2366 2.95107 9.76777 2.48223C9.29893 2.01339 8.66304 1.75 8 1.75C7.33696 1.75 6.70107 2.01339 6.23223 2.48223C5.76339 2.95107 5.5 3.58696 5.5 4.25Z" stroke="currentColor" strokeWidth="1.3" />
        <path d="M9.25 10.5C9.25 11.163 9.51339 11.7989 9.98223 12.2678C10.4511 12.7366 11.087 13 11.75 13C12.413 13 13.0489 12.7366 13.5178 12.2678C13.9866 11.7989 14.25 11.163 14.25 10.5C14.25 9.83696 13.9866 9.20107 13.5178 8.73223C13.0489 8.26339 12.413 8 11.75 8C11.087 8 10.4511 8.26339 9.98223 8.73223C9.51339 9.20107 9.25 9.83696 9.25 10.5Z" stroke="currentColor" strokeWidth="1.3" />
        <path d="M10.9166 10.5001L11.4375 11.1251L12.5832 9.94456" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.875 8.82944C9.296 8.69762 8.66306 8.625 8 8.625C5.23857 8.625 3 9.88419 3 11.4375C3 12.9908 3 14.25 8 14.25C11.5546 14.25 12.5822 13.6136 12.8792 12.6875" stroke="currentColor" strokeWidth="1.3" />
    </svg>
);

const EarningsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.75 8C1.75 5.05372 1.75 3.58058 2.66529 2.66529C3.58058 1.75 5.05372 1.75 8 1.75C10.9462 1.75 12.4194 1.75 13.3347 2.66529C14.25 3.58058 14.25 5.05372 14.25 8" stroke="currentColor" strokeWidth="1.3" />
        <path d="M1.75 9.25C1.75 7.49981 1.75 6.62476 2.09061 5.95628C2.39021 5.36827 2.86827 4.89021 3.45628 4.59061C4.12476 4.25 4.99984 4.25 6.75 4.25H9.25C11.0002 4.25 11.8752 4.25 12.5437 4.59061C13.1317 4.89021 13.6098 5.36827 13.9094 5.95628C14.25 6.62476 14.25 7.49981 14.25 9.25C14.25 11.0002 14.25 11.8752 13.9094 12.5437C13.6098 13.1317 13.1317 13.6098 12.5437 13.9094C11.8752 14.25 11.0002 14.25 9.25 14.25H6.75C4.99984 14.25 4.12476 14.25 3.45628 13.9094C2.86827 13.6098 2.39021 13.1317 2.09061 12.5437C1.75 11.8752 1.75 11.0002 1.75 9.25Z" stroke="currentColor" strokeWidth="1.3" />
        <path d="M6.4375 9.5L7.33038 10.5L9.5625 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

interface DashboardSidebarProps {
    user: User;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    onLogout: () => void;
    onChangePasswordRequest: () => void;
    isCollapsed?: boolean;
    tutorName?: string;
    tutorLogo?: string;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    user,
    isSidebarOpen,
    setIsSidebarOpen,
    onLogout,
    onChangePasswordRequest: _onChangePasswordRequest,
    isCollapsed,
    tutorName: _tutorName,
    tutorLogo,
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const activeView = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1).split('/')[0];

    const isTutor = user.role === UserRole.TUTOR;
    const isAssistant = user.role === UserRole.ASSISTANT;

    const navItems = (isTutor || isAssistant) ? [
        { id: 'dashboard', label: 'Students', icon: <StudentsIcon /> },
        ...(isTutor ? [
            { id: 'staff', label: 'Assistant', icon: <AssistantIcon /> },
            { id: 'earnings', label: 'Earnings', icon: <EarningsIcon /> }
        ] : []),
    ] : [
        { id: 'dashboard', label: 'Tutor Ledger', icon: <StudentsIcon /> },
        { id: 'leads', label: 'Leads', icon: <AssistantIcon /> },
    ];

    return (
        <div className={`
            fixed inset-y-0 right-0 z-40 transform transition-transform duration-500 ease-in-out lg:left-0 lg:right-auto lg:relative lg:translate-x-0
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            ${isCollapsed ? 'w-[90px]' : 'w-72'} bg-black text-white h-full lg:min-h-screen p-6 flex flex-col justify-between shadow-2xl transition-all duration-300
        `}>
            <div className="space-y-8">
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/20">
                        <span className="text-black font-black text-xl">T</span>
                    </div>
                    {!isCollapsed && <span className="text-lg font-black tracking-tighter uppercase italic">Tutor Pro</span>}
                </div>

                <nav className="space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                const path = item.id === 'dashboard' ? '/' : `/${item.id}`;
                                navigate(path);
                                setIsSidebarOpen(false);
                            }}
                            title={isCollapsed ? item.label : ''}
                            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-4 px-4'} py-3.5 rounded-xl transition-all font-black text-[11px] uppercase tracking-widest ${activeView === item.id
                                ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/10'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                }`}
                        >
                            <span className={activeView === item.id ? 'text-black' : 'text-slate-500'}>{item.icon}</span>
                            {!isCollapsed && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex flex-col gap-3">
                <div className={`p-3 rounded-2xl bg-white flex gap-3 items-center ${isCollapsed ? 'justify-center' : ''} shadow-lg`}>
                    <img src={tutorLogo || "/profile.png"} alt="Tutor" className="w-10 h-10 rounded-xl border border-slate-100 object-cover" />
                    {!isCollapsed && (
                        <div className="min-w-0">
                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest truncate">
                                {user.role === UserRole.SUPER_ADMIN ? 'Platform Admin' : isTutor ? 'Tutor Admin' : (user.name || 'Assistant')}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 truncate tracking-wide" >{user.phone}</p>
                        </div>
                    )}
                </div>

                {user.role === UserRole.SUPER_ADMIN && (
                    <button
                        onClick={_onChangePasswordRequest}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest text-slate-400 bg-slate-900 hover:text-white`}
                        title={isCollapsed ? "Change Password" : ""}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-500">
                            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                        </svg>
                        {!isCollapsed && <span>Security</span>}
                    </button>
                )}

                {isTutor && (
                    <BorderButton variant="yellow" onClick={() => {
                        navigate('/profile');
                        setIsSidebarOpen(false);
                    }} className="!py-3.5 !rounded-xl !text-[10px] tracking-[0.2em] font-black">
                        {isCollapsed ? "P" : "MY PROFILE"}
                    </BorderButton>
                )}

                <BorderButton variant="blue" onClick={() => window.location.href = "tel:+919676675576"} className="!py-3.5 !rounded-xl !text-[10px] tracking-[0.2em] font-black">
                    {isCollapsed ? "?" : "SUPPORT HELP"}
                </BorderButton>

                <BorderButton variant="red" onClick={onLogout} className="!py-3.5 !rounded-xl !text-[10px] tracking-[0.2em] font-black">
                    {isCollapsed ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                    ) : 'EXIT / LOGOUT'}
                </BorderButton>
            </div>
        </div>
    );
};

export default DashboardSidebar;
