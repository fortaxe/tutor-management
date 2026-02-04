
import React, { useState, useMemo } from 'react';
import { Gym, GymStatus, SubscriptionStatus } from '../types';
import Input from './Input';
import Button from './Button';
import { INDIAN_STATES } from '../data';

interface GymFormProps {
  gym?: Gym | null;
  onSubmit: (gymData: Omit<Gym, 'id'> | Gym, password?: string) => void;
  onCancel: () => void;
}



const GymForm: React.FC<GymFormProps> = ({ gym, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(() => {
    if (gym) {
      return {
        name: gym.name,
        ownerName: gym.ownerName || '',
        ownerPhone: gym.ownerPhone,
        state: gym.state || '',
        pincode: gym.pincode || '',
        password: '',
        status: gym.status,
        subscriptionStatus: gym.subscriptionStatus,
        subscriptionStartDate: gym.subscriptionStartDate,
        subscriptionEndDate: gym.subscriptionEndDate,
        totalPaidAmount: gym.totalPaidAmount,
      };
    }
    return {
      name: '',
      ownerName: '',
      ownerPhone: '',
      state: '',
      pincode: '',
      password: '',
      status: GymStatus.ACTIVE,
      subscriptionStatus: SubscriptionStatus.PENDING,
      subscriptionStartDate: new Date().toISOString().split('T')[0],
      subscriptionEndDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalPaidAmount: 0,
    };
  });

  const [stateSearch, setStateSearch] = useState(formData.state);
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  const filteredStates = useMemo(() => {
    if (!stateSearch) return INDIAN_STATES;
    return INDIAN_STATES.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()));
  }, [stateSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'ownerPhone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
      return;
    }

    if (name === 'pincode') {
      const cleaned = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalPaidAmount' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.ownerPhone.length !== 10) {
      alert("Owner mobile number must be exactly 10 digits.");
      return;
    }
    if (formData.pincode && formData.pincode.length !== 6) {
      alert("Pincode must be exactly 6 digits.");
      return;
    }

    const { password, ...gymOnlyData } = formData;

    if (gym) {
      onSubmit({ ...gym, ...gymOnlyData } as Gym, password.trim() || undefined);
    } else {
      onSubmit({ ...gymOnlyData, paymentHistory: [] } as Omit<Gym, 'id'>, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-[20px]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[20px] gap-y-[15px]">
        <Input
          label="Gym Name"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g. Muscle Factory"
        />
        <Input
          label="Owner Name"
          name="ownerName"
          id="ownerName"
          value={formData.ownerName}
          onChange={handleChange}
          required
          placeholder="e.g. Rajesh Kumar"
        />
        <Input
          label="Owner Mobile Number"
          type="tel"
          inputMode="numeric"
          name="ownerPhone"
          id="ownerPhone"
          value={formData.ownerPhone}
          onChange={handleChange}
          required
          maxLength={10}
          placeholder="10-digit number"
        />

        <div className="relative">
          <Input
            label="State"
            value={stateSearch}
            onChange={(e) => {
              setStateSearch(e.target.value);
              setShowStateDropdown(true);
            }}
            onFocus={() => setShowStateDropdown(true)}
            placeholder="Search or Select State"
            required
            autoComplete="off"
          />
          {showStateDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-[#E2E8F0] rounded-main shadow-lg max-h-[200px] overflow-y-auto no-scrollbar">
              {filteredStates.length > 0 ? (
                filteredStates.map(state => (
                  <div
                    key={state}
                    className="px-4 py-2 hover:bg-[#F8FAFC] cursor-pointer text-black text-sm font-medium"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, state: state }));
                      setStateSearch(state);
                      setShowStateDropdown(false);
                    }}
                  >
                    {state}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-[#9CA3AF] text-sm">No states found</div>
              )}
            </div>
          )}
          {/* Click outside to close */}
          {showStateDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowStateDropdown(false)} />}
        </div>

        <Input
          label="Pincode"
          type="text"
          inputMode="numeric"
          name="pincode"
          id="pincode"
          value={formData.pincode}
          onChange={handleChange}
          required
          maxLength={6}
          placeholder="6-digit pincode"
        />

        <Input
          label={gym ? 'Reset Password (Optional)' : ' Password'}
          type="password"
          name="password"
          id="password"
          placeholder={gym ? "Leave blank to keep current" : "Set login password"}
          value={formData.password}
          onChange={handleChange}
          required={!gym}
        />
      </div>

      <div className="pt-4 border-t border-[#E2E8F0]">
        <h3 className="text-[12px] font-bold font-grotesk secondary-color uppercase mb-[15px]">Subscription Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[20px] gap-y-[15px]">
          <Input
            label="Start Date"
            type="date"
            name="subscriptionStartDate"
            id="subscriptionStartDate"
            value={formData.subscriptionStartDate}
            onChange={handleChange}
            required
          />
          <Input
            label="End Date"
            type="date"
            name="subscriptionEndDate"
            id="subscriptionEndDate"
            value={formData.subscriptionEndDate}
            onChange={handleChange}
            required
          />
          <Input
            label="Lifetime Amount Collected (₹)"
            type="number"
            name="totalPaidAmount"
            id="totalPaidAmount"
            value={formData.totalPaidAmount}
            onChange={handleChange}
            required
            min="0"
          />
          <div className="space-y-[5px]">
            <label className="block text-[14px] leading-[20px] md:text-[16px] md:leading-[22px] font-bold font-grotesk secondary-color uppercase mb-[5px]">Subscription Status</label>
            <select
              name="subscriptionStatus"
              id="subscriptionStatus"
              value={formData.subscriptionStatus}
              onChange={handleChange}
              className="h-[48px] rounded-main border-main bg-[#F8FAFC] w-full px-[15px] outline-none transition-all text-black font-semibold"
            >
              <option value={SubscriptionStatus.ACTIVE}>Active (Paid)</option>
              <option value={SubscriptionStatus.PENDING}>Pending (Payment Due)</option>
              <option value={SubscriptionStatus.EXPIRED}>Expired (Access Blocked)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <label className="block text-[14px] leading-[20px] md:text-[16px] md:leading-[22px] font-bold font-grotesk secondary-color uppercase mb-[5px]">Overall Gym Status</label>
        <select
          name="status"
          id="status"
          value={formData.status}
          onChange={handleChange}
          className="h-[48px] rounded-main border-main bg-[#F8FAFC] w-full px-[15px] outline-none transition-all text-black font-semibold"
        >
          <option value={GymStatus.ACTIVE}>Active</option>
          <option value={GymStatus.SUSPENDED}>Suspended</option>
          <option value={GymStatus.INACTIVE}>Inactive</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-[#E2E8F0]">
        <Button onClick={onCancel} className="!bg-[#F1F5F9] !text-[#475569] hover:!bg-[#E2E8F0]">Cancel</Button>
        <Button type="submit">
          {gym ? 'Update Gym' : 'Create Gym'}
        </Button>
      </div>
    </form>
  );
};

export default GymForm;
