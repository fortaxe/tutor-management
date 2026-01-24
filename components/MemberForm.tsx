
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
          <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="planStart" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input type="date" name="planStart" id="planStart" value={formData.planStart} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="planDurationDays" className="block text-sm font-medium text-gray-700">Duration (days)</label>
          <input type="number" name="planDurationDays" id="planDurationDays" value={formData.planDurationDays} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="feesAmount" className="block text-sm font-medium text-gray-700">Fees Amount (INR)</label>
          <input type="number" name="feesAmount" id="feesAmount" value={formData.feesAmount} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="feesStatus" className="block text-sm font-medium text-gray-700">Fees Status</label>
          <select name="feesStatus" id="feesStatus" value={formData.feesStatus} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value={PaymentStatus.UNPAID}>Unpaid</option>
            <option value={PaymentStatus.PAID}>Paid</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{member ? 'Update' : 'Add'} Member</button>
      </div>
    </form>
  );
};

export default MemberForm;
