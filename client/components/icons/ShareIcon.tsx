import React from "react";

const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M6.16211 8C6.16211 8.84568 5.47654 9.53125 4.63086 9.53125C3.78517 9.53125 3.09961 8.84568 3.09961 8C3.09961 7.15432 3.78517 6.46875 4.63086 6.46875C5.47654 6.46875 6.16211 7.15432 6.16211 8Z"
            stroke="currentColor"
            strokeWidth="1.3"
        />
        <path
            d="M9.22461 4.63123L6.16211 6.77498"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
        />
        <path
            d="M9.22461 11.3687L6.16211 9.22498"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
        />
        <path
            d="M12.2871 11.9813C12.2871 12.8269 11.6015 13.5125 10.7559 13.5125C9.91018 13.5125 9.22461 12.8269 9.22461 11.9813C9.22461 11.1356 9.91018 10.45 10.7559 10.45C11.6015 10.45 12.2871 11.1356 12.2871 11.9813Z"
            stroke="currentColor"
            strokeWidth="1.3"
        />
        <path
            d="M12.2871 4.01874C12.2871 4.86442 11.6015 5.54999 10.7559 5.54999C9.91018 5.54999 9.22461 4.86442 9.22461 4.01874C9.22461 3.17305 9.91018 2.48749 10.7559 2.48749C11.6015 2.48749 12.2871 3.17305 12.2871 4.01874Z"
            stroke="currentColor"
            strokeWidth="1.3"
        />
    </svg>
);

export default ShareIcon;
