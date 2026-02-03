
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

    // Sum of all pending balances
    const pendingDues = members
      .reduce((acc, m) => acc + (m.feesAmount - m.paidAmount), 0);

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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0">
      {/* Revenue High-Level Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="bg-charcoal p-8 rounded-[2rem] shadow-2xl shadow-charcoal/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brand/20 transition-all"></div>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Total Realized</p>
          <div>
            <span className="text-brand text-2xl font-black mr-1">₹</span>
            <span className="text-4xl font-black text-white tracking-tight">{stats.totalEarnings.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between relative group hover:shadow-xl hover:shadow-brand/5 transition-all">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Collected This Month</p>
          <div>
            <span className="text-brand text-2xl font-black mr-1">₹</span>
            <span className="text-4xl font-black text-slate-950 tracking-tight">{stats.thisMonthEarnings.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between relative group hover:shadow-xl hover:shadow-orange/5 transition-all">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Awaiting Balance</p>
          <div>
            <span className="text-orange-500 text-2xl font-black mr-1">₹</span>
            <span className="text-4xl font-black text-slate-950 tracking-tight">{stats.pendingDues.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Monthly Breakdown List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="px-2">
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-[0.2em]">Monthly Performance</h3>
          </div>
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="divide-y divide-slate-50">
              {monthlyHistory.map(([month, amount]) => (
                <div key={month} className="px-8 py-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-bold text-slate-700">{month}</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-black text-brand-700">₹</span>
                    <span className="text-sm font-black text-slate-950">{amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {monthlyHistory.length === 0 && (
                <div className="p-16 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-slate-300">📊</span>
                  </div>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction Ledger */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 px-2">
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-[0.2em]">Recent Inflow</h3>
            <div className="relative w-full sm:w-72">
              <SearchIcon className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:ring-4 focus:ring-brand/5 focus:border-brand outline-none shadow-sm transition-all"
              />
            </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-10 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Settled Date</th>
                    <th className="px-10 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Member</th>
                    <th className="px-10 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Reference</th>
                    <th className="px-10 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredTransactions.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-10 py-5 whitespace-nowrap text-xs font-black text-slate-400 group-hover:text-slate-600">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="px-10 py-5 whitespace-nowrap text-sm font-black text-slate-950">
                        {p.memberName}
                      </td>
                      <td className="px-10 py-5 whitespace-nowrap text-xs text-slate-400 italic group-hover:text-slate-600">
                        {p.note}
                      </td>
                      <td className="px-10 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <span className="text-xs font-black text-brand-700">₹</span>
                          <span className="text-sm font-black text-slate-950">{p.amount.toLocaleString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="sm:hidden divide-y divide-slate-50">
              {filteredTransactions.map(p => (
                <div key={p.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="space-y-1.5">
                    <p className="text-sm font-black text-slate-950 tracking-tight">{p.memberName}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(p.paymentDate).toLocaleDateString()} • {p.note}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-black text-brand-700">₹</span>
                    <span className="text-sm font-black text-slate-950">{p.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredTransactions.length === 0 && (
              <div className="p-32 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <SearchIcon className="w-6 h-6 text-slate-200" />
                </div>
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No matching records found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymEarnings;
