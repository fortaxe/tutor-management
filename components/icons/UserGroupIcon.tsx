
import React from 'react';

const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.57-1.023 1.535-1.85 2.72-2.186a2.479 2.479 0 012.316.325 3 3 0 012.28 2.28 2.479 2.479 0 01-.325 2.316c-.336.185-.71.34-1.11.469m-7.5-2.962a3 3 0 00-4.682 2.72 9.094 9.094 0 003.741.479m-4.241-1.354a3 3 0 01-.22-2.28 2.479 2.479 0 012.316-.325 2.479 2.479 0 012.316.325 3 3 0 01.22 2.28m-5.462-1.85a.75.75 0 00-1.21-.872l-3.236 4.53L.75 12.75l3.236-4.53a.75.75 0 00-.065-1.06L1.5 6.75m12-3.75a.75.75 0 00-1.21-.872l-3.236 4.53L6.75 6l3.236-4.53a.75.75 0 00-.065-1.06L7.5 0"
    />
  </svg>
);

export default UserGroupIcon;
