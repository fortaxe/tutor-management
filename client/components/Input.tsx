import React, { InputHTMLAttributes, useState } from 'react';
import { cn } from '../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    required?: boolean;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ className = '', label, error, required, startContent, endContent, type, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="space-y-[5px] overflow-visible">
            {label && (
                <label className="block text-[14px] leading-[20px] md:text-[16px] md:leading-[22px] font-bold font-grotesk secondary-color uppercase mb-[5px]">
                    {label}
                    {required && <span className="red-color ml-1">*</span>}
                </label>
            )}
            <div className={cn(
                "flex items-center h-[42px] md:h-[48px] rounded-main border-main bg-[#F8FAFC] w-full px-[15px] focus-within:border-[#E4E9F0] focus-within:ring-1 focus-within:ring-[#E4E9F0] focus-within:ring-offset-0 transition-all outline-none",
                className
            )}>
                {startContent && <div className="flex-shrink-0 mr-2">{startContent}</div>}
                <input
                    type={isPassword ? (showPassword ? 'text' : 'password') : type}
                    className="w-full h-full bg-transparent outline-none placeholder:text-[#9CA3AF] placeholder:text-[14px] placeholder:leading-[20px] md:placeholder:text-[16px] md:placeholder:leading-[22px] text-[#0F172A] font-semibold"
                    {...props}
                />
                {isPassword ? (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="ml-2 flex-shrink-0 focus:outline-none"
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.16354 9.23979C1.11215 9.08533 1.11215 8.91839 1.16354 8.76393C2.19643 5.65633 5.12828 3.41481 8.58365 3.41481C12.0375 3.41481 14.9679 5.6541 16.003 8.76021C16.0551 8.91436 16.0551 9.08117 16.003 9.23607C14.9709 12.3437 12.039 14.5852 8.58365 14.5852C5.12977 14.5852 2.19867 12.3459 1.16354 9.23979Z" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10.8178 9C10.8178 9.59251 10.5824 10.1608 10.1635 10.5797C9.7445 10.9987 9.17626 11.2341 8.58374 11.2341C7.99123 11.2341 7.42299 10.9987 7.00402 10.5797C6.58505 10.1608 6.34967 9.59251 6.34967 9C6.34967 8.40749 6.58505 7.83924 7.00402 7.42027C7.42299 7.0013 7.99123 6.76593 8.58374 6.76593C9.17626 6.76593 9.7445 7.0013 10.1635 7.42027C10.5824 7.83924 10.8178 8.40749 10.8178 9Z" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                ) : (
                    endContent && <div className="ml-2 flex-shrink-0">{endContent}</div>
                )}
            </div>
            {error && <p className="text-[14px] leading-[20px] font-semibold red-color ml-1">{error}</p>}
        </div>
    );
};

export default Input;
