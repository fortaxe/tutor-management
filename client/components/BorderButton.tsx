import React from 'react';
import { cn } from '../lib/utils';

interface BorderButtonProps {
    variant?: 'red' | 'green' | 'blue' | 'yellow' | 'outline';
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}

const BorderButton: React.FC<BorderButtonProps> = ({
    variant = 'red',
    onClick,
    children,
    className = '',
    type = 'button'
}) => {
    const variantStyles = {
        red: 'bg-[#EF44441A] text-[#EF4444] border-[#EF444433]',
        green: 'bg-[#22C55E1A] text-[#22C55E] border-[#22C55E33]',
        blue: 'bg-[#2F70FF1A] text-[#2F70FF] border-[#2F70FF4D]',
        yellow: 'bg-[#FACC151A] text-[#EAB308] border-[#FACC1533]',
        outline: 'bg-transparent border border-[#E2E8F0] text-[#9CA3AF]'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={cn(
                "w-full px-5 py-3 border rounded-[10px] flex items-center justify-center transition-all font-grotesk uppercase font-bold",
                variantStyles[variant],
                className
            )}
        >
            {children}
        </button>
    );
};

export default BorderButton;
