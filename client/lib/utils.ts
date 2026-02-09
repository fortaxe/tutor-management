import { Student } from '../types';

export const getPlanDates = (student: Student) => {
    if (!student) return { startDate: new Date(), endDate: new Date(), remainingDays: 0 };
    const startDate = new Date(student.planStart);
    const endDate = new Date(startDate);

    // Add 30 days per month for plan duration (inclusive of both start and end date)
    endDate.setDate(startDate.getDate() + (Number(student.planDurationMonths) * 30) - 1);

    // Calculate remaining days
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to midnight

    // Calculate difference in milliseconds
    const diffTime = endDate.getTime() - today.getTime();
    const remainingDays = Math.ceil(diffTime / (1000 * 3600 * 24));

    return { startDate, endDate, remainingDays };
};

export const objectToFormData = (obj: any): FormData => {
    const formData = new FormData();

    Object.keys(obj).forEach(key => {
        const value = obj[key];

        // Skip undefined or null values
        if (value === undefined || value === null) return;

        if (value instanceof File || value instanceof Blob) {
            formData.append(key, value);
        } else if (key === 'photo' && typeof value === 'string' && value.startsWith('data:image')) {
            try {
                // Convert base64 to blob
                const byteString = atob(value.split(',')[1]);
                const mimeString = value.split(',')[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: mimeString });
                formData.append('photo', blob, `photo.${mimeString.split('/')[1]}`);
            } catch (e) {
                console.error('Error converting base64 to blob:', e);
                // Fallback: append as string if conversion fails, though likely won't work on server
                formData.append(key, String(value));
            }
        } else {
            // Append other fields as strings
            formData.append(key, String(value));
        }
    });

    return formData;
};

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
