
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Gym, UserRole, GymStatus } from './types';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import GymOwnerDashboard from './pages/GymOwnerDashboard';
import GymEarnings from './pages/GymEarnings';
import StaffManagement from './pages/StaffManagement';
import DashboardLayout from './components/DashboardLayout';
import client from './api/client';

const STORAGE_KEY = 'gym_mgmt_session';
const SESSION_EXPIRY_DAYS = 30;

const App: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<string>('dashboard');

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { user, expiry } = JSON.parse(saved);
        if (Date.now() < expiry) return user;
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return null;
  });

  const { data: gyms = [], isLoading: gymsLoading } = useQuery({
    queryKey: ['gyms'],
    queryFn: async () => {
      const res = await client.get('/gyms');
      return res.data;
    },
    enabled: currentUser?.role === UserRole.SUPER_ADMIN,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['members', currentUser?.gymId],
    queryFn: async () => {
      const res = await client.get(`/members?gymId=${currentUser?.gymId}`);
      return res.data;
    },
    enabled: !!currentUser?.gymId,
  });

  const { data: staff = [], isLoading: staffLoading } = useQuery({
    queryKey: ['staff', currentUser?.gymId],
    queryFn: async () => {
      const res = await client.get(`/staff?gymId=${currentUser?.gymId}`);
      return res.data;
    },
    enabled: !!currentUser?.gymId,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments', currentUser?.gymId],
    queryFn: async () => {
      const res = await client.get(`/payments?gymId=${currentUser?.gymId}`);
      return res.data;
    },
    enabled: !!currentUser?.gymId,
  });

  const loginMutation = useMutation({
    mutationFn: async (creds: any) => {
      const res = await client.post('/auth/login', creds);
      return res.data;
    },
    onSuccess: (user) => {
      const expiry = Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, expiry }));
      setCurrentUser(user);
    }
  });

  const addGymMutation = useMutation({
    mutationFn: async ({ gym, password }: any) => {
      const res = await client.post('/gyms', { ...gym, password });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gyms'] })
  });

  const updateGymMutation = useMutation({
    mutationFn: async ({ gym, password }: any) => {
      const res = await client.patch(`/gyms/${gym.id}`, { ...gym, password });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gyms'] })
  });

  const toggleGymStatusMutation = useMutation({
    mutationFn: async ({ gymId, status }: any) => {
      const res = await client.patch(`/gyms/${gymId}`, { status });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gyms'] })
  });

  const deleteGymMutation = useMutation({
    mutationFn: async (gymId: number) => {
      await client.delete(`/gyms/${gymId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gyms'] })
  });

  const addMemberMutation = useMutation({
    mutationFn: async (member: any) => {
      const res = await client.post('/members', { ...member, gymId: currentUser?.gymId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: async (member: any) => {
      const res = await client.patch(`/members/${member._id}`, member);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  });

  const renewMemberMutation = useMutation({
    mutationFn: async ({ memberId, renewalData }: any) => {
      const res = await client.post(`/members/${memberId}/renew`, { renewalData });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/members/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] })
  });

  const addStaffMutation = useMutation({
    mutationFn: async (trainerData: any) => {
      const res = await client.post('/staff', { ...trainerData, gymId: currentUser?.gymId });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] })
  });

  const updateStaffMutation = useMutation({
    mutationFn: async (trainer: any) => {
      const res = await client.patch(`/staff/${trainer._id}`, trainer);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] })
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/staff/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] })
  });

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
    queryClient.clear();
  };

  if (!currentUser) return <Login onLogin={(creds) => loginMutation.mutate(creds)} />;

  const isTrainer = currentUser.role === UserRole.TRAINER;
  const currentGym = gyms.find(g => g.id === currentUser.gymId);

  if (currentUser.role === UserRole.SUPER_ADMIN) {
    return (
      <SuperAdminDashboard
        user={currentUser}
        gyms={gyms}
        members={members}
        onLogout={handleLogout}
        onToggleGymStatus={(id, status) => toggleGymStatusMutation.mutate({ gymId: id, status: status === GymStatus.ACTIVE ? GymStatus.SUSPENDED : GymStatus.ACTIVE })}
        onDeleteGym={(id) => deleteGymMutation.mutate(id)}
        onAddGym={(gym, password) => addGymMutation.mutate({ gym, password })}
        onUpdateGym={(gym, password) => updateGymMutation.mutate({ gym, password })}
      />
    );
  }

  const effectiveView = isTrainer ? 'dashboard' : activeView;

  return (
    <DashboardLayout 
      user={currentUser} 
      onLogout={handleLogout} 
      pageTitle={effectiveView === 'earnings' ? 'Earnings & Reports' : effectiveView === 'staff' ? 'Staff Management' : currentGym?.name || 'Dashboard'}
      activeView={effectiveView}
      onViewChange={setActiveView}
    >
      {effectiveView === 'dashboard' && (
        <GymOwnerDashboard
          user={currentUser}
          gym={currentGym || { name: 'Loading...' } as Gym}
          members={members}
          onLogout={handleLogout}
          onAddMember={(m) => addMemberMutation.mutate(m)}
          onUpdateMember={(m) => updateMemberMutation.mutate(m)}
          onRenewMember={(id, renewalData) => renewMemberMutation.mutate({ memberId: id, renewalData })}
          onDeleteMember={(id) => deleteMemberMutation.mutate(id)}
        />
      )}
      {effectiveView === 'earnings' && !isTrainer && (
        <GymEarnings 
          gym={currentGym || {} as Gym} 
          members={members} 
          payments={payments} 
        />
      )}
      {effectiveView === 'staff' && !isTrainer && (
        <StaffManagement
          gym={currentGym || {} as Gym}
          staff={staff}
          onAddTrainer={(t) => addStaffMutation.mutate(t)}
          onUpdateTrainer={(t) => updateStaffMutation.mutate(t)}
          onDeleteUser={(id) => deleteStaffMutation.mutate(id)}
        />
      )}
      {(gymsLoading || membersLoading || staffLoading || paymentsLoading) && (
        <div className="fixed bottom-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg border border-slate-100 flex items-center space-x-2 animate-pulse-subtle">
          <div className="w-2 h-2 bg-brand rounded-full"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Syncing...</span>
        </div>
      )}
    </DashboardLayout>
  );
};

export default App;
