
import React, { useState, useEffect } from 'react';
import { Member, PaymentStatus } from '../types';

interface MemberFormProps {
  member?: Member | null;
  onSubmit: (memberData: Omit<Member, 'id'> | Member) => void;
  onCancel: () => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ member, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    planStart: new Date().toISOString().split('T')[0],
    planDurationDays: 30,
    feesAmount: 0,
    feesStatus: PaymentStatus.UNPAID,
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone,
        planStart: member.planStart,
        planDurationDays: member.planDurationDays,
        feesAmount: member.feesAmount,
        feesStatus: member.feesStatus,
      });
    }
  }, [member]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumberField = ['planDurationDays', 'feesAmount'].includes(name);
    setFormData(prev => ({ ...prev, [name]: isNumberField ? Number(value) : value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (member) {
        onSubmit({ ...member, ...formData });
    } else {
        onSubmit({ ...formData, gymId: 0 }); // gymId will be set in parent
    }
  };

  const inputClasses = "mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all sm:text-sm";
  const labelClasses = "block text-xs font-black text-gray-500 uppercase tracking-widest ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className={labelClasses}>Full Name</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputClasses} placeholder="Enter full name" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="email" className={labelClasses}>Email Address</label>
          <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className={inputClasses} placeholder="email@example.com" />
        </div>
        <div>
          <label htmlFor="phone" className={labelClasses}>Phone Number</label>
          <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className={inputClasses} placeholder="+91 00000 00000" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-gray-50">
        <div>
          <label htmlFor="planStart" className={labelClasses}>Subscription Start</label>
          <input type="date" name="planStart" id="planStart" value={formData.planStart} onChange={handleChange} required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="planDurationDays" className={labelClasses}>Duration (Days)</label>
          <select name="planDurationDays" id="planDurationDays" value={formData.planDurationDays} onChange={handleChange} required className={inputClasses}>
             <option value={30}>Monthly (30 days)</option>
             <option value={90}>Quarterly (90 days)</option>
             <option value={180}>Half Yearly (180 days)</option>
             <option value={365}>Yearly (365 days)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-gray-50">
        <div>
          <label htmlFor="feesAmount" className={labelClasses}>Fees Amount (INR)</label>
          <div className="relative">
            <span className="absolute left-4 top-4 text-gray-400 font-bold">₹</span>
            <input type="number" name="feesAmount" id="feesAmount" value={formData.feesAmount} onChange={handleChange} required className={`${inputClasses} pl-8`} />
          </div>
        </div>
        <div>
          <label htmlFor="feesStatus" className={labelClasses}>Payment Status</label>
          <select name="feesStatus" id="feesStatus" value={formData.feesStatus} onChange={handleChange} className={inputClasses}>
            <option value={PaymentStatus.UNPAID}>Unpaid (Mark as pending)</option>
            <option value={PaymentStatus.PAID}>Paid (Record payment)</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
        <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg active:scale-95 transition-all">
          {member ? 'Save Changes' : 'Register Member'}
        </button>
      </div>
    </form>
  );
};

export default MemberForm;