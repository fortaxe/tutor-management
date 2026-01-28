import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Gym, UserRole, GymStatus } from './types';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import GymOwnerDashboard from './pages/GymOwnerDashboard';
import GymEarnings from './pages/GymEarnings';
import StaffManagement from './pages/StaffManagement';
import DashboardLayout from './components/DashboardLayout';
import Toast from './components/Toast';
import client from './lib/client';
import { objectToFormData } from './lib/utils';
import { useMyGym } from './hooks/useMyGym';

const STORAGE_KEY = 'gym_mgmt_session';
const SESSION_EXPIRY_DAYS = 30;

const App: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  // --- Auth State ---
  const [loginError, setLoginError] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // ... existing initialization ...
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

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
    queryClient.clear();
  };

  // --- Queries ---
  const { data: gyms = [], isLoading: gymsLoading } = useQuery({
    queryKey: ['gyms'],
    queryFn: async () => {
      const res = await client.get('/gyms');
      return res.data;
    },
    enabled: currentUser?.role === UserRole.SUPER_ADMIN,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['members', currentUser?.role === UserRole.SUPER_ADMIN ? 'all' : currentUser?.gymId],
    queryFn: async () => {
      const params = currentUser?.role === UserRole.SUPER_ADMIN ? {} : { gymId: currentUser?.gymId };
      const res = await client.get('/members', { params });
      return res.data;
    },
    enabled: !!currentUser && (currentUser.role === UserRole.SUPER_ADMIN || !!currentUser.gymId),
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

  const { data: myGym, isError: isGymError, error: gymError } = useMyGym(currentUser);

  // --- Mutations ---
  const loginMutation = useMutation({
    mutationFn: async (creds: any) => {
      const res = await client.post('/auth/login', creds);
      return res.data;
    },
    onSuccess: (user) => {
      setLoginError('');
      const expiry = Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, expiry }));
      setCurrentUser(user);
    },
    onError: (error: any) => {
      // Set local error instead of showing toast
      setLoginError('Incorrect password. Try again.');
    }
  });

  const addGymMutation = useMutation({
    mutationFn: async ({ gym, password }: any) => {
      const res = await client.post('/gyms', { ...gym, password });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      showToast('Gym added successfully', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || error.message;
      if (msg.includes('duplicate key') || msg.includes('E11000')) {
        showToast('Gym Owner Phone/ID already exists!', 'error');
      } else {
        showToast(`Failed to add gym: ${msg}`, 'error');
      }
    }
  });

  const updateGymMutation = useMutation({
    mutationFn: async ({ gym, password }: any) => {
      const res = await client.patch(`/gyms/${gym.id}`, { ...gym, password });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      showToast('Gym updated successfully', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || error.message;
      showToast(`Failed to update gym: ${msg}`, 'error');
    }
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
      const formData = objectToFormData({ ...member, gymId: currentUser?.gymId });
      const res = await client.post('/members', formData);
      return res.data;
    },
    onMutate: async (newMember) => {
      const queryKey = ['members', currentUser?.gymId];
      await queryClient.cancelQueries({ queryKey });
      const previousMembers = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: any[]) => [
        {
          ...newMember,
          id: Date.now(),
          _id: 'temp-' + Date.now(),
          gymId: currentUser?.gymId,
          feesAmount: Number(newMember.feesAmount),
          paidAmount: Number(newMember.paidAmount)
        },
        ...(old || [])
      ]);
      return { previousMembers };
    },
    onSuccess: () => {
      showToast('Member added successfully', 'success');
    },
    onError: (error: any, newMember, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(['members', currentUser?.gymId], context.previousMembers);
      }
      const msg = error.response?.data?.error || error.message;
      if (msg.includes('duplicate key') || msg.includes('E11000')) {
        showToast('Member with this phone number already exists!', 'error');
      } else {
        showToast(`Failed to add member: ${msg}`, 'error');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: async (member: any) => {
      const formData = objectToFormData(member);
      // We use _id because sending FormData with patches sometimes can be tricky if id is in body, 
      // but here we use URL param which is fine.
      const res = await client.patch(`/members/${member._id}`, formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      showToast('Member updated successfully', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || error.message;
      if (msg.includes('duplicate key') || msg.includes('E11000')) {
        showToast('Update failed: Phone number already in use!', 'error');
      } else {
        showToast(`Failed to update member: ${msg}`, 'error');
      }
    }
  });

  const renewMemberMutation = useMutation({
    // Using any for variable type to handle potential ID format mismatches between mock and server data
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
    // Changed id type from string to any to prevent number vs string assignment errors
    mutationFn: async (id: any) => {
      await client.delete(`/members/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] })
  });

  const addStaffMutation = useMutation({
    mutationFn: async (trainerData: any) => {
      const res = await client.post('/staff', { ...trainerData, gymId: currentUser?.gymId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      showToast('Trainer/Staff added successfully', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || error.message;
      if (msg.includes('duplicate key') || msg.includes('E11000')) {
        showToast('Staff with this phone number already exists!', 'error');
      } else {
        showToast(`Failed to add staff: ${msg}`, 'error');
      }
    }
  });

  const updateStaffMutation = useMutation({
    mutationFn: async (trainer: any) => {
      const res = await client.patch(`/staff/${trainer._id}`, trainer);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      showToast('Staff updated successfully', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || error.message;
      if (msg.includes('duplicate key') || msg.includes('E11000')) {
        showToast('Staff update failed: Phone number exists!', 'error');
      } else {
        showToast(`Failed to update staff: ${msg}`, 'error');
      }
    }
  });

  const deleteStaffMutation = useMutation({
    // Changed id type from string to any to prevent number vs string assignment errors
    mutationFn: async (id: any) => {
      await client.delete(`/staff/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] })
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      if (currentUser?.role === UserRole.GYM_OWNER) {
        await client.patch(`/gyms/${currentUser.gymId}`, { password });
      } else if (currentUser?.role === UserRole.TRAINER || currentUser?.role === UserRole.SUPER_ADMIN) {
        await client.patch(`/staff/${currentUser._id}`, { password });
      }
    },
    onSuccess: () => showToast('Password updated successfully', 'success'),
    onError: (err: any) => showToast('Failed to update password', 'error')
  });

  if (!currentUser) {
    return (
      <>
        {/* Pass custom error handling to Login */}
        <Login
          onLogin={(creds) => {
            setLoginError(''); // Clear previous errors on new attempt
            loginMutation.mutate(creds);
          }}
          isLoading={loginMutation.isPending}
          backendError={loginError}
        />
        {/* Removed Toast for login page as requested */}
      </>
    );
  }

  const isTrainer = currentUser.role === UserRole.TRAINER;
  const currentGym = myGym || gyms.find(g => g.id === currentUser.gymId);

  if (currentUser.role === UserRole.SUPER_ADMIN) {
    return (
      <>
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
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </>
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
      onChangePassword={(pwd) => changePasswordMutation.mutate(pwd)}
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default App;