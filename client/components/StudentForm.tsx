import { useState, useRef } from 'react';
import { Student, PaymentStatus, StudentType, PaymentMode } from '../types';
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

interface StudentFormProps {
  student?: Student | null;
  initialType?: StudentType;
  onSubmit: (studentData: Omit<Student, 'id' | '_id'> | Student) => void;
  onCancel: () => void;
  isLoading?: boolean;
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

const StudentForm: React.FC<StudentFormProps> = ({ student, initialType = StudentType.SUBSCRIPTION, onSubmit, onCancel: _onCancel, isLoading = false }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [step, setStep] = useState(1);
  const [activeType, setActiveType] = useState<StudentType>(student?.studentType || initialType);
  const [errors, setErrors] = useState<{ name?: string; parentName?: string; parentPhone?: string }>({});

  const [feesFocus, setFeesFocus] = useState(false);
  const [paidFocus, setPaidFocus] = useState(false);

  const [formData, setFormData] = useState(() => {
    if (student) {
      return {
        name: student.name,
        studentPhone: student.studentPhone || '',
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        dob: student.dob || '',
        planStart: formatDate(student.planStart),
        planDurationMonths: student.planDurationMonths,
        feesAmount: student.feesAmount.toString(),
        paidToday: student.paidAmount.toString(),
        paymentMode: student.paymentMode || PaymentMode.CASH,
        photo: student.photo,
        studentClass: student.studentClass || '',
        subjects: student.subjects || '',
        board: student.board || '',
      };
    }
    return {
      name: '',
      studentPhone: '',
      parentName: '',
      parentPhone: '',
      dob: '',
      planStart: new Date().toISOString().split('T')[0],
      planDurationMonths: 1, // Default 1 month
      feesAmount: '',
      paidToday: '',
      paymentMode: PaymentMode.CASH,
      photo: undefined as string | undefined,
      studentClass: '',
      subjects: '',
      board: '',
    };
  });

  const calculateEndDate = () => {
    if (!formData.planStart) return '';
    const start = new Date(formData.planStart);
    const end = new Date(start);
    end.setDate(start.getDate() + (Number(formData.planDurationMonths) * 30) - 1);
    return end.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSetSubscription = () => {
    setActiveType(StudentType.SUBSCRIPTION);
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'studentPhone' || name === 'parentPhone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
      return;
    }

    if (name === 'name' || name === 'parentName' || name === 'parentPhone') {
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

    const isNumberField = ['planDurationMonths'].includes(name);
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
    const newErrors: { name?: string; parentName?: string; parentPhone?: string } = {};
    if (!formData.name.trim()) newErrors.name = "Student name is required";
    if (!formData.parentName.trim()) newErrors.parentName = "Parent name is required";
    if (formData.parentPhone.length !== 10) newErrors.parentPhone = "Parent phone number must be 10 digits";

    const newErrorsFull = newErrors as any;
    if (!formData.studentClass.trim()) newErrorsFull.studentClass = "Class is required";
    if (!formData.subjects.trim()) newErrorsFull.subjects = "Subjects are required";
    if (!formData.board.trim()) newErrorsFull.board = "Board is required";

    setErrors(newErrorsFull);
    return Object.keys(newErrorsFull).length === 0;
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
      studentPhone: formData.studentPhone.trim() || undefined,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      dob: formData.dob || undefined,
      planStart: formData.planStart,
      planDurationMonths: formData.planDurationMonths,
      feesAmount: totalFee,
      paidAmount: initialPaid,
      feesStatus: status,
      studentType: activeType,
      photo: formData.photo,
      paymentMode: formData.paymentMode,
      studentClass: formData.studentClass,
      subjects: formData.subjects,
      board: formData.board,
    };

    if (student) {
      onSubmit({ ...student, ...submissionData } as Student);
    } else {
      onSubmit({ ...submissionData, tutorId: 0 } as Omit<Student, 'id' | '_id'>);
    }
  };

  const labelClasses = "block primary-description font-bold font-grotesk secondary-color uppercase mb-[5px]";
  const requiredStar = <span className="text-[#EF4444]">*</span>;

  if (showCamera) {
    return (
      <div className="py-4">
        <h4 className="text-center font-black text-gray-900 uppercase tracking-widest mb-6">Capture Student Photo</h4>
        <CameraCapture onCapture={handlePhotoCapture} onCancel={() => setShowCamera(false)} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {student ? (
          <div className="space-y-[20px] pt-2">
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

            <div className="space-y-[15px]">
              <Input
                label="Student Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Student Name"
                required
                error={errors.name}
              />
              <Input
                label="Parent Name"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                placeholder="Parent Name"
                required
                error={errors.parentName}
              />
              <Input
                label="Parent Mobile"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                placeholder="10 digit number"
                maxLength={10}
                required
                inputMode="numeric"
                error={errors.parentPhone}
              />

              <Input
                label="Duration (Months)"
                name="planDurationMonths"
                type="number"
                min="1"
                value={formData.planDurationMonths}
                onChange={handleChange}
                required
              />

              <DateInput
                label="Start Date"
                name="planStart"
                value={formData.planStart}
                onChange={handleChange}
                required
              />
              <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mt-1 ml-1">
                * EXPIRES ON: {calculateEndDate()}
              </p>

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
          /* ADD STUDENT MODE */
          <>
            {step === 1 && (
              <div className="">
                <div className="hidden">
                  <Button
                    type="button"
                    onClick={handleSetSubscription}
                    className={`flex-1 transition-colors ${activeType === StudentType.SUBSCRIPTION ? 'bg-yellow-400 text-black' : 'bg-gray-100 text-gray-400'}`}
                  >
                    Standard Plan
                  </Button>
                </div>

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

                  <div className="flex w-full gap-2 pb-[20px]">
                    <BorderButton variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()}>
                      <GalleryIcon className="w-4 h-4 mr-[5px]" />
                      GALLERY
                    </BorderButton>
                    <BorderButton variant="outline" className="flex-1" onClick={() => setShowCamera(true)}>
                      <CameraIcon className="w-4 h-4 mr-[5px]" />
                      CAMERA
                    </BorderButton>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                  </div>
                </div>

                <div className="space-y-[10px]">
                  <Input
                    label="Student Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Student Name"
                    required
                    error={errors.name}
                  />
                  <Input
                    label="Parent Name"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    placeholder="Parent Name"
                    required
                    error={errors.parentName}
                  />
                  <Input
                    label="Parent Mobile"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    placeholder="10 digit number"
                    maxLength={10}
                    required
                    inputMode="numeric"
                    error={errors.parentPhone}
                  />
                  <Input
                    label="Student Mobile (Optional)"
                    name="studentPhone"
                    value={formData.studentPhone}
                    onChange={handleChange}
                    placeholder="10 digit number"
                    maxLength={10}
                    inputMode="numeric"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Class"
                      name="studentClass"
                      value={formData.studentClass}
                      onChange={handleChange}
                      placeholder="e.g. 10th"
                      required
                      error={(errors as any).studentClass}
                    />
                    <Select
                      label="Board"
                      name="board"
                      value={formData.board}
                      onChange={handleChange}
                      required
                      error={(errors as any).board}
                    >
                      <option value="">Select Board</option>
                      <option value="SSC">SSC</option>
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="Other">Other</option>
                    </Select>
                  </div>
                  <Input
                    label="Subjects"
                    name="subjects"
                    value={formData.subjects}
                    onChange={handleChange}
                    placeholder="e.g. Math, Science"
                    required
                    error={(errors as any).subjects}
                  />
                  <DateInput
                    label="Date of Birth (Optional)"
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
                  <Input
                    label="Duration (Months)"
                    name="planDurationMonths"
                    type="number"
                    min="1"
                    value={formData.planDurationMonths}
                    onChange={handleChange}
                    required
                  />

                  <DateInput
                    label="Start Date"
                    name="planStart"
                    value={formData.planStart}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mt-1 ml-1">
                    * EXPIRES ON: {calculateEndDate()}
                  </p>

                  <Input
                    label="Total Fee"
                    name="feesAmount"
                    value={formData.feesAmount}
                    onChange={handleChange}
                    placeholder="0"
                    inputMode="numeric"
                    required
                  />

                  <Input
                    label="Paid Today"
                    name="paidToday"
                    value={formData.paidToday}
                    onChange={handleChange}
                    placeholder="0"
                    inputMode="numeric"
                    required
                  />

                  <div>
                    <label className={labelClasses}>Payment Method{requiredStar}</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        type="button"
                        className={`h-[46px] rounded-lg border font-bold ${formData.paymentMode === PaymentMode.CASH ? 'border-yellow-400 bg-yellow-50 text-black' : 'border-gray-200 text-gray-400'}`}
                        onClick={() => setFormData(p => ({ ...p, paymentMode: PaymentMode.CASH }))}
                      >
                        Cash
                      </button>
                      <button
                        type="button"
                        className={`h-[46px] rounded-lg border font-bold ${formData.paymentMode === PaymentMode.UPI ? 'border-yellow-400 bg-yellow-50 text-black' : 'border-gray-200 text-gray-400'}`}
                        onClick={() => setFormData(p => ({ ...p, paymentMode: PaymentMode.UPI }))}
                      >
                        UPI / Online
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="pt-5 mt-auto">
        {student ? (
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Update Student
            <SubmitArrowIcon className="ml-2" stroke="currentColor" />
          </Button>
        ) : (
          step === 1 ? (
            <div className="flex gap-2">
              <Button type="button" onClick={_onCancel} variant="secondary" className="flex-1" disabled={isLoading}>
                Cancel
              </Button>
              <Button type="button" onClick={handleNext} className="flex-1">
                Next <ArrowRightIcon className="ml-2 w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button type="button" onClick={() => setStep(1)} variant="secondary" className="flex-1" disabled={isLoading}>
                <ArrowLeftIcon className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button type="submit" className="flex-1" isLoading={isLoading}>
                Register Student
                <SubmitArrowIcon className="ml-2" stroke="currentColor" />
              </Button>
            </div>
          )
        )}
      </div>
    </form >
  );
};

export default StudentForm;












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