
import React, { useMemo, useState } from 'react';
import { Gym, MemberPayment, Member, PaymentStatus } from '../types';
import SearchIcon from '../components/icons/SearchIcon';
import Badge from '../components/Badge';

interface GymEarningsProps {
  gym: Gym;
  members: Member[];
  payments: MemberPayment[];
}

const GymEarnings: React.FC<GymEarningsProps> = ({ gym, members, payments }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const stats = useMemo(() => {
    const totalEarnings = payments.reduce((acc, p) => acc + p.amount, 0);
    const thisMonthEarnings = payments
      .filter(p => {
        const d = new Date(p.paymentDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, p) => acc + p.amount, 0);
    
    const pendingDues = members
      .filter(m => m.feesStatus === PaymentStatus.UNPAID)
      .reduce((acc, m) => acc + m.feesAmount, 0);

    return { totalEarnings, thisMonthEarnings, pendingDues };
  }, [payments, members, currentMonth, currentYear]);

  const monthlyHistory = useMemo(() => {
    const groups: Record<string, number> = {};
    payments.forEach(p => {
      const d = new Date(p.paymentDate);
      const key = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      groups[key] = (groups[key] || 0) + p.amount;
    });
    return Object.entries(groups).sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateB.getTime() - dateA.getTime();
    });
  }, [payments]);

  const filteredTransactions = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return payments
      .filter(p => 
        p.memberName.toLowerCase().includes(q) || 
        p.note.toLowerCase().includes(q)
      )
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [payments, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Revenue High-Level Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-8 border-l-green-600">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lifetime Revenue</p>
          <p className="text-3xl font-black text-gray-900">₹{stats.totalEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-8 border-l-brand-600">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Revenue This Month</p>
          <p className="text-3xl font-black text-brand-700">₹{stats.thisMonthEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-8 border-l-yellow-600">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Receivables (Pending)</p>
          <p className="text-3xl font-black text-yellow-700">₹{stats.pendingDues.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Breakdown List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight ml-2">Monthly History</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {monthlyHistory.map(([month, amount]) => (
                <div key={month} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-bold text-gray-700">{month}</span>
                  <span className="text-sm font-black text-green-700">₹{amount.toLocaleString()}</span>
                </div>
              ))}
              {monthlyHistory.length === 0 && (
                <div className="p-10 text-center text-gray-400 text-sm font-bold">No history available</div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction Ledger */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Recent Transactions</h3>
            <div className="relative w-full sm:w-64">
                <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search member..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none shadow-sm"
                />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Member</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Note</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-500">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900">
                        {p.memberName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 italic">
                        {p.note}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-black text-green-700">₹{p.amount.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filteredTransactions.map(p => (
                <div key={p.id} className="p-4 flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-gray-900">{p.memberName}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(p.paymentDate).toLocaleDateString()} • {p.note}</p>
                  </div>
                  <p className="text-sm font-black text-green-700">₹{p.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {filteredTransactions.length === 0 && (
              <div className="p-20 text-center">
                 <p className="text-gray-400 font-bold">No transactions found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymEarnings;