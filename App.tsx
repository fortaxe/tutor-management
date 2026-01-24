
import React, { useState, useEffect } from 'react';
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
  const [initError, setInitError] = useState<string | null>(null);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberPayments, setMemberPayments] = useState<MemberPayment[]>([]);
  const [staffProfiles, setStaffProfiles] = useState<User[]>([]);
  const [activeView, setActiveView] = useState<string>('dashboard');

  // Check for existing session on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error("Profile fetch error:", profileError);
            // If profile fails but session exists, we might have an RLS issue or missing profile
            // Let's sign out to be safe and allow fresh login
            await supabase.auth.signOut();
            setCurrentUser(null);
          } else if (profile) {
            setCurrentUser({
              id: profile.id,
              phone: profile.phone,
              role: profile.role as UserRole,
              gymId: profile.gym_id
            });
          }
        }
      } catch (err: any) {
        console.error('Initialization error:', err);
        if (err.message !== 'FetchError' && !err.message?.includes('JWT')) {
           setInitError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  // Fetch Data when user is logged in
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        // 1. Fetch Gyms
        let gymQuery = supabase.from('gyms').select('*').order('created_at', { ascending: false });
        if (currentUser.role !== UserRole.SUPER_ADMIN) {
          gymQuery = gymQuery.eq('id', currentUser.gymId);
        }
        const { data: gymsData, error: gymFetchError } = await gymQuery;
        if (gymFetchError) throw gymFetchError;
        
        const formattedGyms = (gymsData || []).map(g => ({
          id: g.id,
          name: g.name,
          ownerPhone: g.owner_phone,
          status: g.status as GymStatus,
          subscriptionStatus: g.subscription_status as SubscriptionStatus,
          subscriptionStartDate: g.subscription_start_date,
          subscriptionEndDate: g.subscription_end_date,
          totalPaidAmount: g.total_paid_amount,
          paymentHistory: []
        }));
        setGyms(formattedGyms);

        // 2. Fetch Members
        const { data: membersData } = await supabase.from('members').select('*');
        const formattedMembers = (membersData || []).map(m => ({
          id: m.id,
          gymId: m.gym_id,
          name: m.name,
          email: m.email,
          phone: m.phone,
          planStart: m.plan_start,
          plan_duration_days: m.plan_duration_days,
          fees_amount: m.fees_amount,
          fees_status: m.fees_status as PaymentStatus,
          photo: m.photo_url
        }));
        // Note: The mapping here needs to match type Member interface exactly
        setMembers((membersData || []).map(m => ({
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
        })));

        // 3. Fetch Payments
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

        // 4. Fetch Profiles (Staff) for current gym
        if (currentUser.gymId) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('*')
            .eq('gym_id', currentUser.gymId);
          
          setStaffProfiles((profilesData || []).map(p => ({
            id: p.id,
            phone: p.phone,
            role: p.role as UserRole,
            gymId: p.gym_id
          })));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleLogin = async (phone: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: phoneToEmail(phone),
      password: password,
    });

    if (error) throw error;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

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
    
    window.location.reload();
  };

  const handleDeleteMember = async (id: number) => {
    await supabase.from('members').delete().eq('id', id);
    setMembers(members.filter(m => m.id !== id));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand mb-4"></div>
        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Gym Stack...</p>
      </div>
    </div>
  );

  if (initError) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-red-100 text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-black text-slate-900 mb-2 uppercase">Connection Error</h2>
        <p className="text-slate-500 text-sm mb-6">{initError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest"
        >
          Try Again
        </button>
      </div>
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
          onAddGym={async (gymData, password) => {
            try {
              // 1. Create Gym record
              const { data: newGym, error: gymError } = await supabase.from('gyms').insert({
                name: gymData.name,
                owner_phone: gymData.ownerPhone,
                status: gymData.status,
                subscription_status: gymData.subscriptionStatus,
                subscription_start_date: gymData.subscriptionStartDate,
                subscription_end_date: gymData.subscriptionEndDate,
                total_paid_amount: gymData.totalPaidAmount
              }).select().single();

              if (gymError) throw gymError;

              // 2. Create Auth User with role in metadata
              if (password) {
                const { data: authData, error: authError } = await supabase.auth.signUp({
                  email: phoneToEmail(gymData.ownerPhone),
                  password: password,
                  options: {
                    data: {
                      role: UserRole.GYM_OWNER,
                      phone: gymData.ownerPhone
                    }
                  }
                });

                if (authError) throw authError;

                if (authData.user) {
                  // 3. Link Profile
                  const { error: profileError } = await supabase.from('profiles').upsert({
                    id: authData.user.id,
                    phone: gymData.ownerPhone,
                    role: UserRole.GYM_OWNER,
                    gym_id: newGym.id
                  });
                  if (profileError) throw profileError;
                }
              }
              
              alert("Gym and Owner account created successfully!");
              window.location.reload();
            } catch (err: any) {
              console.error(err);
              alert("Error adding gym: " + err.message);
            }
          }}
          onUpdateGym={async (gymData, password) => {
            try {
              const { error: gymError } = await supabase.from('gyms').update({
                name: gymData.name,
                owner_phone: gymData.ownerPhone,
                status: gymData.status,
                subscription_status: gymData.subscriptionStatus,
                subscription_start_date: gymData.subscriptionStartDate,
                subscription_end_date: gymData.subscriptionEndDate,
                total_paid_amount: gymData.totalPaidAmount
              }).eq('id', gymData.id);

              if (gymError) throw gymError;
              window.location.reload();
            } catch (err: any) {
              console.error(err);
              alert("Error updating gym: " + err.message);
            }
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
              staff={staffProfiles} 
              onAddTrainer={async (data) => {
                try {
                  const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: phoneToEmail(data.phone),
                    password: data.password || 'Trainer123',
                    options: {
                      data: {
                        role: UserRole.TRAINER,
                        phone: data.phone
                      }
                    }
                  });
                  if (authError) throw authError;
                  if (authData.user) {
                    await supabase.from('profiles').insert({
                      id: authData.user.id,
                      phone: data.phone,
                      role: UserRole.TRAINER,
                      gym_id: currentUser.gymId
                    });
                  }
                  window.location.reload();
                } catch (err: any) {
                  alert("Error creating trainer: " + err.message);
                }
              }}
              onUpdateTrainer={() => {}}
              onDeleteUser={async (id) => {
                const { error } = await supabase.from('profiles').delete().eq('id', id);
                if (error) alert(error.message);
                else window.location.reload();
              }}
            />
          )}
        </DashboardLayout>
      )}
    </div>
  );
};

export default App;
