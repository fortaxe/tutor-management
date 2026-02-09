import { useState } from 'react';
import { Student, StudentType, PaymentStatus, PaymentMode } from '../types';
import Input from './Input';
import Button from './Button';
import DateInput from './DateInput';
import { getPlanDates } from '@/lib/utils';
import { SubmitArrowIcon } from './icons/FormIcons';
import StudentAvatar from './StudentAvatar';

interface RenewPlanFormProps {
    student: Student;
    onSubmit: (renewalData: {
        planStart: string;
        planDurationMonths: number;
        feesAmount: number;
        paidAmount: number;
        feesStatus: PaymentStatus;
        studentType: StudentType;
        paymentMode: PaymentMode;
    }) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const RenewPlanForm: React.FC<RenewPlanFormProps> = ({ student, onSubmit, onCancel, isLoading = false }) => {
    const formatDate = (date: Date) => {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    };

    const getSuggestedStart = () => {
        const { endDate, remainingDays } = getPlanDates(student);

        if (remainingDays < 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return today;
        }

        const nextDay = new Date(endDate);
        nextDay.setDate(endDate.getDate() + 1);
        return nextDay;
    };

    const [formData, setFormData] = useState({
        type: StudentType.SUBSCRIPTION,
        startDate: formatDate(getSuggestedStart()),
        durationMonths: 1,
        fee: '',
        paid: '',
        paymentMode: PaymentMode.CASH,
    });

    const calculateEndDate = () => {
        if (!formData.startDate) return '';
        const start = new Date(formData.startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + (Number(formData.durationMonths) * 30) - 1);
        return end.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const feesAmount = Number(formData.fee) || 0;
        const paidAmount = Number(formData.paid) || 0;

        let feesStatus = PaymentStatus.UNPAID;
        if (paidAmount === feesAmount && feesAmount > 0) feesStatus = PaymentStatus.PAID;
        else if (paidAmount > 0) feesStatus = PaymentStatus.PARTIAL;

        onSubmit({
            planStart: formData.startDate,
            planDurationMonths: formData.durationMonths,
            feesAmount,
            paidAmount,
            feesStatus,
            studentType: formData.type,
            paymentMode: formData.paymentMode
        });
    };

    return (
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <StudentAvatar student={student} />
                    <div>
                        <h3 className="font-extrabold text-slate-900 group-hover:text-black transition-colors">{student.name}</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Parent: {student.parentName}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <DateInput
                        label="RENEW FROM"
                        name="startDate"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                    />

                    <div className="space-y-1">
                        <div className="space-y-3">
                            <Input
                                label="DURATION (MONTHS)"
                                type="number"
                                min="1"
                                value={formData.durationMonths}
                                onChange={(e) => setFormData(prev => ({ ...prev, durationMonths: Number(e.target.value) }))}
                                required
                            />
                        </div>
                        <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mt-2 ml-1">
                            * NEW EXPIRY: {calculateEndDate()}
                        </p>
                    </div>

                    <Input
                        label="TOTAL FEES"
                        value={formData.fee}
                        onChange={(e) => setFormData({ ...formData, fee: e.target.value.replace(/\D/g, '') })}
                        placeholder="0"
                        inputMode="numeric"
                        required
                        startContent={<span className="text-slate-400 font-bold">₹</span>}
                    />

                    <Input
                        label="PAID TODAY"
                        value={formData.paid}
                        onChange={(e) => setFormData({ ...formData, paid: e.target.value.replace(/\D/g, '') })}
                        placeholder="0"
                        inputMode="numeric"
                        required
                        startContent={<span className="text-slate-400 font-bold">₹</span>}
                    />

                    <div className="space-y-2">
                        <label className="block text-xs font-black text-slate-600 uppercase tracking-widest ml-1">
                            PAYMENT MODE
                        </label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <button
                                type="button"
                                className={`h-[52px] rounded-xl border-2 font-black uppercase text-[10px] tracking-widest transition-all ${formData.paymentMode === PaymentMode.CASH ? 'border-yellow-400 bg-yellow-50 text-black shadow-lg shadow-yellow-100' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                                onClick={() => setFormData(p => ({ ...p, paymentMode: PaymentMode.CASH }))}
                            >
                                Cash
                            </button>
                            <button
                                type="button"
                                className={`h-[52px] rounded-xl border-2 font-black uppercase text-[10px] tracking-widest transition-all ${formData.paymentMode === PaymentMode.UPI ? 'border-yellow-400 bg-yellow-50 text-black shadow-lg shadow-yellow-100' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                                onClick={() => setFormData(p => ({ ...p, paymentMode: PaymentMode.UPI }))}
                            >
                                UPI / Online
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-6 mt-auto border-t border-slate-100">
                <Button type="button" onClick={onCancel} className="flex-1 !bg-slate-100 !text-slate-500 hover:!bg-slate-200 border-none rounded-xl font-bold" disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" className="flex-[2] bg-yellow-400 text-black hover:bg-yellow-500 border-none rounded-xl font-black uppercase tracking-widest shadow-xl shadow-yellow-100" isLoading={isLoading}>
                    CONFIRM RENEWAL
                    <SubmitArrowIcon className="ml-2" stroke="currentColor" />
                </Button>
            </div>
        </form >
    );
};

export default RenewPlanForm;
