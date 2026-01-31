
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
import TrendUpIcon from '../components/icons/TrendUpIcon';
import { Table, Column } from '../components/Table';
import Drawer from '../components/Drawer';

import CollectBalanceForm from '../components/CollectBalanceForm';
import RenewPlanForm from '../components/RenewPlanForm';

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

  const { remainingDays } = getPlanDates(member);
  const isExpired = remainingDays < 0;
  const balance = member.feesAmount - member.paidAmount;

  let themeClass = '';

  if (isExpired) {
    themeClass = 'red-secondary-bg border-red red-color';
  } else if (balance > 0) {
    themeClass = 'orange-secondary-bg border-orange orange-text-color';
  } else {
    themeClass = 'green-secondary-bg border-green green-text-color';
  }

  return (
    <div className={`size-[46px] rounded-main border flex items-center justify-center font-black text-[16px] leading-[22px] uppercase font-bold font-grotesk ${themeClass}`}>
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

  const sortConfig = { key: 'planStart', direction: 'desc' as 'asc' | 'desc' };

  const expiryFilter = 10;
  const [searchQuery, setSearchQuery] = useState('');

  const isTrainer = user.role === UserRole.TRAINER;

  const stats = useMemo(() => {
    const expiredMembers = members.filter(m => getPlanDates(m).remainingDays < 0).length;
    const expiringSoon = members.filter(m => {
      const { remainingDays } = getPlanDates(m);
      return remainingDays >= 0 && remainingDays <= expiryFilter;
    }).length;
    const duesPendingMembers = members.filter(m => (m.feesAmount - m.paidAmount) > 0 && getPlanDates(m).remainingDays >= 0);
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

    const activeMembers = members.length - expiredMembers;

    return { activeMembers, expiredMembers, duesPending, totalDuesAmount, thisMonthMembers, expiringSoon };
  }, [members, expiryFilter]);



  const columns: Column<Member>[] = [
    {
      key: 'profile',
      header: (
        <div className="flex items-center gap-[1px]">
          PROFILE
        </div>
      ),
      headerClassName: "table-th pl-5 pr-[50px]",
      className: "w-1 py-[15px] pl-5 pr-[50px] whitespace-nowrap",
      render: (member) => (
        <div className="flex items-center">
          <MemberAvatar member={member} />
          <div className="ml-2">
            <div className="flex items-center ">
              <div className="dashboard-primary-desc-geist text-black">{member.name}</div>

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
        </div>
      ),
      headerClassName: "table-th pr-[50px]",
      className: "w-1 py-5 pr-[50px] whitespace-nowrap text-sm",
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
        </div>
      ),
      headerClassName: "table-th pr-[50px]",
      className: "w-1 py-5 pr-[50px] whitespace-nowrap text-sm",
      render: (member) => {
        const { remainingDays } = getPlanDates(member);
        const isExpired = remainingDays < 0;
        if (isExpired) return <Tag variant="red">EXPIRED</Tag>;
        return (
          <span className={`dashboard-primary-desc-geist ${remainingDays <= 10 ? 'red-color' : remainingDays <= 20 ? 'orange-text-color' : 'green-text-color'}`}>
            {remainingDays} {remainingDays === 1 ? 'Day' : 'Days'} Left
          </span>
        )
      }
    },
    {
      key: 'payment',
      header: "PAYMENT",
      headerClassName: "table-th text-left w-full",
      className: " py-5 whitespace-nowrap text-sm w-full",
      render: (member) => {
        const balance = member.feesAmount - member.paidAmount;
        const { remainingDays } = getPlanDates(member);
        const isExpired = remainingDays < 0;

        return (
          <div className="flex items-center gap-[5px]">
            {isExpired && <Tag variant="red">EXPIRED</Tag>}
            {(member.feesStatus !== PaymentStatus.PAID || !isExpired) && (
              (member.feesStatus === PaymentStatus.PAID || balance <= 0) ? (
                <Tag variant="green">SETTLED</Tag>
              ) : (
                <div className="flex gap-2">
                  <Tag variant="orange">DUE : ₹{balance}</Tag>
                </div>
              )
            )}
            {member.memberType === MemberType.DAY_PASS && (
              <Tag variant="violet">DAY PASS</Tag>
            )}
          </div>
        )
      }
    },
    {
      key: 'actions',
      header: "ACTIONS",
      headerClassName: "table-th text-right px-5",
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

  const filteredMembers = (() => {
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
            return remainingDays >= 0 && remainingDays <= expiryFilter;
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

    // Prepare sort values to avoid recalculating in sort loop
    const sortableList = baseList.map(m => {
      let sortValue: any = '';
      const dates = getPlanDates(m);

      switch (sortConfig.key) {
        case 'name':
          sortValue = m.name.toLowerCase();
          break;
        case 'endDate':
          sortValue = dates.endDate.getTime();
          break;
        case 'remainingDays':
          sortValue = dates.remainingDays;
          break;
        case 'planStart':
          sortValue = new Date(m.planStart).getTime();
          break;
        default:
          sortValue = 0;
      }
      return { member: m, sortValue };
    });

    sortableList.sort((a, b) => {
      if (a.sortValue < b.sortValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a.sortValue > b.sortValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sortableList.map(item => item.member);
  })();


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
    setIsCollectModalOpen(true);
  };

  const handleOpenRenewModal = (member: Member) => {
    setEditingMember(member);
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

  const handleFormSubmit = (memberData: Omit<Member, 'id' | '_id'> | Member) => {
    if ('id' in memberData || '_id' in memberData) {
      onUpdateMember(memberData as Member);
    } else {
      onAddMember({ ...memberData, gymId: gym.id });
    }
    handleCloseModal();
  };

  const handleCollectSubmit = (amount: number) => {
    if (!editingMember) return;

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

  const onRenewMemberSubmit = (renewalData: {
    planStart: string;
    planDurationDays: number;
    feesAmount: number;
    paidAmount: number;
    feesStatus: PaymentStatus;
    memberType: MemberType;
  }) => {
    if (!editingMember) return;
    onRenewMember(editingMember._id || editingMember.id!, renewalData);
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

    const headers = ['Name', 'Phone', 'Email', 'Plan Start', 'Duration (Days)', 'Fee Amount', 'Paid Amount', 'Status', 'Member Type', 'Payment Mode'];
    const rows = filteredMembers.map(m => [
      `"${m.name}"`,
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
          <TrendUpIcon className='size-[13px]' />
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
            variant="orange"
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
              {/* <div className="relative w-full sm:w-auto">
                <SortIcon active direction={sortConfig.direction} className="absolute left-[15px] top-1/2 -translate-y-1/2 size-4 pointer-events-none z-10" />
                <select
                  value={`${sortConfig.key}-${sortConfig.direction}`}
                  onChange={(e) => {
                    const [key, direction] = e.target.value.split('-');
                    setSortConfig({ key, direction: direction as 'asc' | 'desc' });
                  }}
                  className="h-[46px] w-full sm:w-[220px] pl-[40px] pr-8 rounded-main border border-slate-200 bg-white outline-none appearance-none font-bold uppercase text-[12px] cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <option value="name-asc">Name A to Z</option>
                  <option value="name-desc">Name Z to A</option>
                  <option value="endDate-asc">Expiry: Earliest First</option>
                  <option value="endDate-desc">Expiry: Latest First</option>
                  <option value="remainingDays-asc">Days Left: Least First</option>
                  <option value="remainingDays-desc">Days Left: Most First</option>
                  <option value="planStart-desc">Newest First (Default)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDownSmallIcon className="size-4" stroke="#64748b" />
                </div>
              </div> */}

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

                      </div>
                      <p className="dashboard-secondary-desc-geist secondary-color">{member.phone}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <span className={`dashboard-primary-desc-geist whitespace-nowrap ${isExpired
                      ? 'red-color'
                      : remainingDays <= 20
                        ? 'orange-text-color'
                        : 'green-text-color'
                      }`}>
                      {isExpired ? 'Expired' : `${remainingDays} Days Left`}
                    </span>
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="dashboard-secondary-desc-geist secondary-color text-left">
                        {balance > 0 ? (
                          <div className="flex gap-1 items-center">
                            <span className="orange-text-color">₹{balance} Due</span>
                          </div>
                        ) : endDate.toLocaleDateString()}
                      </span>
                      {member.memberType === MemberType.DAY_PASS && (
                        <Tag variant="violet" className="scale-75 origin-left">DAY PASS</Tag>
                      )}
                    </div>
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

      <Drawer isOpen={isCollectModalOpen} onClose={handleCloseModal} title="Collect Pending Balance">
        {editingMember && (
          <CollectBalanceForm
            member={editingMember}
            onSubmit={handleCollectSubmit}
            onCancel={handleCloseModal}
          />
        )}
      </Drawer>

      <Drawer isOpen={isRenewModalOpen} onClose={handleCloseModal} title="RENEW / NEW PLAN">
        {editingMember && (
          <RenewPlanForm
            member={editingMember}
            onSubmit={onRenewMemberSubmit}
            onCancel={handleCloseModal}
          />
        )}
      </Drawer>

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
