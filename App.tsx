
import React, { useState, useEffect, useCallback } from 'react';
import { User, Gym, Member, UserRole, GymStatus, MemberPayment, PaymentStatus, SubscriptionStatus } from './types';
import { supabase, phoneToEmail } from './lib/supabase';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import GymOwnerDashboard from './pages/GymOwnerDashboard';
import GymEarnings from './pages/GymEarnings';
import StaffManagement from './pages/StaffManagement';
import DashboardLayout from './components/DashboardLayout';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberPayments, setMemberPayments] = useState<MemberPayment[]>([]);
  const [activeView, setActiveView] = useState<string>('dashboard');

  // Check for existing session on mount
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
  }, []);

  // Fetch Data when user is logged in
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      // Fetch Gyms
      let gymQuery = supabase.from('gyms').select('*');
      if (currentUser.role !== UserRole.SUPER_ADMIN) {
        gymQuery = gymQuery.eq('id', currentUser.gymId);
      }
      const { data: gymsData } = await gymQuery;
      
      // Transform DB snake_case to CamelCase for the UI
      const formattedGyms = (gymsData || []).map(g => ({
        id: g.id,
        name: g.name,
        ownerPhone: g.owner_phone,
        status: g.status as GymStatus,
        subscriptionStatus: g.subscription_status as SubscriptionStatus,
        subscriptionStartDate: g.subscription_start_date,
        subscriptionEndDate: g.subscription_end_date,
        totalPaidAmount: g.total_paid_amount,
        paymentHistory: [] // History fetched separately if needed
      }));
      setGyms(formattedGyms);

      // Fetch Members
      const { data: membersData } = await supabase.from('members').select('*');
      const formattedMembers = (membersData || []).map(m => ({
        id: m.id,
        gymId: m.gym_id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        planStart: m.plan_start,
        planDurationDays: m.plan_duration_days,
        feesAmount: m.fees_amount,
        feesStatus: m.fees_status as PaymentStatus,
        photo: m.photo_url
      }));
      setMembers(formattedMembers);

      // Fetch Payments
      const { data: paymentsData } = await supabase.from('member_payments').select('*');
      setMemberPayments((paymentsData || []).map(p => ({
        id: p.id,
        memberId: p.member_id,
        memberName: p.member_name,
        gymId: p.gym_id,
        amount: p.amount,
        paymentDate: p.payment_date,
        note: p.note
      })));
    };

    fetchData();
  }, [currentUser]);

  const handleLogin = async (phone: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: phoneToEmail(phone),
      password: password,
    });

    if (error) throw error;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profile) {
      setCurrentUser({
        id: profile.id,
        phone: profile.phone,
        role: profile.role as UserRole,
        gymId: profile.gym_id
      });
      setActiveView('dashboard');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const handleAddMember = async (memberData: Omit<Member, 'id'>) => {
    const { data, error } = await supabase.from('members').insert({
      gym_id: currentUser?.gymId,
      name: memberData.name,
      email: memberData.email,
      phone: memberData.phone,
      plan_start: memberData.planStart,
      plan_duration_days: memberData.planDurationDays,
      fees_amount: memberData.feesAmount,
      fees_status: memberData.feesStatus,
      photo_url: memberData.photo
    }).select().single();

    if (error) throw error;

    if (memberData.feesStatus === PaymentStatus.PAID) {
      await supabase.from('member_payments').insert({
        member_id: data.id,
        member_name: data.name,
        gym_id: currentUser?.gymId,
        amount: data.fees_amount,
        note: 'Initial Registration'
      });
    }
    
    window.location.reload(); // Refresh to update state
  };

  const handleDeleteMember = async (id: number) => {
    await supabase.from('members').delete().eq('id', id);
    setMembers(members.filter(m => m.id !== id));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
    </div>
  );

  if (!currentUser) return <Login onLogin={handleLogin} />;

  const currentGym = gyms.find(g => g.id === currentUser.gymId);

  return (
    <div className="min-h-screen bg-slate-50">
      {currentUser.role === UserRole.SUPER_ADMIN ? (
        <SuperAdminDashboard 
          user={currentUser} 
          gyms={gyms} 
          members={members} 
          onLogout={handleLogout}
          onToggleGymStatus={async (id, status) => {
            const next = status === GymStatus.ACTIVE ? GymStatus.SUSPENDED : GymStatus.ACTIVE;
            await supabase.from('gyms').update({ status: next }).eq('id', id);
            window.location.reload();
          }}
          onAddGym={async (data) => {
            // New Gym Logic...
          }}
          onUpdateGym={async (data) => {
             // Update Gym Logic...
          }}
        />
      ) : (
        <DashboardLayout 
          user={currentUser} 
          onLogout={handleLogout} 
          pageTitle={currentGym?.name || 'My Gym'} 
          activeView={activeView}
          onViewChange={setActiveView}
        >
          {activeView === 'dashboard' && (
            <GymOwnerDashboard 
              user={currentUser} 
              gym={currentGym!} 
              members={members} 
              onLogout={handleLogout}
              onAddMember={handleAddMember}
              onUpdateMember={async (m) => {
                 await supabase.from('members').update({
                   name: m.name,
                   fees_status: m.feesStatus,
                   phone: m.phone
                 }).eq('id', m.id);
                 window.location.reload();
              }}
              onDeleteMember={handleDeleteMember}
            />
          )}
          {activeView === 'earnings' && (
            <GymEarnings 
              gym={currentGym!} 
              members={members} 
              payments={memberPayments.filter(p => p.gymId === currentUser.gymId)} 
            />
          )}
          {activeView === 'staff' && (
            <StaffManagement 
              gym={currentGym!} 
              staff={[]} // Logic for fetching profile-based staff
              onAddTrainer={() => {}}
              onUpdateTrainer={() => {}}
              onDeleteUser={() => {}}
            />
          )}
        </DashboardLayout>
      )}
    </div>
  );
};

export default App;
