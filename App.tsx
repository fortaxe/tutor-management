
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

  // --- Bootstrap Admin Utility ---
  const handleBootstrap = async () => {
    setBootstrapStatus('Creating account...');
    try {
      const phone = '9999999999';
      const email = `${phone}@gymstack.com`;
      const password = 'admin'; // Default password for bootstrap

      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create Profile
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: authData.user.id,
          phone: phone,
          role: UserRole.SUPER_ADMIN
        }]);

        if (profileError) throw profileError;
        
        setBootstrapStatus('Success! Login with 9999999999 / admin');
      }
    } catch (err: any) {
      setBootstrapStatus(`Error: ${err.message || 'Bootstrap failed'}`);
    }
  };

  // --- Configuration Check ---
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
          <div className="w-16 h-16 bg-brand/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⚙️</span>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Setup Required</h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Please add your Supabase environment variables in Vercel settings:
          </p>
          <div className="space-y-3 text-left bg-slate-950 p-4 rounded-xl border border-slate-700 font-mono text-xs mb-6">
            <p className="text-brand">VITE_SUPABASE_URL</p>
            <p className="text-brand">VITE_SUPABASE_ANON_KEY</p>
          </div>
          <p className="text-slate-500 text-xs italic">
            App will automatically refresh once configured.
          </p>
        </div>
      </div>
    );
  }

  // --- Auth Listener ---
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
          } else {
            // Profile missing despite having Auth session
            console.warn("Auth session exists but no profile found.");
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

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    if (!currentUser) return;

    try {
      if (currentUser.role === UserRole.SUPER_ADMIN) {
        const { data: gymsData } = await supabase.from('gyms').select('*').order('created_at', { ascending: false });
        const { data: membersData } = await supabase.from('members').select('*');
        setGyms(gymsData || []);
        setMembers(membersData || []);
      } else {
        const { data: gymsData } = await supabase.from('gyms').select('*').eq('id', currentUser.gymId);
        const { data: membersData } = await supabase.from('members').select('*').eq('gym_id', currentUser.gymId);
        const { data: paymentsData } = await supabase.from('payments').select('*').eq('gym_id', currentUser.gymId);
        
        setGyms(gymsData || []);
        setMembers(membersData || []);
        setMemberPayments(paymentsData || []);
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
      .insert([{ ...gymData, status: 'Active', subscription_status: 'Active' }])
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

  const updateGym = async (updatedGym: any, password?: string) => {
    await supabase.from('gyms').update(updatedGym).eq('id', updatedGym.id);
    fetchData();
  };

  const addMember = async (newMember: any) => {
    const { data: member, error } = await supabase
      .from('members')
      .insert([{ ...newMember, gym_id: currentUser?.gymId }])
      .select()
      .single();
    
    if (member && newMember.feesStatus === PaymentStatus.PAID) {
       await supabase.from('payments').insert([{
         gym_id: currentUser?.gymId,
         member_id: member.id,
         member_name: member.name,
         amount: member.fees_amount || member.feesAmount,
         payment_date: new Date().toISOString().split('T')[0],
         note: 'Initial Payment'
       }]);
    }
    fetchData();
  };

  const updateMember = async (m: any) => {
    await supabase.from('members').update(m).eq('id', m.id);
    fetchData();
  };

  const deleteMember = async (id: any) => {
    await supabase.from('members').delete().eq('id', id);
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-black text-slate-900 uppercase tracking-widest text-xs">Syncing with Cloud...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Login onLogin={() => {}} />
        <div className="fixed bottom-10 left-0 right-0 flex justify-center">
           <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">System Recovery</p>
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
  if (!currentGym) return <div className="p-10 text-center font-bold">Gym account not found. Please contact support.</div>;

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
          staff={[]} // Logic needed to fetch profiles where gym_id matches
          onAddTrainer={() => {}}
          onUpdateTrainer={() => {}}
          onDeleteUser={() => {}}
        />
      )}
    </DashboardLayout>
  );
};

export default App;
