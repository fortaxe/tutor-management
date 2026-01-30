import React from 'react';

interface BorderButtonProps {
    variant?: 'red' | 'green';
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
        red: 'bg-[#EF44441A] !text-[#EF4444] border-[#EF444433]',
        green: 'bg-[#22C55E1A] !text-[#22C55E] border-[#22C55E33]'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`w-full px-5 py-3 border rounded-[10px] primary-description flex items-center justify-center transition-all  font-grotesk uppercase font-bold ${variantStyles[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export default BorderButton;
