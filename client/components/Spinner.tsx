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
        <span
            className={`inline-block ${className}`}
            style={{
                width: size,
                height: size,
                border: '2px solid currentColor',
                borderBottomColor: 'transparent',
                borderRadius: '50%',
                display: 'inline-block',
                boxSizing: 'border-box',
                animation: 'geist-spin 0.6s linear infinite',
            }}
        >
            <style>{`
        @keyframes geist-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </span>
    );
};

export default Spinner;
