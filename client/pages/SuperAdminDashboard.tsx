import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Tutor, Student, TutorStatus, SubscriptionStatus, SubscriptionPayment } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import TutorForm from '../components/TutorForm';
import PaymentForm from '../components/PaymentForm';
import PaymentHistory from '../components/PaymentHistory';
import PlusIcon from '../components/icons/PlusIcon';
import EditIcon from '../components/icons/EditIcon';
import ClockIcon from '../components/icons/ClockIcon';
import SearchIcon from '../components/icons/SearchIcon';
import TrashIcon from '../components/icons/TrashIcon';
import ExclamationTriangleIcon from '../components/icons/ExclamationTriangleIcon';
import LeadsManager from '../components/LeadsManager';

interface SuperAdminDashboardProps {
  user: User;
  tutors: Tutor[];
  students: Student[];
  onLogout: () => void;
  onToggleTutorStatus: (tutorId: number, currentStatus: TutorStatus) => void;
  onDeleteTutor: (tutorId: number) => void;
  onAddTutor: (tutorData: Omit<Tutor, 'id' | 'paymentHistory'>, password?: string) => void;
  onUpdateTutor: (tutor: Tutor, password?: string) => void;
  onOpenChangePass: () => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  user,
  tutors,
  students,
  onLogout,
  onToggleTutorStatus,
  onDeleteTutor,
  onAddTutor,
  onUpdateTutor,
  onOpenChangePass
}) => {
  const [modalType, setModalType] = useState<'add' | 'edit' | 'payment' | 'history' | 'delete' | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const activeView = location.pathname.includes('leads') ? 'leads' : 'dashboard';

  const getStudentCount = React.useCallback((tutorId: number) => {
    return students.filter(student => student.tutorId === tutorId).length;
  }, [students]);

  const totalRevenue = useMemo(() => {
    return tutors.reduce((acc, tutor) => acc + (tutor.totalPaidAmount || 0), 0);
  }, [tutors]);

  const filteredTutors = useMemo(() => {
    return tutors.filter(tutor =>
      tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.ownerPhone.includes(searchQuery)
    );
  }, [tutors, searchQuery]);

  const tutorsWithStudentCount = useMemo(() => {
    return filteredTutors.map(tutor => ({
      ...tutor,
      studentCount: getStudentCount(tutor.id),
    }));
  }, [filteredTutors, getStudentCount]);

  const subscriptionStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return <Badge color="green">Active</Badge>;
      case SubscriptionStatus.PENDING:
        return <Badge color="yellow">Pending</Badge>;
      case SubscriptionStatus.EXPIRED:
        return <Badge color="red">Expired</Badge>;
      default:
        return <Badge color="gray">Unknown</Badge>;
    }
  };

  const tutorStatusBadge = (status: TutorStatus) => {
    switch (status) {
      case TutorStatus.ACTIVE:
        return <Badge color="green">Active</Badge>;
      case TutorStatus.SUSPENDED:
        return <Badge color="red">Suspended</Badge>;
      case TutorStatus.INACTIVE:
        return <Badge color="gray">Inactive</Badge>;
      default:
        return <Badge color="gray">Unknown</Badge>;
    }
  };

  const handleOpenAddModal = () => {
    setSelectedTutor(null);
    setModalType('add');
  };

  const handleOpenEditModal = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setModalType('edit');
  };

  const handleOpenPaymentModal = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setModalType('payment');
  };

  const handleOpenHistoryModal = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setModalType('history');
  };

  const handleOpenDeleteConfirm = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setModalType('delete');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedTutor(null);
  };

  const handleTutorFormSubmit = (tutorData: Omit<Tutor, 'id'> | Tutor, password?: string) => {
    if (selectedTutor) {
      onUpdateTutor({ ...selectedTutor, ...tutorData }, password);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { paymentHistory, ...rest } = tutorData;
      onAddTutor(rest as Omit<Tutor, 'id' | 'paymentHistory'>, password);
    }
    handleCloseModal();
  };

  const handleRecordPayment = (paymentData: Omit<SubscriptionPayment, 'id'>) => {
    if (selectedTutor) {
      const newPayment: SubscriptionPayment = {
        ...paymentData,
        id: Date.now(),
      };
      const updatedTutor: Tutor = {
        ...selectedTutor,
        totalPaidAmount: selectedTutor.totalPaidAmount + paymentData.amount,
        subscriptionStartDate: paymentData.startDate,
        subscriptionEndDate: paymentData.endDate,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        status: TutorStatus.ACTIVE,
        paymentHistory: [...selectedTutor.paymentHistory, newPayment],
      };
      onUpdateTutor(updatedTutor);
    }
    handleCloseModal();
  };

  const confirmDeletion = () => {
    if (selectedTutor) {
      onDeleteTutor(selectedTutor.id);
      handleCloseModal();
    }
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      pageTitle={activeView === 'leads' ? 'Lead Management' : 'Admin Operations'}
      onOpenChangePass={onOpenChangePass}
    >
      {activeView === 'leads' ? (
        <LeadsManager />
      ) : (
        <>
          <div className="flex lg:grid lg:grid-cols-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 gap-4 lg:gap-6 mb-8 no-scrollbar">
            <div className="min-w-[240px] flex-1 bg-white p-5 lg:p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-black flex-shrink-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Tutors</p>
              <p className="text-2xl lg:text-3xl font-extrabold text-slate-900">{tutors.length}</p>
            </div>
            <div className="min-w-[240px] flex-1 bg-white p-5 lg:p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-400 flex-shrink-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
              <p className="text-2xl lg:text-3xl font-extrabold text-slate-900">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="min-w-[240px] flex-1 bg-white p-5 lg:p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-slate-400 flex-shrink-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Students</p>
              <p className="text-2xl lg:text-3xl font-extrabold text-slate-900">{students.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Tutor Management</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Manage tutor subscriptions and platform access</p>
                </div>
                <button
                  onClick={handleOpenAddModal}
                  className="w-full sm:w-auto flex justify-center items-center px-4 py-2 bg-yellow-400 text-black text-sm font-bold rounded-lg hover:bg-yellow-500 transition-colors shadow-sm"
                >
                  <PlusIcon className="w-5 h-5 mr-1.5" /> Add New Tutor
                </button>
              </div>

              <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search tutor name or phone..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Tutor Details</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Subscription</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Billing</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {tutorsWithStudentCount.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">{t.name}</div>
                        <div className="text-xs text-slate-500 font-bold">{t.ownerPhone}</div>
                        <div className="text-[10px] text-black font-bold mt-1 px-1.5 py-0.5 bg-yellow-100 inline-block rounded uppercase tracking-tighter">
                          {t.studentCount} students
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center space-y-1">
                          {tutorStatusBadge(t.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <div className="font-bold text-slate-900">{new Date(t.subscriptionEndDate).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{subscriptionStatusBadge(t.subscriptionStatus)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-extrabold text-slate-900">₹{t.totalPaidAmount.toLocaleString()}</div>
                        <button
                          onClick={() => handleOpenHistoryModal(t)}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-bold uppercase tracking-tighter flex items-center mt-1"
                        >
                          <ClockIcon className="w-3 h-3 mr-0.5" /> History
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleOpenPaymentModal(t)}
                          className="inline-flex items-center px-2.5 py-1 bg-yellow-50 text-black border border-yellow-200 rounded-md hover:bg-yellow-100 transition-colors font-bold text-xs"
                          title="Record Payment"
                        >
                          Renew
                        </button>
                        <button onClick={() => handleOpenEditModal(t)} className="text-slate-600 hover:text-black transition-colors" title="Edit Tutor">
                          <EditIcon className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => onToggleTutorStatus(t.id, t.status)}
                          className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md border ${t.status === TutorStatus.ACTIVE ? 'border-red-100 text-red-600 hover:bg-red-50' : 'border-green-100 text-green-600 hover:bg-green-50'}`}
                        >
                          {t.status === TutorStatus.ACTIVE ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleOpenDeleteConfirm(t)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Delete Tutor"
                        >
                          <TrashIcon className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y divide-gray-100">
              {tutorsWithStudentCount.map((t) => (
                <div key={t.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900">{t.name}</h4>
                      <p className="text-xs text-slate-500 font-bold">{t.ownerPhone}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {tutorStatusBadge(t.status)}
                      {subscriptionStatusBadge(t.subscriptionStatus)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Expires On</p>
                      <p className="text-xs font-bold text-slate-900">{new Date(t.subscriptionEndDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Total Revenue</p>
                      <p className="text-xs font-extrabold text-slate-900">₹{t.totalPaidAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleOpenHistoryModal(t)}
                      className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter flex items-center"
                    >
                      <ClockIcon className="w-3.5 h-3.5 mr-1" /> Payment History
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenPaymentModal(t)}
                        className="px-3 py-1.5 bg-yellow-400 text-black rounded-md font-bold text-xs shadow-sm"
                      >
                        ₹ Pay
                      </button>
                      <button onClick={() => handleOpenEditModal(t)} className="p-1.5 bg-gray-100 text-gray-600 rounded-md border border-gray-200">
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleOpenDeleteConfirm(t)} className="p-1.5 bg-red-50 text-red-600 rounded-md border border-red-100">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {tutorsWithStudentCount.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="font-bold">No tutors found.</p>
              </div>
            )}
          </div>

          <Modal
            isOpen={modalType === 'add' || modalType === 'edit'}
            onClose={handleCloseModal}
            title={selectedTutor ? `Edit ${selectedTutor.name}` : "Add New Tutor"}
          >
            <TutorForm
              key={selectedTutor ? selectedTutor.id : 'new'}
              tutor={selectedTutor}
              onSubmit={handleTutorFormSubmit}
              onCancel={handleCloseModal}
            />
          </Modal>

          <Modal
            isOpen={modalType === 'payment'}
            onClose={handleCloseModal}
            title="Record Subscription Payment"
          >
            <PaymentForm
              onSubmit={handleRecordPayment}
              onCancel={handleCloseModal}
            />
          </Modal>

          <Modal
            isOpen={modalType === 'history'}
            onClose={handleCloseModal}
            title="Payment History"
          >
            <PaymentHistory history={selectedTutor?.paymentHistory || []} />
          </Modal>

          <Modal
            isOpen={modalType === 'delete'}
            onClose={handleCloseModal}
            title="Confirm Deletion"
          >
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2">Are you sure?</h4>
              <p className="text-sm text-slate-500 mb-8 px-4 leading-relaxed">
                This will permanently delete <span className="font-bold text-slate-900">{selectedTutor?.name}</span> and all related data.
              </p>
              <div className="flex gap-4">
                <button onClick={handleCloseModal} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-lg font-bold">Cancel</button>
                <button onClick={confirmDeletion} className="flex-1 py-4 bg-red-600 text-white rounded-lg font-bold">Delete Tutor</button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
