import React, { useState } from 'react';
import { useMembershipDuration } from '../hooks/useMembershipDuration';
import { Member, MemberType, PaymentStatus } from '../types';
import Input from './Input';
import Button from './Button';
import Select from './Select';

import DateInput from './DateInput';
import { getPlanDates } from '@/lib/utils';
import { SubmitArrowIcon } from './icons/FormIcons';

interface RenewPlanFormProps {
    member: Member;
    onSubmit: (renewalData: {
        planStart: string;
        planDurationDays: number;
        feesAmount: number;
        paidAmount: number;
        feesStatus: PaymentStatus;
        memberType: MemberType;
    }) => void;
    onCancel: () => void;
}

const RenewPlanForm: React.FC<RenewPlanFormProps> = ({ member, onSubmit, onCancel }) => {
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
        const { endDate, remainingDays } = getPlanDates(member);

        // If expired (remainingDays < 0), start from today
        if (remainingDays < 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return today;
        }

        // If active, start from the next day after expiry to avoid overlap
        const nextDay = new Date(endDate);
        nextDay.setDate(endDate.getDate() + 1);
        return nextDay;
    };

    const [formData, setFormData] = useState({
        type: member.memberType,
        startDate: formatDate(getSuggestedStart()),
        duration: member.memberType === MemberType.DAY_PASS ? 0 : 29,
        fee: '',
        paid: '',
    });

    const {
        isCustomRenewal,
        customMonths,
        handleDurationChange,
        handleCustomMonthChange
    } = useMembershipDuration(formData.duration, (newDuration) => {
        setFormData(prev => ({ ...prev, duration: newDuration }));
    });

    const calculateEndDate = () => {
        if (!formData.startDate) return '';
        const start = new Date(formData.startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + (Number(formData.duration) || 0));
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
            planDurationDays: formData.duration,
            feesAmount,
            paidAmount,
            feesStatus,
            memberType: formData.type
        });
    };

    return (
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-5">
                <div className="flex gap-2">
                    <Button
                        type="button"
                        onClick={() => setFormData({
                            ...formData,
                            type: MemberType.SUBSCRIPTION,
                            duration: 29
                        })}
                        className={`flex-1 transition-colors ${formData.type === MemberType.SUBSCRIPTION ? '!primary-bg-green !text-white' : '!bg-white !text-[#9CA3AF] border-main hover:!bg-slate-50'}`}
                    >
                        SUBSCRIPTION
                    </Button>
                    <Button
                        type="button"
                        onClick={() => setFormData({
                            ...formData,
                            type: MemberType.DAY_PASS,
                            duration: 0
                        })}
                        className={`flex-1 transition-colors ${formData.type === MemberType.DAY_PASS ? '!primary-bg-green !text-white' : '!bg-white !text-[#9CA3AF] border-main hover:!bg-slate-50'}`}
                    >
                        DAY PASS
                    </Button>
                </div>

                <div className="space-y-[15px]">
                    <DateInput
                        label="Starts From"
                        name="startDate"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                    />

                    <div className="space-y-1">
                        {formData.type === MemberType.DAY_PASS ? (
                            <Input
                                label="Duration (Days)"
                                type="number"
                                min="1"
                                value={formData.duration + 1}
                                onChange={(e) => setFormData({ ...formData, duration: Math.max(0, Number(e.target.value) - 1) })}
                                endContent={<span className="text-[10px] font-black text-slate-400 uppercase">Days</span>}
                                required
                            />
                        ) : (
                            <div>
                                <Select
                                    label="Duration (Days)"
                                    value={isCustomRenewal ? 'custom' : formData.duration}
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
                                    <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Input
                                            label="Months (Max 16)"
                                            type="number"
                                            min="1"
                                            max="16"
                                            value={customMonths}
                                            onChange={handleCustomMonthChange}
                                            placeholder="Enter months..."
                                            required
                                        />
                                        <div className="text-right text-[10px] font-black text-slate-400 mt-1 mr-2">
                                            ≈ {formData.duration + 1} Days Validity
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <p className="orange-text-color text-[14px] leading-[20px] font-semibold">
                            *Ends On {calculateEndDate()}
                        </p>
                    </div>

                    <Input
                        label="Total Fee"
                        value={formData.fee}
                        onChange={(e) => setFormData({ ...formData, fee: e.target.value.replace(/\D/g, '') })}
                        placeholder="0"
                        inputMode="numeric"
                        required
                        startContent={<span className="secondary-color font-bold">₹</span>}
                    />

                    <Input
                        label="Paid Today"
                        value={formData.paid}
                        onChange={(e) => setFormData({ ...formData, paid: e.target.value.replace(/\D/g, '') })}
                        placeholder="0"
                        inputMode="numeric"
                        required
                        startContent={<span className="secondary-color font-bold">₹</span>}
                    />
                </div>
            </div>

            <div className="flex gap-2 pt-5 mt-auto">
                <Button type="button" onClick={onCancel} variant="secondary" className="flex-1 max-w-[120px]">
                    Cancel
                </Button>
                <Button type="submit" className="flex-1">
                    Confirm Plan
                    <SubmitArrowIcon className="ml-[5px]" stroke="white" />
                </Button>
            </div>
        </form>
    );
};

export default RenewPlanForm;
