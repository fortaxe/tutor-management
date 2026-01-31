import React from 'react';
import { CalendarIcon } from './icons/FormIcons';
import Input from './Input';
import { cn } from '../lib/utils';

interface DateInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    placeholder?: string;
    className?: string;
}

const DateInput: React.FC<DateInputProps> = ({
    label,
    name,
    value,
    onChange,
    required = false,
    placeholder = 'DD-MM-YYYY',
    className
}) => {
    const labelClasses = "block primary-description font-bold font-grotesk secondary-color uppercase mb-[5px]";
    const requiredStar = <span className="text-[#EF4444]">*</span>;

    return (
        <div className="relative">
            <label className={labelClasses}>{label}{required && requiredStar}</label>
            <div className="relative w-full">
                <Input
                    name={`${name}_display`}
                    value={value ? value.split('-').reverse().join('-') : ''}
                    readOnly
                    placeholder={placeholder}
                    className={cn("pr-10 bg-[#F8FAFC]", className)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <CalendarIcon stroke="black" />
                </div>
                <input
                    type="date"
                    name={name}
                    value={value}
                    onChange={onChange}
                    onClick={(e) => {
                        console.log('DateInput: onClick triggered');
                        try {
                            e.preventDefault();
                            e.currentTarget.showPicker();
                            console.log('DateInput: showPicker called from onClick SUCCESS');
                        } catch (err) {
                            console.error('DateInput: showPicker error from onClick', err);
                        }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
            </div>
        </div>
    );
};

export default DateInput;
