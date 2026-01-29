import React, { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
    return (
        <input
            className={`h-[48px] rounded-main border-main bg-[#F8FAFC] placeholder:text-[#B5BBC4] placeholder:text-[14px] placeholder:leading-[20px] md:placeholder:text-[16px] md:placeholder:leading-[22px] w-full px-[15px] outline-none focus:border-[#E4E9F0] focus:ring-1 focus:ring-[#E4E9F0] focus:ring-offset-0 transition-all text-[#0F172A] ${className}`}
            {...props}
        />
    );
};

export default Input;
