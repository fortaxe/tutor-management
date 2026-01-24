
import React, { useState, useCallback, useEffect } from 'react';
import { User, Gym, Member, UserRole, GymStatus, MemberPayment, PaymentStatus } from './types';
import { USERS, GYMS, MEMBERS, MEMBER_PAYMENTS } from './constants';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import GymOwnerDashboard from './pages/GymOwnerDashboard';
import GymEarnings from './pages/GymEarnings';
import StaffManagement from './pages/StaffManagement';
import DashboardLayout from './components/DashboardLayout';

const STORAGE_KEYS = {
  SESSION: 'gym_mgmt_session',
  USERS: 'gym_mgmt_users',
  GYMS: 'gym_mgmt_gyms',
  MEMBERS: 'gym_mgmt_members',
  PAYMENTS: 'gym_mgmt_payments',
};

const SESSION_EXPIRY_DAYS = 30;

const App: React.FC = () => {
  // --- Persistent State ---
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : USERS;
  });

  const [gyms, setGyms] = useState<Gym[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GYMS);
    return saved ? JSON.parse(saved) : GYMS;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return saved ? JSON.parse(saved) : MEMBERS;
  });

  const [memberPayments, setMemberPayments] = useState<MemberPayment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : MEMBER_PAYMENTS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (saved) {
      try {
        const { user, expiry } = JSON.parse(saved);
        if (Date.now() < expiry) return user;
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      } catch (e) {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    }
    return null;
  });

  const [activeView, setActiveView] = useState<string>('dashboard');

  // --- Persistence Effects ---
  useEffect(() => localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.GYMS, JSON.stringify(gyms)), [gyms]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members)), [members]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(memberPayments)), [memberPayments]);

  // --- Handlers ---
  const handleLogin = (user: User) => {
    const expiry = Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ user, expiry }));
    setCurrentUser(user);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    setCurrentUser(null);
  };

  const addTrainer = useCallback((trainerData: Omit<User, 'id' | 'role'>) => {
    const newUser: User = {
      ...trainerData,
      id: Date.now(),
      role: UserRole.TRAINER,
    };
    setUsers(prev => [...prev, newUser]);
  }, []);

  const updateTrainer = useCallback((updatedTrainer: User) => {
    setUsers(prev => prev.map(u => u.id === updatedTrainer.id ? updatedTrainer : u));
  }, []);

  const deleteUser = useCallback((userId: number) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  const toggleGymStatus = useCallback((gymId: number, currentStatus: GymStatus) => {
    setGyms(prev => prev.map(gym => gym.id === gymId ? { ...gym, status: currentStatus === GymStatus.ACTIVE ? GymStatus.SUSPENDED : GymStatus.ACTIVE } : gym));
  }, []);

  const addGym = useCallback((gymData: Omit<Gym, 'id' | 'paymentHistory'>, password?: string) => {
    const newGymId = Date.now();
    const newUser: User = { id: Date.now() + 1, phone: gymData.ownerPhone, password: password || 'gym123', role: UserRole.GYM_OWNER, gymId: newGymId };
    setGyms(prev => [...prev, { ...gymData, id: newGymId, paymentHistory: [] }]);
    setUsers(prev => [...prev, newUser]);
  }, []);

  const updateGym = useCallback((updatedGym: Gym, password?: string) => {
    setGyms(prev => prev.map(g => g.id === updatedGym.id ? updatedGym : g));
    setUsers(prev => prev.map(u => {
      if (u.gymId === updatedGym.id && u.role === UserRole.GYM_OWNER) {
        return {
          ...u,
          phone: updatedGym.ownerPhone,
          ...(password ? { password } : {})
        };
      }
      return u;
    }));
  }, []);

  const addMember = useCallback((newMember: Omit<Member, 'id'>) => {
    const id = Date.now();
    setMembers(prev => [...prev, { ...newMember, id }]);
    if (newMember.feesStatus === PaymentStatus.PAID) {
      setMemberPayments(prev => [...prev, { id: Date.now() + 1, memberId: id, memberName: newMember.name, gymId: newMember.gymId, amount: newMember.feesAmount, paymentDate: new Date().toISOString().split('T')[0], note: 'Initial Payment' }]);
    }
  }, []);

  const updateMember = useCallback((updatedMember: Member) => {
    setMembers(prevMembers => {
      const oldMember = prevMembers.find(m => m.id === updatedMember.id);
      if (oldMember && oldMember.feesStatus === PaymentStatus.UNPAID && updatedMember.feesStatus === PaymentStatus.PAID) {
        setMemberPayments(prev => [...prev, { id: Date.now(), memberId: updatedMember.id, memberName: updatedMember.name, gymId: updatedMember.gymId, amount: updatedMember.feesAmount, paymentDate: new Date().toISOString().split('T')[0], note: 'Fee Collection' }]);
      }
      return prevMembers.map(member => member.id === updatedMember.id ? updatedMember : member);
    });
  }, []);

  const deleteMember = useCallback((memberId: number) => setMembers(prev => prev.filter(m => m.id !== memberId)), []);

  if (!currentUser) return <Login users={users} onLogin={handleLogin} />;

  if (currentUser.role === UserRole.SUPER_ADMIN) {
    return (
      <SuperAdminDashboard
        user={currentUser}
        gyms={gyms}
        members={members}
        onLogout={handleLogout}
        onToggleGymStatus={toggleGymStatus}
        onAddGym={addGym}
        onUpdateGym={updateGym}
      />
    );
  }

  if ((currentUser.role === UserRole.GYM_OWNER || currentUser.role === UserRole.TRAINER) && currentUser.gymId) {
    const currentGym = gyms.find(gym => gym.id === currentUser.gymId);
    if (!currentGym) return <div>Error: Gym not found.</div>;
    
    const gymMembers = members.filter(member => member.gymId === currentUser.gymId);
    const gymPayments = memberPayments.filter(p => p.gymId === currentUser.gymId);
    const gymStaff = users.filter(u => u.gymId === currentUser.gymId);
    
    const isTrainer = currentUser.role === UserRole.TRAINER;
    const effectiveView = isTrainer ? 'dashboard' : activeView;

    return (
      <DashboardLayout 
        user={currentUser} 
        onLogout={handleLogout} 
        pageTitle={effectiveView === 'earnings' ? 'Earnings & Reports' : effectiveView === 'staff' ? 'Staff Management' : currentGym.name}
        activeView={effectiveView}
        onViewChange={setActiveView}
      >
        {effectiveView === 'dashboard' && (
          <GymOwnerDashboard
            user={currentUser}
            gym={currentGym}
            members={gymMembers}
            onLogout={handleLogout}
            onAddMember={addMember}
            onUpdateMember={updateMember}
            onDeleteMember={deleteMember}
          />
        )}
        {effectiveView === 'earnings' && !isTrainer && (
          <GymEarnings 
            gym={currentGym} 
            members={gymMembers} 
            payments={gymPayments} 
          />
        )}
        {effectiveView === 'staff' && !isTrainer && (
          <StaffManagement
            gym={currentGym}
            staff={gymStaff}
            onAddTrainer={addTrainer}
            onUpdateTrainer={updateTrainer}
            onDeleteUser={deleteUser}
          />
        )}
      </DashboardLayout>
    );
  }

  return <div>Invalid configuration.</div>;
};

export default App;
