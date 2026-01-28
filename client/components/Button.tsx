import React from 'react';

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
        'primary-bg-green text-white font-semibold px-5 py-3 rounded-main leading-[20px] md:leading-[24px] text-[14px] md:text-[16px] transition-all disabled:opacity-70 disabled:cursor-not-allowed';

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
            {children}
        </button>
    );
};

export default Button;
