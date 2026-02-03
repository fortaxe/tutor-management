
import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { closeAddMemberModal, openAddMemberModal } from '../store/uiSlice';
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
import MobileMemberCard from '../components/MobileMemberCard';
import MemberAvatar from '@/components/MemberAvatar';
import { getPlanDates } from '@/lib/utils';
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

const GymOwnerDashboard: React.FC<GymOwnerDashboardProps> = ({ user, gym, members, onAddMember, onUpdateMember, onRenewMember, onDeleteMember }) => {
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [showThisMonthOnly, setShowThisMonthOnly] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isAddMemberModalOpen = useSelector((state: RootState) => state.ui.isAddMemberModalOpen);
  const dispatch = useDispatch();
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
            {/* <ActionIcon variant="pdf" onClick={() => generateInvoice(gym, member)} title="Download Invoice" /> */}
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
          baseList = members.filter(m => getPlanDates(m).remainingDays <= 0);
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
  })();


  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setShowThisMonthOnly(false);
  };

  const handleOpenModal = (member: Member | null = null, type: MemberType = MemberType.SUBSCRIPTION) => {
    setEditingMember(member);
    setInitialType(type);
    setIsEditModalOpen(true);
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
    setIsEditModalOpen(false);
    dispatch(closeAddMemberModal());
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4 md:space-y-5 px-4 md:px-5 lg:px-0">
      {/* Stats Cards */}
      <div className={`flex overflow-x-auto md:pb-4 gap-2 md:gap-4 snap-x snap-mandatory no-scrollbar sm:grid sm:pb-0 sm:gap-[15px] ${isTrainer ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
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

      {/* Mobile Add Member Button */}
      <div className="md:hidden">
        <Button
          onClick={() => dispatch(openAddMemberModal())}
          className="w-full"
        >
          <img src="/icons/plus.svg" alt="" className="w-5 h-5 mr-2" /> ADD MEMBER
        </Button>
      </div>

      <div className="relative flex gap-[5px] md:hidden w-full sm:w-auto">
        <img src="/icons/search.svg" alt="" className="absolute left-[15px] size-5 top-1/2 -translate-y-1/2 size-5 z-10" />
        <Input
          type="text"
          placeholder="SEARCH..."
          wrapperClassName="flex-1"
          className="block w-full sm:w-[191px] pl-[45px] font-grotesk secondary-color   font-bold uppercase  bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />


        {!isTrainer && (
          <button onClick={handleExportExcel} className="size-[42px] md:size-[46px] flex items-center justify-center rounded-main border border-slate-200 hover:bg-slate-50 transition-colors">
            <img src="/icons/excel.svg" alt="" className='size-4 md:size-[20px]' />
          </button>
        )}
      </div>

      <div className='flex gap-[5px] flex-row md:flex-wrap items-end md:hidden overflow-x-auto no-scrollbar'>
        <button onClick={() => handleTabChange('members')} className={`${tabClasses('members')} rounded-main min-w-fit `}>All</button>
        <button onClick={() => handleTabChange('expiry')} className={`${tabClasses('expiry')} rounded-main min-w-fit `}>Expiring</button>
        <button onClick={() => handleTabChange('expired')} className={`${tabClasses('expired')} rounded-main min-w-fit `}>Expired</button>
        <button onClick={() => handleTabChange('dues')} className={`${tabClasses('dues')} rounded-main min-w-fit `}>Balance Due</button>
        <button onClick={() => handleTabChange('passes')} className={`${tabClasses('passes')} rounded-main min-w-fit `}>DayPass</button>
      </div>

      <div className="md:bg-white rmd:overflow-hidden bg-transparent md:border md:border-[#E2E8F0] md:rounded-[10px]">
        <div className=" space-y-4 md:space-y-8">
          <div className="flex flex-col xl:flex-row justify-between xl:items-end md:space-y-4 xl:space-y-0  border-b border-[#E2E8F0] p-[15px] hidden md:flex md:p-5">

            <div className=' gap-[5px] flex-wrap items-end hidden md:flex'>
              <button onClick={() => handleTabChange('members')} className={`${tabClasses('members')} rounded-main min-w-fit px-6`}>All</button>
              <button onClick={() => handleTabChange('expiry')} className={`${tabClasses('expiry')} rounded-main min-w-fit px-6`}>Expiring</button>
              <button onClick={() => handleTabChange('expired')} className={`${tabClasses('expired')} rounded-main min-w-fit px-6`}>Expired</button>
              <button onClick={() => handleTabChange('dues')} className={`${tabClasses('dues')} rounded-main min-w-fit px-6`}>Balance Due</button>
              <button onClick={() => handleTabChange('passes')} className={`${tabClasses('passes')} rounded-main min-w-fit px-6`}>DayPass</button>
            </div>


            <div className="flex flex-row gap-[5px] xl:items-center">
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


              <div className="relative hidden md:block w-full sm:w-auto">
                <img src="/icons/search.svg" alt="" className="absolute left-[15px] top-1/2 -translate-y-1/2 size-5 z-10" />
                <Input
                  type="text"
                  placeholder="SEARCH..."
                  className="block w-full sm:w-[191px] pl-[45px] pr-4 h-[46px] font-bold uppercase  bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {!isTrainer && (
                <button onClick={handleExportExcel} className="size-[42px] md:size-[46px] flex items-center justify-center rounded-main border border-slate-200 hover:bg-slate-50 transition-colors">
                  <img src="/icons/excel.svg" alt="" className='size-4 md:size-[20px]' />
                </button>
              )}

            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <Table
            data={filteredMembers}
            columns={columns}
            keyExtractor={(item) => item._id || item.id!}
          />
        </div>

        <div className="md:hidden space-y-[10px] pb-10 bg-[#F4F7FB] ">
          {filteredMembers.map(member => (
            <MobileMemberCard
              key={member._id || member.id}
              member={member}
              onRenew={handleOpenRenewModal}
              onEdit={handleOpenModal}
              onCollect={handleOpenCollectModal}
              onDelete={handleOpenDeleteConfirm}
              onWhatsApp={(m) => {
                const { endDate, remainingDays } = getPlanDates(m);
                const isExpired = remainingDays < 0;
                const text = isExpired
                  ? `Hello ${m.name}, your gym membership has expired on ${endDate.toLocaleDateString()}. Please renew to continue your workout.`
                  : `Hello ${m.name}, your gym membership is ending in ${remainingDays} days. Please renew to continue your workout.`;
                window.open(`https://wa.me/91${m.phone}?text=${encodeURIComponent(text)}`, '_blank');
              }}
            />
          ))}
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

      <Drawer isOpen={isEditModalOpen || isAddMemberModalOpen} onClose={handleCloseModal} title={editingMember ? 'Edit Member' : 'Add New Member'} >
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
