
import React, { useState, useCallback } from 'react';
import { User, Gym, Member, UserRole, GymStatus } from './types';
import { USERS, GYMS, MEMBERS } from './constants';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import GymOwnerDashboard from './pages/GymOwnerDashboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [gyms, setGyms] = useState<Gym[]>(GYMS);
  const [members, setMembers] = useState<Member[]>(MEMBERS);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
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

  const addMember = useCallback((newMember: Omit<Member, 'id'>) => {
    setMembers(prevMembers => [
      ...prevMembers,
      { ...newMember, id: Date.now() } // Simple unique ID
    ]);
  }, []);

  const updateMember = useCallback((updatedMember: Member) => {
    setMembers(prevMembers =>
      prevMembers.map(member =>
        member.id === updatedMember.id ? updatedMember : member
      )
    );
  }, []);

  const deleteMember = useCallback((memberId: number) => {
    setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
  }, []);

  if (!currentUser) {
    return <Login users={USERS} onLogin={handleLogin} />;
  }

  if (currentUser.role === UserRole.SUPER_ADMIN) {
    return <SuperAdminDashboard
      user={currentUser}
      gyms={gyms}
      members={members}
      onLogout={handleLogout}
      onToggleGymStatus={toggleGymStatus}
    />;
  }

  if (currentUser.role === UserRole.GYM_OWNER && currentUser.gymId) {
    const currentGym = gyms.find(gym => gym.id === currentUser.gymId);
    if (!currentGym) {
      return <div>Error: Gym not found for the current user.</div>;
    }
    const gymMembers = members.filter(member => member.gymId === currentUser.gymId);
    
    return <GymOwnerDashboard
      user={currentUser}
      gym={currentGym}
      members={gymMembers}
      onLogout={handleLogout}
      onAddMember={addMember}
      onUpdateMember={updateMember}
      onDeleteMember={deleteMember}
    />;
  }

  return <div>Invalid user role or configuration.</div>;
};

export default App;
