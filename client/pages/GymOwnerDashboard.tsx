
import React, { useState, useMemo } from 'react';
import { User, Gym, Member, PaymentStatus, UserRole, MemberType } from '../types';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import MemberForm from '../components/MemberForm';

import EditIcon from '../components/icons/EditIcon';
import TrashIcon from '../components/icons/TrashIcon';
import UserGroupIcon from '../components/icons/UserGroupIcon';
import ExclamationTriangleIcon from '../components/icons/ExclamationTriangleIcon';

import ArrowPathIcon from '../components/icons/ArrowPathIcon';
import Button from '../components/Button';
import Tag from '../components/Tag';
import TicketIcon from '../components/icons/TicketIcon';
import Input from '../components/Input';
import StatsCard from '../components/StatsCard';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface GymOwnerDashboardProps {
  user: User;
  gym: Gym;
  members: Member[];
  onLogout: () => void;
  onAddMember: (member: Omit<Member, 'id' | '_id'>) => void;
  onUpdateMember: (member: Member) => void;
  onRenewMember: (memberId: string | number, renewalData: { planStart: string; planDurationDays: number; feesAmount: number; paidAmount: number; feesStatus: PaymentStatus; memberType: MemberType }) => void;
  onDeleteMember: (memberId: string | number) => void;
}

type Tab = 'members' | 'expiry' | 'expired' | 'dues' | 'passes';

const getPlanDates = (member: Member) => {
  if (!member) return { startDate: new Date(), endDate: new Date(), remainingDays: 0 };
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
        className="size-[46px] rounded-main object-cover border-main"
      />
    );
  }

  return (
    <div className={`size-[46px] rounded-main border flex items-center justify-center font-black text-xs uppercase font-bold font-grotesk ${member.memberType === MemberType.DAY_PASS ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-brand/10 border-brand/20 text-brand-700'}`}>
      {member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
    </div>
  );
};

