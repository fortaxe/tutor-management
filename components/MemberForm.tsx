
import React, { useState, useEffect } from 'react';
import { Member, PaymentStatus } from '../types';
import CameraCapture from './CameraCapture';

interface MemberFormProps {
  member?: Member | null;
  onSubmit: (memberData: Omit<Member, 'id'> | Member) => void;
  onCancel: () => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ member, onSubmit, onCancel }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    planStart: new Date().toISOString().split('T')[0],
    planDurationDays: 30,
    feesAmount: '' as string, // Always handle as string in form for better input experience
    feesStatus: PaymentStatus.UNPAID,
    photo: undefined as string | undefined,
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email || '',
        phone: member.phone,
        planStart: member.planStart,
        planDurationDays: member.planDurationDays,
        feesAmount: member.feesAmount.toString(),
        feesStatus: member.feesStatus,
        photo: member.photo,
      });
    }
  }, [member]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'feesAmount') {
      // Allow empty string so the user can delete '0' or any value entirely
      if (value === '' || /^\d+$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }

    const isNumberField = ['planDurationDays'].includes(name);
    setFormData(prev => ({ ...prev, [name]: isNumberField ? Number(value) : value }));
  };
  
  const handlePhotoCapture = (imageData: string) => {
    setFormData(prev => ({ ...prev, photo: imageData }));
    setShowCamera(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submissionData = {
      ...formData,
      feesAmount: Number(formData.feesAmount) || 0,
      email: formData.email.trim() || undefined,
    };

    if (member) {
        onSubmit({ ...member, ...submissionData } as Member);
    } else {
        onSubmit({ ...submissionData, gymId: 0 } as Omit<Member, 'id'>);
    }
  };

  const inputClasses = "mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all sm:text-sm";
  const labelClasses = "block text-xs font-black text-gray-500 uppercase tracking-widest ml-1";

  if (showCamera) {
    return (
      <div className="py-4">
        <h4 className="text-center font-black text-gray-900 uppercase tracking-widest mb-6">Capture Member Photo</h4>
        <CameraCapture onCapture={handlePhotoCapture} onCancel={() => setShowCamera(false)} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-col items-center pb-4 border-b border-gray-50">
        <div 
          onClick={() => setShowCamera(true)}
          className="relative h-24 w-24 rounded-full border-2 border-dashed border-brand-200 bg-brand-50 flex items-center justify-center cursor-pointer hover:bg-brand-100 transition-colors group overflow-hidden"
        >
          {formData.photo ? (
            <img src={formData.photo} alt="Member preview" className="h-full w-full object-cover" />
          ) : (
            <div className="text-center p-2">
              <svg className="w-8 h-8 mx-auto text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="text-white text-[10px] font-black uppercase tracking-tighter">
              {formData.photo ? 'Change Photo' : 'Capture ID'}
            </span>
          </div>
        </div>
        <p className="mt-2 text-[10px] font-black text-brand-600 uppercase tracking-widest">
          Validation Photo
        </p>
      </div>

      <div>
        <label htmlFor="name" className={labelClasses}>Full Name</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputClasses} placeholder="Enter full name" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="email" className={labelClasses}>Email (Optional)</label>
          <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={inputClasses} placeholder="Optional" />
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
            <input 
              type="text" 
              inputMode="numeric"
              name="feesAmount" 
              id="feesAmount" 
              value={formData.feesAmount} 
              onChange={handleChange} 
              required 
              className={`${inputClasses} pl-8`} 
              placeholder="Enter amount"
            />
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
        <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-brand-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-brand-700 shadow-lg active:scale-95 transition-all">
          {member ? 'Save Profile' : 'Register Member'}
        </button>
      </div>
    </form>
  );
};

export default MemberForm;
