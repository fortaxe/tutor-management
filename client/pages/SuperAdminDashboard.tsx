import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Gym, Member, GymStatus, SubscriptionStatus, SubscriptionPayment } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import GymForm from '../components/GymForm';
import PaymentForm from '../components/PaymentForm';
import PaymentHistory from '../components/PaymentHistory';
import PlusIcon from '../components/icons/PlusIcon';
import EditIcon from '../components/icons/EditIcon';
import ClockIcon from '../components/icons/ClockIcon';
import UserGroupIcon from '../components/icons/UserGroupIcon';
import SearchIcon from '../components/icons/SearchIcon';
import TrashIcon from '../components/icons/TrashIcon';
import ExclamationTriangleIcon from '../components/icons/ExclamationTriangleIcon';
import LeadsManager from '../components/LeadsManager';

interface SuperAdminDashboardProps {
  user: User;
  gyms: Gym[];
  members: Member[];
  onLogout: () => void;
  onToggleGymStatus: (gymId: number, currentStatus: GymStatus) => void;
  onDeleteGym: (gymId: number) => void;
  onAddGym: (gymData: Omit<Gym, 'id' | 'paymentHistory'>, password?: string) => void;
  onUpdateGym: (gym: Gym, password?: string) => void;
  onChangePassword?: (password: string) => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  user,
  gyms,
  members,
  onLogout,
  onToggleGymStatus,
  onDeleteGym,
  onAddGym,
  onUpdateGym,
  onChangePassword
}) => {
  const [modalType, setModalType] = useState<'add' | 'edit' | 'payment' | 'history' | 'delete' | null>(null);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const activeView = location.pathname.includes('leads') ? 'leads' : 'dashboard';

  const getMemberCount = React.useCallback((gymId: number) => {
    return members.filter(member => member.gymId === gymId).length;
  }, [members]);

  const totalRevenue = useMemo(() => {
    return gyms.reduce((acc, gym) => acc + (gym.totalPaidAmount || 0), 0);
  }, [gyms]);

  const filteredGyms = useMemo(() => {
    return gyms.filter(gym =>
      gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.ownerPhone.includes(searchQuery)
    );
  }, [gyms, searchQuery]);

  const gymsWithMemberCount = useMemo(() => {
    return filteredGyms.map(gym => ({
      ...gym,
      memberCount: getMemberCount(gym.id),
    }));
  }, [filteredGyms, getMemberCount]);

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

  const gymStatusBadge = (status: GymStatus) => {
    switch (status) {
      case GymStatus.ACTIVE:
        return <Badge color="green">Active</Badge>;
      case GymStatus.SUSPENDED:
        return <Badge color="red">Suspended</Badge>;
      case GymStatus.INACTIVE:
        return <Badge color="gray">Inactive</Badge>;
      default:
        return <Badge color="gray">Unknown</Badge>;
    }
  };

  const handleOpenAddModal = () => {
    setSelectedGym(null);
    setModalType('add');
  };

  const handleOpenEditModal = (gym: Gym) => {
    setSelectedGym(gym);
    setModalType('edit');
  };

  const handleOpenPaymentModal = (gym: Gym) => {
    setSelectedGym(gym);
    setModalType('payment');
  };

  const handleOpenHistoryModal = (gym: Gym) => {
    setSelectedGym(gym);
    setModalType('history');
  };

  const handleOpenDeleteConfirm = (gym: Gym) => {
    setSelectedGym(gym);
    setModalType('delete');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedGym(null);
  };

  const handleGymFormSubmit = (gymData: Omit<Gym, 'id'> | Gym, password?: string) => {
    if (selectedGym) {
      onUpdateGym({ ...selectedGym, ...gymData }, password);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { paymentHistory, ...rest } = gymData;
      onAddGym(rest as Omit<Gym, 'id' | 'paymentHistory'>, password);
    }
    handleCloseModal();
  };

  const handleRecordPayment = (paymentData: Omit<SubscriptionPayment, 'id'>) => {
    if (selectedGym) {
      const newPayment: SubscriptionPayment = {
        ...paymentData,
        id: Date.now(),
      };
      const updatedGym: Gym = {
        ...selectedGym,
        totalPaidAmount: selectedGym.totalPaidAmount + paymentData.amount,
        subscriptionStartDate: paymentData.startDate,
        subscriptionEndDate: paymentData.endDate,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        status: GymStatus.ACTIVE,
        paymentHistory: [...selectedGym.paymentHistory, newPayment],
      };
      onUpdateGym(updatedGym);
    }
    handleCloseModal();
  };

  const confirmDeletion = () => {
    if (selectedGym) {
      onDeleteGym(selectedGym.id);
      handleCloseModal();
    }
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      pageTitle={activeView === 'leads' ? 'Lead Management' : 'SaaS Admin'}
      onChangePasswordRequest={onChangePassword}
    >
      {activeView === 'leads' ? (
        <LeadsManager />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
            <div className="bg-white p-5 lg:p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-brand-600">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Gyms</p>
              <p className="text-2xl lg:text-3xl font-extrabold text-gray-900">{gyms.length}</p>
            </div>
            <div className="bg-white p-5 lg:p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-600">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Platform Revenue</p>
              <p className="text-2xl lg:text-3xl font-extrabold text-green-700">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-5 lg:p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-600 sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Members Reached</p>
              <p className="text-2xl lg:text-3xl font-extrabold text-gray-900">{members.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Gym Subscriptions Ledger</h3>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">Manage subscriptions and offline records</p>
                </div>
                <button
                  onClick={handleOpenAddModal}
                  className="w-full sm:w-auto flex justify-center items-center px-4 py-2 bg-brand-600 text-white text-sm font-bold rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
                >
                  <PlusIcon className="w-5 h-5 mr-1.5" /> Add Gym
                </button>
              </div>

              <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search gym name or owner mobile..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Gym Details</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Expiry</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Revenue</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {gymsWithMemberCount.map((gym) => (
                    <tr key={gym.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{gym.name}</div>
                        <div className="text-xs text-gray-500 font-bold">{gym.ownerPhone}</div>
                        <div className="text-[10px] text-brand-600 font-bold mt-1 px-1.5 py-0.5 bg-brand-50 inline-block rounded uppercase tracking-tighter">
                          {gym.memberCount} members
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center space-y-1">
                          {gymStatusBadge(gym.status)}
                          {subscriptionStatusBadge(gym.subscriptionStatus)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <div className="font-bold text-gray-900">{new Date(gym.subscriptionEndDate).toLocaleDateString()}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Expires on</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-extrabold text-green-700">₹{gym.totalPaidAmount.toLocaleString()}</div>
                        <button
                          onClick={() => handleOpenHistoryModal(gym)}
                          className="text-[10px] text-brand-600 hover:text-brand-800 font-bold uppercase tracking-tighter flex items-center mt-1"
                        >
                          <ClockIcon className="w-3 h-3 mr-0.5" /> History
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleOpenPaymentModal(gym)}
                          className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 transition-colors font-bold text-xs"
                          title="Record New Payment"
                        >
                          ₹+
                        </button>
                        <button onClick={() => handleOpenEditModal(gym)} className="text-brand-600 hover:text-brand-800 transition-colors" title="Edit Gym">
                          <EditIcon className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => onToggleGymStatus(gym.id, gym.status)}
                          className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md border ${gym.status === GymStatus.ACTIVE ? 'border-red-100 text-red-600 hover:bg-red-50' : 'border-green-100 text-green-600 hover:bg-green-50'
                            }`}
                        >
                          {gym.status === GymStatus.ACTIVE ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleOpenDeleteConfirm(gym)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Delete Gym"
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
              {gymsWithMemberCount.map((gym) => (
                <div key={gym.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900">{gym.name}</h4>
                      <p className="text-xs text-gray-500 font-bold">{gym.ownerPhone}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {gymStatusBadge(gym.status)}
                      {subscriptionStatusBadge(gym.subscriptionStatus)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Expires</p>
                      <p className="text-xs font-bold text-gray-900">{new Date(gym.subscriptionEndDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Revenue</p>
                      <p className="text-xs font-extrabold text-green-700">₹{gym.totalPaidAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleOpenHistoryModal(gym)}
                      className="text-[10px] text-brand-600 font-bold uppercase tracking-tighter flex items-center"
                    >
                      <ClockIcon className="w-3.5 h-3.5 mr-1" /> View History
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenPaymentModal(gym)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-md font-bold text-xs flex items-center shadow-sm"
                      >
                        ₹ Record Payment
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(gym)}
                        className="p-1.5 bg-gray-100 text-gray-600 rounded-md border border-gray-200"
                      >
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteConfirm(gym)}
                        className="p-1.5 bg-red-50 text-red-600 rounded-md border border-red-100"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {gymsWithMemberCount.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                {searchQuery ? (
                  <>
                    <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-bold">No gyms match your search "{searchQuery}"</p>
                  </>
                ) : (
                  <>
                    <UserGroupIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-bold">No gyms registered yet.</p>
                  </>
                )}
              </div>
            )}
          </div>

          <Modal
            isOpen={modalType === 'add' || modalType === 'edit'}
            onClose={handleCloseModal}
            title={selectedGym ? `Edit ${selectedGym.name}` : "Add New Gym"}
          >
            <GymForm
              key={selectedGym ? selectedGym.id : 'new'}
              gym={selectedGym}
              onSubmit={handleGymFormSubmit}
              onCancel={handleCloseModal}
            />
          </Modal>

          <Modal
            isOpen={modalType === 'payment'}
            onClose={handleCloseModal}
            title="Record Payment"
          >
            <div className="mb-4 text-sm text-gray-500 font-medium">
              Add an offline payment record for <span className="text-brand-600 font-bold">{selectedGym?.name}</span>.
            </div>
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
            <div className="mb-6 bg-green-50 p-4 rounded-xl border border-green-100 flex justify-between items-center">
              <div>
                <p className="text-xs text-green-600 font-bold uppercase">Lifetime Value</p>
                <p className="text-2xl font-black text-green-800">₹{selectedGym?.totalPaidAmount.toLocaleString() || 0}</p>
              </div>
              <button
                onClick={() => setModalType('payment')}
                className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 shadow-md"
              >
                Add New
              </button>
            </div>
            <PaymentHistory history={selectedGym?.paymentHistory || []} />
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
              <h4 className="text-lg font-black text-slate-900 mb-2">Are you absolutely sure?</h4>
              <p className="text-sm text-slate-500 mb-8 px-4 leading-relaxed">
                Deleting <span className="font-bold text-slate-900">{selectedGym?.name}</span> will permanently remove all associated members, trainers, and payment records. This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  No, Keep It
                </button>
                <button
                  onClick={confirmDeletion}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 transition-colors active:scale-95"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}

    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
