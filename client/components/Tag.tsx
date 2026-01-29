import React from 'react';

interface TagProps {
    variant: 'green' | 'red' | 'blue' | 'orange';
    isActive?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
}

const Tag: React.FC<TagProps> = ({ variant, isActive = false, onClick, children, className = '' }) => {
    const variantStyles = {
        green: {
            default: 'green-secondary-bg green-text-color border-green',
            active: 'bg-[#22C55E] text-white border-[#22C55E]'
        },
        red: {
            default: 'red-secondary-bg red-color border-red',
            active: 'bg-[#EF4444] text-white border-[#EF4444]'
        },
        blue: {
            default: 'blue-secondary-bg blue-text-color border-blue',
            active: 'bg-[#0E7490] text-white border-[#0E7490]'
        },
        orange: {
            default: 'bg-[#FFFBEB] text-[#F59E0B] border-[#FBD691] border',
            active: 'bg-[#F59E0B] text-white border-[#F59E0B]'
        }
    };

    const styles = variantStyles[variant];
    const computedStyles = isActive ? styles.active : styles.default;

    return (
        <div
            onClick={onClick}
            className={`px-[10px] py-[5px] rounded-main text-[12px] leading-[20px] font-bold font-grotesk inline-flex justify-center items-center gap-[3.5px] border ${computedStyles} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
        >
            {children}
        </div>
    );
};

export default Tag;
