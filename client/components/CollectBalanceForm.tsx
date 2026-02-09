import { useState } from 'react';
import { Student, PaymentMode } from '../types';
import Input from './Input';
import Button from './Button';
import SummaryCard from './SummaryCard';
import StudentAvatar from './StudentAvatar';

interface CollectBalanceFormProps {
    student: Student;
    onSubmit: (amount: number, paymentMode: PaymentMode) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const CollectBalanceForm: React.FC<CollectBalanceFormProps> = ({ student, onSubmit, onCancel, isLoading = false }) => {
    const [amount, setAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState<PaymentMode>(PaymentMode.CASH);
    const enteringAmount = Number(amount) || 0;
    const currentPaid = student.paidAmount + enteringAmount;
    const currentDue = Math.max(0, student.feesAmount - currentPaid);

    const renderStudentInfo = () => (
        <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-main border border-slate-100 mb-5">
            <StudentAvatar student={student} />
            <div>
                <h3 className="font-bold font-grotesk text-slate-900 leading-tight">{student.name}</h3>
                <p className="text-sm font-semibold text-slate-500 font-geist">Parent: {student.parentName}</p>
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
                {renderStudentInfo()}

                <SummaryCard
                    variant="slate"
                    items={[
                        { label: 'Original Fee', value: `₹${student.feesAmount}` },
                        { label: 'Total Paid', value: `₹${currentPaid}`, color: 'text-green-600' },
                        {
                            label: currentDue > 0 ? 'Remaining Due' : 'Status',
                            value: currentDue > 0 ? `₹${currentDue}` : 'SETTLED',
                            color: currentDue > 0 ? 'text-red-500' : 'text-green-600'
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
                        <button
                            type="button"
                            className={`h-[46px] rounded-lg border font-bold ${paymentMode === PaymentMode.CASH ? 'border-yellow-400 bg-yellow-50 text-black' : 'border-gray-200 text-gray-400'}`}
                            onClick={() => setPaymentMode(PaymentMode.CASH)}
                        >
                            Cash
                        </button>
                        <button
                            type="button"
                            className={`h-[46px] rounded-lg border font-bold ${paymentMode === PaymentMode.UPI ? 'border-yellow-400 bg-yellow-50 text-black' : 'border-gray-200 text-gray-400'}`}
                            onClick={() => setPaymentMode(PaymentMode.UPI)}
                        >
                            UPI / Online
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 pt-5 mt-auto">
                <Button type="button" onClick={onCancel} variant="secondary" className="flex-1 max-w-[120px]" disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" className="flex-1" isLoading={isLoading}>
                    Collect Payment
                </Button>
            </div>
        </form>
    );
};

export default CollectBalanceForm;
