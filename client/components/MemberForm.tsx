import React, { useState, useRef, useEffect } from 'react';
import { Member, PaymentStatus, MemberType, PaymentMode } from '../types';
import CameraCapture from './CameraCapture';
import Input from './Input';
import Button from './Button';
import BorderButton from './BorderButton';

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
  const [step, setStep] = useState(1);
  const [activeType, setActiveType] = useState<MemberType>(member?.memberType || initialType);

  const [formData, setFormData] = useState(() => {
    if (member) {
      return {
        name: member.name,
        email: member.email || '',
        phone: member.phone,
        dob: member.dob || '',
        planStart: member.planStart,
        planDurationDays: member.planDurationDays,
        feesAmount: member.feesAmount.toString(),
        paidToday: member.paidAmount.toString(),
        paymentMode: member.paymentMode || PaymentMode.CASH,
        photo: member.photo,
      };
    }
    return {
      name: '',
      email: '',
      phone: '',
      dob: '',
      planStart: new Date().toISOString().split('T')[0],
      planDurationDays: initialType === MemberType.DAY_PASS ? 1 : 29,
      feesAmount: initialType === MemberType.DAY_PASS ? '100' : '',
      paidToday: initialType === MemberType.DAY_PASS ? '100' : '',
      paymentMode: PaymentMode.CASH,
      photo: undefined as string | undefined,
    };
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSetSubscription = () => {
    setActiveType(MemberType.SUBSCRIPTION);
    setFormData(prev => {
      if (prev.planDurationDays === 1) {
        return {
          ...prev,
          planDurationDays: 29,
          feesAmount: '',
          paidToday: ''
        };
      }
      return prev;
    });
  };

  const handleSetDayPass = () => {
    setActiveType(MemberType.DAY_PASS);
    setFormData(prev => ({
      ...prev,
      planDurationDays: 1,
      feesAmount: '100',
      paidToday: '100'
    }));
  };

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

  const validateStep1 = () => {
    if (!formData.name.trim()) return false;
    if (formData.phone.length !== 10) return false;
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    } else {
      alert("Please fill in all required fields (Name, Mobile).");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const totalFee = Number(formData.feesAmount) || 0;
    const initialPaid = Number(formData.paidToday) || 0;

    let status = PaymentStatus.UNPAID;
    if (initialPaid === totalFee && totalFee > 0) status = PaymentStatus.PAID;
    else if (initialPaid > 0) status = PaymentStatus.PARTIAL;

    const submissionData = {
      name: formData.name,
      email: formData.email.trim() || undefined,
      phone: formData.phone,
      dob: formData.dob || undefined,
      planStart: formData.planStart,
      planDurationDays: formData.planDurationDays,
      feesAmount: totalFee,
      paidAmount: initialPaid,
      feesStatus: status,
      memberType: activeType,
      photo: formData.photo,
      paymentMode: formData.paymentMode,
    };

    if (member) {
      onSubmit({ ...member, ...submissionData } as Member);
    } else {
      onSubmit({ ...submissionData, gymId: 0 } as Omit<Member, 'id' | '_id'>);
    }
  };

  const labelClasses = "block primary-description font-bold font-grotesk secondary-color uppercase mb-[5px]";
  const requiredStar = <span className="text-[#EF4444]">*</span>;

  if (showCamera) {
    return (
      <div className="py-4">
        <h4 className="text-center font-black text-gray-900 uppercase tracking-widest mb-6">Capture Member Photo</h4>
        <CameraCapture onCapture={handlePhotoCapture} onCancel={() => setShowCamera(false)} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      {/* Stepper Header */}
      <div className="flex items-center  mb-5 ">
        <div className="flex items-center gap-[5px]">
          <div className={`size-6 rounded-full flex items-center justify-center text-[12px] leading-[16px] font-grotesk font-bold ${step >= 1 ? 'primary-bg-green text-white ' : 'bg-[#F8FAFC] text-slate-400'}`}>01</div>

          <span className={` dashboard-primary-desc ${step >= 1 ? 'text-black' : 'secondary-color'}`}>Member Details</span>
        </div>
        <div className="h-px border border-[#E2E8F0] border-dashed w-8 md:w-[71px] mx-[5px]"></div>
        <div className="flex items-center gap-[5px]">
          <div className={`size-6 rounded-full flex items-center justify-center text-[12px] leading-[16px] font-grotesk font-bold ${step >= 2 ? 'primary-bg-green text-white' : 'border border-slate-200 text-slate-400'}`}>02</div>
          <span className={`dashboard-primary-desc ${step >= 2 ? 'text-black' : 'secondary-color'}`}>Membership Details</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {step === 1 && (
          <div className="">
            {!member && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleSetSubscription}
                  className={`flex-1 transition-colors ${activeType === MemberType.SUBSCRIPTION ? '!primary-bg-green !text-white' : '!bg-[#F8FAFC] !text-[#9CA3AF] border-main hover:!bg-slate-100'}`}
                >
                  Subscription
                </Button>
                <Button
                  type="button"
                  onClick={handleSetDayPass}
                  className={`flex-1 transition-colors ${activeType === MemberType.DAY_PASS ? '!bg-[#F59E0B] !text-white' : '!bg-[#F8FAFC] !text-[#9CA3AF] border-main hover:!bg-slate-100'}`}
                >
                  Day Pass
                </Button>
              </div>
            )}

            <div className="flex flex-col items-center gap-6 pt-5">
              <div className="size-[120px] rounded-main bg-[#F8FAFC] border border-dashed border-[#E2E8F0] flex items-center justify-center overflow-hidden relative group">
                {formData.photo ? (
                  <>
                    <img src={formData.photo} alt="Preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white text-xs font-bold" onClick={() => setFormData(p => ({ ...p, photo: undefined }))}>REMOVE</div>
                  </>
                ) : (
                  <div className="text-slate-300">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
              </div>

              <div className="flex w-full gap-2 mb-[30px] ">
                <BorderButton variant="green" className="flex-1 !bg-white !text-[#22C55E] !border-[#22C55E]" onClick={() => fileInputRef.current?.click()}>
                  <svg className="w-4 h-4 mr-[5px]" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.75 8C1.75 5.05372 1.75 3.58058 2.66529 2.66529C3.58058 1.75 5.05372 1.75 8 1.75C10.9462 1.75 12.4194 1.75 13.3347 2.66529C14.25 3.58058 14.25 5.05372 14.25 8C14.25 10.9462 14.25 12.4194 13.3347 13.3347C12.4194 14.25 10.9462 14.25 8 14.25C5.05372 14.25 3.58058 14.25 2.66529 13.3347C1.75 12.4194 1.75 10.9462 1.75 8Z" stroke="#22C55E" stroke-width="1.3" />
                    <path d="M9.25 5.5C9.25 5.83152 9.3817 6.14946 9.61612 6.38388C9.85054 6.6183 10.1685 6.75 10.5 6.75C10.8315 6.75 11.1495 6.6183 11.3839 6.38388C11.6183 6.14946 11.75 5.83152 11.75 5.5C11.75 5.16848 11.6183 4.85054 11.3839 4.61612C11.1495 4.3817 10.8315 4.25 10.5 4.25C10.1685 4.25 9.85054 4.3817 9.61612 4.61612C9.3817 4.85054 9.25 5.16848 9.25 5.5Z" stroke="#22C55E" stroke-width="1.3" />
                    <path d="M1.75 6.84605L2.36296 6.75805C6.72435 6.13177 10.4524 9.89448 9.78569 14.2499" stroke="#22C55E" stroke-width="1.3" stroke-linecap="round" />
                    <path d="M14.2499 8.86562L13.6415 8.78137C11.8641 8.53524 10.2559 9.42012 9.42773 10.8128" stroke="#22C55E" stroke-width="1.3" stroke-linecap="round" />
                  </svg>

                  Gallery
                </BorderButton>
                <BorderButton variant="green" className="flex-1 !bg-white !text-[#22C55E] !border-[#22C55E]" onClick={() => setShowCamera(true)}>
                  <svg className="w-4 h-4 mr-[5px]" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.125 8.625C6.125 9.12228 6.32254 9.59919 6.67417 9.95083C7.02581 10.3025 7.50272 10.5 8 10.5C8.49728 10.5 8.97419 10.3025 9.32583 9.95083C9.67746 9.59919 9.875 9.12228 9.875 8.625C9.875 8.12772 9.67746 7.65081 9.32583 7.29917C8.97419 6.94754 8.49728 6.75 8 6.75C7.50272 6.75 7.02581 6.94754 6.67417 7.29917C6.32254 7.65081 6.125 8.12772 6.125 8.625Z" stroke="#22C55E" stroke-width="1.3" />
                    <path d="M6.61111 13.625H9.38888C11.3396 13.625 12.3149 13.625 13.0155 13.1654C13.3188 12.9664 13.5792 12.7107 13.7819 12.4129C14.25 11.7251 14.25 10.7674 14.25 8.85225C14.25 6.93713 14.25 5.97951 13.7819 5.29163C13.5792 4.99384 13.3188 4.73815 13.0155 4.53918C12.5653 4.24383 12.0017 4.13827 11.1388 4.10054C10.7269 4.10054 10.3724 3.79418 10.2917 3.39773C10.1705 2.80306 9.63869 2.375 9.02106 2.375H6.97894C6.36128 2.375 5.82947 2.80306 5.70833 3.39773C5.62757 3.79418 5.27303 4.10054 4.86125 4.10054C3.99833 4.13827 3.43472 4.24383 2.98452 4.53918C2.68122 4.73815 2.4208 4.99384 2.21814 5.29163C1.75 5.97951 1.75 6.93713 1.75 8.85225C1.75 10.7674 1.75 11.7251 2.21814 12.4129C2.4208 12.7107 2.68122 12.9664 2.98452 13.1654C3.68515 13.625 4.66047 13.625 6.61111 13.625Z" stroke="#22C55E" stroke-width="1.3" />
                    <path d="M12.375 6.75H11.75" stroke="#22C55E" stroke-width="1.3" stroke-linecap="round" />
                  </svg>

                  Camera
                </BorderButton>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
              </div>
            </div>

            <div className="space-y-[10px]">
              <div>
                <label className={labelClasses}>Full Name{requiredStar}</label>
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. name" required />
              </div>
              <div>
                <label className={labelClasses}>Mobile{requiredStar}</label>
                <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="10 digit number" maxLength={10} required inputMode="numeric" />
              </div>
              <div>
                <label className={labelClasses}>Email</label>
                <Input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" />
              </div>
              <div className="relative">
                <label className={labelClasses}>Date of Birth{requiredStar}</label>
                <div className="relative w-full">
                  <Input
                    name="dob_display"
                    value={formData.dob ? formData.dob.split('-').reverse().join('-') : ''}
                    readOnly
                    placeholder="DD-MM-YYYY"
                    className="pr-10 bg-[#F8FAFC]"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.75 8C1.75 5.64298 1.75 4.46447 2.48223 3.73223C3.21447 3 4.39298 3 6.75 3H9.25C11.607 3 12.7856 3 13.5177 3.73223C14.25 4.46447 14.25 5.64298 14.25 8V9.25C14.25 11.607 14.25 12.7856 13.5177 13.5177C12.7856 14.25 11.607 14.25 9.25 14.25H6.75C4.39298 14.25 3.21447 14.25 2.48223 13.5177C1.75 12.7856 1.75 11.607 1.75 9.25V8Z" stroke="black" strokeWidth="1.3" />
                      <path d="M4.875 3V2.0625" stroke="black" strokeWidth="1.3" strokeLinecap="round" />
                      <path d="M11.125 3V2.0625" stroke="black" strokeWidth="1.3" strokeLinecap="round" />
                      <path d="M2.0625 6.125H13.9375" stroke="black" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    onClick={(e) => { try { e.currentTarget.showPicker(); } catch { } }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-[#F8FAFC] rounded-main border border-[#E2E8F0] p-4">
              <h4 className="text-[12px] leading-[16px] font-bold text-[#64748B] uppercase font-grotesk mb-3">Calculated Coverage</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] leading-[14px] font-medium text-[#64748B] mb-1">Starts From</label>
                  <div className="text-[14px] leading-[20px] font-bold text-[#0F172A] font-grotesk">
                    {formData.planStart ? new Date(formData.planStart).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] leading-[14px] font-medium text-[#64748B] mb-1">Ends On</label>
                  <div className="text-[14px] leading-[20px] font-bold text-[#0F172A] font-grotesk">
                    {(() => {
                      if (!formData.planStart) return '-';
                      const date = new Date(formData.planStart);
                      date.setDate(date.getDate() + (Number(formData.planDurationDays) || 0));
                      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#F1F5F9] rounded-full">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.75 11.2336C2.26071 11.8386 3.01353 12.25 3.86478 12.25H10.1352C10.9865 12.25 11.7393 11.8386 12.25 11.2336M1.75 11.2336C1.43634 10.8621 1.25 10.3845 1.25 9.86667V3.58333C1.25 2.50634 2.12656 1.63333 3.20833 1.63333H10.7917C11.8734 1.63333 12.75 2.50634 12.75 3.58333V9.86667C12.75 10.3845 12.5637 10.8621 12.25 11.2336M1.75 11.2336C1.75 11.4554 1.79133 11.6677 1.86756 11.8647M12.25 11.2336C12.25 11.4554 12.2087 11.6677 12.1324 11.8647M4.16667 3.96667H9.83333M4.16667 6.3H7.58333" stroke="#0F172A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-[14px] leading-[20px] font-bold text-[#0F172A] font-grotesk">Configure Membership Term</h3>
            </div>

            <div>
              <label className={labelClasses}>Duration (Days){requiredStar}</label>
              {activeType === MemberType.DAY_PASS ? (
                <div className="h-[48px] rounded-main border-main bg-[#F8FAFC] flex items-center px-[15px] text-[#0F172A] font-grotesk font-bold">1 Day</div>
              ) : (
                <div className="relative">
                  <select name="planDurationDays" value={formData.planDurationDays} onChange={handleChange} className="h-[48px] rounded-main border-main bg-[#F8FAFC] w-full px-[15px] outline-none appearance-none text-[#0F172A] focus:border-[#E4E9F0] font-grotesk font-bold" required>
                    <option value={29}>Monthly (30 Days)</option>
                    <option value={89}>Quarterly (90 Days)</option>
                    <option value={179}>Half Yearly (180 Days)</option>
                    <option value={364}>Yearly (365 Days)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.375 6.125L8 9.875L3.625 6.125" stroke="#0F172A" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <label className={labelClasses}>Start Date{requiredStar}</label>
              <div className="relative w-full">
                <Input
                  name="planStart_display"
                  value={formData.planStart ? formData.planStart.split('-').reverse().join('-') : ''}
                  readOnly
                  className="pr-10 bg-[#F8FAFC]"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer z-10 w-5 h-5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <path d="M1.75 8C1.75 5.64298 1.75 4.46447 2.48223 3.73223C3.21447 3 4.39298 3 6.75 3H9.25C11.607 3 12.7856 3 13.5177 3.73223C14.25 4.46447 14.25 5.64298 14.25 8V9.25C14.25 11.607 14.25 12.7856 13.5177 13.5177C12.7856 14.25 11.607 14.25 9.25 14.25H6.75C4.39298 14.25 3.21447 14.25 2.48223 13.5177C1.75 12.7856 1.75 11.607 1.75 9.25V8Z" stroke="black" strokeWidth="1.3" />
                    <path d="M4.875 3V2.0625" stroke="black" strokeWidth="1.3" strokeLinecap="round" />
                    <path d="M11.125 3V2.0625" stroke="black" strokeWidth="1.3" strokeLinecap="round" />
                    <path d="M2.0625 6.125H13.9375" stroke="black" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </div>
                <input
                  type="date"
                  name="planStart"
                  value={formData.planStart}
                  onChange={handleChange}
                  onClick={(e) => { try { e.currentTarget.showPicker(); } catch { } }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Total Fee{requiredStar}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <Input className="pl-8" name="feesAmount" value={formData.feesAmount} onChange={handleChange} placeholder="0" inputMode="numeric" required />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Paid Today{requiredStar}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <Input className="pl-8" name="paidToday" value={formData.paidToday} onChange={handleChange} placeholder="0" inputMode="numeric" required />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Payment Method{requiredStar}</label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div
                  onClick={() => setFormData(p => ({ ...p, paymentMode: PaymentMode.CASH }))}
                  className={`border rounded-main h-[46px] flex items-center justify-center cursor-pointer uppercase font-bold text-sm transition-all ${formData.paymentMode === PaymentMode.CASH ? 'border-[#22C55E] bg-[#22C55E]/5 text-[#22C55E]' : 'bg-[#F8FAFC] border-main secondary-color hover:bg-slate-100'}`}
                >
                  Cash
                </div>
                <div
                  onClick={() => setFormData(p => ({ ...p, paymentMode: PaymentMode.UPI }))}
                  className={`border rounded-main h-[46px] flex items-center justify-center cursor-pointer uppercase font-bold text-sm transition-all ${formData.paymentMode === PaymentMode.UPI ? 'border-[#22C55E] bg-[#22C55E]/5 text-[#22C55E]' : 'bg-[#F8FAFC] border-main secondary-color hover:bg-slate-100'}`}
                >
                  Online
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-5 mt-auto">
        {step === 1 ? (
          <Button type="button" onClick={handleNext} block>
            Next <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              type="button" onClick={() => setStep(1)}
              className="!bg-[#F8FAFC] !w-fit border-main secondary-color gap-[5px] px-6">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span>Back</span>
            </Button>
            <Button type="submit" className="flex-1 ">
              {member ? 'Update Member' : 'Register Member'}
              <svg className='ml-[5px]' width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8H13M13 8L9.25 4.25M13 8L9.25 11.75" stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>

            </Button>
          </div>
        )}
      </div>
    </form>
  );
};

export default MemberForm;
