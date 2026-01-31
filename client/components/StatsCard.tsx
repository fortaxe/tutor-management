import React from 'react';
import Tag from './Tag';

interface StatsCardProps {
    label: string;
    value: string | number;
    variant: 'green' | 'red' | 'blue' | 'orange';
    onClick?: () => void;
    isActive?: boolean;
    children?: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, variant, onClick, isActive = false, children }) => {
    const variantStyles = {
        green: {
            value: 'green-text-color',
            footer: 'green-secondary-bg green-text-color border-green',
            activeFooter: 'bg-[#22C55E] text-white border-[#22C55E]'
        },
        red: {
            value: 'red-color',
            footer: 'red-secondary-bg red-color border-red',
            activeFooter: 'bg-[#EF4444] text-white border-[#EF4444]'
        },
        blue: {
            value: 'blue-text-color',
            footer: 'blue-secondary-bg blue-text-color border-blue',
            activeFooter: 'bg-[#0E7490] text-white border-[#0E7490]'
        },
        orange: {
            value: 'orange-text-color',
            footer: 'orange-secondary-bg orange-text-color border-orange',
            activeFooter: 'bg-[#F59E0B] text-white border-[#F59E0B]'
        }
    };

    const styles = variantStyles[variant];


    return (
        <div className="bg-white p-5 flex-shrink-0 snap-center rounded-main border-main flex items-center w-full">
            <div className="w-full">
                <p className="secondary-description font-bold font-grotesk uppercase pb-3">{label}</p>
                <p className={`${styles.value} text-[32px] font-medium leading-[32px] mb-5 font-bold font-grotesk `}>{value}</p>

                {children && (
                    <Tag
                        variant={variant}
                        isActive={isActive}
                        onClick={onClick}
                    >
                        {children}
                    </Tag>
                )}
            </div>
        </div>
    );
};

export default StatsCard;
