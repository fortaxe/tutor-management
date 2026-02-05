
import React from 'react';

interface SortIconProps {
    className?: string;
}

const SortIcon: React.FC<SortIconProps> = ({ className }) => {

    return (
        <svg
            className={className}
            width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.125 14.6875V5.3125M13.125 5.3125L16.25 8.53516M13.125 5.3125L10 8.53516" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M6.875 5.3125V14.6875M6.875 14.6875L10 11.4648M6.875 14.6875L3.75 11.4648" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>

    );
};

export default SortIcon;
