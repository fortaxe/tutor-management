
import React from 'react';

export const PhotoPlaceholderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const GalleryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M1.75 8C1.75 5.05372 1.75 3.58058 2.66529 2.66529C3.58058 1.75 5.05372 1.75 8 1.75C10.9462 1.75 12.4194 1.75 13.3347 2.66529C14.25 3.58058 14.25 5.05372 14.25 8C14.25 10.9462 14.25 12.4194 13.3347 13.3347C12.4194 14.25 10.9462 14.25 8 14.25C5.05372 14.25 3.58058 14.25 2.66529 13.3347C1.75 12.4194 1.75 10.9462 1.75 8Z" stroke="currentColor" strokeWidth="1.3" />
        <path d="M9.25 5.5C9.25 5.83152 9.3817 6.14946 9.61612 6.38388C9.85054 6.6183 10.1685 6.75 10.5 6.75C10.8315 6.75 11.1495 6.6183 11.3839 6.38388C11.6183 6.14946 11.75 5.83152 11.75 5.5C11.75 5.16848 11.6183 4.85054 11.3839 4.61612C11.1495 4.3817 10.8315 4.25 10.5 4.25C10.1685 4.25 9.85054 4.3817 9.61612 4.61612C9.3817 4.85054 9.25 5.16848 9.25 5.5Z" stroke="currentColor" strokeWidth="1.3" />
        <path d="M1.75 6.84605L2.36296 6.75805C6.72435 6.13177 10.4524 9.89448 9.78569 14.2499" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M14.2499 8.86562L13.6415 8.78137C11.8641 8.53524 10.2559 9.42012 9.42773 10.8128" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
);

export const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M6.125 8.625C6.125 9.12228 6.32254 9.59919 6.67417 9.95083C7.02581 10.3025 7.50272 10.5 8 10.5C8.49728 10.5 8.97419 10.3025 9.32583 9.95083C9.67746 9.59919 9.875 9.12228 9.875 8.625C9.875 8.12772 9.67746 7.65081 9.32583 7.29917C8.97419 6.94754 8.49728 6.75 8 6.75C7.50272 6.75 7.02581 6.94754 6.67417 7.29917C6.32254 7.65081 6.125 8.12772 6.125 8.625Z" stroke="currentColor" strokeWidth="1.3" />
        <path d="M6.61111 13.625H9.38888C11.3396 13.625 12.3149 13.625 13.0155 13.1654C13.3188 12.9664 13.5792 12.7107 13.7819 12.4129C14.25 11.7251 14.25 10.7674 14.25 8.85225C14.25 6.93713 14.25 5.97951 13.7819 5.29163C13.5792 4.99384 13.3188 4.73815 13.0155 4.53918C12.5653 4.24383 12.0017 4.13827 11.1388 4.10054C10.7269 4.10054 10.3724 3.79418 10.2917 3.39773C10.1705 2.80306 9.63869 2.375 9.02106 2.375H6.97894C6.36128 2.375 5.82947 2.80306 5.70833 3.39773C5.62757 3.79418 5.27303 4.10054 4.86125 4.10054C3.99833 4.13827 3.43472 4.24383 2.98452 4.53918C2.68122 4.73815 2.4208 4.99384 2.21814 5.29163C1.75 5.97951 1.75 6.93713 1.75 8.85225C1.75 10.7674 1.75 11.7251 2.21814 12.4129C2.4208 12.7107 2.68122 12.9664 2.98452 13.1654C3.68515 13.625 4.66047 13.625 6.61111 13.625Z" stroke="currentColor" strokeWidth="1.3" />
        <path d="M12.375 6.75H11.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
);

export const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M1.75 8C1.75 5.64298 1.75 4.46447 2.48223 3.73223C3.21447 3 4.39298 3 6.75 3H9.25C11.607 3 12.7856 3 13.5177 3.73223C14.25 4.46447 14.25 5.64298 14.25 8V9.25C14.25 11.607 14.25 12.7856 13.5177 13.5177C12.7856 14.25 11.607 14.25 9.25 14.25H6.75C4.39298 14.25 3.21447 14.25 2.48223 13.5177C1.75 12.7856 1.75 11.607 1.75 9.25V8Z" stroke="currentColor" strokeWidth="1.3" />
        <path d="M4.875 3V2.0625" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M11.125 3V2.0625" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M2.0625 6.125H13.9375" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
);

export const ChevronDownSmallIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12.375 6.125L8 9.875L3.625 6.125" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
);

export const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

export const SubmitArrowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M3 8H13M13 8L9.25 4.25M13 8L9.25 11.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
