import React, { InputHTMLAttributes, useRef } from 'react';
import { cn } from '../lib/utils';

interface UploadInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    required?: boolean;
    wrapperClassName?: string;
    onFileSelect?: (file: File) => void;
    placeholder?: string;
}

const UploadInput: React.FC<UploadInputProps> = ({
    className = '',
    wrapperClassName = '',
    label,
    error,
    required,
    onFileSelect,
    placeholder = "UPLOAD",
    ...props
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleContainerClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onFileSelect) {
            onFileSelect(file);
        }
    };

    return (
        <div className={cn("space-y-[5px] overflow-visible", wrapperClassName)}>
            {label && (
                <label className="block text-[14px] leading-[20px] md:text-[16px] md:leading-[22px] font-bold font-grotesk secondary-color uppercase mb-[5px]">
                    {label}
                    {required && <span className="red-color ml-1">*</span>}
                </label>
            )}
            <div
                onClick={handleContainerClick}
                className={cn(
                    "flex items-center justify-center h-[42px] md:h-[48px] rounded-main border  border-[#E2E8F0] bg-[#F8FAFC] w-full px-[15px] cursor-pointer hover:bg-slate-100 transition-all outline-none",
                    className
                )}
            >
                <span className="text-[#9CA3AF] text-[14px] leading-[20px] md:text-[16px] md:leading-[22px] font-bold font-grotesk uppercase">
                    {placeholder}
                </span>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                    {...props}
                />
            </div>
            {error && <p className="text-[14px] leading-[20px] font-semibold red-color ml-1">{error}</p>}
        </div>
    );
};

export default UploadInput;
