import React from 'react';

interface StatsCardProps {
    label: string;
    value: string | number;
    variant: 'green' | 'red' | 'blue';
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
        }
    };

    const styles = variantStyles[variant];
    const footerStyles = isActive ? styles.activeFooter : styles.footer;

    return (
        <div className="bg-white p-5 flex-shrink-0 snap-center rounded-main border-main flex items-center w-full">
            <div className="w-full">
                <p className="secondary-description font-medium pb-3">{label}</p>
                <p className={`${styles.value} text-[32px] font-medium leading-[32px] mb-5`}>{value}</p>

                {children && (
                    <div
                        onClick={onClick}
                        className={`px-[10px] py-[5px] rounded-main text-[12px] leading-[20px] font-medium inline-flex justify-center items-center gap-[3.5px] border ${footerStyles} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                    >
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsCard;
