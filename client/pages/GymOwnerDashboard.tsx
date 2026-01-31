
import React, { useState, useMemo } from 'react';
import { User, Gym, Member, PaymentStatus, UserRole, MemberType } from '../types';
import Modal from '../components/Modal';
import MemberForm from '../components/MemberForm';
import UserGroupIcon from '../components/icons/UserGroupIcon';
import ExclamationTriangleIcon from '../components/icons/ExclamationTriangleIcon';
import Button from '../components/Button';
import Tag from '../components/Tag';
import Input from '../components/Input';
import StatsCard from '../components/StatsCard';
import ActionIcon from '../components/ActionIcon';
import SortIcon from '../components/icons/SortIcon';
import { Table, Column } from '../components/Table';
import Drawer from '../components/Drawer';

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

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'planStart', direction: 'desc' });

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

  const handleSort = React.useCallback((key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const columns: Column<Member>[] = [
    {
      key: 'profile',
      header: (
        <div className="flex items-center gap-[1px]">
          PROFILE
          <SortIcon active={sortConfig.key === 'name'} direction={sortConfig.direction} />
        </div>
      ),
      headerClassName: "flex items-center gap-[1px] pl-5 pr-[50px] bg-white cursor-pointer select-none",
      className: "py-[15px] pl-5 pr-[50px] whitespace-nowrap",
      onClickHeader: () => handleSort('name'),
      render: (member) => (
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
      )
    },
    {
      key: 'expiry',
      header: (
        <div className="flex items-center gap-[1px]">
          EXPIRY DATE
          <SortIcon active={sortConfig.key === 'endDate'} direction={sortConfig.direction} />
        </div>
      ),
      headerClassName: "pr-[50px] cursor-pointer select-none",
      className: "py-5 pr-[50px] whitespace-nowrap text-sm",
      onClickHeader: () => handleSort('endDate'),
      render: (member) => {
        const { endDate, remainingDays } = getPlanDates(member);
        const isExpired = remainingDays < 0;
        return (
          <>
            <div className="dashboard-primary-desc-geist text-black">{endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}</div>
            <div className="dashboard-secondary-desc uppercase font-grotesk font-bold secondary-color">{isExpired ? 'Expired On' : 'Expires On'}</div>
          </>
        )
      }
    },
    {
      key: 'days_left',
      header: (
        <div className="flex items-center gap-[1px]">
          DAYS LEFT
          <SortIcon active={sortConfig.key === 'remainingDays'} direction={sortConfig.direction} />
        </div>
      ),
      headerClassName: "pr-[50px] cursor-pointer select-none",
      className: "py-5 pr-[50px] whitespace-nowrap text-sm",
      onClickHeader: () => handleSort('remainingDays'),
      render: (member) => {
        const { remainingDays } = getPlanDates(member);
        const isExpired = remainingDays < 0;
        if (isExpired) return <Tag variant="red">EXPIRED</Tag>;
        return (
          <span className={`dashboard-primary-desc-geist ${remainingDays <= 10 ? 'red-color' : remainingDays <= 20 ? 'yellow-text-color' : 'green-text-color'}`}>
            {remainingDays} {remainingDays === 1 ? 'Day' : 'Days'} Left
          </span>
        )
      }
    },
    {
      key: 'payment',
      header: "PAYMENT",
      headerClassName: "text-left px-8",
      className: "px-8 py-5 whitespace-nowrap text-sm",
      render: (member) => {
        const balance = member.feesAmount - member.paidAmount;
        const { remainingDays } = getPlanDates(member);
        const isExpired = remainingDays < 0;

        return (
          <div className="flex flex-col items-start gap-1">
            {isExpired && <Tag variant="red">EXPIRED</Tag>}
            {(member.feesStatus !== PaymentStatus.PAID || !isExpired) && (
              member.feesStatus === PaymentStatus.PAID ? (
                <Tag variant="green">SETTLED</Tag>
              ) : (
                <div className="flex gap-2">
                  <Tag variant={member.feesStatus === PaymentStatus.PARTIAL ? 'orange' : 'red'}>
                    {member.feesStatus === PaymentStatus.PARTIAL ? 'PARTIAL' : 'UNPAID'}
                  </Tag>
                  {/* Always show due amount for clarity if there is a balance */}
                  <Tag variant="blue">DUE : ₹{balance}</Tag>
                </div>
              )
            )}
          </div>
        )
      }
    },
    {
      key: 'actions',
      header: "ACTIONS",
      headerClassName: "text-right px-5",
      className: "px-5 py-5 whitespace-nowrap text-right text-sm font-medium",
      render: (member) => {
        const { remainingDays, endDate } = getPlanDates(member);
        const isExpired = remainingDays < 0;
        const balance = member.feesAmount - member.paidAmount;

        const handleWhatsApp = () => {
          const text = isExpired
            ? `Hello ${member.name}, your gym membership has expired on ${endDate.toLocaleDateString()}. Please renew to continue your workout.`
            : `Hello ${member.name}, your gym membership is ending in ${remainingDays} days. Please renew to continue your workout.`;
          window.open(`https://wa.me/91${member.phone}?text=${encodeURIComponent(text)}`, '_blank');
        };

        return (
          <div className="flex items-center justify-end gap-[5px] transition-opacity">
            {(activeTab === 'expiry' || activeTab === 'expired') && (
              <ActionIcon variant="whatsup" onClick={handleWhatsApp} title="Send WhatsApp Reminder" />
            )}
            <ActionIcon variant="reload" onClick={() => handleOpenRenewModal(member)} title="New Plan / Renew" />
            {balance > 0 && (
              <ActionIcon variant="card" onClick={() => handleOpenCollectModal(member)} title="Collect Balance" />
            )}
            <ActionIcon variant="edit" onClick={() => handleOpenModal(member)} />
            <ActionIcon variant="delete" onClick={() => handleOpenDeleteConfirm(member)} />
          </div>
        )
      }
    }
  ];

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
          baseList = members.filter(m => {
            const { remainingDays } = getPlanDates(m);
            return (m.feesAmount - m.paidAmount) > 0 && remainingDays >= 0;
          });
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

    // Sorting
    return [...baseList].sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortConfig.key) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'endDate':
          aValue = getPlanDates(a).endDate.getTime();
          bValue = getPlanDates(b).endDate.getTime();
          break;
        case 'remainingDays':
          aValue = getPlanDates(a).remainingDays;
          bValue = getPlanDates(b).remainingDays;
          break;
        case 'planStart':
          aValue = new Date(a.planStart).getTime();
          bValue = new Date(b.planStart).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [activeTab, members, expiryFilter, searchQuery, showThisMonthOnly, sortConfig]);


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
          <div className="flex flex-col xl:flex-row justify-between xl:items-end space-y-4 xl:space-y-0  border-b border-[#E2E8F0] pb-5 px-5  pt-5">

            <div className='flex gap-[5px] flex-wrap items-end'>
              <button onClick={() => handleTabChange('members')} className={`${tabClasses('members')} rounded-main min-w-fit px-6`}>All</button>
              <button onClick={() => handleTabChange('expiry')} className={`${tabClasses('expiry')} rounded-main min-w-fit px-6`}>Expiring</button>
              <button onClick={() => handleTabChange('expired')} className={`${tabClasses('expired')} rounded-main min-w-fit px-6`}>Expired</button>
              <button onClick={() => handleTabChange('dues')} className={`${tabClasses('dues')} rounded-main min-w-fit px-6`}>Balance Due</button>
              <button onClick={() => handleTabChange('passes')} className={`${tabClasses('passes')} rounded-main min-w-fit px-6`}>DayPass</button>
            </div>


            <div className="flex flex-col sm:flex-row gap-[5px] xl:items-center">
              <button onClick={handleExportExcel} className="h-[46px] w-[46px] flex items-center justify-center rounded-main border border-slate-200 hover:bg-slate-50 transition-colors">
                {/* <SortIcon className='size-[20px]' /> */}
              </button>
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

        <Table
          data={filteredMembers}
          columns={columns}
          keyExtractor={(item) => item._id || item.id!}
        />

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
                  <div className="flex gap-[5px]">
                    {(activeTab === 'expiry' || activeTab === 'expired') && (
                      <ActionIcon
                        variant="whatsup"
                        onClick={() => {
                          const text = isExpired
                            ? `Hello ${member.name}, your gym membership has expired on ${endDate.toLocaleDateString()}. Please renew to continue your workout.`
                            : `Hello ${member.name}, your gym membership is ending in ${remainingDays} days. Please renew to continue your workout.`;
                          window.open(`https://wa.me/91${member.phone}?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        title="Send WhatsApp Reminder"
                      />
                    )}
                    <ActionIcon variant="reload" onClick={() => handleOpenRenewModal(member)} title="New Plan / Renew" />
                    {balance > 0 && (
                      <ActionIcon variant="card" onClick={() => handleOpenCollectModal(member)} title="Collect Balance" />
                    )}
                    <ActionIcon variant="edit" onClick={() => handleOpenModal(member)} />
                    <ActionIcon variant="delete" onClick={() => handleOpenDeleteConfirm(member)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {
          filteredMembers.length === 0 && (
            <div className="text-center py-32">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserGroupIcon className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No matching records</p>
            </div>
          )
        }
      </div >

      <Drawer isOpen={isModalOpen} onClose={handleCloseModal} title={editingMember ? 'Edit Member' : 'Add New Member'} >
        <MemberForm member={editingMember} initialType={initialType} onSubmit={handleFormSubmit} onCancel={handleCloseModal} />
      </Drawer>

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
                onClick={() => setRenewalFormData({ ...renewalFormData, type: MemberType.SUBSCRIPTION, duration: 29 })}
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
                if (!renewalFormData.startDate) return null;
                const start = new Date(renewalFormData.startDate);
                const end = new Date(start);
                end.setDate(start.getDate() + (Number(renewalFormData.duration) || 0));

                return (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Starts From</p>
                      <p className="text-base font-black">{start.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                    </div>
                    <div className="h-px w-10 bg-white/20"></div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Ends On</p>
                      <p className="text-base font-black text-white">{end.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
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
                      <option value={29}>Monthly (30 days)</option>
                      <option value={89}>Quarterly (90 days)</option>
                      <option value={179}>Half Yearly (180 days)</option>
                      <option value={364}>Yearly (365 days)</option>
                      {[29, 89, 179, 364].includes(Number(renewalFormData.duration)) ? null : (
                        <option value={renewalFormData.duration}>{renewalFormData.duration} Days (Custom)</option>
                      )}
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
    </div >
  );
};

export default GymOwnerDashboard;
