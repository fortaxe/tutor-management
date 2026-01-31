import React, { useState } from 'react';
import { Member } from '../types';
import Input from './Input';
import Button from './Button';
import SummaryCard from './SummaryCard';

interface CollectBalanceFormProps {
    member: Member;
    onSubmit: (amount: number) => void;
    onCancel: () => void;
}

const CollectBalanceForm: React.FC<CollectBalanceFormProps> = ({ member, onSubmit, onCancel }) => {
    const [amount, setAmount] = useState('');
    const enteringAmount = Number(amount) || 0;
    const currentPaid = member.paidAmount + enteringAmount;
    const currentDue = Math.max(0, member.feesAmount - currentPaid);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = Number(amount);
        if (numAmount > 0) {
            onSubmit(numAmount);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-5">

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
            </div>

            <div className="flex gap-2 pt-5 mt-auto">
                <Button type="button" onClick={onCancel} variant="secondary" className="flex-1 max-w-[120px]">
                    Cancel
                </Button>
                <Button type="submit" className="flex-1 ">
                    Collect Payment
                </Button>
            </div>
        </form>
    );
};

export default CollectBalanceForm;
