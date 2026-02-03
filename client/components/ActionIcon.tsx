
import React from 'react';
import ReloadIcon from './icons/Reload';
import EditIcon from './icons/EditIcon';
import CardIcon from './icons/card';
import DeleteIcon from './icons/delete';
import WhatsAppIcon from './icons/WhatsAppIcon';

import PdfIcon from './icons/PdfIcon';

export type ActionVariant = 'reload' | 'edit' | 'card' | 'delete' | 'whatsup' | 'pdf';

interface ActionIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant: ActionVariant;
}

const variants = {
    reload: {
        icon: ReloadIcon,
        className: "bg-[#EFF6FF] border-[#A7C8FB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white hover:border-transparent"
    },
    edit: {
        icon: EditIcon,
        className: "bg-[#F8FAFC] border-[#CBD5E1] text-[#475569] hover:bg-[#475569] hover:text-white hover:border-transparent"
    },
    card: {
        icon: CardIcon,
        className: "bg-[#F5F3FF] border-[#CBB7FB] text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white hover:border-transparent"
    },
    delete: {
        icon: DeleteIcon,
        className: "bg-[#FEEDED] border-[#FBCCCC] text-[#EF4444] hover:bg-[#EF4444] hover:text-white hover:border-transparent"
    },
    whatsup: {
        icon: WhatsAppIcon,
        className: "bg-[#22C55E1A] border-[#22C55E33] text-[#22C55E] hover:bg-[#22C55E] hover:text-white hover:border-transparent"
    },
    pdf: {
        icon: PdfIcon,
        className: "bg-[#F1F5F9] border-[#CBD5E1] text-[#64748B] hover:bg-[#64748B] hover:text-white hover:border-transparent"
    }
};

const ActionIcon: React.FC<ActionIconProps> = ({ variant, className, children, style, ...props }) => {
    const config = variants[variant];
    const Icon = config.icon;

    return (
        <button
            {...props}
            style={{ ...style, borderWidth: '1.3px' }}
            className={`w-[36px] h-[36px] items-center justify-center flex rounded-[10px] transition-all duration-200 ${config.className} ${className || ''}`}
        >
            {children ? children : <Icon className="w-[16px] h-[16px]" />}
        </button>
    );
};

export default ActionIcon;
