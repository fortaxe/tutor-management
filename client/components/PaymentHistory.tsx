
import React from 'react';
import { SubscriptionPayment } from '../types';

interface PaymentHistoryProps {
  history: SubscriptionPayment[];
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return <div className="text-center py-6 text-slate-500 italic font-medium">No payment records found for this tutor.</div>;
  }

  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paid At</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Covered Period</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {history.slice().reverse().map((payment) => (
            <tr key={payment.id} className="text-xs">
              <td className="px-4 py-2 whitespace-nowrap font-medium">{new Date(payment.paymentDate).toLocaleDateString()}</td>
              <td className="px-4 py-2 whitespace-nowrap text-green-700 font-bold">₹{payment.amount.toLocaleString()}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-500">
                {new Date(payment.startDate).toLocaleDateString()} - {new Date(payment.endDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-2 text-gray-600 italic">{payment.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentHistory;
