import React from 'react';

interface SpinnerProps {
    size?: number;
    className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
    size = 20,
    className = ''
}) => {
    return (
        <svg
            className={`animate-spin ${className}`}
            width={size}
            height={size}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M10 4.33333V1.5" stroke="currentColor" strokeWidth="1.19298" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.0138 5.98612L16.0443 3.95557" stroke="currentColor" strokeOpacity="0.85" strokeWidth="1.19298" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15.6667 10H18.5" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.19298" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.0138 14.0139L16.0443 16.0445" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.19298" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 15.6667V18.5" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.19298" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.98612 14.0139L3.95557 16.0445" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.19298" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.33333 10H1.5" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.19298" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.98612 5.98612L3.95557 3.95557" stroke="currentColor" strokeOpacity="0.85" strokeWidth="1.19298" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export default Spinner;
