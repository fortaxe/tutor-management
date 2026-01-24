
import React, { useState, useMemo, useCallback } from 'react';
import { User, Gym, Member, PaymentStatus, UserRole } from '../types';
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
        className="h-11 w-11 rounded-2xl object-cover border border-slate-200"
      />
    );
  }
  
  return (
    <div className="h-11 w-11 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-700 font-black text-xs">
      {member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
    </div>
  );
};

const MemberRow: React.FC<{ member: Member, onEdit: (member: Member) => void, onDelete: (id: number) => void, onToggleFeeStatus: (member: Member) => void }> = ({ member, onEdit, onDelete, onToggleFeeStatus }) => {
  const { endDate, remainingDays } = getPlanDates(member);
  const isExpired = remainingDays < 0;

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-8 py-5 whitespace-nowrap">
        <div className="flex items-center">
          <MemberAvatar member={member} />
          <div className="ml-4">
            <div className="text-sm font-bold text-slate-900 group-hover:text-brand transition-colors">{member.name}</div>
            <div className="text-[11px] font-medium text-slate-400 truncate max-w-[150px]">{member.email}</div>
          </div>
        </div>
      </td>
      <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500 font-bold">{member.phone}</td>
      <td className="px-8 py-5 whitespace-nowrap text-sm">
         <div className="font-bold text-slate-700">{endDate.toLocaleDateString()}</div>
         <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Expires</div>
      </td>
      <td className="px-8 py-5 whitespace-nowrap text-sm">
        {isExpired ? (
          <Badge color="red">Expired</Badge>
        ) : (
          <span className={`text-sm font-black ${remainingDays <= 7 ? 'text-orange-600' : 'text-brand-600'}`}>
            {remainingDays} Days Left
          </span>
        )}
      </td>
      <td className="px-8 py-5 whitespace-nowrap text-sm">
        <button onClick={() => onToggleFeeStatus(member)} className="focus:outline-none hover:opacity-80 transition-opacity">
          {member.feesStatus === PaymentStatus.PAID ? <Badge color="green">Settled</Badge> : <Badge color="yellow">Pending</Badge>}
        </button>
      </td>
      <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(member)} className="p-2 bg-slate-100 text-slate-600 hover:bg-brand hover:text-white rounded-xl transition-all shadow-sm"><EditIcon className="w-4 h-4"/></button>
          <button onClick={() => onDelete(member.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"><TrashIcon className="w-4 h-4"/></button>
        </div>
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

  const isTrainer = user.role === UserRole.TRAINER;

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
        m.email?.toLowerCase().includes(q) ||
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
    flex-1 text-center py-3.5 px-4 text-[11px] font-black transition-all duration-300 uppercase tracking-[0.15em]
    ${activeTab === tabName ? 'bg-charcoal text-white shadow-xl shadow-charcoal/20 z-10' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
  `;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Cards */}
      <div className={`grid grid-cols-1 ${isTrainer ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-6`}>
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 flex items-center group hover:shadow-xl hover:shadow-brand/5 transition-all">
          <div className="bg-brand/10 p-4 rounded-2xl border border-brand/20 group-hover:bg-brand group-hover:text-white transition-all"><UserGroupIcon className="h-7 w-7 text-brand group-hover:text-white"/></div>
          <div className="ml-5">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Now</p>
            <p className="text-3xl font-black text-slate-950">{stats.activeMembers}</p>
          </div>
        </div>
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 flex items-center group hover:shadow-xl hover:shadow-orange/5 transition-all">
          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 group-hover:bg-orange-500 group-hover:text-white transition-all"><ClockIcon className="h-7 w-7 text-orange-500 group-hover:text-white"/></div>
          <div className="ml-5">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Membership Expired</p>
            <p className="text-3xl font-black text-slate-950">{stats.expiredMembers}</p>
          </div>
        </div>
        {!isTrainer && (
          <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 flex items-center group hover:shadow-xl hover:shadow-yellow/5 transition-all">
            <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 group-hover:bg-yellow-500 group-hover:text-white transition-all"><ExclamationTriangleIcon className="h-7 w-7 text-yellow-500 group-hover:text-white"/></div>
            <div className="ml-5">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Fee Pending</p>
              <p className="text-3xl font-black text-slate-950">{stats.duesPending}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-8 lg:p-10 space-y-8">
          <div className="flex flex-col xl:flex-row justify-between xl:items-center space-y-6 xl:space-y-0">
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl w-full xl:max-w-md overflow-hidden border border-slate-200/50">
              <button onClick={() => setActiveTab('members')} className={`${tabClasses('members')} rounded-xl`}>All Members</button>
              <button onClick={() => setActiveTab('expiry')} className={`${tabClasses('expiry')} rounded-xl`}>Expiring Soon</button>
              <button onClick={() => setActiveTab('dues')} className={`${tabClasses('dues')} rounded-xl`}>Due Fees</button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
               {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Quick Search..."
                  className="block w-full pl-11 pr-4 py-4 border border-slate-200 bg-slate-50/50 rounded-2xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand focus:bg-white transition-all sm:text-sm font-semibold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={() => handleOpenModal()} 
                className="flex items-center justify-center px-8 py-4 bg-brand text-charcoal rounded-2xl font-black uppercase tracking-widest hover:bg-brand-400 transition-all shadow-xl shadow-brand/20 active:scale-95 text-xs"
              >
                <PlusIcon className="w-5 h-5 mr-3" /> New Member
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'expiry' && (
          <div className="px-10 py-5 bg-brand/5 flex flex-wrap items-center gap-4 border-y border-brand/10">
             <span className="text-[11px] font-black text-brand-800 uppercase tracking-widest">Expiration Timeframe</span>
             <div className="flex gap-2">
               {[7, 15, 30].map(days => (
                   <button 
                      key={days} 
                      onClick={() => setExpiryFilter(days)} 
                      className={`px-5 py-2 text-xs font-bold rounded-xl border transition-all ${expiryFilter === days ? 'bg-brand text-charcoal border-brand shadow-md shadow-brand/10' : 'bg-white text-brand border-brand/20 hover:border-brand'}`}
                    >
                       {days} Days
                   </button>
               ))}
             </div>
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-10 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile</th>
                <th className="px-10 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                <th className="px-10 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Expiration</th>
                <th className="px-10 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline</th>
                <th className="px-10 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment</th>
                <th className="relative px-10 py-5 text-right"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {filteredMembers.map(member => (
                <MemberRow key={member.id} member={member} onEdit={handleOpenModal} onDelete={onDeleteMember} onToggleFeeStatus={handleToggleFeeStatus} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Member List */}
        <div className="lg:hidden divide-y divide-slate-50">
          {filteredMembers.map(member => {
            const { endDate, remainingDays } = getPlanDates(member);
            const isExpired = remainingDays < 0;
            return (
              <div key={member.id} className="p-6 space-y-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <MemberAvatar member={member} />
                    <div className="ml-4">
                      <h4 className="font-bold text-slate-950">{member.name}</h4>
                      <p className="text-xs text-slate-400 font-bold">{member.phone}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <button onClick={() => handleToggleFeeStatus(member)} className="focus:outline-none">
                      {member.feesStatus === PaymentStatus.PAID ? <Badge color="green">Settled</Badge> : <Badge color="yellow">Pending</Badge>}
                    </button>
                    {isExpired ? <Badge color="red">Expired</Badge> : <span className="text-[11px] font-black text-brand-700 uppercase bg-brand/10 px-3 py-1 rounded-lg">{remainingDays}d Left</span>}
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-4 px-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-xs">
                    <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest block mb-0.5">End Date</span> 
                    <span className="font-black text-slate-800 tracking-tight">{endDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => handleOpenModal(member)} className="bg-white text-slate-600 p-3 rounded-xl border border-slate-200 shadow-sm active:scale-95 transition-all"><EditIcon className="w-5 h-5"/></button>
                    <button onClick={() => onDeleteMember(member.id)} className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 shadow-sm active:scale-95 transition-all"><TrashIcon className="w-5 h-5"/></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-24 text-slate-300">
            {searchQuery ? (
              <div className="max-w-xs mx-auto">
                <SearchIcon className="w-16 h-16 mx-auto mb-6 opacity-20" />
                <p className="font-black uppercase tracking-widest text-xs mb-2">No Results Found</p>
                <p className="text-slate-400 text-sm">We couldn't find any members matching "<span className="text-slate-900">{searchQuery}</span>"</p>
              </div>
            ) : (
              <div className="max-w-xs mx-auto">
                <UserGroupIcon className="w-16 h-16 mx-auto mb-6 opacity-20" />
                <p className="font-black uppercase tracking-widest text-xs mb-2">Club Empty</p>
                <p className="text-slate-400 text-sm">Start your growth by registering your first member.</p>
                <button onClick={() => handleOpenModal()} className="mt-6 text-brand font-black uppercase text-[11px] tracking-widest py-3 px-6 bg-brand/5 rounded-xl hover:bg-brand/10 transition-colors">Register Member</button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingMember ? 'Update Profile' : 'Member Registration'}>
          <MemberForm member={editingMember} onSubmit={handleFormSubmit} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default GymOwnerDashboard;
