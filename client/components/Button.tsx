import React from 'react';
import Spinner from './Spinner';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
    React.AnchorHTMLAttributes<HTMLAnchorElement> & {
        href?: string;
        isLoading?: boolean;
        block?: boolean;
    };

const Button: React.FC<ButtonProps> = ({
    className = '',
    children,
    href,
    isLoading,
    block = false,
    disabled,
    ...props
}) => {
    const baseStyles =
        'primary-bg-green hover:bg-[#16A34A] active:bg-[#15803D] text-white font-medium px-5 h-[46px] flex items-center justify-center rounded-main leading-[20px] md:leading-[24px] text-[14px] md:text-[16px] transition-all disabled:opacity-70 disabled:cursor-not-allowed font-bold font-grotesk uppercase';

    const displayStyle = block ? 'block w-full' : 'inline-block';
    const combinedClassName = `${displayStyle} ${baseStyles} ${className}`.trim();

    if (href) {
        return (
            <a href={href} className={combinedClassName} {...props}>
                {children}
            </a>
        );
    }

    return (
        <button
            className={combinedClassName}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center justify-center gap-2 text-white">
                    <Spinner className='text-white' />
                </div>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
