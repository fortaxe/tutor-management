import React, { InputHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    required?: boolean;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ className = '', label, error, required, startContent, endContent, ...props }) => {
    return (
        <div className="space-y-[5px] overflow-visible">
            {label && (
                <label className="block primary-description font-bold font-grotesk secondary-color uppercase mb-[5px]">
                    {label}
                    {required && <span className="text-[#EF4444]">*</span>}
                </label>
            )}
            <div className={cn(
                "flex items-center h-[48px] rounded-main border-main bg-[#F8FAFC] w-full px-[15px] focus-within:border-[#E4E9F0] focus-within:ring-1 focus-within:ring-[#E4E9F0] focus-within:ring-offset-0 transition-all outline-none",
                className
            )}>
                {startContent && <div className="flex-shrink-0">{startContent}</div>}
                <input
                    className="w-full h-full bg-transparent outline-none placeholder:text-[#B5BBC4] placeholder:text-[14px] placeholder:leading-[20px] md:placeholder:text-[16px] md:placeholder:leading-[22px] text-[#0F172A] font-semibold"
                    {...props}
                />
                {endContent && <div className="ml-2 flex-shrink-0">{endContent}</div>}
            </div>
            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
        </div>
    );
};

export default Input;
