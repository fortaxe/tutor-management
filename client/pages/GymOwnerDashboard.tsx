import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { closeAddMemberModal, openAddMemberModal } from '../store/uiSlice';
import { User, Gym, Member, PaymentStatus, UserRole, MemberType, PaymentMode } from '../types';
import Modal from '../components/Modal';
import MemberForm from '../components/MemberForm';
import UserGroupIcon from '../components/icons/UserGroupIcon';
import ExclamationTriangleIcon from '../components/icons/ExclamationTriangleIcon';
import Button from '../components/Button';
import Tag from '../components/Tag';
import Input from '../components/Input';
import StatsCard from '../components/StatsCard';
import ActionIcon from '../components/ActionIcon';
import MobileMemberCard from '../components/MobileMemberCard';
import MemberAvatar from '@/components/MemberAvatar';
import { getPlanDates } from '@/lib/utils';
import { Table, Column } from '../components/Table';
import Drawer from '../components/Drawer';

import CollectBalanceForm from '../components/CollectBalanceForm';
import RenewPlanForm from '../components/RenewPlanForm';
import SortIcon from '@/components/icons/SortIcon';
import CustomDropdown from '../components/CustomDropdown';
import { generateInvoice } from '../lib/invoiceGenerator';

interface GymOwnerDashboardProps {
  user: User;
  gym: Gym;
  members: Member[];
  onLogout: () => void;
  onAddMember: (member: Omit<Member, 'id' | '_id'>) => Promise<any>;
  onUpdateMember: (member: Member) => Promise<any>;
  onRenewMember: (memberId: string | number, renewalData: { planStart: string; planDurationDays: number; feesAmount: number; paidAmount: number; feesStatus: PaymentStatus; memberType: MemberType; paymentMode: PaymentMode }) => Promise<any>;
  onDeleteMember: (memberId: string | number) => void;
}

type Tab = 'members' | 'expiry' | 'expired' | 'dues' | 'passes';

const sortOptions = [
  { value: 'createdAt-desc', label: 'Latest' },
  { value: 'name-asc', label: 'Name ↑' },
  { value: 'name-desc', label: 'Name ↓' }
];