const MemberRow: React.FC<{
  member: Member,
  onEdit: (member: Member) => void,
  onDelete: (member: Member) => void,
  onCollect: (member: Member) => void,
  onRenew: (member: Member) => void,
  activeTab: string
}> = ({ member, onEdit, onDelete, onCollect, onRenew, activeTab }) => {
  const { endDate, remainingDays } = getPlanDates(member);
  const isExpired = remainingDays < 0;
  const balance = member.feesAmount - member.paidAmount;

  const handleWhatsApp = () => {
    const text = isExpired
      ? `Hello ${member.name}, your gym membership has expired on ${endDate.toLocaleDateString()}. Please renew to continue your workout.`
      : `Hello ${member.name}, your gym membership is ending in ${remainingDays} days. Please renew to continue your workout.`;
    window.open(`https://wa.me/91${member.phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="py-[15px] whitespace-nowrap">
        <div className="flex items-center">
          <MemberAvatar member={member} />
          <div className="ml-2">
            <div className="flex items-center gap-2">
              <div className="dashboard-primary-desc-geist text-black">{member.name}</div>
              {member.memberType === MemberType.DAY_PASS && (
                <span className="bg-orange-100 text-orange-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Pass</span>
              )}
            </div>
            <div className="dashboard-secondary-desc-geist secondary-color pt-[1px]">{member.phone}</div>
          </div>
        </div>
      </td>
      <td className="py-5 whitespace-nowrap text-sm">
        <div className="dashboard-primary-desc-geist text-black">{endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}</div>
        <div className="dashboard-secondary-desc uppercase font-grotesk font-bold secondary-color">{isExpired ? 'Expired On' : 'Expires On'}</div>
      </td>
      <td className="py-5 whitespace-nowrap text-sm">
        {isExpired ? (
          <Tag variant="red">EXPIRED</Tag>
        ) : (
          <span className={`dashboard-primary-desc-geist ${remainingDays <= 10
            ? 'red-color'
            : remainingDays <= 20
              ? 'yellow-text-color'
              : 'green-text-color'
            }`}>
            {remainingDays} {remainingDays === 1 ? 'Day' : 'Days'} Left
          </span>
        )}
      </td>
      <td className="px-8 py-5 whitespace-nowrap text-sm">
        <div className="flex flex-col items-start gap-1">
          {isExpired ? (
            <Tag variant="red">EXPIRED</Tag>
          ) : (
            member.feesStatus === PaymentStatus.PAID ? (
              <Tag variant="green">SETTLED</Tag>
            ) : (
              <div className="flex gap-2">
                <Tag variant={member.feesStatus === PaymentStatus.PARTIAL ? 'orange' : 'red'}>
                  {member.feesStatus === PaymentStatus.PARTIAL ? 'PARTIAL' : 'UNPAID'}
                </Tag>
                {member.feesStatus === PaymentStatus.PARTIAL && (
                  <Tag variant="blue">DUE : ₹{balance}</Tag>
                )}
              </div>
            )
          )}
        </div>
      </td>
      <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2 transition-opacity">
          {(activeTab === 'expiry' || activeTab === 'expired') && (
            <button onClick={handleWhatsApp} className="p-2 bg-green-500 text-white hover:bg-green-600 rounded-xl transition-all shadow-sm" title="Send WhatsApp Reminder">
              <WhatsAppIcon className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onRenew(member)} className="p-2 bg-slate-900 text-white hover:bg-black rounded-xl transition-all shadow-sm" title="New Plan / Renew">
            <ArrowPathIcon className="w-4 h-4" />
          </button>
          {balance > 0 && (
            <button onClick={() => onCollect(member)} className="p-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-500 hover:text-white rounded-xl transition-all shadow-sm" title="Collect Balance">
              <span className="font-black text-[10px]">₹+</span>
            </button>
          )}
          <button onClick={() => onEdit(member)} className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white rounded-xl transition-all shadow-sm"><EditIcon className="w-4 h-4" /></button>
          <button onClick={() => onDelete(member)} className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"><TrashIcon className="w-4 h-4" /></button>
        </div>
      </td>
    </tr>
  );
};


const GymOwnerDashboard: React.FC<GymOwnerDashboardProps> = ({ user, gym, members, onAddMember, onUpdateMember, onRenewMember, onDeleteMember }) => {
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [showThisMonthOnly, setShowThisMonthOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [initialType, setInitialType] = useState<MemberType>(MemberType.SUBSCRIPTION);
  const [collectAmount, setCollectAmount] = useState<string>('');

  // Renewal State
  const [renewalFormData, setRenewalFormData] = useState({
    type: MemberType.SUBSCRIPTION,
    startDate: new Date().toISOString().split('T')[0],
    duration: 30,
    fee: '',
    paid: '',
  });

  const [expiryFilter, setExpiryFilter] = useState<number>(7);
  const [searchQuery, setSearchQuery] = useState('');

  const isTrainer = user.role === UserRole.TRAINER;

  const stats = useMemo(() => {
    const activeMembers = members.filter(m => getPlanDates(m).remainingDays >= 0).length;
    const expiredMembers = members.length - activeMembers;
    const duesPendingMembers = members.filter(m => m.feesStatus !== PaymentStatus.PAID);
    const duesPending = duesPendingMembers.length;
    const totalDuesAmount = duesPendingMembers.reduce((sum, m) => sum + (m.feesAmount - m.paidAmount), 0);

    // Calculate members joined this month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const thisMonthMembers = members.filter(m => {
      const d = new Date(m.planStart); // Using planStart as proxy for join date
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    return { activeMembers, expiredMembers, duesPending, totalDuesAmount, thisMonthMembers };
  }, [members]);

  const filteredMembers = useMemo(() => {
    let baseList = members;

    if (showThisMonthOnly) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      baseList = baseList.filter(m => {
        const d = new Date(m.planStart);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    } else {
      switch (activeTab) {
        case 'expiry':
          baseList = members.filter(m => {
            const { remainingDays } = getPlanDates(m);
            return m.memberType === MemberType.SUBSCRIPTION && remainingDays >= 0 && remainingDays <= expiryFilter;
          });
          break;
        case 'dues':
          baseList = members.filter(m => m.feesStatus !== PaymentStatus.PAID);
          break;
        case 'passes':
          baseList = members.filter(m => m.memberType === MemberType.DAY_PASS);
          break;
        case 'expired':
          baseList = members.filter(m => getPlanDates(m).remainingDays < 0);
          break;
        case 'members':
        default:
          baseList = members;
      }
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
  }, [activeTab, members, expiryFilter, searchQuery, showThisMonthOnly]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setShowThisMonthOnly(false);
  };

  const handleOpenModal = (member: Member | null = null, type: MemberType = MemberType.SUBSCRIPTION) => {
    setEditingMember(member);
    setInitialType(type);
    setIsModalOpen(true);
  };

  const handleOpenCollectModal = (member: Member) => {
    setEditingMember(member);
    setCollectAmount((member.feesAmount - member.paidAmount).toString());
    setIsCollectModalOpen(true);
  };

  const handleOpenRenewModal = (member: Member) => {
    const { endDate } = getPlanDates(member);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const suggestedStart = endDate > today ? endDate : today;

    setEditingMember(member);
    setRenewalFormData({
      type: member.memberType,
      startDate: suggestedStart.toISOString().split('T')[0],
      duration: member.memberType === MemberType.DAY_PASS ? 1 : (member.planDurationDays || 30),
      fee: member.feesAmount.toString(),
      paid: member.feesAmount.toString(),
    });
    setIsRenewModalOpen(true);
  };

  const handleOpenDeleteConfirm = (member: Member) => {
    setEditingMember(member);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingMember(null);
    setIsModalOpen(false);
    setIsCollectModalOpen(false);
    setIsRenewModalOpen(false);
    setIsDeleteModalOpen(false);
  };

  const handleFormSubmit = (memberData: Omit<Member, 'id'> | Member) => {
    if ('id' in memberData || '_id' in memberData) {
      // Cast to Member since we know it has an ID, effectively
      onUpdateMember(memberData as Member);
    } else {
      onAddMember({ ...memberData, gymId: gym.id });
    }
    handleCloseModal();
  };

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const amount = Number(collectAmount);
    const maxAllowed = editingMember.feesAmount - editingMember.paidAmount;

    if (amount <= 0 || amount > maxAllowed) {
      alert(`Please enter a valid amount (Max: ₹${maxAllowed})`);
      return;
    }

    const newTotalPaid = editingMember.paidAmount + amount;
    const newStatus = newTotalPaid >= editingMember.feesAmount ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

    onUpdateMember({
      ...editingMember,
      paidAmount: newTotalPaid,
      feesStatus: newStatus
    });

    handleCloseModal();
  };

  const handleRenewalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const fee = Number(renewalFormData.fee);
    const paid = Number(renewalFormData.paid);

    let status = PaymentStatus.UNPAID;
    if (paid === fee && fee > 0) status = PaymentStatus.PAID;
    else if (paid > 0) status = PaymentStatus.PARTIAL;

    onRenewMember(editingMember._id || editingMember.id!, {
      planStart: renewalFormData.startDate,
      planDurationDays: Number(renewalFormData.duration),
      feesAmount: fee,
      paidAmount: paid,
      feesStatus: status,
      memberType: renewalFormData.type
    });

    handleCloseModal();
  };

  const confirmDeletion = () => {
    if (editingMember) {
      onDeleteMember(editingMember._id || editingMember.id!);
      handleCloseModal();
    }
  };


  const handleExportExcel = () => {
    if (!filteredMembers.length) {
      alert('No members to export.');
      return;
    }

    // CSV Header
    const headers = ['Name', 'Phone', 'Email', 'Plan Start', 'Duration (Days)', 'Fee Amount', 'Paid Amount', 'Status', 'Member Type', 'Payment Mode'];

    // CSV Rows
    const rows = filteredMembers.map(m => [
      `"${m.name}"`, // Quote strings to handle commas
      `"${m.phone}"`,
      `"${m.email || ''}"`,
      `"${m.planStart}"`,
      m.planDurationDays,
      m.feesAmount,
      m.paidAmount,
      `"${m.feesStatus}"`,
      `"${m.memberType}"`,
      `"${m.paymentMode || ''}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `members_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabClasses = (tabName: Tab) => `
    flex-1 text-center px-[15px] py-[5px] uppercase  dashboard-primary-desc font-black transition-all duration-300 w-fit  
    ${!showThisMonthOnly && activeTab === tabName ? 'bg-black text-white  z-10' : 'secondary-color border-main'}
  `;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-5">
      {/* Stats Cards */}
      {/* Stats Cards */}
      <div className={`flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory no-scrollbar sm:grid sm:pb-0 sm:gap-[15px] ${isTrainer ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
        <StatsCard
          label="Active Now"
          value={stats.activeMembers}
          variant="green"
          isActive={showThisMonthOnly}
          onClick={() => {
            if (showThisMonthOnly) {
              setShowThisMonthOnly(false);
            } else {
              setActiveTab('members');
              setShowThisMonthOnly(true);
            }
          }}
        >
          <img className='size-[13px]' src="/icons/up.svg" alt="" />
          {stats.thisMonthMembers} This Month
        </StatsCard>

        <StatsCard
          label="Expired List"
          value={stats.expiredMembers}
          variant="red"
          isActive={!showThisMonthOnly && activeTab === 'expired'}
          onClick={() => {
            setActiveTab('expired');
            setShowThisMonthOnly(false);
          }}
        >
          View List
        </StatsCard>

        {!isTrainer && (
          <StatsCard
            label="Balance Due"
            value={stats.duesPending < 10 ? `0${stats.duesPending}` : stats.duesPending}
            variant="blue"
            isActive={!showThisMonthOnly && activeTab === 'dues'}
            onClick={() => {
              setActiveTab('dues');
              setShowThisMonthOnly(false);
            }}
          >
            Due : ₹{stats.totalDuesAmount}
          </StatsCard>
        )}
      </div>

      <div className="bg-white rounded-main shadow-sm border-main overflow-hidden">
        <div className=" space-y-4 md:space-y-8">
          <div className="flex flex-col xl:flex-row justify-between xl:items-center space-y-4 xl:space-y-0  border-b border-[#E2E8F0] pb-5 px-5 pt-5">

            <div className='flex gap-[5px] flex-wrap items-end'>
              <button onClick={() => handleTabChange('members')} className={`${tabClasses('members')} rounded-main min-w-fit px-6`}>All</button>
              <button onClick={() => handleTabChange('expiry')} className={`${tabClasses('expiry')} rounded-main min-w-fit px-6`}>Expiring</button>
              <button onClick={() => handleTabChange('expired')} className={`${tabClasses('expired')} rounded-main min-w-fit px-6`}>Expired</button>
              <button onClick={() => handleTabChange('dues')} className={`${tabClasses('dues')} rounded-main min-w-fit px-6`}>Balance Due</button>
              <button onClick={() => handleTabChange('passes')} className={`${tabClasses('passes')} rounded-main min-w-fit px-6`}>DayPass</button>
            </div>


            <div className="flex flex-col sm:flex-row gap-[5px] xl:items-center">

              <button onClick={handleExportExcel} className="h-[46px] w-[46px] flex items-center justify-center rounded-main border border-slate-200 hover:bg-slate-50 transition-colors">
                <img src="/icons/excel.svg" alt="" className='size-[20px]' />
              </button>

              <div className="relative w-full sm:w-auto">
                <img src="/icons/search.svg" alt="" className="absolute left-[15px] top-1/2 -translate-y-1/2 size-5 z-10" />
                <Input
                  type="text"
                  placeholder="SEARCH..."
                  className="block w-full sm:w-[191px] pl-[45px] pr-4 h-[46px] font-bold uppercase  bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => handleOpenModal(null, MemberType.DAY_PASS)}
                  className="!bg-[#FFFBEB] !border-[#FBD691] !text-[#F59E0B] border  flex-1 sm:flex-none uppercase  "
                >
                  <img src="/icons/calendar.svg" alt="" className="w-5 h-5 mr-2" /> DAY PASS
                </Button>
                <Button
                  onClick={() => handleOpenModal(null, MemberType.SUBSCRIPTION)}
                  className="flex-1 sm:flex-none uppercase "
                >
                  <img src="/icons/plus.svg" alt="" className="w-5 h-5 mr-2" /> ADD MEMBER
                </Button>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'expiry' && (
          <div className="px-10 py-5 bg-brand/5 flex flex-wrap items-center gap-4 border-y border-brand/10">
            <span className="text-[10px] font-black text-brand-800 uppercase tracking-widest">Expiration Window</span>
            <div className="flex gap-2">
              {[3, 7].map(days => (
                <button
                  key={days}
                  onClick={() => setExpiryFilter(days)}
                  className={`px-5 py-2 text-[10px] font-black uppercase rounded-xl border transition-all ${expiryFilter === days ? 'bg-brand text-charcoal border-brand shadow-sm' : 'bg-white text-brand border-brand/20'}`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="hidden lg:block overflow-x-auto pt-5 px-5">
          <table className="min-w-full  " >
            <thead className=" ">
              <tr className=''>
                <th className="dashboard-secondary-desc secondary-color uppercase flex items-center gap-[1px] pb-3 bg-white">
                  <div className="flex items-center gap-[1px]">
                    PROFILE
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.5 11.75V4.25M10.5 4.25L13 6.82812M10.5 4.25L8 6.82812" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5.5 4.25V11.75M5.5 11.75L8 9.17188M5.5 11.75L3 9.17188" stroke="#0081DD" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </th>
                <th className="dashboard-secondary-desc secondary-color uppercase pb-3">
                  <div className="flex items-center gap-[1px]">
                    EXPIRY DATE
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.5 11.75V4.25M10.5 4.25L13 6.82812M10.5 4.25L8 6.82812" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5.5 4.25V11.75M5.5 11.75L8 9.17188M5.5 11.75L3 9.17188" stroke="#0081DD" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </th>
                <th className="dashboard-secondary-desc secondary-color uppercase pb-3">
                  <div className="flex items-center gap-[1px]">
                    DAYS LEFT
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.5 11.75V4.25M10.5 4.25L13 6.82812M10.5 4.25L8 6.82812" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5.5 4.25V11.75M5.5 11.75L8 9.17188M5.5 11.75L3 9.17188" stroke="#0081DD" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </th>
                <th className="dashboard-secondary-desc secondary-color uppercase pb-3 text-left">PAYMENT</th>
                <th className="dashboard-secondary-desc secondary-color uppercase pb-3 text-right pr-10">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {filteredMembers.map(member => (
                <MemberRow key={member._id || member.id} member={member} onEdit={(m) => handleOpenModal(m)} onDelete={handleOpenDeleteConfirm} onCollect={handleOpenCollectModal} onRenew={handleOpenRenewModal} activeTab={activeTab} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden ">
          {filteredMembers.map(member => {
            const { endDate, remainingDays } = getPlanDates(member);
            const isExpired = remainingDays < 0;
            const balance = member.feesAmount - member.paidAmount;
            return (
              <div key={member._id || member.id} className=" transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <MemberAvatar member={member} />
                    <div className="">
                      <div className="flex items-center gap-[1px]">
                        <h4 className="dashboard-primary-desc-geist ">{member.name}</h4>
                        {member.memberType === MemberType.DAY_PASS && (
                          <span className="text-[8px] font-black bg-orange-100 text-orange-700 px-1 rounded">PASS</span>
                        )}
                      </div>
                      <p className="dashboard-secondary-desc-geist secondary-color">{member.phone}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center">
                    <span className={`dashboard-primary-desc-geist text-left ${isExpired
                      ? 'red-color'
                      : remainingDays <= 10
                        ? 'red-color'
                        : remainingDays <= 20
                          ? 'yellow-text-color'
                          : 'green-text-color'
                      }`}>
                      {isExpired ? 'Expired' : `${remainingDays} Days Left`}
                    </span>
                    <span className="dashboard-secondary-desc-geist secondary-color text-left">
                      {balance > 0 ? `₹${balance} Due` : endDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end md:justify-between items-center bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-xs hidden md:block">
                    <span className="text-slate-400 font-black uppercase text-[9px] tracking-widest block mb-0.5">Expires</span>
                    <span className="font-black text-slate-800">{endDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex space-x-2">
                    {(activeTab === 'expiry' || activeTab === 'expired') && (
                      <button
                        onClick={() => {
                          const text = isExpired
                            ? `Hello ${member.name}, your gym membership has expired on ${endDate.toLocaleDateString()}. Please renew to continue your workout.`
                            : `Hello ${member.name}, your gym membership is ending in ${remainingDays} days. Please renew to continue your workout.`;
                          window.open(`https://wa.me/91${member.phone}?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="bg-green-500 text-white p-3 rounded-xl shadow-sm active:scale-95 transition-all"
                      >
                        <WhatsAppIcon className="w-5 h-5" />
                      </button>
                    )}
                    <button onClick={() => handleOpenRenewModal(member)} className="bg-slate-900 text-white p-3 rounded-xl shadow-sm active:scale-95 transition-all"><ArrowPathIcon className="w-5 h-5" /></button>
                    {balance > 0 && (
                      <button onClick={() => handleOpenCollectModal(member)} className="bg-yellow-500 text-white p-3 rounded-xl shadow-sm active:scale-95 transition-all font-black text-xs">₹+</button>
                    )}
                    <button onClick={() => handleOpenModal(member)} className="bg-white text-slate-600 p-3 rounded-xl border border-slate-200 shadow-sm active:scale-95 transition-all"><EditIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleOpenDeleteConfirm(member)} className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 shadow-sm active:scale-95 transition-all"><TrashIcon className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-32">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserGroupIcon className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No matching records</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingMember ? 'Update Profile' : initialType === MemberType.DAY_PASS ? 'Quick Day Pass' : 'New Member Registration'}>
        <MemberForm member={editingMember} initialType={initialType} onSubmit={handleFormSubmit} onCancel={handleCloseModal} />
      </Modal>

      {/* Collect Balance Modal */}
      <Modal isOpen={isCollectModalOpen} onClose={handleCloseModal} title="Collect Pending Balance">
        {editingMember && (
          <form onSubmit={handleCollectSubmit} className="space-y-6">
            <div className="bg-brand/5 p-6 rounded-3xl border border-brand/10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Original Fee</span>
                <span className="text-sm font-black text-slate-950">₹{editingMember.feesAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Already</span>
                <span className="text-sm font-black text-brand-700">₹{editingMember.paidAmount}</span>
              </div>
              <div className="mt-5 pt-5 border-t border-brand/10 flex justify-between items-center">
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total Remaining</span>
                <span className="text-2xl font-black text-orange-600">₹{editingMember.feesAmount - editingMember.paidAmount}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payment Amount (INR)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black text-slate-950 focus:ring-4 focus:ring-brand/5 focus:border-brand outline-none transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={handleCloseModal} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-4 bg-brand text-charcoal rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand/20 active:scale-95 transition-all">Collect Payment</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Renewal / Upgrade / New Plan Modal */}
      <Modal isOpen={isRenewModalOpen} onClose={handleCloseModal} title="Configure Membership Term">
        {editingMember && (
          <form onSubmit={handleRenewalSubmit} className="space-y-6">
            {/* Type Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRenewalFormData({ ...renewalFormData, type: MemberType.SUBSCRIPTION, duration: 30 })}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${renewalFormData.type === MemberType.SUBSCRIPTION ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Full Subscription
              </button>
              <button
                type="button"
                onClick={() => setRenewalFormData({ ...renewalFormData, type: MemberType.DAY_PASS, duration: 1 })}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${renewalFormData.type === MemberType.DAY_PASS ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Day Pass
              </button>
            </div>

            {/* Term Display Card */}
            <div className={`p-8 rounded-[2rem] text-white relative overflow-hidden transition-colors ${renewalFormData.type === MemberType.DAY_PASS ? 'bg-orange-600' : 'bg-slate-900'}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4">Calculated Coverage</p>
              {(() => {
                const start = new Date(renewalFormData.startDate);
                const end = new Date(start);
                end.setDate(start.getDate() + Number(renewalFormData.duration));
                return (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Starts From</p>
                      <p className="text-base font-black">{start.toLocaleDateString()}</p>
                    </div>
                    <div className="h-px w-10 bg-white/20"></div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Ends On</p>
                      <p className="text-base font-black text-white">{end.toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {/* Custom Start Date Picker */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">Effective Start</label>
                  <input
                    type="date"
                    value={renewalFormData.startDate}
                    onChange={(e) => setRenewalFormData({ ...renewalFormData, startDate: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:ring-4 focus:ring-brand/5 outline-none transition-all"
                  />
                </div>

                {/* Duration Picker */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">Duration</label>
                  {renewalFormData.type === MemberType.DAY_PASS ? (
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={renewalFormData.duration}
                        onChange={(e) => setRenewalFormData({ ...renewalFormData, duration: Number(e.target.value) })}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:ring-4 focus:ring-brand/5 outline-none"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Days</span>
                    </div>
                  ) : (
                    <select
                      value={renewalFormData.duration}
                      onChange={(e) => setRenewalFormData({ ...renewalFormData, duration: Number(e.target.value) })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:ring-4 focus:ring-brand/5 outline-none transition-all"
                    >
                      <option value={30}>Monthly (30 days)</option>
                      <option value={90}>Quarterly (90 days)</option>
                      <option value={180}>Half Yearly (180 days)</option>
                      <option value={365}>Yearly (365 days)</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">Total Fee (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={renewalFormData.fee}
                      onChange={(e) => setRenewalFormData({ ...renewalFormData, fee: e.target.value.replace(/\D/g, '') })}
                      className="w-full pl-8 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:ring-4 focus:ring-brand/5 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">Paid Today (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500 font-bold">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={renewalFormData.paid}
                      onChange={(e) => setRenewalFormData({ ...renewalFormData, paid: e.target.value.replace(/\D/g, '') })}
                      className="w-full pl-8 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-brand-700 focus:ring-4 focus:ring-brand/5 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={handleCloseModal} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-4 bg-brand text-charcoal rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand/20 active:scale-95 transition-all">Confirm Plan</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModal}
        title="Confirm Deletion"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h4 className="text-lg font-black text-slate-900 mb-2">Remove Member Profile?</h4>
          <p className="text-sm text-slate-500 mb-8 px-4 leading-relaxed">
            Deleting <span className="font-bold text-slate-900">{editingMember?.name}</span> will permanently erase their membership profile and payment history. This action cannot be undone.
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleCloseModal}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
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
    </div>
  );
};

export default GymOwnerDashboard;
