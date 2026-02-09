import React, { useState, useMemo } from 'react';
import { Tutor, TutorStatus, SubscriptionStatus } from '../types';
import Input from './Input';
import Button from './Button';
import { INDIAN_STATES } from '../data';

interface TutorFormProps {
  tutor?: Tutor | null;
  onSubmit: (tutorData: Omit<Tutor, 'id'> | Tutor, password?: string) => void;
  onCancel: () => void;
}

const TutorForm: React.FC<TutorFormProps> = ({ tutor, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(() => {
    if (tutor) {
      return {
        name: tutor.name,
        ownerName: tutor.ownerName || '',
        ownerPhone: tutor.ownerPhone,
        state: tutor.state || '',
        pincode: tutor.pincode || '',
        password: '',
        status: tutor.status,
        subscriptionStatus: tutor.subscriptionStatus,
        subscriptionStartDate: tutor.subscriptionStartDate,
        subscriptionEndDate: tutor.subscriptionEndDate,
        totalPaidAmount: tutor.totalPaidAmount,
      };
    }
    return {
      name: '',
      ownerName: '',
      ownerPhone: '',
      state: '',
      pincode: '',
      password: '',
      status: TutorStatus.ACTIVE,
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

    const { password, ...tutorOnlyData } = formData;

    if (tutor) {
      onSubmit({ ...tutor, ...tutorOnlyData } as Tutor, password.trim() || undefined);
    } else {
      onSubmit({ ...tutorOnlyData, paymentHistory: [] } as Omit<Tutor, 'id'>, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-[20px]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[20px] gap-y-[15px]">
        <Input
          label="Tutor / Institute Name"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g. Acme Coaching"
        />
        <Input
          label="Owner Name (Optional)"
          name="ownerName"
          id="ownerName"
          value={formData.ownerName}
          onChange={handleChange}
          placeholder="e.g. Jane Doe"
        />
        <Input
          label="Login Contact Number"
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
            label="Location State"
            value={stateSearch}
            onChange={(e) => {
              setStateSearch(e.target.value);
              setShowStateDropdown(true);
            }}
            onFocus={() => setShowStateDropdown(true)}
            placeholder="Select State"
            required
            autoComplete="off"
          />
          {showStateDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-[200px] overflow-y-auto no-scrollbar">
              {filteredStates.length > 0 ? (
                filteredStates.map(state => (
                  <div
                    key={state}
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-slate-900 text-sm font-bold border-b border-slate-50 last:border-0"
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
                <div className="px-4 py-3 text-slate-400 text-sm">No states found</div>
              )}
            </div>
          )}
          {showStateDropdown && (
            <div className="fixed inset-0 z-40" onClick={() => setShowStateDropdown(false)} />
          )}
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
          label={tutor ? 'Reset Password (Optional)' : 'Access Password'}
          type="password"
          name="password"
          id="password"
          placeholder={tutor ? "Leave blank to keep current" : "Set password"}
          value={formData.password}
          onChange={handleChange}
          required={!tutor}
        />
      </div>

      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-[15px]">Subscription Control</h3>
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
            label="Expiry Date"
            type="date"
            name="subscriptionEndDate"
            id="subscriptionEndDate"
            value={formData.subscriptionEndDate}
            onChange={handleChange}
            required
          />
          <Input
            label="Total Amount Received (₹)"
            type="number"
            name="totalPaidAmount"
            id="totalPaidAmount"
            value={formData.totalPaidAmount}
            onChange={handleChange}
            required
            min="0"
          />
          <div className="space-y-[5px]">
            <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-[5px] ml-1">Payment Status</label>
            <select
              name="subscriptionStatus"
              id="subscriptionStatus"
              value={formData.subscriptionStatus}
              onChange={handleChange}
              className="h-[52px] rounded-xl border border-slate-200 bg-slate-50 w-full px-[15px] outline-none transition-all text-slate-900 font-bold focus:ring-2 focus:ring-yellow-400"
            >
              <option value={SubscriptionStatus.ACTIVE}>Active / Paid</option>
              <option value={SubscriptionStatus.PENDING}>Pending / Due</option>
              <option value={SubscriptionStatus.EXPIRED}>Expired / Blocked</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-[5px] ml-1">Entity Global Status</label>
        <select
          name="status"
          id="status"
          value={formData.status}
          onChange={handleChange}
          className="h-[52px] rounded-xl border border-slate-200 bg-slate-50 w-full px-[15px] outline-none transition-all text-slate-900 font-bold focus:ring-2 focus:ring-yellow-400"
        >
          <option value={TutorStatus.ACTIVE}>Active</option>
          <option value={TutorStatus.SUSPENDED}>Suspended</option>
          <option value={TutorStatus.INACTIVE}>Inactive</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
        <Button onClick={onCancel} className="!bg-slate-100 !text-slate-500 hover:!bg-slate-200 border-none font-bold rounded-xl px-6">Cancel</Button>
        <Button type="submit" className="bg-yellow-400 text-black border-none hover:bg-yellow-500 font-extrabold rounded-xl px-10">
          {tutor ? 'UPDATE TUTOR' : 'CREATE TUTOR'}
        </Button>
      </div>
    </form>
  );
};

export default TutorForm;
