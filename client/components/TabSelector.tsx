import React from 'react';

interface TabOption<T> {
    label: string;
    value: T;
}

interface TabSelectorProps<T> {
    options: TabOption<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
    itemClassName?: string;
}

const TabSelector = <T extends string | number>({
    options,
    value,
    onChange,
    className = '',
    itemClassName = ''
}: TabSelectorProps<T>) => {
    return (
        <div className={`flex gap-[5px] ${className}`}>
            {options.map((option) => {
                const isActive = value === option.value;
                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={`text-center px-[15px] py-[5px] uppercase dashboard-primary-desc font-black transition-all duration-300 w-fit rounded-main whitespace-nowrap flex-shrink-0 ${isActive
                            ? 'bg-black text-white z-10'
                            : 'secondary-color border border-[#E2E8F0]  bg-white'
                            } ${itemClassName}`}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};

export default TabSelector;
