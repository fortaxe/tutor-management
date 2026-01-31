import React, { useState } from 'react';
import { Member, MemberType, PaymentStatus } from '../types';
import Input from './Input';
import Button from './Button';
import Select from './Select';

import DateInput from './DateInput';
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
    const getSuggestedStart = () => {
        const startDate = new Date(member.planStart);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + member.planDurationDays);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return endDate > today ? endDate : today;
    };

    const [formData, setFormData] = useState({
        type: member.memberType,
        startDate: getSuggestedStart().toISOString().split('T')[0],
        duration: member.memberType === MemberType.DAY_PASS ? 1 : 29,
        fee: '',
        paid: '',
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
                            duration: 1
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
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                endContent={<span className="text-[10px] font-black text-slate-400 uppercase">Days</span>}
                                required
                            />
                        ) : (
                            <Select
                                label="Duration (Days)"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                required
                            >
                                <option value={29}>Monthly (30 Days)</option>
                                <option value={89}>Quarterly (90 Days)</option>
                                <option value={179}>Half Yearly (180 Days)</option>
                                <option value={364}>Yearly (365 Days)</option>
                            </Select>
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
