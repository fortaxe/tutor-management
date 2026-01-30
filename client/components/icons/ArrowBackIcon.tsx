import React from 'react';

const ArrowBackIcon: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} group-hover:text-black`}>
            <g clipPath="url(#clip0_433_6602)">
                <path d="M1.16699 14.0001C1.16699 17.4037 2.51907 20.6679 4.92579 23.0746C7.33251 25.4813 10.5967 26.8334 14.0003 26.8334C17.4039 26.8334 20.6681 25.4813 23.0749 23.0746C25.4816 20.6679 26.8337 17.4037 26.8337 14.0001C26.8337 10.5965 25.4816 7.33226 23.0749 4.92554C20.6681 2.51883 17.4039 1.16675 14.0003 1.16675C10.5967 1.16675 7.33251 2.51883 4.92579 4.92554C2.51907 7.33226 1.16699 10.5965 1.16699 14.0001Z" stroke="currentColor" strokeWidth="1.3" />
                <path d="M19.0005 14.0001H9.00049M9.00049 14.0001L12.7505 10.2501M9.00049 14.0001L12.7505 17.7501" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs>
                <clipPath id="clip0_433_6602">
                    <rect width="28" height="28" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
};

export default ArrowBackIcon;
