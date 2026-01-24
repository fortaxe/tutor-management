
import React, { useState, useMemo, useCallback } from 'react';
import { User, Gym, Member, PaymentStatus } from '../types';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import MemberForm from '../components/MemberForm';
import PlusIcon from '../components/icons/PlusIcon';
import EditIcon from '../components/icons/EditIcon';
import TrashIcon from '../components/icons/TrashIcon';
import UserGroupIcon from '../components/icons/UserGroupIcon';
import ClockIcon from '../components/icons/ClockIcon';
import ExclamationTriangleIcon from '../components/icons/ExclamationTriangleIcon';
import SearchIcon from '../components/icons/SearchIcon';

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

const MemberAvatar: React.FC<{ member: Member }> = ({ member }) => {
  if (member.photo) {
    return (
      <img 
        src={member.photo} 
        alt={member.name} 
        className="h-10 w-10 rounded-full object-cover border border-gray-200"
      />
    );
  }
  
  return (
    <div className="h-10 w-10 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-black text-xs">
      {member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
    </div>
  );
};

const MemberRow: React.FC<{ member: Member, onEdit: (member: Member) => void, onDelete: (id: number) => void, onToggleFeeStatus: (member: Member) => void }> = ({ member, onEdit, onDelete, onToggleFeeStatus }) => {
  const { endDate, remainingDays } = getPlanDates(member);
  const isExpired = remainingDays < 0;

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <MemberAvatar member={member} />
          <div className="ml-4">
            <div className="text-sm font-bold text-gray-900">{member.name}</div>
            <div className="text-[10px] text-gray-500 truncate max-w-[150px]">{member.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{member.phone}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
         <div className="font-bold text-gray-700">{endDate.toLocaleDateString()}</div>
         <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Expiry</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {isExpired ? (
          <Badge color="red">Expired</Badge>
        ) : (
          <span className={`text-sm font-bold ${remainingDays <= 7 ? 'text-red-600' : 'text-brand-600'}`}>
            {remainingDays}d left
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <button onClick={() => onToggleFeeStatus(member)} className="focus:outline-none hover:opacity-80 transition-opacity">
          {member.feesStatus === PaymentStatus.PAID ? <Badge color="green">Paid</Badge> : <Badge color="yellow">Unpaid</Badge>}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        <button onClick={() => onEdit(member)} className="p-1 text-brand-600 hover:text-brand-900 transition-colors"><EditIcon className="w-5 h-5"/></button>
        <button onClick={() => onDelete(member.id)} className="p-1 text-red-600 hover:text-red-900 transition-colors"><TrashIcon className="w-5 h-5"/></button>
      </td>
    </tr>
  );
};


const GymOwnerDashboard: React.FC<GymOwnerDashboardProps> = ({ user, gym, members, onLogout, onAddMember, onUpdateMember, onDeleteMember }) => {
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [expiryFilter, setExpiryFilter] = useState<number>(7);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const activeMembers = members.filter(m => getPlanDates(m).remainingDays >= 0).length;
    const expiredMembers = members.length - activeMembers;
    const duesPending = members.filter(m => m.feesStatus === PaymentStatus.UNPAID).length;
    return { activeMembers, expiredMembers, duesPending };
  }, [members]);

  const filteredMembers = useMemo(() => {
    let baseList = members;
    
    switch(activeTab) {
      case 'expiry':
        baseList = members.filter(m => {
          const { remainingDays } = getPlanDates(m);
          return remainingDays >= 0 && remainingDays <= expiryFilter;
        });
        break;
      case 'dues':
        baseList = members.filter(m => m.feesStatus === PaymentStatus.UNPAID);
        break;
      case 'members':
      default:
        baseList = members;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      baseList = baseList.filter(m => 
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.includes(q)
      );
    }

    return baseList;
  }, [activeTab, members, expiryFilter, searchQuery]);

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

  const tabClasses = (tabName: Tab) => `
    flex-1 text-center py-2.5 px-2 text-xs font-bold transition-all duration-200 uppercase tracking-widest
    ${activeTab === tabName ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}
  `;

  return (
    <div className="animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-green-50 p-3 rounded-xl border border-green-100"><UserGroupIcon className="h-6 w-6 text-green-600"/></div>
          <div className="ml-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Active</p>
            <p className="text-xl font-black text-gray-900">{stats.activeMembers}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-red-50 p-3 rounded-xl border border-red-100"><ClockIcon className="h-6 w-6 text-red-600"/></div>
          <div className="ml-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Expired</p>
            <p className="text-xl font-black text-gray-900">{stats.expiredMembers}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100"><ExclamationTriangleIcon className="h-6 w-6 text-yellow-600"/></div>
          <div className="ml-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Pending Dues</p>
            <p className="text-xl font-black text-gray-900">{stats.duesPending}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 space-y-4">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center space-y-4 lg:space-y-0">
            <div className="flex bg-gray-100 p-1 rounded-xl w-full lg:max-w-md overflow-hidden border border-gray-200">
              <button onClick={() => setActiveTab('members')} className={`${tabClasses('members')} rounded-lg`}>All</button>
              <button onClick={() => setActiveTab('expiry')} className={`${tabClasses('expiry')} rounded-lg`}>Expiry</button>
              <button onClick={() => setActiveTab('dues')} className={`${tabClasses('dues')} rounded-lg`}>Dues</button>
            </div>
            <button 
              onClick={() => handleOpenModal()} 
              className="w-full lg:w-auto flex justify-center items-center px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-md active:scale-95"
            >
              <PlusIcon className="w-5 h-5 mr-2" /> Add Member
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all sm:text-sm shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {activeTab === 'expiry' && (
          <div className="px-6 py-4 bg-brand-50/50 flex flex-wrap items-center gap-2 border-b border-brand-100">
             <span className="text-[10px] font-bold text-brand-700 uppercase mr-1">Filter timeframe:</span>
             {[7, 15, 30].map(days => (
                 <button 
                    key={days} 
                    onClick={() => setExpiryFilter(days)} 
                    className={`px-4 py-1 text-xs font-bold rounded-full border transition-all ${expiryFilter === days ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-brand-600 border-brand-200'}`}
                  >
                     {days} Days
                 </button>
             ))}
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Member</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Expiry Date</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Fees</th>
                <th className="relative px-6 py-4 text-right"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filteredMembers.map(member => (
                <MemberRow key={member.id} member={member} onEdit={handleOpenModal} onDelete={onDeleteMember} onToggleFeeStatus={handleToggleFeeStatus} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Member List */}
        <div className="lg:hidden divide-y divide-gray-50">
          {filteredMembers.map(member => {
            const { endDate, remainingDays } = getPlanDates(member);
            const isExpired = remainingDays < 0;
            return (
              <div key={member.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <MemberAvatar member={member} />
                    <div className="ml-3">
                      <h4 className="font-bold text-gray-900">{member.name}</h4>
                      <p className="text-xs text-gray-500 font-medium">{member.phone}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <button onClick={() => handleToggleFeeStatus(member)} className="focus:outline-none">
                      {member.feesStatus === PaymentStatus.PAID ? <Badge color="green">Paid</Badge> : <Badge color="yellow">Unpaid</Badge>}
                    </button>
                    {isExpired ? <Badge color="red">Expired</Badge> : <span className="text-[10px] font-black text-brand-600 uppercase bg-brand-50 px-2 py-0.5 rounded">{remainingDays}d left</span>}
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-xs">
                    <span className="text-gray-400 font-bold uppercase text-[9px]">Expires:</span> 
                    <span className="ml-2 font-bold text-gray-700">{endDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => handleOpenModal(member)} className="text-brand-600 p-1"><EditIcon className="w-5 h-5"/></button>
                    <button onClick={() => onDeleteMember(member.id)} className="text-red-600 p-1"><TrashIcon className="w-5 h-5"/></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            {searchQuery ? (
              <>
                <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-bold">No members match "{searchQuery}"</p>
              </>
            ) : (
              <>
                <UserGroupIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-bold">No members found.</p>
              </>
            )}
          </div>
        )}
      </div>
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingMember ? 'Update Member Profile' : 'Register New Member'}>
          <MemberForm member={editingMember} onSubmit={handleFormSubmit} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default GymOwnerDashboard;
