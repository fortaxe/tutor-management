import React from 'react';

interface Option {
    label: string;
    value: string;
}

interface OptionGroupProps {
    label?: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
}

const OptionGroup: React.FC<OptionGroupProps> = ({ label, options, value, onChange, required }) => {
    return (
        <div className="space-y-[10px] w-full">
            {label && (
                <label className="block primary-description font-bold font-grotesk secondary-color uppercase">
                    {label} {required && <span className="text-[#EF4444]">*</span>}
                </label>
            )}
            <div className="bg-[#F8FAFC] p-1 rounded-main border border-[#E2E8F0] flex gap-1">
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-[6px] transition-all ${value === option.value
                                ? 'bg-white text-black shadow-sm'
                                : 'text-[#9CA3AF] hover:text-slate-600'
                            }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default OptionGroup;
