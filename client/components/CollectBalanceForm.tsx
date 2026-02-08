import React, { useState } from 'react';
import { Member, PaymentMode } from '../types';
import Input from './Input';
import Button from './Button';
import BorderButton from './BorderButton';
import SummaryCard from './SummaryCard';
import MemberAvatar from './MemberAvatar';

interface CollectBalanceFormProps {
    member: Member;
    onSubmit: (amount: number, paymentMode: PaymentMode) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const CollectBalanceForm: React.FC<CollectBalanceFormProps> = ({ member, onSubmit, onCancel, isLoading = false }) => {
    const [amount, setAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState<PaymentMode>(PaymentMode.CASH);
    const enteringAmount = Number(amount) || 0;
    const currentPaid = member.paidAmount + enteringAmount;
    const currentDue = Math.max(0, member.feesAmount - currentPaid);

    // Add Member Info Display
    const renderMemberInfo = () => (
        <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-main border border-slate-100 mb-5">
            <MemberAvatar member={member} />
            <div>
                <h3 className="font-bold font-grotesk text-slate-900 leading-tight">{member.name}</h3>
                <p className="text-sm font-semibold text-slate-500 font-geist">{member.phone}</p>
            </div>
        </div>
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = Number(amount);
        if (numAmount > 0) {
            onSubmit(numAmount, paymentMode);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-5">
                {renderMemberInfo()}

                <SummaryCard
                    variant="slate"
                    items={[
                        { label: 'Original Fee', value: `₹${member.feesAmount}` },
                        { label: 'Total Paid', value: `₹${currentPaid}`, color: 'text-[#22C55E]' },
                        {
                            label: currentDue > 0 ? 'Remaining Due' : 'Status',
                            value: currentDue > 0 ? `₹${currentDue}` : 'SETTLED',
                            color: currentDue > 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'
                        }
                    ]}
                />

                <Input
                    label="Payment Amount"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                    placeholder="0"
                    inputMode="numeric"
                    autoFocus
                    startContent={<span className="text-slate-400 font-bold">₹</span>}
                />

                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">
                        Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <BorderButton
                            type="button"
                            variant="outline"
                            className={`h-[46px] ${paymentMode === PaymentMode.CASH ? 'bg-white border-[#22C55E] text-[#22C55E]' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#9CA3AF]'}`}
                            onClick={() => setPaymentMode(PaymentMode.CASH)}
                        >
                            Cash
                        </BorderButton>
                        <BorderButton
                            type="button"
                            variant="outline"
                            className={`h-[46px] ${paymentMode === PaymentMode.UPI ? 'bg-white border-[#22C55E] text-[#22C55E]' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#9CA3AF]'}`}
                            onClick={() => setPaymentMode(PaymentMode.UPI)}
                        >
                            UPI / CARD
                        </BorderButton>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 pt-5 mt-auto">
                <Button type="button" onClick={onCancel} variant="secondary" className="flex-1 max-w-[120px]" disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" className="flex-1 " isLoading={isLoading}>
                    Collect Payment
                </Button>
            </div>
        </form>
    );
};

export default CollectBalanceForm;