const GymOwnerDashboard: React.FC<GymOwnerDashboardProps> = ({ user, gym, members, onAddMember, onUpdateMember, onRenewMember, onDeleteMember }) => {
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isAddMemberModalOpen = useSelector((state: RootState) => state.ui.isAddMemberModalOpen);
  const dispatch = useDispatch();
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [initialType, setInitialType] = useState<MemberType>(MemberType.SUBSCRIPTION);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });

  // Success State
  const [successData, setSuccessData] = useState<{
    type: 'ADD' | 'RENEW' | 'COLLECT';
    member: Member;
    title: string;
    description?: string;
    amount?: number;
  } | null>(null);


  const expiryFilter = 5;
  const [searchQuery, setSearchQuery] = useState('');


  const isTrainer = user.role === UserRole.TRAINER;

  const stats = useMemo(() => {
    const expiredMembers = members.filter(m => getPlanDates(m).remainingDays <= 0).length;
    const expiringSoon = members.filter(m => {
      const { remainingDays } = getPlanDates(m);
      return remainingDays > 0 && remainingDays <= expiryFilter;
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
        const isExpired = remainingDays <= 0;
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
        const isExpired = remainingDays <= 0;

        return (
          <div className="flex items-center gap-[5px]">
            {isExpired ? (
              <Tag variant="red">EXPIRED</Tag>
            ) : (
              <>
                {(member.feesStatus === PaymentStatus.PAID || balance <= 0) ? (
                  <Tag variant="green">SETTLED</Tag>
                ) : (
                  <Tag variant="orange">DUE : ₹{balance}</Tag>
                )}
                {member.memberType === MemberType.DAY_PASS && (
                  <Tag variant="violet">DAY PASS</Tag>
                )}
              </>
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
            ? `Hi ${member.name},\n\nYour ${gym.name} membership expired on ${endDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '')}.\n\nRenew today to resume your training.\n\nThank you`
            : `Hi ${member.name},\n\nYour ${gym.name} membership expires in ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}.\n\nRenew now to continue your fitness journey.\n\nThank you`;
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
            {!isTrainer && <ActionIcon variant="delete" onClick={() => handleOpenDeleteConfirm(member)} />}
          </div>
        )
      }
    }
  ];

  const filteredMembers = (() => {
    let baseList = members;

    switch (activeTab) {
      case 'expiry':
        baseList = members
          .filter(m => {
            const { remainingDays } = getPlanDates(m);
            return remainingDays > 0 && remainingDays <= expiryFilter;
          })
          .sort((a, b) => getPlanDates(a).remainingDays - getPlanDates(b).remainingDays);
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


    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      baseList = baseList.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.phone.includes(q)
      );
    }

    // Apply sorting
    return [...baseList].sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA: any = (a as any)[key];
      let valB: any = (b as any)[key];

      // Special handling for dates
      if (key === 'planStart' || key === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  })();


  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const handleOpenModal = (member: Member | null = null, type: MemberType = MemberType.SUBSCRIPTION) => {
    setEditingMember(member);
    setInitialType(type);
    setIsEditModalOpen(true);
    setSuccessData(null);
  };

  const handleOpenCollectModal = (member: Member) => {
    setEditingMember(member);
    setIsCollectModalOpen(true);
    setSuccessData(null);
  };

  const handleOpenRenewModal = (member: Member) => {
    setEditingMember(member);
    setIsRenewModalOpen(true);
    setSuccessData(null);
  };



  const handleOpenDeleteConfirm = (member: Member) => {
    setEditingMember(member);
    setIsDeleteModalOpen(true);
  };


  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCloseModal = () => {
    setEditingMember(null);
    setIsEditModalOpen(false);
    dispatch(closeAddMemberModal());
    setIsCollectModalOpen(false);
    setIsRenewModalOpen(false);
    setIsDeleteModalOpen(false);
    setSuccessData(null);
    setIsSubmitting(false); // Ensure loading state is reset
  };

  const handleFormSubmit = async (memberData: Omit<Member, 'id' | '_id'> | Member) => {
    setIsSubmitting(true);
    try {
      if ('id' in memberData || '_id' in memberData) {
        const updated = await onUpdateMember(memberData as Member);
        // Only show success for add? The prompt mentions "add member renewal and the balance clean"
        // Update might be simple edit.
        // Assuming "Add Member" means creating new.
        handleCloseModal();
      } else {
        const newMember = await onAddMember({ ...memberData, gymId: gym.id });
        if (newMember) {
          setSuccessData({
            type: 'ADD',
            member: newMember,
            title: 'Member Added Successfully',
            description: 'Registration'
          });
        } else {
          handleCloseModal();
        }
      }
    } catch (e) {
      console.error(e);
      // Keep modal open on error?
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCollectSubmit = async (amount: number, paymentMode: PaymentMode) => {
    if (!editingMember) return;

    const maxAllowed = editingMember.feesAmount - editingMember.paidAmount;

    if (amount <= 0 || amount > maxAllowed) {
      alert(`Please enter a valid amount (Max: ₹${maxAllowed})`);
      return;
    }

    const newTotalPaid = editingMember.paidAmount + amount;
    const newStatus = newTotalPaid >= editingMember.feesAmount ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

    setIsSubmitting(true);
    try {
      const updated = await onUpdateMember({
        ...editingMember,
        paidAmount: newTotalPaid,
        feesStatus: newStatus,
        paymentMode
      });

      const description = updated?.feesAmount === updated?.paidAmount ? 'Balance Cleared' : 'Partial Payment';
      setSuccessData({
        type: 'COLLECT',
        member: updated || { ...editingMember, paidAmount: newTotalPaid, feesStatus: newStatus },
        title: 'Payment Collected Successfully',
        description,
        amount: amount
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRenewMemberSubmit = async (renewalData: {
    planStart: string;
    planDurationDays: number;
    feesAmount: number;
    paidAmount: number;
    feesStatus: PaymentStatus;
    memberType: MemberType;
    paymentMode: PaymentMode;
  }) => {
    if (!editingMember) return;
    setIsSubmitting(true);
    try {
      const updated = await onRenewMember(editingMember._id || editingMember.id!, renewalData);
      setSuccessData({
        type: 'RENEW',
        member: updated || editingMember, // Fallback if API doesn't return member
        title: 'Membership Renewed Successfully',
        description: 'Plan Renewal'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
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
    const rows = filteredMembers.map(m => {
      const date = new Date(m.planStart);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      return [
        `"${m.name}"`,
        `"${m.phone}"`,
        `"${m.email || ''}"`,
        `"${formattedDate}"`,
        m.planDurationDays,
        m.feesAmount,
        m.paidAmount,
        `"${m.feesStatus}"`,
        `"${m.memberType}"`,
        `"${m.paymentMode || ''}"`
      ];
    });

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
    ${activeTab === tabName ? 'bg-black text-white  z-10' : 'secondary-color border-main'}
  `;

  // Success View Component
  const SuccessView = () => {
    if (!successData) return null;
    const { member, title, description, amount } = successData;

    // Only show share/download if paidAmount > 0 (or if amount is passed and > 0)
    const displayAmount = amount !== undefined ? amount : member.paidAmount;
    const showInvoiceOptions = displayAmount > 0;

    const handleShare = async () => {
      try {
        const dateStr = new Date().toISOString();
        if (navigator.share) {
          const blob = await generateInvoice(gym, member, dateStr, description, true, displayAmount);
          if (blob instanceof Blob) {
            const file = new File([blob], `${member.name.replace(/\s+/g, '_')}_Receipt.pdf`, { type: 'application/pdf' });
            await navigator.share({
              files: [file],
              title: 'Payment Receipt',
              text: `Here is your payment receipt.`
            });
            return;
          }
        }
      } catch (e) {
        console.error("Share failed", e);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center p-6 h-full text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-500 mb-8">{showInvoiceOptions ? 'Transaction recorded successfully.' : 'Action completed successfully.'}</p>

        {showInvoiceOptions && (
          <div className="flex flex-col gap-3 w-full max-w-sm mb-8">
            <Button onClick={handleShare} className="w-full bg-[#128C7E] hover:bg-[#075E54] justify-center">
              Share Receipt on WhatsApp
            </Button>
            <Button onClick={() => generateInvoice(gym, member, new Date().toISOString(), description, false, displayAmount)} variant="secondary" className="w-full justify-center">
              Download Invoice
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4 md:space-y-0 px-4 md:px-5 lg:px-0 no-scrollbar">
        {/* Stats Cards */}
        <div className={`flex overflow-x-auto md:pb-4 gap-2 md:gap-4 snap-x snap-mandatory no-scrollbar sm:grid sm:pb-0 sm:gap-[15px] ${isTrainer ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
          <StatsCard
            label="Active Now"
            value={stats.activeMembers}
            variant="green"
            isActive={activeTab === 'members'}
            onClick={() => setActiveTab('members')}
          />

          <StatsCard
            label="Expiring Soon"
            value={stats.expiringSoon}
            variant="red"
            isActive={activeTab === 'expiry'}
            onClick={() => setActiveTab('expiry')}
          />

          {!isTrainer && (
            <StatsCard
              label="Balance Due"
              value={stats.duesPending < 10 ? `0${stats.duesPending}` : stats.duesPending}
              variant="orange"
              isActive={activeTab === 'dues'}
              onClick={() => setActiveTab('dues')}
            />
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

          <CustomDropdown
            options={sortOptions}
            value={`${sortConfig.key}-${sortConfig.direction}`}
            onChange={(val) => {
              const [key, direction] = val.split('-');
              setSortConfig({ key, direction: direction as 'asc' | 'desc' });
            }}
            icon={<SortIcon className='size-5' />}
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

                <CustomDropdown
                  options={sortOptions}
                  value={`${sortConfig.key}-${sortConfig.direction}`}
                  onChange={(val) => {
                    const [key, direction] = val.split('-');
                    setSortConfig({ key, direction: direction as 'asc' | 'desc' });
                  }}
                  icon={<SortIcon className='size-5' />}
                />

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
                onDelete={!isTrainer ? handleOpenDeleteConfirm : undefined}
                showWhatsApp={activeTab === 'expiry' || activeTab === 'expired'}
                onWhatsApp={(m) => {
                  const { endDate, remainingDays } = getPlanDates(m);
                  const isExpired = remainingDays < 0;
                  const text = isExpired
                    ? `Hi ${m.name},\n\nYour ${gym.name} membership expired on ${endDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '')}.\n\nRenew today to resume your training.\n\nThank you`
                    : `Hi ${m.name},\n\nYour ${gym.name} membership expires in ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}.\n\nRenew now to continue your fitness journey.\n\nThank you`;
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

      </div >
      <Drawer isOpen={isEditModalOpen || isAddMemberModalOpen} onClose={handleCloseModal} title={successData ? successData.title : (editingMember ? 'Edit Member' : 'Add New Member')} >
        {successData ? <SuccessView /> : (
          <MemberForm
            member={editingMember}
            initialType={initialType}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
            isLoading={isSubmitting}
          />
        )}
      </Drawer>

      <Drawer isOpen={isCollectModalOpen} onClose={handleCloseModal} title={successData ? successData.title : "Collect Pending Balance"}>
        {successData ? <SuccessView /> : editingMember && (
          <CollectBalanceForm
            member={editingMember}
            onSubmit={handleCollectSubmit}
            onCancel={handleCloseModal}
            isLoading={isSubmitting}
          />
        )}
      </Drawer>

      <Drawer isOpen={isRenewModalOpen} onClose={handleCloseModal} title={successData ? successData.title : "RENEW / NEW PLAN"}>
        {successData ? <SuccessView /> : editingMember && (
          <RenewPlanForm
            member={editingMember}
            onSubmit={onRenewMemberSubmit}
            onCancel={handleCloseModal}
            isLoading={isSubmitting}
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
    </>
  );
};

export default GymOwnerDashboard;
