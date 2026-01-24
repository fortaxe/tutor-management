
import React, { useState, useCallback } from 'react';
import { User, Gym, Member, UserRole, GymStatus, MemberPayment, PaymentStatus } from './types';
import { USERS, GYMS, MEMBERS, MEMBER_PAYMENTS } from './constants';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import GymOwnerDashboard from './pages/GymOwnerDashboard';
import GymEarnings from './pages/GymEarnings';
import DashboardLayout from './components/DashboardLayout';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(USERS);
  const [gyms, setGyms] = useState<Gym[]>(GYMS);
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [memberPayments, setMemberPayments] = useState<MemberPayment[]>(MEMBER_PAYMENTS);
  const [activeView, setActiveView] = useState<string>('dashboard');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const toggleGymStatus = useCallback((gymId: number, currentStatus: GymStatus) => {
    setGyms(prevGyms =>
      prevGyms.map(gym =>
        gym.id === gymId
          ? { ...gym, status: currentStatus === GymStatus.ACTIVE ? GymStatus.SUSPENDED : GymStatus.ACTIVE }
          : gym
      )
    );
  }, []);

  const addGym = useCallback((gymData: Omit<Gym, 'id'>, password?: string) => {
    const newGymId = Date.now();
    const newGym: Gym = {
      ...gymData,
      id: newGymId,
    };

    const newUser: User = {
      id: Date.now() + 1,
      phone: gymData.ownerPhone,
      password: password || 'gym123',
      role: UserRole.GYM_OWNER,
      gymId: newGymId,
    };

    setGyms(prev => [...prev, newGym]);
    setUsers(prev => [...prev, newUser]);
  }, []);

  const updateGym = useCallback((updatedGym: Gym) => {
    setGyms(prev => prev.map(g => g.id === updatedGym.id ? updatedGym : g));
  }, []);

  const addMember = useCallback((newMember: Omit<Member, 'id'>) => {
    const id = Date.now();
    setMembers(prevMembers => [
      ...prevMembers,
      { ...newMember, id }
    ]);
    
    if (newMember.feesStatus === PaymentStatus.PAID) {
      const p: MemberPayment = {
        id: Date.now() + 1,
        memberId: id,
        memberName: newMember.name,
        gymId: newMember.gymId,
        amount: newMember.feesAmount,
        paymentDate: new Date().toISOString().split('T')[0],
        note: 'Initial Payment',
      };
      setMemberPayments(prev => [...prev, p]);
    }
  }, []);

  const updateMember = useCallback((updatedMember: Member) => {
    setMembers(prevMembers => {
      const oldMember = prevMembers.find(m => m.id === updatedMember.id);
      
      if (oldMember && oldMember.feesStatus === PaymentStatus.UNPAID && updatedMember.feesStatus === PaymentStatus.PAID) {
        const p: MemberPayment = {
          id: Date.now(),
          memberId: updatedMember.id,
          memberName: updatedMember.name,
          gymId: updatedMember.gymId,
          amount: updatedMember.feesAmount,
          paymentDate: new Date().toISOString().split('T')[0],
          note: 'Fee Collection',
        };
        setMemberPayments(prev => [...prev, p]);
      }
      
      return prevMembers.map(member =>
        member.id === updatedMember.id ? updatedMember : member
      );
    });
  }, []);

  const deleteMember = useCallback((memberId: number) => {
    setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
  }, []);

  if (!currentUser) {
    return <Login users={users} onLogin={handleLogin} />;
  }

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

  if (currentUser.role === UserRole.GYM_OWNER && currentUser.gymId) {
    const currentGym = gyms.find(gym => gym.id === currentUser.gymId);
    if (!currentGym) return <div>Error: Gym not found.</div>;
    
    const gymMembers = members.filter(member => member.gymId === currentUser.gymId);
    const gymPayments = memberPayments.filter(p => p.gymId === currentUser.gymId);
    
    return (
      <DashboardLayout 
        user={currentUser} 
        onLogout={handleLogout} 
        pageTitle={activeView === 'earnings' ? 'Earnings & Reports' : currentGym.name}
        activeView={activeView}
        onViewChange={setActiveView}
      >
        {activeView === 'dashboard' ? (
          <GymOwnerDashboard
            user={currentUser}
            gym={currentGym}
            members={gymMembers}
            onLogout={handleLogout}
            onAddMember={addMember}
            onUpdateMember={updateMember}
            onDeleteMember={deleteMember}
          />
        ) : (
          <GymEarnings 
            gym={currentGym} 
            members={gymMembers} 
            payments={gymPayments} 
          />
        )}
      </DashboardLayout>
    );
  }

  return <div>Invalid configuration.</div>;
};

export default App;
