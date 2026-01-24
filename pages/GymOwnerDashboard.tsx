
import React, { useState, useMemo, useCallback } from 'react';
import { User, Gym, Member, PaymentStatus } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import MemberForm from '../components/MemberForm';
import PlusIcon from '../components/icons/PlusIcon';
import EditIcon from '../components/icons/EditIcon';
import TrashIcon from '../components/icons/TrashIcon';
import UserGroupIcon from '../components/icons/UserGroupIcon';
import ClockIcon from '../components/icons/ClockIcon';
import ExclamationTriangleIcon from '../components/icons/ExclamationTriangleIcon';

interface GymOwnerDashboardProps {
  user: User;
  gym: Gym;
  members: Member[];
  onLogout: () => void;
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (memberId: number) => void;
}

type Tab = 'members' | 'expiry' | 'dues';

const getPlanDates = (member: Member) => {
  const startDate = new Date(member.planStart);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + member.planDurationDays);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const remainingDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  return { startDate, endDate, remainingDays };
};

const MemberRow: React.FC<{ member: Member, onEdit: (member: Member) => void, onDelete: (id: number) => void, onToggleFeeStatus: (member: Member) => void }> = ({ member, onEdit, onDelete, onToggleFeeStatus }) => {
  const { endDate, remainingDays } = getPlanDates(member);
  const isExpired = remainingDays < 0;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}<br />{member.phone}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{endDate.toLocaleDateString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {isExpired ? (
          <Badge color="red">Expired</Badge>
        ) : (
          <span className={`${remainingDays <= 7 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
            {remainingDays} days
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <button onClick={() => onToggleFeeStatus(member)} className="cursor-pointer">
          {member.feesStatus === PaymentStatus.PAID ? <Badge color="green">Paid</Badge> : <Badge color="yellow">Unpaid</Badge>}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        <button onClick={() => onEdit(member)} className="text-indigo-600 hover:text-indigo-900"><EditIcon className="w-5 h-5"/></button>
        <button onClick={() => onDelete(member.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
      </td>
    </tr>
  );
};


const GymOwnerDashboard: React.FC<GymOwnerDashboardProps> = ({ user, gym, members, onLogout, onAddMember, onUpdateMember, onDeleteMember }) => {
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [expiryFilter, setExpiryFilter] = useState<number>(7);

  const stats = useMemo(() => {
    const activeMembers = members.filter(m => getPlanDates(m).remainingDays >= 0).length;
    const expiredMembers = members.length - activeMembers;
    const duesPending = members.filter(m => m.feesStatus === PaymentStatus.UNPAID).length;
    return { activeMembers, expiredMembers, duesPending };
  }, [members]);

  const filteredMembers = useMemo(() => {
    switch(activeTab) {
      case 'expiry':
        return members.filter(m => {
          const { remainingDays } = getPlanDates(m);
          return remainingDays >= 0 && remainingDays <= expiryFilter;
        });
      case 'dues':
        return members.filter(m => m.feesStatus === PaymentStatus.UNPAID);
      case 'members':
      default:
        return members;
    }
  }, [activeTab, members, expiryFilter]);

  const handleOpenModal = (member: Member | null = null) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingMember(null);
    setIsModalOpen(false);
  };

  const handleFormSubmit = (memberData: Omit<Member, 'id'> | Member) => {
    if ('id' in memberData) {
      onUpdateMember(memberData);
    } else {
      onAddMember({ ...memberData, gymId: gym.id });
    }
    handleCloseModal();
  };

  const handleToggleFeeStatus = useCallback((member: Member) => {
    const newStatus = member.feesStatus === PaymentStatus.PAID ? PaymentStatus.UNPAID : PaymentStatus.PAID;
    onUpdateMember({ ...member, feesStatus: newStatus });
  }, [onUpdateMember]);

  const tabClasses = (tabName: Tab) => `px-4 py-2 text-sm font-medium rounded-md ${activeTab === tabName ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`;

  return (
    <DashboardLayout user={user} onLogout={onLogout} pageTitle={`${gym.name} Dashboard`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="bg-green-100 p-3 rounded-full"><UserGroupIcon className="h-6 w-6 text-green-600"/></div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Active Members</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeMembers}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="bg-red-100 p-3 rounded-full"><ClockIcon className="h-6 w-6 text-red-600"/></div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Expired Members</p>
            <p className="text-2xl font-bold text-gray-900">{stats.expiredMembers}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="bg-yellow-100 p-3 rounded-full"><ExclamationTriangleIcon className="h-6 w-6 text-yellow-600"/></div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Dues Pending</p>
            <p className="text-2xl font-bold text-gray-900">{stats.duesPending}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2 border border-gray-200 p-1 rounded-lg">
            <button onClick={() => setActiveTab('members')} className={tabClasses('members')}>All Members</button>
            <button onClick={() => setActiveTab('expiry')} className={tabClasses('expiry')}>Upcoming Expiry</button>
            <button onClick={() => setActiveTab('dues')} className={tabClasses('dues')}>Pending Dues</button>
          </div>
          <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            <PlusIcon className="w-5 h-5 mr-2" /> Add Member
          </button>
        </div>

        {activeTab === 'expiry' && (
          <div className="my-4">
             <span className="text-sm font-medium text-gray-700 mr-2">Show members expiring in:</span>
             {[7, 15, 30].map(days => (
                 <button key={days} onClick={() => setExpiryFilter(days)} className={`px-3 py-1 text-sm rounded-full ${expiryFilter === days ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-100 text-gray-600'}`}>
                     Next {days} days
                 </button>
             ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map(member => (
                <MemberRow key={member.id} member={member} onEdit={handleOpenModal} onDelete={onDeleteMember} onToggleFeeStatus={handleToggleFeeStatus} />
              ))}
            </tbody>
          </table>
           {filteredMembers.length === 0 && <p className="text-center text-gray-500 py-8">No members found.</p>}
        </div>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingMember ? 'Edit Member' : 'Add New Member'}>
          <MemberForm member={editingMember} onSubmit={handleFormSubmit} onCancel={handleCloseModal} />
      </Modal>

    </DashboardLayout>
  );
};

export default GymOwnerDashboard;
