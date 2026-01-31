import React from 'react';
import { ChevronDownSmallIcon } from './icons/FormIcons';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    required?: boolean;
}

const Select: React.FC<SelectProps> = ({ label, required, children, className = '', ...props }) => {
    return (
        <div className="space-y-[10px] w-full">
            {label && (
                <label className="block primary-description font-bold font-grotesk secondary-color uppercase">
                    {label} {required && <span className="text-[#EF4444]">*</span>}
                </label>
            )}
            <div className="relative">
                <select
                    className={`h-[48px] rounded-main border border-[#E2E8F0] bg-[#F8FAFC] w-full px-[15px] outline-none appearance-none text-[#0F172A] focus:border-brand font-grotesk font-bold transition-all ${className}`}
                    {...props}
                >
                    {children}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDownSmallIcon stroke="#0F172A" />
                </div>
            </div>
        </div>
    );
};

export default Select;
