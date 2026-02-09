import { useMemo, useState } from 'react';
import { Tutor, StudentPayment, Student, PaymentMode } from '../types';
import Tag from '../components/Tag';
import ActionIcon from '../components/ActionIcon';
import { generateInvoice } from '@/lib/invoiceGenerator';
import StatsCard from '../components/StatsCard';
import { Table, Column } from '../components/Table';
import * as XLSX from 'xlsx';
import TabSelector from '../components/TabSelector';
import Button from '../components/Button';
import { cn } from '@/lib/utils';
import Input from '../components/Input';

interface TutorEarningsProps {
  tutor: Tutor;
  students: Student[];
  payments: StudentPayment[];
}

type TimeFilter = 'today' | 'yesterday' | '7days' | '30days' | 'all';

const timeFilterOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last 30 Days', value: '30days' },
];

const TutorEarnings: React.FC<TutorEarningsProps> = ({ tutor, students, payments }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [sortConfig] = useState({ key: 'date', direction: 'desc' });
  const [showDuesOnly] = useState(false);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalEarnings = payments.reduce((acc, p) => acc + p.amount, 0);

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const thisMonthEarnings = payments
      .filter(p => {
        const d = new Date(p.paymentDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, p) => acc + p.amount, 0);

    const pendingAmount = students.reduce((acc, s) => acc + (Math.max(0, s.feesAmount - s.paidAmount)), 0);
    const pendingCount = students.filter(s => s.feesAmount > s.paidAmount).length;

    return {
      totalEarnings: `₹${totalEarnings.toLocaleString()}`,
      thisMonthEarnings: `₹${thisMonthEarnings.toLocaleString()}`,
      pendingAmount: `₹${pendingAmount.toLocaleString()}`,
      pendingCount
    };
  }, [payments, students]);

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

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => {
        const student = students.find(s => String(s.id) === String(p.studentId) || s._id === p.studentId);
        const phone = student?.parentPhone?.toLowerCase() || student?.studentPhone?.toLowerCase() || '';
        return (
          p.studentName.toLowerCase().includes(q) ||
          p.note.toLowerCase().includes(q) ||
          phone.includes(q)
        );
      });
    }

    if (selectedMonth) {
      result = result.filter(p => {
        const d = new Date(p.paymentDate);
        const key = d.toLocaleString('default', { month: 'short', year: 'numeric' }).toUpperCase();
        return key === selectedMonth;
      });
    }

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


    if (showDuesOnly) {
      const studentsWithDues = students.filter(s => (s.feesAmount - s.paidAmount) > 0);
      const studentIdsWithDues = studentsWithDues.map(s => String(s.id || s._id));

      const latestPaymentPerStudent: Record<string, typeof result[0]> = {};
      result.forEach(p => {
        const studentId = String(p.studentId);
        if (studentIdsWithDues.includes(studentId)) {
          if (!latestPaymentPerStudent[studentId] ||
            new Date(p.paymentDate) > new Date(latestPaymentPerStudent[studentId].paymentDate)) {
            latestPaymentPerStudent[studentId] = p;
          }
        }
      });
      result = Object.values(latestPaymentPerStudent);
    }

    result.sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dA = new Date(a.paymentDate).getTime();
        const dB = new Date(b.paymentDate).getTime();
        return sortConfig.direction === 'desc' ? dB - dA : dA - dB;
      }
      return 0;
    });

    return result;
  }, [payments, searchQuery, timeFilter, selectedMonth, sortConfig, showDuesOnly, students]);

  const handleExportExcel = () => {
    const exportData = filteredPayments.map(p => {
      const student = students.find(s => String(s.id) === String(p.studentId) || s._id === p.studentId);
      const date = new Date(p.paymentDate);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      return {
        'Date': formattedDate,
        'Student': p.studentName,
        'Parent Phone': student?.parentPhone || 'N/A',
        'Note': p.note,
        'Payment Mode': p.paymentMode || 'N/A',
        'Amount': p.amount
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Earnings");
    XLSX.writeFile(wb, `Tutor_Earnings_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleShareReceipt = async (payment: StudentPayment) => {
    const student = students.find(s => String(s.id) === String(payment.studentId) || s._id === payment.studentId);
    if (!student || !student.parentPhone) return;

    try {
      if (navigator.share) {
        const blob = await generateInvoice(tutor, student as any, payment.createdAt, payment.note, true, payment.amount);
        if (blob instanceof Blob) {
          const file = new File([blob], `${student.name.replace(/\s+/g, '_')}_Receipt.pdf`, { type: 'application/pdf' });
          await navigator.share({
            files: [file],
            title: 'Payment Receipt',
            text: `Here is your payment receipt.`
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error sharing receipt:', error);
    }
  };

  const columns: Column<StudentPayment>[] = [
    {
      header: "DATE",
      key: "paymentDate",
      headerClassName: "table-th pl-5 pr-10",
      className: "w-1 py-5 pl-5 pr-10 whitespace-nowrap",
      render: (item) => (
        <span className="font-semibold">{new Date(item.paymentDate).toLocaleDateString()}</span>
      )
    },
    {
      header: "STUDENT",
      key: "studentName",
      headerClassName: "table-th pr-10",
      className: "w-1 py-5 pr-10 whitespace-nowrap",
      render: (item) => <span className="font-semibold">{item.studentName}</span>
    },
    {
      header: "PARENT PHONE",
      key: "studentId",
      headerClassName: "table-th pr-10",
      className: "w-1 py-5 pr-10 whitespace-nowrap",
      render: (item) => {
        const student = students.find(s => String(s.id) === String(item.studentId) || s._id === item.studentId);
        return <span className="text-gray-500 font-medium">{student?.parentPhone || 'N/A'}</span>;
      }
    },
    {
      header: "NOTE",
      key: "note",
      headerClassName: "table-th text-left w-full",
      className: "py-5 whitespace-nowrap text-sm w-full",
      render: (item) => <span className="text-gray-600 truncate max-w-[200px] block">{item.note}</span>
    },
    {
      header: "METHOD",
      key: "paymentMode",
      headerClassName: "table-th pr-10",
      className: "w-1 py-5 pr-10 whitespace-nowrap",
      render: (item) => (
        <Tag variant={item.paymentMode === PaymentMode.UPI ? 'green' : 'orange'}>
          {item.paymentMode === PaymentMode.UPI ? 'Online' : 'Cash'}
        </Tag>
      )
    },
    {
      header: "AMOUNT",
      key: "amount",
      headerClassName: "table-th pr-10",
      className: "w-1 py-5 pr-10 whitespace-nowrap",
      render: (item) => <span className="font-bold">₹{item.amount.toLocaleString()}</span>
    },
    {
      header: "ACTION",
      key: "_id",
      headerClassName: "table-th text-right px-5",
      className: "px-5 py-5 whitespace-nowrap text-right text-sm font-medium",
      render: (item) => (
        <div className="flex gap-2 justify-end">
          <ActionIcon variant="share" onClick={() => handleShareReceipt(item)} />
          <ActionIcon variant="pdf" onClick={() => {
            const student = students.find(s => String(s.id) === String(item.studentId) || s._id === item.studentId);
            if (student) generateInvoice(tutor, student as any, item.createdAt, item.note, false, item.amount);
          }} />
        </div>
      )
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4 px-4 md:px-5 lg:px-0">
      <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 gap-4 no-scrollbar">
        <StatsCard label="TOTAL EARNINGS" value={stats.totalEarnings} variant="green" />
        <StatsCard label="THIS MONTH" value={stats.thisMonthEarnings} variant="green" />
        <StatsCard label="PENDING BALANCE" value={stats.pendingAmount} variant="orange" />
      </div>

      <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar font-bold">
        <Button
          variant="secondary"
          className={cn("h-10 px-6 rounded-lg", !selectedMonth && timeFilter === 'all' ? "bg-black text-yellow-400" : "bg-gray-100 text-gray-500")}
          onClick={() => { setSelectedMonth(null); setTimeFilter('all'); }}
        >
          ALL HISTORY
        </Button>
        {monthlyBreakdown.map(([month, amount]) => (
          <Button
            key={month}
            variant="secondary"
            className={cn("h-10 px-4 rounded-lg whitespace-nowrap", selectedMonth === month ? "bg-black text-yellow-400" : "bg-gray-100 text-gray-500")}
            onClick={() => { setSelectedMonth(month === selectedMonth ? null : month); setTimeFilter('all'); }}
          >
            {month}: ₹{amount.toLocaleString()}
          </Button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row justify-between p-5 border-b border-gray-50 gap-4">
          <TabSelector
            options={timeFilterOptions}
            value={timeFilter}
            onChange={(val) => { setTimeFilter(val as TimeFilter); setSelectedMonth(null); }}
          />
          <div className="flex gap-2">
            <div className="relative w-full md:w-64">
              <img src="/icons/search.svg" alt="" className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-40" />
              <Input
                placeholder="Search payments..."
                className="pl-10 h-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={handleExportExcel} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <img src="/icons/excel.svg" alt="" className="size-5" />
            </button>
          </div>
        </div>

        <div className="hidden md:block">
          <Table data={filteredPayments} columns={columns} keyExtractor={(p) => p._id || String(p.id)} />
        </div>

        <div className="md:hidden divide-y divide-gray-50">
          {filteredPayments.map(p => {
            const student = students.find(s => String(s.id) === String(p.studentId) || s._id === p.studentId);
            return (
              <div key={p._id || p.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900">{p.studentName}</h4>
                    <p className="text-xs text-slate-500">{new Date(p.paymentDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">₹{p.amount.toLocaleString()}</p>
                    <Tag variant={p.paymentMode === PaymentMode.UPI ? 'green' : 'orange'}>{p.paymentMode === PaymentMode.UPI ? 'Online' : 'Cash'}</Tag>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400 truncate max-w-[200px]">{p.note}</p>
                  <div className="flex gap-2">
                    <ActionIcon variant="share" onClick={() => handleShareReceipt(p)} />
                    <ActionIcon variant="pdf" onClick={() => { if (student) generateInvoice(tutor, student as any, p.createdAt, p.note, false, p.amount); }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default TutorEarnings;
