
import React from 'react';

const DumbbellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 15h12" />
    <path d="M6 9h12" />
    <path d="M3 8v8" />
    <path d="M21 8v8" />
    <path d="M6 3v18" />
    <path d="M18 3v18" />
  </svg>
);

export default DumbbellIcon;
