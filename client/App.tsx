
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Tutor, UserRole, TutorStatus, Student, StudentPayment } from './types';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import TutorDashboard from './pages/TutorDashboard';
import TutorEarnings from './pages/TutorEarnings';
import StaffManagement from './pages/StaffManagement';
import DashboardLayout from './components/DashboardLayout';
import Toast from './components/Toast';
import client from './lib/client';
import { objectToFormData } from './lib/utils';
import { useMyTutor } from './hooks/useMyTutor';
import DemoPage from './pages/DemoPage';
import OwnerProfile from './pages/OwnerProfile';
import ChangePasswordDrawer from './components/ChangePasswordDrawer';


import { Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

const STORAGE_KEY = 'tutor_mgmt_session';
const SESSION_EXPIRY_DAYS = 30;

// Main App Component with all dashboard logic
const MainApp: React.FC = () => {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Security Modal State
  const [isChangePassOpen, setChangePassOpen] = useState(false);

  // Initial View State - syncing with URL if possible or default
  // const [activeView, setActiveView] = useState<string>('dashboard'); -> Removed


  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  // --- Auth State ---
  const [loginError, setLoginError] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { user, expiry } = JSON.parse(saved);
        if (Date.now() < expiry) return user;
        localStorage.removeItem(STORAGE_KEY);
      } catch {
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
  const { data: tutors = [], isLoading: tutorsLoading } = useQuery({
    queryKey: ['tutors'],
    queryFn: async () => {
      const res = await client.get('/tutors');
      return res.data;
    },
    enabled: currentUser?.role === UserRole.SUPER_ADMIN,
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['students', currentUser?.role === UserRole.SUPER_ADMIN ? 'all' : currentUser?.tutorId],
    queryFn: async () => {
      const params = currentUser?.role === UserRole.SUPER_ADMIN ? {} : { tutorId: currentUser?.tutorId };
      const res = await client.get('/students', { params });
      return res.data;
    },
    enabled: !!currentUser && (currentUser.role === UserRole.SUPER_ADMIN || !!currentUser.tutorId),
  });

  const { data: staff = [], isLoading: staffLoading } = useQuery({
    queryKey: ['staff', currentUser?.tutorId],
    queryFn: async () => {
      const res = await client.get(`/staff?tutorId=${currentUser?.tutorId}`);
      return res.data;
    },
    enabled: !!currentUser?.tutorId,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<StudentPayment[]>({
    queryKey: ['payments', currentUser?.tutorId],
    queryFn: async () => {
      const res = await client.get(`/payments?tutorId=${currentUser?.tutorId}`);
      return res.data;
    },
    enabled: !!currentUser?.tutorId,
  });

  const { data: myTutor, isLoading: tutorLoading } = useMyTutor(currentUser);

  // Validate User Session Periodically
  useQuery({
    queryKey: ['validateUser', currentUser?._id],
    queryFn: async () => {
      if (!currentUser?._id) return null;
      try {
        await client.get(`/users/${currentUser._id}`);
        return true;
      } catch (error: any) {
        if (error.response?.status === 404) {
          handleLogout();
          // Optional: You might want to show a toast, but handleLogout clears state so toast might disappear 
          // or React might unmount everything. But since toast state is local to MainApp, and MainApp re-renders 
          // with currentUser=null which shows Login page, the toast might be lost.
          // However, the priority is to logout.
          return false;
        }
        return true;
      }
    },
    enabled: !!currentUser?._id,
    refetchInterval: 30000, // Check every 30 seconds
    retry: false
  });

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
    onError: (_error: any) => {
      // Set local error instead of showing toast
      setLoginError('Incorrect password. Try again.');
    }
  });

  const addTutorMutation = useMutation({
    mutationFn: async ({ tutor, password }: any) => {
      const res = await client.post('/tutors', { ...tutor, password });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutors'] });
      showToast('Tutor added successfully', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || error.message;
      if (msg.includes('duplicate key') || msg.includes('E11000')) {
        showToast('Tutor Owner Phone/ID already exists!', 'error');
      } else {
        showToast(`Failed to add tutor: ${msg}`, 'error');
      }
    }
  });

  const updateTutorMutation = useMutation({
    mutationFn: async ({ tutor, password }: any) => {
      const formData = objectToFormData({ ...tutor, password });
      const res = await client.patch(`/tutors/${tutor.id}`, formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutors'] });
      queryClient.invalidateQueries({ queryKey: ['myTutor'] });
      showToast('Tutor updated successfully', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || error.message;
      showToast(`Failed to update tutor: ${msg}`, 'error');
    }
  });

  const toggleTutorStatusMutation = useMutation({
    mutationFn: async ({ tutorId, status }: any) => {
      const res = await client.patch(`/tutors/${tutorId}`, { status });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tutors'] })
  });

  const deleteTutorMutation = useMutation({
    mutationFn: async (tutorId: number) => {
      await client.delete(`/tutors/${tutorId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tutors'] })
  });


  const addStudentMutation = useMutation({
    mutationFn: async (student: any) => {
      // Ensure specific fields are correctly passed or defaulted
      const studentData = {
        ...student,
        tutorId: currentUser?.tutorId,
        planDurationMonths: Number(student.planDurationMonths || 0),
        // Any other defaults needed?
      }
      const formData = objectToFormData(studentData);
      const res = await client.post('/students', formData);
      return res.data;
    },
    onMutate: async (newStudent) => {
      const queryKey = ['students', currentUser?.tutorId];
      await queryClient.cancelQueries({ queryKey });
      const previousStudents = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: any[]) => [
        {
          ...newStudent,
          id: Date.now(),
          _id: 'temp-' + Date.now(),
          tutorId: currentUser?.tutorId,
          feesAmount: Number(newStudent.feesAmount),
          paidAmount: Number(newStudent.paidAmount)
        },
        ...(old || [])
      ]);
      return { previousStudents };
    },
    onSuccess: () => {
      showToast('Student added successfully', 'success');
    },
    onError: (error: any, _newStudent, context) => {
      if (context?.previousStudents) {
        queryClient.setQueryData(['students', currentUser?.tutorId], context.previousStudents);
      }
      const msg = error.response?.data?.error || error.message;
      if (msg.includes('duplicate key') || msg.includes('E11000')) {
        showToast('Student with this phone number already exists!', 'error');
      } else {
        showToast(`Failed to add student: ${msg}`, 'error');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  });

  const updateStudentMutation = useMutation({
    mutationFn: async (student: any) => {
      const formData = objectToFormData(student);
      // We use _id because sending FormData with patches sometimes can be tricky if id is in body, 
      // but here we use URL param which is fine.
      const res = await client.patch(`/students/${student._id}`, formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      showToast('Student updated successfully', 'success');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || error.message;
      if (msg.includes('duplicate key') || msg.includes('E11000')) {
        showToast('Update failed: Phone number already in use!', 'error');
      } else {
        showToast(`Failed to update student: ${msg}`, 'error');
      }
    }
  });

  const renewStudentMutation = useMutation({
    // Using any for variable type to handle potential ID format mismatches between mock and server data
    mutationFn: async ({ studentId, renewalData }: any) => {
      const res = await client.post(`/students/${studentId}/renew`, { renewalData });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  });

  const deleteStudentMutation = useMutation({
    // Changed id type from string to any to prevent number vs string assignment errors
    mutationFn: async (id: any) => {
      await client.delete(`/students/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] })
  });

  const addStaffMutation = useMutation({
    mutationFn: async (trainerData: any) => {
      const res = await client.post('/staff', { ...trainerData, tutorId: currentUser?.tutorId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      showToast('Assistant added successfully', 'success');
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
      if (currentUser?.role === UserRole.TUTOR) {
        await client.patch(`/tutors/${currentUser.tutorId}`, { password });
      } else if (currentUser?.role === UserRole.ASSISTANT || currentUser?.role === UserRole.SUPER_ADMIN) {
        await client.patch(`/staff/${currentUser._id}`, { password });
      }
    },
    onSuccess: () => showToast('Password updated successfully', 'success'),
    onError: (_err: any) => showToast('Failed to update password', 'error')
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

  const isAssistant = currentUser.role === UserRole.ASSISTANT;
  const currentTutor = myTutor || tutors.find(t => t.id === currentUser.tutorId);

  if (currentUser.role === UserRole.SUPER_ADMIN) {
    return (
      <>
        <SuperAdminDashboard
          user={currentUser}
          tutors={tutors}
          students={students}
          onLogout={handleLogout}
          onToggleTutorStatus={(id, status) => toggleTutorStatusMutation.mutate({ tutorId: id, status: status === TutorStatus.ACTIVE ? TutorStatus.SUSPENDED : TutorStatus.ACTIVE })}
          onDeleteTutor={(id) => deleteTutorMutation.mutate(id)}
          onAddTutor={(tutor, password) => addTutorMutation.mutate({ tutor, password })}
          onUpdateTutor={(tutor, password) => updateTutorMutation.mutate({ tutor, password })}
          onOpenChangePass={() => setChangePassOpen(true)}
        />

        <ChangePasswordDrawer
          isOpen={isChangePassOpen}
          onClose={() => setChangePassOpen(false)}
          onUpdate={(pwd) => changePasswordMutation.mutate(pwd)}
          isLoading={changePasswordMutation.isPending}
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



  return (
    <DashboardLayout
      user={currentUser}
      onLogout={handleLogout}
      pageTitle={currentTutor?.name || 'Overview'}
      onOpenChangePass={() => setChangePassOpen(true)}
      tutorName={currentTutor?.name}
      tutorLogo={currentTutor?.logo}
    >
      <Routes>
        <Route path="/" element={
          <TutorDashboard
            user={currentUser}
            tutor={currentTutor || { name: 'Loading...' } as Tutor}
            students={students}
            onLogout={handleLogout}
            onAddStudent={(s) => addStudentMutation.mutateAsync(s)}
            onUpdateStudent={(s) => updateStudentMutation.mutateAsync(s)}
            onRenewStudent={(id, renewalData) => renewStudentMutation.mutateAsync({ studentId: id, renewalData })}
            onDeleteStudent={(id) => deleteStudentMutation.mutate(id)}
          />
        } />

        <Route path="/earnings" element={
          !isAssistant ? (
            <TutorEarnings
              tutor={currentTutor || {} as Tutor}
              students={students}
              payments={payments}
            />
          ) : <Navigate to="/" replace />
        } />

        <Route path="/staff" element={
          currentUser.role !== UserRole.ASSISTANT ? (
            <StaffManagement
              tutor={currentTutor || {} as Tutor}
              staff={staff}
              onAddAssistant={(t: any) => addStaffMutation.mutate(t)}
              onUpdateAssistant={(t: any) => updateStaffMutation.mutate(t)}
              onDeleteUser={(id) => deleteStaffMutation.mutate(id)}
            />
          ) : <Navigate to="/" replace />
        } />

        <Route path="/profile" element={
          currentUser.role === UserRole.ASSISTANT ? <Navigate to="/" replace /> :
            tutorLoading ? <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div> :
              currentTutor ? (
                <OwnerProfile
                  tutor={currentTutor}
                  user={currentUser!}
                  onChangePasswordRequest={() => setChangePassOpen(true)}
                  onUpdateTutor={(tutorData: any) => updateTutorMutation.mutate({ tutor: { id: currentTutor.id, ...tutorData } })}
                  isLoading={updateTutorMutation.isPending}
                />
              ) : <Navigate to="/" replace />
        } />
      </Routes>

      {/* Subscription Expired / Suspended Block - Global Overlay */}
      {(currentUser.role === UserRole.TUTOR || currentUser.role === UserRole.ASSISTANT) && currentTutor && (
        (() => {
          const today = new Date().toISOString().split('T')[0];
          // Use currentTutor data which is fresh from the API
          const isExpired = currentTutor.subscriptionEndDate && currentTutor.subscriptionEndDate < today;
          const isInactive = currentTutor.status !== TutorStatus.ACTIVE;

          if (isInactive || isExpired) {
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-red-100 animate-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Subscription Expired</h2>
                  <p className="text-slate-500 mb-8 leading-relaxed">
                    Your tutor subscription plan is currently Expired.
                    Access to the dashboard has been restricted.
                  </p>
                  <div className="bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Contact Administrator</p>
                    <a href="tel:+919676675576" className="text-lg font-black text-yellow-600 hover:underline">+91 96766 75576</a>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
                  >
                    Logout
                  </button>
                </div>
              </div>
            );
          }
          return null;
        })()
      )}

      {(tutorsLoading || studentsLoading || staffLoading || paymentsLoading) && (
        <div className="fixed bottom-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg border border-slate-100 flex items-center space-x-2 animate-pulse-subtle">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
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

      <ChangePasswordDrawer
        isOpen={isChangePassOpen}
        onClose={() => setChangePassOpen(false)}
        onUpdate={(pwd) => changePasswordMutation.mutate(pwd)}
        isLoading={changePasswordMutation.isPending}
      />
    </DashboardLayout>
  );
};


const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
      <Analytics />
    </>
  );
};


export default App;