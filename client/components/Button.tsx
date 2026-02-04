import React from 'react';
import Spinner from './Spinner';
import { cn } from '../lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
    React.AnchorHTMLAttributes<HTMLAnchorElement> & {
        href?: string;
        isLoading?: boolean;
        block?: boolean;
        variant?: 'primary' | 'secondary';
    };

const Button: React.FC<ButtonProps> = ({
    className = '',
    children,
    href,
    isLoading,
    block = false,
    disabled,
    variant = 'primary',
    ...props
}) => {
    const baseStyles = 'h-[46px] flex items-center justify-center rounded-main leading-[20px] px-5  md:leading-[24px] text-[14px] md:text-[16px] transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase font-grotesk font-bold';

    const variants = {
        primary: 'primary-bg-green hover:bg-[#16A34A] active:bg-[#15803D] text-white',
        secondary: 'bg-[#F8FAFC] border-main hover:bg-slate-100 text-[16px] leading-[22px] text-[#9CA3AF]'
    };

    const combinedClassName = cn(
        baseStyles,
        variants[variant],
        block ? 'w-full' : 'w-fit',
        className
    );

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
                <div className="flex items-center justify-center gap-2">
                    <Spinner className={variant === 'primary' ? 'text-white' : 'text-current'} />
                </div>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
