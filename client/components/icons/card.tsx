
import React from 'react';

const CardIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.375 9.25V13M12.375 13L13.625 11.75M12.375 13L11.125 11.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.25 8C14.25 5.64298 14.25 4.46447 13.5177 3.73223C12.7856 3 11.607 3 9.25 3H6.75C4.39298 3 3.21447 3 2.48223 3.73223C1.75 4.46447 1.75 5.64298 1.75 8C1.75 10.357 1.75 11.5356 2.48223 12.2677C3.21447 13 4.39298 13 6.75 13H9.25" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M6.75 10.5H4.25" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M8.625 10.5H8.3125" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M1.75 6.75H14.25" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
);

export default CardIcon;
