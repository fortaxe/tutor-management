import React, { useState, useRef } from 'react';
import { useMembershipDuration } from '../hooks/useMembershipDuration';
import { Member, PaymentStatus, MemberType, PaymentMode } from '../types';
import CameraCapture from './CameraCapture';
import Input from './Input';
import Button from './Button';
import BorderButton from './BorderButton';
import DateInput from './DateInput';
import {
  PhotoPlaceholderIcon,
  GalleryIcon,
  CameraIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SubmitArrowIcon
} from './icons/FormIcons';
import Select from './Select';


import { compressImage } from '../lib/imageUtils';

interface MemberFormProps {
  member?: Member | null;
  initialType?: MemberType;
  onSubmit: (memberData: Omit<Member, 'id' | '_id'> | Member) => void;
  onCancel: () => void;
}

const formatDate = (dateStr: string | Date) => {
  const d = new Date(dateStr);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

const MemberForm: React.FC<MemberFormProps> = ({ member, initialType = MemberType.SUBSCRIPTION, onSubmit, onCancel: _onCancel }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [step, setStep] = useState(1);
  const [activeType, setActiveType] = useState<MemberType>(member?.memberType || initialType);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const [feesFocus, setFeesFocus] = useState(false);
  const [paidFocus, setPaidFocus] = useState(false);

  const [formData, setFormData] = useState(() => {
    if (member) {
      return {
        name: member.name,
        email: member.email || '',
        phone: member.phone,
        dob: member.dob || '',
        planStart: formatDate(member.planStart),
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

  const {
    isCustomRenewal,
    customMonths,
    handleDurationChange,
    handleCustomMonthChange,
    setIsCustomRenewal,
    setCustomMonths
  } = useMembershipDuration(formData.planDurationDays, (newDuration) => {
    setFormData(prev => ({ ...prev, planDurationDays: newDuration }));
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSetSubscription = () => {
    setActiveType(MemberType.SUBSCRIPTION);
    setFormData(prev => {
      if (prev.planDurationDays === 1) {
        setIsCustomRenewal(false);
        setCustomMonths('');
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

  /* Step 2: Set stored duration to 0 for Day Pass, effectively 1 day (Start + 0) */
  const handleSetDayPass = () => {
    setActiveType(MemberType.DAY_PASS);
    setFormData(prev => ({
      ...prev,
      planDurationDays: 0,
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

    if (name === 'name' || name === 'phone') {
      if (value.trim()) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
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
    const newErrors: { name?: string; phone?: string } = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.phone.length !== 10) newErrors.phone = "Phone number must be 10 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (validateStep1()) {
      setStep(2);
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

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* EDIT MODE: Single View */}
        {member ? (
          <div className="space-y-[20px] pt-2">
            {/* Photo Section */}
            <div className="flex flex-col items-center gap-6">
              <div className="size-[120px] rounded-main bg-[#F8FAFC] border border-dashed border-[#E2E8F0] flex items-center justify-center overflow-hidden relative group">
                {formData.photo ? (
                  <>
                    <img src={formData.photo} alt="Preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white text-xs font-bold" onClick={() => setFormData(p => ({ ...p, photo: '' }))}>REMOVE</div>
                  </>
                ) : (
                  <div className="text-slate-300">
                    <PhotoPlaceholderIcon />
                  </div>
                )}
              </div>

              <div className="flex w-full gap-2 pb-[10px]">
                <BorderButton variant="green" className="flex-1 bg-white border-[#22C55E] text-[#22C55E]" onClick={() => fileInputRef.current?.click()}>
                  <GalleryIcon className="w-4 h-4 mr-[5px]" />
                  <span className="hidden md:inline">UPLOAD</span>
                  <span className="md:hidden">GALLERY</span>
                </BorderButton>
                <BorderButton variant="green" className="flex-1 bg-white border-[#22C55E] text-[#22C55E]" onClick={() => setShowCamera(true)}>
                  <CameraIcon className="w-4 h-4 mr-[5px]" />
                  CAMERA
                </BorderButton>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-[15px]">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. name"
                required
                error={errors.name}
              />
              <Input
                label="Mobile"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10 digit number"
                maxLength={10}
                required
                inputMode="numeric"
                error={errors.phone}
              />

              {/* Duration Logic */}
              <div>
                <Select
                  label="Duration (Days)"
                  name="planDurationDays"
                  value={formData.planDurationDays === 0 ? 'custom' : (isCustomRenewal ? 'custom' : formData.planDurationDays)}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomRenewal(true);
                    } else {
                      handleDurationChange(e);
                    }
                  }}
                  required
                >
                  <option value={29}>Monthly (30 Days)</option>
                  <option value={89}>Quarterly (90 Days)</option>
                  <option value={179}>Half Yearly (180 Days)</option>
                  <option value={364}>Yearly (365 Days)</option>
                  <option value="custom">Custom</option>
                </Select>
                {/* Show custom input if explicit custom state OR if value doesn't match presets (and isn't 0/empty initial) - simplified to isCustomRenewal since hook handles it mostly, 
                      but for edit mode we need to ensure existing custom values show input.
                      The 'useMembershipDuration' hook handles 'isCustomRenewal' initialization if we passed simpler logic? 
                      Actually the hook initializes based on duration match. So it should work. */}
                {isCustomRenewal && (
                  <div className="mt-[10px] animate-in fade-in slide-in-from-top-2 duration-300">
                    <Input
                      label="Months"
                      type="number"
                      min="1"
                      max="16"
                      value={customMonths}
                      onChange={handleCustomMonthChange}
                      placeholder="Enter months..."
                      required
                    />
                  </div>
                )}
              </div>

              <DateInput
                label="Start Date"
                name="planStart"
                value={formData.planStart}
                onChange={handleChange}
                required
              />

              <Input
                label="Total Fee"
                startContent={<span className={`text-[14px] md:text-[16px] leading-[20px] md:leading-[22px] font-semibold ${feesFocus || formData.feesAmount ? 'text-black' : 'secondary-color'}`}>&#8377;</span>}
                name="feesAmount"
                value={formData.feesAmount}
                onChange={handleChange}
                onFocus={() => setFeesFocus(true)}
                onBlur={() => setFeesFocus(false)}
                placeholder="0"
                inputMode="numeric"
                required
              />

              <Input
                label="Paid Today"
                startContent={<span className={`text-[14px] md:text-[16px] leading-[20px] md:leading-[22px] font-semibold ${paidFocus || formData.paidToday ? 'text-black' : 'secondary-color'}`}>&#8377;</span>}
                name="paidToday"
                value={formData.paidToday}
                onChange={handleChange}
                onFocus={() => setPaidFocus(true)}
                onBlur={() => setPaidFocus(false)}
                placeholder="0"
                inputMode="numeric"
                required
              />
            </div>
          </div>
        ) : (
          /* ADD MEMBER MODE (Original Steps) */
          <>
            {step === 1 && (
              <div className="">
                {!member && (
                  <div className="flex gap-2 pb-5">
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
                      className={`flex-1 transition-colors ${activeType === MemberType.DAY_PASS ? '!bg-[#4F46E5] !text-white' : '!bg-[#F8FAFC] !text-[#9CA3AF] border-main hover:!bg-slate-100'}`}
                    >
                      Day Pass
                    </Button>
                  </div>
                )}

                <div className="flex flex-col items-center gap-6 ">
                  <div className="size-[120px] rounded-main bg-[#F8FAFC] border border-dashed border-[#E2E8F0] flex items-center justify-center overflow-hidden relative group">
                    {formData.photo ? (
                      <>
                        <img src={formData.photo} alt="Preview" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white text-xs font-bold" onClick={() => setFormData(p => ({ ...p, photo: '' }))}>REMOVE</div>
                      </>
                    ) : (
                      <div className="text-slate-300">
                        <PhotoPlaceholderIcon />
                      </div>
                    )}
                  </div>

                  <div className="flex w-full gap-2 pb-[30px] ">
                    <BorderButton variant="green" className="flex-1 bg-white border-[#22C55E] text-[#22C55E]" onClick={() => fileInputRef.current?.click()}>
                      <GalleryIcon className="w-4 h-4 mr-[5px]" />
                      <span className="hidden md:inline">UPLOAD</span>
                      <span className="md:hidden">GALLERY</span>
                    </BorderButton>
                    <BorderButton variant="green" className="flex-1 bg-white border-[#22C55E] text-[#22C55E]" onClick={() => setShowCamera(true)}>
                      <CameraIcon className="w-4 h-4 mr-[5px]" />
                      CAMERA
                    </BorderButton>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                  </div>
                </div>

                <div className="space-y-[10px]">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. name"
                    required
                    error={errors.name}
                  />
                  <Input
                    label="Mobile"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10 digit number"
                    maxLength={10}
                    required
                    inputMode="numeric"
                    error={errors.phone}
                  />
                  <Input
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    type="email"
                  />
                  <DateInput
                    label="Date of Birth"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                  />

                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">

                <div className="space-y-[10px]">
                  {activeType === MemberType.DAY_PASS ? (
                    <div className="space-y-[10px]">
                      <label className={labelClasses}>Duration (Days){requiredStar}</label>
                      <div className="h-[48px] rounded-main border-main bg-[#F8FAFC] flex items-center px-[15px] text-black font-grotesk font-bold">1 Day</div>
                    </div>
                  ) : (
                    <div>
                      <Select
                        label="Duration (Days)"
                        name="planDurationDays"
                        value={isCustomRenewal ? 'custom' : formData.planDurationDays}
                        onChange={handleDurationChange}
                        required
                      >
                        <option value={29}>Monthly (30 Days)</option>
                        <option value={89}>Quarterly (90 Days)</option>
                        <option value={179}>Half Yearly (180 Days)</option>
                        <option value={364}>Yearly (365 Days)</option>
                        <option value="custom">Custom</option>
                      </Select>
                      {isCustomRenewal && (
                        <div className="mt-[10px] animate-in fade-in slide-in-from-top-2 duration-300">
                          <Input
                            label="Months"
                            type="number"
                            min="1"
                            max="16"
                            value={customMonths}
                            onChange={handleCustomMonthChange}
                            placeholder="Enter months..."
                            required
                          />

                        </div>
                      )}
                    </div>
                  )}

                  <DateInput
                    label="Start Date"
                    name="planStart"
                    value={formData.planStart}
                    onChange={handleChange}
                    required
                  />

                  <div>
                    <Input
                      label="Total Fee"
                      startContent={<span className={`text-[14px] md:text-[16px] leading-[20px] md:leading-[22px] font-semibold ${feesFocus || formData.feesAmount ? 'text-black' : 'secondary-color'}`}>&#8377;</span>}
                      name="feesAmount"
                      value={formData.feesAmount}
                      onChange={handleChange}
                      onFocus={() => setFeesFocus(true)}
                      onBlur={() => setFeesFocus(false)}
                      placeholder="0"
                      inputMode="numeric"
                      required
                    />
                  </div>

                  <div>
                    <Input
                      label="Paid Today"
                      startContent={<span className={`text-[14px] md:text-[16px] leading-[20px] md:leading-[22px] font-semibold ${paidFocus || formData.paidToday ? 'text-black' : 'secondary-color'}`}>&#8377;</span>}
                      name="paidToday"
                      value={formData.paidToday}
                      onChange={handleChange}
                      onFocus={() => setPaidFocus(true)}
                      onBlur={() => setPaidFocus(false)}
                      placeholder="0"
                      inputMode="numeric"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>Payment Method{requiredStar}</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <BorderButton
                        variant="outline"
                        className={`h-[46px] ${formData.paymentMode === PaymentMode.CASH ? 'bg-white border-[#22C55E] text-[#22C55E]' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#9CA3AF]'}`}
                        onClick={() => setFormData(p => ({ ...p, paymentMode: PaymentMode.CASH }))}
                      >
                        Cash
                      </BorderButton>
                      <BorderButton
                        variant="outline"
                        className={`h-[46px] ${formData.paymentMode === PaymentMode.UPI ? 'bg-white border-[#22C55E] text-[#22C55E]' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#9CA3AF]'}`}
                        onClick={() => setFormData(p => ({ ...p, paymentMode: PaymentMode.UPI }))}
                      >
                        UPI / CARD
                      </BorderButton>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="pt-5 mt-auto">
        {member ? (
          /* EDIT Member Footer */
          <Button key="submit-btn" type="submit" className="flex-1 w-full">
            Update Member
            <SubmitArrowIcon className="ml-[5px]" stroke="white" />
          </Button>
        ) : (
          /* ADD Member Footer */
          step === 1 ? (
            <div className="flex gap-2">
              <Button
                key="cancel-btn"
                type="button"
                onClick={_onCancel}
                variant="secondary"
                className="flex-1 max-w-[120px]"
              >
                Cancel
              </Button>
              <Button key="next-btn" type="button" onClick={handleNext} className="flex-1">
                Next <ArrowRightIcon className="size-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                key="back-btn"
                type="button"
                onClick={() => setStep(1)}
                variant="secondary"
                className="flex-1 max-w-[120px] gap-[5px]"
              >
                <ArrowLeftIcon className="size-4" />
                <span>Back</span>
              </Button>
              <Button key="submit-btn" type="submit" className="flex-1">
                Register Member
                <SubmitArrowIcon className="ml-[5px]" stroke="white" />
              </Button>
            </div>
          )
        )}
      </div>
    </form>
  );
};

export default MemberForm;












{/* Stepper Header */ }
// <div className="flex items-center  mb-5 ">
//   <div className="flex items-center gap-[5px]">
//     <div className={`size-6 rounded-full flex items-center justify-center text-[12px] leading-[16px] font-grotesk font-bold ${step >= 1 ? 'primary-bg-green text-white ' : 'bg-[#F8FAFC] text-slate-400'}`}>01</div>

//     <span className={` dashboard-primary-desc ${step >= 1 ? 'text-black' : 'secondary-color'}`}>Member Details</span>
//   </div>
//   <div className=" border-[1px] border-[#E2E8F0] border-dashed w-8 md:w-[71px] mx-[5px]"></div>
//   <div className="flex items-center gap-[5px]">
//     <div className={`size-6 rounded-full flex items-center justify-center text-[12px] leading-[16px] font-grotesk font-bold ${step >= 2 ? 'bg-[#22C55E1A]  border border-[#22C55E33] text-[#22C55E]' : ' secondary-color  border-main'}`}>02</div>
//     <span className={`dashboard-primary-desc ${step >= 2 ? 'text-black' : 'secondary-color'}`}>Membership Details</span>
//   </div>
// </div>