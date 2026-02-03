import { useState } from 'react';

interface UseMembershipDurationReturn {
    duration: number;
    isCustom: boolean;
    customMonths: string;
    isCustomRenewal: boolean;
    handleDurationChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleCustomMonthChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setDuration: React.Dispatch<React.SetStateAction<number>>;
    setCustomMonths: React.Dispatch<React.SetStateAction<string>>;
    setIsCustomRenewal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useMembershipDuration = (
    initialDuration: number,
    onDurationChange: (duration: number) => void
): UseMembershipDurationReturn => {
    const [isCustomRenewal, setIsCustomRenewal] = useState(() => {
        // Check if initial duration is one of the standard ones
        const STANDARD_DURATIONS = [29, 89, 179, 364];
        return !STANDARD_DURATIONS.includes(initialDuration) && initialDuration !== 1; // 1 is Day Pass
    });

    const [customMonths, setCustomMonths] = useState<string>(() => {
        // If it's effectively a "standard-ish" custom duration (e.g. they previously chose custom 1 month)
        // or if it's a weird number, try to reverse engineer months for display
        if (![29, 89, 179, 364, 1].includes(initialDuration)) {
            return Math.round((initialDuration + 1) / 30).toString();
        }
        return '';
    });

    const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'custom') {
            setIsCustomRenewal(true);
            setCustomMonths('');
            onDurationChange(0);
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
            onDurationChange(0);
            return;
        }
        const months = parseInt(val);
        if (!isNaN(months) && months > 0 && months <= 16) {
            onDurationChange((months * 30) - 1);
        }
    };

    return {
        duration: initialDuration,
        isCustom: isCustomRenewal,
        customMonths,
        isCustomRenewal, // Alias for backward compatibility if needed or clearer naming
        handleDurationChange,
        handleCustomMonthChange,
        setDuration: () => { }, // No-op for now unless we need two-way binding beyond the callback
        setCustomMonths,
        setIsCustomRenewal
    };
};
