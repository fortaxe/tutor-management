
import React, { useState, useCallback, useEffect } from 'react';
import { User, Gym, Member, UserRole, GymStatus, MemberPayment, PaymentStatus, SubscriptionStatus } from './types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import GymOwnerDashboard from './pages/GymOwnerDashboard';
import GymEarnings from './pages/GymEarnings';
import StaffManagement from './pages/StaffManagement';
import DashboardLayout from './components/DashboardLayout';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberPayments, setMemberPayments] = useState<MemberPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [bootstrapStatus, setBootstrapStatus] = useState<string | null>(null);

  const handleBootstrap = async () => {
    setBootstrapStatus('Starting setup...');
    try {
      const phone = '9999999999';
      const email = `${phone}@gymstack.com`;
      const password = 'admin';

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setBootstrapStatus('Admin already exists in Auth. Checking profile...');
          // Check if profile exists
          const { data: existingProfile } = await supabase.from('profiles').select('*').eq('phone', phone).single();
          if (!existingProfile) {
            // This handles a case where Auth exists but profile doesn't
            const { data: user } = await supabase.auth.getUser();
            if (user.user) {
               await supabase.from('profiles').insert([{ id: user.user.id, phone, role: UserRole.SUPER_ADMIN }]);
            }
          }
          setBootstrapStatus('Setup verified. Try logging in.');
          return;
        }
        throw authError;
      }

      if (authData.user) {
        await supabase.from('profiles').insert([{
          id: authData.user.id,
          phone: phone,
          role: UserRole.SUPER_ADMIN
        }]);
        setBootstrapStatus('Success! Login: 9999999999 / admin');
      }
    } catch (err: any) {
      setBootstrapStatus(`Setup Error: ${err.message}`);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile && !error) {
            setCurrentUser({
              id: profile.id,
              phone: profile.phone,
              role: profile.role as UserRole,
              gymId: profile.gym_id
            });
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setCurrentUser({
            id: profile.id,
            phone: profile.phone,
            role: profile.role as UserRole,
            gymId: profile.gym_id
          });
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;

    try {
      if (currentUser.role === UserRole.SUPER_ADMIN) {
        const { data: gymsData } = await supabase.from('gyms').select('*').order('created_at', { ascending: false });
        const { data: membersData } = await supabase.from('members').select('*');
        
        // Map snake_case to camelCase for the UI
        setGyms(gymsData?.map(g => ({
          ...g,
          ownerPhone: g.owner_phone,
          subscriptionStatus: g.subscription_status,
          subscriptionStartDate: g.subscription_start_date,
          subscriptionEndDate: g.subscription_end_date,
          totalPaidAmount: g.total_paid_amount,
          paymentHistory: g.payment_history || []
        })) || []);
        
        setMembers(membersData?.map(m => ({
          ...m,
          gymId: m.gym_id,
          planStart: m.plan_start,
          planDurationDays: m.plan_duration_days,
          feesAmount: m.fees_amount,
          feesStatus: m.fees_status
        })) || []);
      } else {
        const { data: gymsData } = await supabase.from('gyms').select('*').eq('id', currentUser.gymId);
        const { data: membersData } = await supabase.from('members').select('*').eq('gym_id', currentUser.gymId);
        const { data: paymentsData } = await supabase.from('payments').select('*').eq('gym_id', currentUser.gymId);
        
        setGyms(gymsData?.map(g => ({
          ...g,
          ownerPhone: g.owner_phone,
          subscriptionStatus: g.subscription_status,
          subscriptionStartDate: g.subscription_start_date,
          subscriptionEndDate: g.subscription_end_date,
          totalPaidAmount: g.total_paid_amount,
          paymentHistory: g.payment_history || []
        })) || []);

        setMembers(membersData?.map(m => ({
          ...m,
          gymId: m.gym_id,
          planStart: m.plan_start,
          planDurationDays: m.plan_duration_days,
          feesAmount: m.fees_amount,
          feesStatus: m.fees_status
        })) || []);

        setMemberPayments(paymentsData?.map(p => ({
          ...p,
          memberId: p.member_id,
          memberName: p.member_name,
          gymId: p.gym_id,
          paymentDate: p.payment_date
        })) || []);
      }
    } catch (err) {
      console.error("Data fetch failed:", err);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const addGym = async (gymData: any, password?: string) => {
    const { data: newGym, error: gymError } = await supabase
      .from('gyms')
      .insert([{ 
        name: gymData.name,
        owner_phone: gymData.ownerPhone,
        status: 'Active', 
        subscription_status: 'Active',
        subscription_start_date: gymData.subscriptionStartDate,
        subscription_end_date: gymData.subscriptionEndDate,
        total_paid_amount: gymData.totalPaidAmount
      }])
      .select()
      .single();

    if (newGym && !gymError) {
      const email = `${gymData.ownerPhone}@gymstack.com`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: password || 'gym123'
      });

      if (authData.user && !authError) {
        await supabase.from('profiles').insert([{
          id: authData.user.id,
          phone: gymData.ownerPhone,
          role: UserRole.GYM_OWNER,
          gym_id: newGym.id
        }]);
      }
      fetchData();
    }
  };

  const updateGym = async (updatedGym: any) => {
    await supabase.from('gyms').update({
      name: updatedGym.name,
      owner_phone: updatedGym.ownerPhone,
      status: updatedGym.status,
      subscription_status: updatedGym.subscriptionStatus,
      subscription_start_date: updatedGym.subscriptionStartDate,
      subscription_end_date: updatedGym.subscriptionEndDate,
      total_paid_amount: updatedGym.totalPaidAmount,
      payment_history: updatedGym.paymentHistory
    }).eq('id', updatedGym.id);
    fetchData();
  };

  const addMember = async (newMember: any) => {
    const { data: member, error } = await supabase
      .from('members')
      .insert([{ 
        gym_id: currentUser?.gymId,
        name: newMember.name,
        email: newMember.email,
        phone: newMember.phone,
        plan_start: newMember.planStart,
        plan_duration_days: newMember.planDurationDays,
        fees_amount: newMember.feesAmount,
        fees_status: newMember.feesStatus,
        photo: newMember.photo
      }])
      .select()
      .single();
    
    if (member && newMember.feesStatus === PaymentStatus.PAID) {
       await supabase.from('payments').insert([{
         gym_id: currentUser?.gymId,
         member_id: member.id,
         member_name: member.name,
         amount: newMember.feesAmount,
         payment_date: new Date().toISOString().split('T')[0],
         note: 'Initial Registration Payment'
       }]);
    }
    fetchData();
  };

  const updateMember = async (m: any) => {
    await supabase.from('members').update({
      name: m.name,
      email: m.email,
      phone: m.phone,
      plan_start: m.planStart,
      plan_duration_days: m.planDurationDays,
      fees_amount: m.feesAmount,
      fees_status: m.feesStatus,
      photo: m.photo
    }).eq('id', m.id);
    fetchData();
  };

  const deleteMember = async (id: any) => {
    await supabase.from('members').delete().eq('id', id);
    fetchData();
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center text-white">
        <div>
          <h1 className="text-2xl font-bold mb-4">Configuration Missing</h1>
          <p className="text-slate-400">Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to environment.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Login onLogin={() => {}} />
        <div className="fixed bottom-10 left-0 right-0 flex justify-center">
           <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full text-center">
              <button 
                onClick={handleBootstrap}
                className="text-xs font-bold text-brand hover:underline"
              >
                {bootstrapStatus || 'Need to initialize first Super Admin? Click here.'}
              </button>
           </div>
        </div>
      </div>
    );
  }

  if (currentUser.role === UserRole.SUPER_ADMIN) {
    return (
      <SuperAdminDashboard
        user={currentUser}
        gyms={gyms}
        members={members}
        onLogout={handleLogout}
        onToggleGymStatus={async (id, status) => {
          await supabase.from('gyms').update({ status: status === 'Active' ? 'Suspended' : 'Active' }).eq('id', id);
          fetchData();
        }}
        onAddGym={addGym}
        onUpdateGym={updateGym}
      />
    );
  }

  const currentGym = gyms[0];
  if (!currentGym) return <div className="p-10 text-center font-bold">Gym account not found.</div>;

  return (
    <DashboardLayout 
      user={currentUser} 
      onLogout={handleLogout} 
      pageTitle={activeView === 'earnings' ? 'Earnings' : activeView === 'staff' ? 'Staff' : currentGym.name}
      activeView={activeView}
      onViewChange={setActiveView}
    >
      {activeView === 'dashboard' && (
        <GymOwnerDashboard
          user={currentUser}
          gym={currentGym}
          members={members}
          onLogout={handleLogout}
          onAddMember={addMember}
          onUpdateMember={updateMember}
          onDeleteMember={deleteMember}
        />
      )}
      {activeView === 'earnings' && (
        <GymEarnings gym={currentGym} members={members} payments={memberPayments} />
      )}
      {activeView === 'staff' && (
        <StaffManagement
          gym={currentGym}
          staff={[]} 
          onAddTrainer={() => {}}
          onUpdateTrainer={() => {}}
          onDeleteUser={() => {}}
        />
      )}
    </DashboardLayout>
  );
};

export default App;
