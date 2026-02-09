import React from 'react';
import { ChevronDownSmallIcon } from './icons/FormIcons';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    required?: boolean;
    error?: string;
}

const Select: React.FC<SelectProps> = ({ label, required, error, children, className = '', ...props }) => {
    return (
        <div className="space-y-[10px] w-full">
            {label && (
                <label className="block primary-description font-bold font-grotesk secondary-color uppercase">
                    {label} {required && <span className="text-[#EF4444]">*</span>}
                </label>
            )}
            <div className="relative">
                <select
                    className={`h-[48px] rounded-main border ${error ? 'border-red-500' : 'border-[#E2E8F0]'} bg-[#F8FAFC] w-full px-[15px] outline-none appearance-none text-black focus:border-brand font-grotesk font-bold transition-all ${className}`}
                    {...props}
                >
                    {children}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDownSmallIcon stroke="#000000" />
                </div>
            </div>
            {error && <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mt-1">{error}</p>}
        </div>
    );
};

export default Select;
