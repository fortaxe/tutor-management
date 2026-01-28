import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    // Add any specific custom props here if needed in future
}

const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
    return (
        <input
            className={`h-[48px] rounded-main border-main bg-[#F8FAFC] placeholder:text-[#B5BBC4] placeholder:text-[16px] placeholder:leading-[22px] w-full px-[15px] outline-none focus:border-2 focus:border-[#E4E9F0] transition-all text-[#0F172A] ${className}`}
            {...props}
        />
    );
};

export default Input;
