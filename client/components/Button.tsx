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
        primary: 'primary-bg-yellow hover:bg-[#EAB308] active:bg-[#CA8A04] text-black shadow-lg shadow-yellow-400/10',
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
                    <Spinner className={variant === 'primary' ? 'text-black' : 'text-current'} />
                </div>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
