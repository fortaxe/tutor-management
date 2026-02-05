
import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
    value: string;
    label: string;
}

interface CustomDropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    icon?: React.ReactNode;
    className?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, icon, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Trigger Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-[5px] border-main rounded-main h-[42px] md:h-[46px] px-[11px] md:px-5 bg-white cursor-pointer select-none"
            >
                {icon}
                <span className="hidden md:block font-bold text-[16px] leading-[22px] font-grotesk uppercase secondary-color">
                    {selectedOption.label}
                </span>
            </div>

            {/* Menu */}
            {isOpen && (
                <div className="absolute top-[calc(100%+5px)] right-0 min-w-[150px] w-max max-w-[calc(100vw-40px)] bg-white border-main rounded-main z-50 overflow-hidden p-[15px] flex flex-col gap-[10px] ">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`font-semibold text-[16px] leading-[22px] cursor-pointer transition-colors ${option.value === value
                                ? 'text-black'
                                : 'text-[#9CA3AF] hover:text-black'
                                }`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
