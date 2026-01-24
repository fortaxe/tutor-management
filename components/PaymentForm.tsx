
import React, { useState } from 'react';
import { SubscriptionPayment } from '../types';

interface PaymentFormProps {
  onSubmit: (payment: Omit<SubscriptionPayment, 'id'>) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: 300,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentDate: new Date().toISOString().split('T')[0],
    note: 'Subscription Renewal',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'amount' ? Number(value) : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount (INR)</label>
          <input 
            type="number" 
            name="amount" 
            value={formData.amount} 
            onChange={handleChange} 
            required 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Received Date</label>
          <input 
            type="date" 
            name="paymentDate" 
            value={formData.paymentDate} 
            onChange={handleChange} 
            required 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Period Start</label>
          <input 
            type="date" 
            name="startDate" 
            value={formData.startDate} 
            onChange={handleChange} 
            required 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Period End (Expiry)</label>
          <input 
            type="date" 
            name="endDate" 
            value={formData.endDate} 
            onChange={handleChange} 
            required 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Note</label>
        <textarea 
          name="note" 
          value={formData.note} 
          onChange={handleChange} 
          rows={2}
          placeholder="e.g. Upgraded to Yearly Plan"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-bold">Record Payment</button>
      </div>
    </form>
  );
};

export default PaymentForm;
