
import React, { useState, useEffect } from 'react';
import { Member, PaymentStatus, MemberType } from '../types';
import CameraCapture from './CameraCapture';

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface MemberFormProps {
  member?: Member | null;
  initialType?: MemberType;
  onSubmit: (memberData: Omit<Member, 'id' | '_id'> | Member) => void;
  onCancel: () => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ member, initialType = MemberType.SUBSCRIPTION, onSubmit, onCancel }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [activeType, setActiveType] = useState<MemberType>(member?.memberType || initialType);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    planStart: new Date().toISOString().split('T')[0],
    planDurationDays: 30,
    feesAmount: '' as string,
    paidToday: '' as string,
    photo: undefined as string | undefined,
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email || '',
        phone: member.phone,
        planStart: member.planStart,
        planDurationDays: member.planDurationDays,
        feesAmount: member.feesAmount.toString(),
        paidToday: member.paidAmount.toString(),
        photo: member.photo,
      });
      setActiveType(member.memberType);
    } else {
      // Defaults for Day Pass
      if (activeType === MemberType.DAY_PASS) {
        setFormData(prev => ({
          ...prev,
          planDurationDays: 1,
          feesAmount: '100',
          paidToday: '100'
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          planDurationDays: 30,
          feesAmount: '',
          paidToday: ''
        }));
      }
    }
  }, [member, activeType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
      return;
    }

    if (name === 'feesAmount' || name === 'paidToday') {
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setFormData(prev => ({ ...prev, photo: compressed }));
      } catch (error) {
        console.error("Image compression error:", error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    const totalFee = Number(formData.feesAmount) || 0;
    const initialPaid = Number(formData.paidToday) || 0;

    let status = PaymentStatus.UNPAID;
    if (initialPaid === totalFee && totalFee > 0) status = PaymentStatus.PAID;
    else if (initialPaid > 0) status = PaymentStatus.PARTIAL;

    const submissionData = {
      name: formData.name,
      email: formData.email.trim() || undefined,
      phone: formData.phone,
      planStart: formData.planStart,
      planDurationDays: formData.planDurationDays,
      feesAmount: totalFee,
      paidAmount: initialPaid,
      feesStatus: status,
      memberType: activeType,
      photo: formData.photo,
    };

    if (member) {
      onSubmit({ ...member, ...submissionData } as Member);
    } else {
      onSubmit({ ...submissionData, gymId: 0 } as Omit<Member, 'id' | '_id'>);
    }
  };

  const inputClasses = "mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all sm:text-sm";
  const labelClasses = "block text-xs font-black text-gray-500 uppercase tracking-widest ml-1 mb-1";

  if (showCamera) {
    return (
      <div className="py-4">
        <h4 className="text-center font-black text-gray-900 uppercase tracking-widest mb-6">Capture Member Photo</h4>
        <CameraCapture onCapture={handlePhotoCapture} onCancel={() => setShowCamera(false)} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!member && (
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveType(MemberType.SUBSCRIPTION)}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeType === MemberType.SUBSCRIPTION ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Subscription
          </button>
          <button
            type="button"
            onClick={() => setActiveType(MemberType.DAY_PASS)}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeType === MemberType.DAY_PASS ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Quick Day Pass
          </button>
        </div>
      )}

      {/* Profile Section */}
      <div className="space-y-5">
        <div className="flex flex-col items-center pb-4">
          <div className="relative h-24 w-24 rounded-full border-2 border-dashed border-brand-200 bg-brand-50 flex items-center justify-center overflow-hidden mb-3">
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
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand hover:text-charcoal transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
              Camera
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand hover:text-charcoal transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Gallery
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="name" className={labelClasses}>Full Name</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputClasses} placeholder="e.g. Rahul Sharma" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className={labelClasses}>Mobile Number</label>
            <input
              type="tel"
              inputMode="numeric"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              maxLength={10}
              className={`${inputClasses} font-bold`}
              placeholder="10-digit number"
            />
          </div>
          <div>
            <label htmlFor="email" className={labelClasses}>Email (Optional)</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={inputClasses} placeholder="Optional" />
          </div>
        </div>
      </div>

      {/* Subscription Section - ONLY FOR NEW MEMBERS */}
      {!member && (
        <div className="pt-6 border-t border-slate-100 space-y-5">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Initial Membership Details</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Duration (Days)</label>
              {activeType === MemberType.DAY_PASS ? (
                <input type="number" name="planDurationDays" value={formData.planDurationDays} onChange={handleChange} className={inputClasses} min="1" />
              ) : (
                <select name="planDurationDays" value={formData.planDurationDays} onChange={handleChange} required className={inputClasses}>
                  <option value={30}>Monthly (30 days)</option>
                  <option value={90}>Quarterly (90 days)</option>
                  <option value={180}>Half Yearly (180 days)</option>
                  <option value={365}>Yearly (365 days)</option>
                </select>
              )}
            </div>
            <div>
              <label className={labelClasses}>Start Date</label>
              <input type="date" name="planStart" value={formData.planStart} onChange={handleChange} required className={inputClasses} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Total Fee (₹)</label>
              <input type="text" inputMode="numeric" name="feesAmount" value={formData.feesAmount} onChange={handleChange} required className={`${inputClasses} font-black`} />
            </div>
            <div>
              <label className={labelClasses}>Paid Today (₹)</label>
              <input type="text" inputMode="numeric" name="paidToday" value={formData.paidToday} onChange={handleChange} required className={`${inputClasses} font-black text-brand-700`} />
            </div>
          </div>
        </div>
      )}

      {member && (
        <div className="pt-6 border-t border-slate-100 space-y-5">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Plan Details</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Duration (Days)</label>
              {activeType === MemberType.DAY_PASS ? (
                <input type="number" name="planDurationDays" value={formData.planDurationDays} onChange={handleChange} className={inputClasses} min="1" />
              ) : (
                <select name="planDurationDays" value={formData.planDurationDays} onChange={handleChange} required className={inputClasses}>
                  <option value={30}>Monthly (30 days)</option>
                  <option value={90}>Quarterly (90 days)</option>
                  <option value={180}>Half Yearly (180 days)</option>
                  <option value={365}>Yearly (365 days)</option>
                  <option value={formData.planDurationDays}>{formData.planDurationDays} Days (Custom)</option>
                </select>
              )}
            </div>
            <div>
              <label className={labelClasses}>Start Date</label>
              <input type="date" name="planStart" value={formData.planStart} onChange={handleChange} required className={inputClasses} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Total Fee (₹)</label>
              <input type="text" inputMode="numeric" name="feesAmount" value={formData.feesAmount} onChange={handleChange} required className={`${inputClasses} font-black`} />
            </div>
            <div>
              <label className={labelClasses}>Paid Total (₹)</label>
              <input type="text" inputMode="numeric" name="paidToday" value={formData.paidToday} onChange={handleChange} required className={`${inputClasses} font-black text-brand-700`} />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="w-full sm:w-auto px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
        <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-brand-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-brand-700 shadow-lg active:scale-95 transition-all">
          {member ? 'Update Profile' : activeType === MemberType.DAY_PASS ? 'Issue Day Pass' : 'Register Member'}
        </button>
      </div>
    </form>
  );
};

export default MemberForm;
