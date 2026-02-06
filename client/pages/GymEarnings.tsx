
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Gym, MemberPayment, Member, PaymentMode, UserRole } from '../types';
import SearchIcon from '../components/icons/SearchIcon';
import Tag from '../components/Tag';
import ActionIcon from '../components/ActionIcon';
import { generateInvoice } from '@/lib/invoiceGenerator';
import StatsCard from '../components/StatsCard';
import { Table, Column } from '../components/Table';
import CustomDropdown from '../components/CustomDropdown';
import SortIcon from '../components/icons/SortIcon';
import * as XLSX from 'xlsx';
import TabSelector from '../components/TabSelector';
import Button from '../components/Button';
import { cn } from '@/lib/utils';
import Input from '../components/Input';

interface GymEarningsProps {
  gym: Gym;
  members: Member[];
  payments: MemberPayment[];
}

type TimeFilter = 'today' | 'yesterday' | '7days' | '30days' | 'all';

const paymentOptions = [
  { value: PaymentMode.UPI, label: 'UPI / CARD' },
  { value: PaymentMode.CASH, label: 'CASH' }
];

const timeFilterOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last 30 Days', value: '30days' },
];

const GymEarnings: React.FC<GymEarningsProps> = ({ gym, members, payments }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [showDuesOnly, setShowDuesOnly] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = useMemo(() => {
    const totalEarnings = payments.reduce((acc, p) => acc + p.amount, 0);

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const thisMonthEarnings = payments
      .filter(p => {
        const d = new Date(p.paymentDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, p) => acc + p.amount, 0);

    const pendingAmount = members.reduce((acc, m) => acc + (Math.max(0, m.feesAmount - m.paidAmount)), 0);
    const pendingCount = members.filter(m => m.feesAmount > m.paidAmount).length;

    return {
      totalEarnings: `₹${totalEarnings.toLocaleString()}`,
      thisMonthEarnings: `₹${thisMonthEarnings.toLocaleString()}`,
      pendingAmount: `₹${pendingAmount.toLocaleString()}`,
      pendingCount
    };
  }, [payments, members, today]);

  const monthlyBreakdown = useMemo(() => {
    const groups: Record<string, number> = {};
    payments.forEach(p => {
      const d = new Date(p.paymentDate);
      const key = d.toLocaleString('default', { month: 'short', year: 'numeric' }).toUpperCase();
      groups[key] = (groups[key] || 0) + p.amount;
    });

    return Object.entries(groups)
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateB.getTime() - dateA.getTime();
      });
  }, [payments]);

  const filteredPayments = useMemo(() => {
    let result = [...payments];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => {
        const member = members.find(m => String(m.id) === String(p.memberId) || m._id === p.memberId);
        const phone = member?.phone?.toLowerCase() || '';
        return (
          p.memberName.toLowerCase().includes(q) ||
          p.note.toLowerCase().includes(q) ||
          phone.includes(q)
        );
      });
    }

    // Selected Month filter
    if (selectedMonth) {
      result = result.filter(p => {
        const d = new Date(p.paymentDate);
        const key = d.toLocaleString('default', { month: 'short', year: 'numeric' }).toUpperCase();
        return key === selectedMonth;
      });
    }

    // Time Filter
    if (timeFilter !== 'all') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      result = result.filter(p => {
        const pDate = new Date(p.paymentDate);
        pDate.setHours(0, 0, 0, 0);

        if (timeFilter === 'today') return pDate.getTime() === now.getTime();
        if (timeFilter === 'yesterday') {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          return pDate.getTime() === yesterday.getTime();
        }
        if (timeFilter === '7days') {
          const limitDate = new Date(now);
          limitDate.setDate(now.getDate() - 6);
          return pDate.getTime() >= limitDate.getTime();
        }
        if (timeFilter === '30days') {
          const limitDate = new Date(now);
          limitDate.setDate(now.getDate() - 29);
          return pDate.getTime() >= limitDate.getTime();
        }
        return true;
      });
    }

    // Payment Filter
    if (paymentFilter) {
      result = result.filter(p => p.paymentMode === (paymentFilter as PaymentMode));
    }

    // Dues Filter - show only latest payment from members with pending balance
    if (showDuesOnly) {
      const membersWithDues = members.filter(m => (m.feesAmount - m.paidAmount) > 0);
      const memberIdsWithDues = membersWithDues.map(m => String(m.id || m._id));

      // Get latest payment for each member with dues
      const latestPaymentPerMember: Record<string, typeof result[0]> = {};
      result.forEach(p => {
        const memberId = String(p.memberId);
        if (memberIdsWithDues.includes(memberId)) {
          if (!latestPaymentPerMember[memberId] ||
            new Date(p.paymentDate) > new Date(latestPaymentPerMember[memberId].paymentDate)) {
            latestPaymentPerMember[memberId] = p;
          }
        }
      });
      result = Object.values(latestPaymentPerMember);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dA = new Date(a.paymentDate).getTime();
        const dB = new Date(b.paymentDate).getTime();
        return sortConfig.direction === 'desc' ? dB - dA : dA - dB;
      }
      if (sortConfig.key === 'amount') {
        const vA = a.amount;
        const vB = b.amount;
        return sortConfig.direction === 'desc' ? vB - vA : vA - vB;
      }
      if (sortConfig.key === 'name') {
        const nA = a.memberName.toLowerCase();
        const nB = b.memberName.toLowerCase();
        if (nA < nB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (nA > nB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
      return 0;
    });

    return result;
  }, [payments, searchQuery, timeFilter, selectedMonth, sortConfig, paymentFilter, showDuesOnly, members]);

  const handleExportExcel = () => {
    const exportData = filteredPayments.map(p => {
      const member = members.find(m => String(m.id) === String(p.memberId) || m._id === p.memberId);
      const date = new Date(p.paymentDate);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      return {
        'Settled Date': formattedDate,
        'Member': p.memberName,
        'Phone': member?.phone || 'N/A',
        'Reference': p.note,
        'Payment Mode': p.paymentMode || 'N/A',
        'Amount': p.amount
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Earnings");
    XLSX.writeFile(wb, `Gym_Earnings_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const columns: Column<MemberPayment>[] = [
    {
      header: (
        <div className="flex items-center gap-[1px]">
          SETTLED DATE
        </div>
      ),
      key: "paymentDate",
      headerClassName: "table-th pl-5 pr-[50px]",
      className: "w-1 py-5 pl-5 pr-[50px] whitespace-nowrap",
      render: (item) => (
        <span className="text-black text-[14px] leading-[20px] font-semibold">
          {new Date(item.paymentDate).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          })}
        </span>
      )
    },
    {
      header: (
        <div className="flex items-center gap-[1px]">
          MEMBER
        </div>
      ),
      key: "memberName",
      headerClassName: "table-th pr-[50px]",
      className: "w-1 py-5 pr-[50px] whitespace-nowrap",
      render: (item) => <span className="text-black text-[14px] leading-[20px] font-semibold">{item.memberName}</span>
    },
    {
      header: (
        <div className="flex items-center gap-[1px]">
          PHONE
        </div>
      ),
      key: "memberId",
      headerClassName: "table-th pr-[50px]",
      className: "w-1 py-5 pr-[50px] whitespace-nowrap ",
      render: (item) => {
        const member = members.find(m => String(m.id) === String(item.memberId) || m._id === item.memberId);
        return <span className="text-black text-[14px] leading-[20px] font-semibold">{member?.phone || 'N/A'}</span>;
      }
    },
    {
      header: (
        <div className="flex items-center gap-[1px]">
          REFERENCE
        </div>
      ),
      key: "note",
      headerClassName: "table-th text-left w-full",
      className: "py-5 whitespace-nowrap text-sm w-full",
      render: (item) => (
        <span className="text-black text-[14px] leading-[20px] font-semibold">
          {item.note}
        </span>
      )
    },
    {
      header: (
        <div className="flex items-center gap-[1px]">
          PAYMENT METHOD
        </div>
      ),
      key: "paymentMode",
      headerClassName: "table-th pr-[50px]",
      className: "w-1 py-5 pr-[50px] whitespace-nowrap",
      render: (item) => (
        <Tag variant={item.paymentMode === PaymentMode.UPI ? 'green' : 'orange'} className="uppercase">
          {item.paymentMode === PaymentMode.UPI ? 'UPI / CARD' : 'CASH'}
        </Tag>
      )
    },
    {
      header: (
        <div className="flex items-center gap-[1px]">
          AMOUNT
        </div>
      ),
      key: "amount",
      headerClassName: "table-th pr-[50px]",
      className: "w-1 py-5 pr-[50px] whitespace-nowrap",
      render: (item) => <span className="text-black text-[14px] leading-[20px] font-semibold">₹{Number(item.amount).toLocaleString()}</span>
    },
    {
      header: "ACTION",
      key: "_id",
      headerClassName: "table-th text-right px-5",
      className: "px-5 py-5 whitespace-nowrap text-right text-sm font-medium",
      render: (item) => (
        <div className="flex gap-2 justify-end">
          <ActionIcon
            variant="pdf"
            onClick={() => {
              const member = members.find(m => String(m.id) === String(item.memberId) || m._id === item.memberId);
              if (member) {
                generateInvoice(gym, { ...member, paidAmount: item.amount }, item.createdAt, item.note);
              }
            }}
          />
        </div>
      )
    }
  ];


  const currentMonthKey = useMemo(() =>
    new Date().toLocaleString('default', { month: 'short', year: 'numeric' }).toUpperCase(),
    []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4 md:space-y-0 px-4 md:px-5 lg:px-0 no-scrollbar">
      {/* Stats Overview */}
      <div className="flex overflow-x-auto md:pb-4 gap-2 md:gap-4 snap-x snap-mandatory no-scrollbar sm:grid sm:pb-0 sm:gap-[15px] sm:grid-cols-3">
        <StatsCard
          label="TOTAL EARNINGS"
          value={stats.totalEarnings}
          variant="green"
          isActive={selectedMonth === null && timeFilter === 'all'}
          onClick={() => { setSelectedMonth(null); setTimeFilter('all'); }}
          className="min-w-[200px]"
        >

        </StatsCard>
        <StatsCard
          label="COLLECTED THIS MONTH"
          value={stats.thisMonthEarnings}
          variant="green"
          isActive={selectedMonth === currentMonthKey}
          className="min-w-[200px]"
          onClick={() => {
            setSelectedMonth(selectedMonth === currentMonthKey ? null : currentMonthKey);
            setTimeFilter('all');
          }}
        >

        </StatsCard>
        <StatsCard
          label="PENDING AMOUNT"
          value={stats.pendingAmount}
          variant="orange"
          isActive={showDuesOnly}
          className="min-w-[200px]"
          onClick={() => {
            setShowDuesOnly(!showDuesOnly);
            if (!showDuesOnly) {
              setTimeFilter('all');
              setSelectedMonth(null);
            }
          }}
        >

        </StatsCard>
      </div>

      <div className="">
        {/* Monthly Performance Scroll */}
        <div className="flex gap-[5px] overflow-x-auto no-scrollbar mb-4 md:mb-5">
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedMonth(null);
              setTimeFilter('all');
            }}
            className={cn(
              "flex-shrink-0 h-[30px] md:h-[46px] border-main secondary-color whitespace-nowrap font-black hover:bg-white text-[12px] md:text-[16px] leading-[18px] md:leading-[22px] ",
              (selectedMonth === null && timeFilter === 'all') ? "bg-white" : "bg-transparent"
            )}
          >
            ALL
          </Button>
          {monthlyBreakdown.map(([month, amount]) => (
            <Button
              key={month}
              variant="secondary"
              onClick={() => {
                const nextMonth = selectedMonth === month ? null : month;
                setSelectedMonth(nextMonth);
                setTimeFilter('all');
              }}
              className={cn(
                "flex-shrink-0 h-[30px] md:h-[46px] border-main secondary-color whitespace-nowrap font-black hover:bg-white text-[12px] md:text-[16px] leading-[18px] md:leading-[22px]",
                selectedMonth === month ? "bg-white" : "bg-transparent"
              )}
            >
              {month} - ₹{amount.toLocaleString()}
            </Button>
          ))}
        </div>

        <div className="md:bg-white bg-transparent md:border md:border-[#E2E8F0] md:rounded-[10px]">
          <div className="space-y-4 md:space-y-5">
            {/* Filters Toolbar */}
            <div className="flex flex-col xl:flex-row justify-between xl:items-end md:space-y-4 xl:space-y-0 border-b border-[#E2E8F0] p-[15px] hidden md:flex md:p-5">
              <TabSelector
                options={timeFilterOptions}
                value={timeFilter}
                onChange={(val) => {
                  setTimeFilter(val as TimeFilter);
                  setSelectedMonth(null);
                }}
                className="hidden md:flex"
              />

              <div className="flex flex-row gap-[5px] items-center">
                <div className="relative hidden md:block w-full sm:w-auto">
                  <img src="/icons/search.svg" alt="" className="absolute left-[15px] top-1/2 -translate-y-1/2 size-5 z-10" />
                  <Input
                    type="text"
                    placeholder="SEARCH..."
                    className="block w-full sm:w-[191px] pl-[45px] pr-4 h-[46px] font-bold uppercase bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* <CustomDropdown
                  options={paymentOptions}
                  value={paymentFilter}
                  onChange={setPaymentFilter}
                  icon={<SortIcon className='size-5' />}
                  className='md:px-[13px]'
                /> */}

                <button onClick={handleExportExcel} className="size-[46px] flex items-center justify-center rounded-main border border-slate-200 hover:bg-slate-50 transition-colors bg-white">
                  <img src="/icons/excel.svg" alt="" className='size-[20px]' />
                </button>
              </div>
            </div>

            {/* Mobile Only Toolbar */}
            <div className="flex gap-[5px] md:hidden w-full ">
              <div className="relative flex-1">
                <img src="/icons/search.svg" alt="" className="absolute left-[15px] size-5 top-1/2 -translate-y-1/2 z-10" />
                <Input
                  type="text"
                  placeholder="SEARCH..."
                  className="block w-full h-[42px] pl-[45px] font-bold uppercase bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {/* <CustomDropdown
                options={paymentOptions}
                value={paymentFilter}
                onChange={setPaymentFilter}
                icon={<SortIcon className='size-5' />}
                className="h-[42px]"
              /> */}
              <button onClick={handleExportExcel} className="size-[42px] flex items-center justify-center rounded-main border border-slate-200 bg-white">
                <img src="/icons/excel.svg" alt="" className='size-4' />
              </button>
            </div>

            {/* Mobile Tab Scroller */}
            <TabSelector
              options={timeFilterOptions}
              value={timeFilter}
              onChange={(val) => {
                setTimeFilter(val as TimeFilter);
                setSelectedMonth(null);
              }}
              className="md:hidden overflow-x-auto no-scrollbar "
              itemClassName="min-w-fit px-4 border"
            />

            {/* Desktop Table container */}
            <div className="hidden md:block">
              <Table
                data={filteredPayments}
                columns={columns}
                keyExtractor={(p) => p._id || String(p.id)}
              />
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden space-y-[5px] pb-[10px]">
              {filteredPayments.map(p => {
                const member = members.find(m => String(m.id) === String(p.memberId) || m._id === p.memberId);
                return (
                  <div key={p._id || p.id} className="bg-white px-[10px] py-[15px] rounded-main border-main">
                    <div className="flex-1">
                      <div className='flex justify-between pb-[10px] items-center'>
                        <div className='flex gap-[5px] items-center'>
                          <div className='flex flex-col'>
                            <p className="text-[12px] leading-[18px] font-semibold">{p.memberName}</p>

                          </div>
                          <Tag variant={p.paymentMode === PaymentMode.UPI ? 'green' : 'orange'}>
                            {p.paymentMode === PaymentMode.UPI ? 'UPI / CARD' : 'CASH'}
                          </Tag>
                        </div>
                        <div>
                          <p className="text-[12px] leading-[18px] font-semibold">
                            ₹{p.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className='flex justify-between items-center'>
                        <div>
                          <div className='flex gap-[5px]'>
                            <p className="text-[#94A3B8] text-[12px] leading-[18px] font-semibold">
                              {new Date(p.paymentDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </p>
                            <p className="text-[12px] leading-[18px] font-semibold">{p.note}</p>
                          </div>
                          <p className="text-[12px] leading-[18px] font-semibold font-medium">{member?.phone}</p>
                        </div>
                        <div>
                          <ActionIcon
                            variant="pdf"
                            onClick={() => {
                              if (member) {
                                generateInvoice(gym, { ...member, paidAmount: p.amount }, p.createdAt, p.note);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredPayments.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-[#94A3B8] font-grotesk uppercase font-bold">No Records Found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymEarnings;
