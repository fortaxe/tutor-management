
import React, { useState, useEffect } from 'react';
import { Gym, GymStatus, SubscriptionStatus } from '../types';

interface GymFormProps {
  gym?: Gym | null;
  onSubmit: (gymData: Omit<Gym, 'id'> | Gym, password?: string) => void;
  onCancel: () => void;
}

const GymForm: React.FC<GymFormProps> = ({ gym, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    ownerEmail: '',
    password: '',
    status: GymStatus.ACTIVE,
    subscriptionStatus: SubscriptionStatus.PENDING,
    subscriptionStartDate: new Date().toISOString().split('T')[0],
    subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalPaidAmount: 0,
  });

  useEffect(() => {
    if (gym) {
      setFormData(prev => ({
        ...prev,
        name: gym.name,
        ownerEmail: gym.ownerEmail,
        status: gym.status,
        subscriptionStatus: gym.subscriptionStatus,
        subscriptionStartDate: gym.subscriptionStartDate,
        subscriptionEndDate: gym.subscriptionEndDate,
        totalPaidAmount: gym.totalPaidAmount,
      }));
    }
  }, [gym]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'totalPaidAmount' ? Number(value) : value 
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gym) {
      const { password, ...gymOnlyData } = formData;
      onSubmit({ ...gym, ...gymOnlyData });
    } else {
      const { password, ...gymOnlyData } = formData;
      onSubmit(gymOnlyData, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Gym Name</label>
          <input 
            type="text" 
            name="name" 
            id="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm" 
          />
        </div>
        <div>
          <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700">Owner Email</label>
          <input 
            type="email" 
            name="ownerEmail" 
            id="ownerEmail" 
            value={formData.ownerEmail} 
            onChange={handleChange} 
            required 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm" 
          />
        </div>
      </div>

      {!gym && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Initial Owner Password</label>
          <input 
            type="text" 
            name="password" 
            id="password" 
            placeholder="e.g. TempPass123"
            value={formData.password} 
            onChange={handleChange} 
            required 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm" 
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
        <div>
          <label htmlFor="subscriptionStartDate" className="block text-sm font-medium text-gray-700">Subscription Start Date</label>
          <input 
            type="date" 
            name="subscriptionStartDate" 
            id="subscriptionStartDate" 
            value={formData.subscriptionStartDate} 
            onChange={handleChange} 
            required 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm" 
          />
        </div>
        <div>
          <label htmlFor="subscriptionEndDate" className="block text-sm font-medium text-gray-700">Subscription End Date</label>
          <input 
            type="date" 
            name="subscriptionEndDate" 
            id="subscriptionEndDate" 
            value={formData.subscriptionEndDate} 
            onChange={handleChange} 
            required 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="totalPaidAmount" className="block text-sm font-medium text-gray-700">Lifetime Amount Collected (INR)</label>
          <input 
            type="number" 
            name="totalPaidAmount" 
            id="totalPaidAmount" 
            value={formData.totalPaidAmount} 
            onChange={handleChange} 
            required 
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-bold text-brand-700" 
          />
          <p className="mt-1 text-xs text-gray-500">Record total cash/offline payment received from this owner.</p>
        </div>
        <div>
          <label htmlFor="subscriptionStatus" className="block text-sm font-medium text-gray-700">Subscription Status</label>
          <select 
            name="subscriptionStatus" 
            id="subscriptionStatus" 
            value={formData.subscriptionStatus} 
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
          >
            <option value={SubscriptionStatus.ACTIVE}>Active (Paid)</option>
            <option value={SubscriptionStatus.PENDING}>Pending (Payment Due)</option>
            <option value={SubscriptionStatus.EXPIRED}>Expired (Access Blocked)</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Overall Gym Status</label>
        <select 
          name="status" 
          id="status" 
          value={formData.status} 
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
        >
          <option value={GymStatus.ACTIVE}>Active</option>
          <option value={GymStatus.SUSPENDED}>Suspended</option>
          <option value={GymStatus.INACTIVE}>Inactive</option>
        </select>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700">
          {gym ? 'Update Gym' : 'Create Gym'}
        </button>
      </div>
    </form>
  );
};

export default GymForm;