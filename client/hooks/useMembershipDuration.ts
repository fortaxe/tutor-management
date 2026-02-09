import { useState } from 'react';

interface UseMembershipDurationReturn {
    duration: number; // This will now represent months
    isCustom: boolean;
    customMonths: string;
    isCustomRenewal: boolean;
    handleDurationChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleCustomMonthChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setDuration: (duration: number) => void;
    setCustomMonths: React.Dispatch<React.SetStateAction<string>>;
    setIsCustomRenewal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useMembershipDuration = (
    initialDuration: number, // Initial duration in months
    onDurationChange: (duration: number) => void
): UseMembershipDurationReturn => {
    const [isCustomRenewal, setIsCustomRenewal] = useState(() => {
        // Standard durations in months: 1, 3, 6, 12
        const STANDARD_DURATIONS = [1, 3, 6, 12];
        return !STANDARD_DURATIONS.includes(initialDuration);
    });

    const [customMonths, setCustomMonths] = useState<string>(() => {
        const STANDARD_DURATIONS = [1, 3, 6, 12];
        if (!STANDARD_DURATIONS.includes(initialDuration)) {
            return initialDuration.toString();
        }
        return '';
    });

    const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'custom') {
            setIsCustomRenewal(true);
            setCustomMonths('');
            onDurationChange(1); // Default to 1 month for custom
        } else {
            setIsCustomRenewal(false);
            setCustomMonths('');
            onDurationChange(Number(value));
        }
    };

    const handleCustomMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCustomMonths(val);
        if (val === '') {
            onDurationChange(1);
            return;
        }
        const months = parseInt(val);
        if (!isNaN(months) && months > 0) {
            onDurationChange(months);
        }
    };

    return {
        duration: initialDuration,
        isCustom: isCustomRenewal,
        customMonths,
        isCustomRenewal,
        handleDurationChange,
        handleCustomMonthChange,
        setDuration: onDurationChange,
        setCustomMonths,
        setIsCustomRenewal
    };
};
