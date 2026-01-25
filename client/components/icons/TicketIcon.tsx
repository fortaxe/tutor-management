
import React from 'react';

const TicketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18M3 8.25a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 8.25V15.75a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15.75V8.25z"
    />
  </svg>
);

export default TicketIcon;
