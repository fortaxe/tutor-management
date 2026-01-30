
import React from 'react';

interface SortIconProps {
    active: boolean;
    direction: 'asc' | 'desc';
    className?: string;
}

const SortIcon: React.FC<SortIconProps> = ({ active, direction, className }) => {
    const upColor = active && direction === 'asc' ? '#0081DD' : '#9CA3AF';
    const downColor = active && direction === 'desc' ? '#0081DD' : '#9CA3AF';

    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M10.5 11.75V4.25M10.5 4.25L13 6.82812M10.5 4.25L8 6.82812"
                stroke={upColor}
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5.5 4.25V11.75M5.5 11.75L8 9.17188M5.5 11.75L3 9.17188"
                stroke={downColor}
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default SortIcon;
