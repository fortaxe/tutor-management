
import React, { useState, useCallback, useEffect } from 'react';
import { User, Gym, Member, UserRole, GymStatus, MemberPayment, PaymentStatus, SubscriptionStatus } from './types';
import { supabase } from './supabaseClient';
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

  // --- Auth Listener ---
  useEffect(() => {
    const checkUser = async () => {
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
      setLoading(false);
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
      // Supabase Auth requires an email. We'll simulate with phone@gymstack.com
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
    // If password provided, you'd handle Auth update (omitted for brevity)
    fetchData();
  };

  const addMember = async (newMember: any) => {
    const { data: member, error } = await supabase
      .from('members')
      .insert([{ ...newMember, gym_id: currentUser?.gymId }])
      .select()
      .single();
    
    if (member && newMember.fees_status === 'Paid') {
       await supabase.from('payments').insert([{
         gym_id: currentUser?.gymId,
         member_id: member.id,
         member_name: member.name,
         amount: member.fees_amount,
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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-brand uppercase tracking-widest animate-pulse">Initializing Cloud Sync...</div>;

  if (!currentUser) return <Login onLogin={() => {}} />; // Login now handles its own auth

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
  if (!currentGym) return <div>Gym access error.</div>;

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
      {/* Staff management would similarly interact with 'profiles' table */}
    </DashboardLayout>
  );
};

export default App;
