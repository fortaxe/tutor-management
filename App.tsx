
import React, { useState, useCallback, useEffect } from 'react';
import { User, Gym, Member, UserRole, GymStatus, MemberPayment, PaymentStatus, SubscriptionStatus } from './types';
import { supabase, isSupabaseConfigured, SUPER_ADMIN_PHONE, SUPER_ADMIN_PASSWORD } from './supabaseClient';
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

  // --- Bootstrap Admin Utility ---
  const handleBootstrap = async () => {
    setBootstrapStatus('Initializing Super Admin...');
    try {
      const phone = SUPER_ADMIN_PHONE;
      const email = `${phone}@gymstack.com`;
      const password = SUPER_ADMIN_PASSWORD;

      // 1. Attempt to Sign Up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      // Handle "user already exists" gracefully
      if (authError) {
        if (authError.message.includes('already registered')) {
          setBootstrapStatus('User exists in Auth. Linking profile...');
          
          // Verify if profile exists, if not, create it
          const { data: profile } = await supabase.from('profiles').select('*').eq('phone', phone).single();
          
          if (!profile) {
            // Need the ID from auth.users (requires being logged in or admin access, 
            // but we can try getting session if they just signed up or use user object if available)
            // If they are already registered, we suggest they just try logging in.
            setBootstrapStatus(`Admin ${phone} already configured. Please login.`);
            return;
          }
          setBootstrapStatus('Configuration verified. Please login.');
          return;
        }
        throw authError;
      }

      if (authData.user) {
        // 2. Create the Database Profile
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: authData.user.id,
          phone: phone,
          role: UserRole.SUPER_ADMIN
        }]);

        if (profileError) throw profileError;
        
        setBootstrapStatus(`Success! Login with ${phone} / ${password.replace(/./g, '*')}`);
      }
    } catch (err: any) {
      setBootstrapStatus(`Setup Failed: ${err.message || 'Unknown error'}`);
      console.error(err);
    }
  };

  // --- Configuration Check ---
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-800 p-10 rounded-[3rem] border border-slate-700 shadow-2xl">
          <div className="w-16 h-16 bg-brand/20 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse">
            <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Core Setup Required</h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Your application is not connected to a database. Please add these variables to your Vercel project:
          </p>
          
          <div className="space-y-4 text-left bg-slate-950 p-6 rounded-2xl border border-slate-700 font-mono text-[10px] mb-8 overflow-x-auto">
            <div className="flex justify-between items-center group">
              <p className="text-slate-500 uppercase font-black tracking-tighter">Required</p>
            </div>
            <p className="text-brand">VITE_SUPABASE_URL</p>
            <p className="text-brand">VITE_SUPABASE_ANON_KEY</p>
            
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <p className="text-slate-500 uppercase font-black tracking-tighter">Optional (Admin Seeding)</p>
            </div>
            <p className="text-blue-400">VITE_SUPER_ADMIN_PHONE</p>
            <p className="text-blue-400">VITE_SUPER_ADMIN_PASSWORD</p>
          </div>

          <p className="text-slate-500 text-[10px] italic">
            Dashboard will auto-refresh upon configuration.
          </p>
        </div>
      </div>
    );
  }

  // --- Auth & Data Handling ---
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
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
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
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
        <div className="fixed bottom-10 left-0 right-0 flex justify-center p-4">
           <div className="bg-white/90 backdrop-blur-xl px-8 py-5 rounded-[2rem] border border-slate-200 shadow-2xl max-w-sm w-full text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">System Provisioning</p>
              <button 
                onClick={handleBootstrap}
                className="text-xs font-bold text-brand hover:underline transition-all active:scale-95"
              >
                {bootstrapStatus || 'Provision Super Admin Access'}
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
