import React from 'react';

interface SummaryItem {
    label: string;
    value: string | number;
    color?: string;
}

interface SummaryCardProps {
    title?: string;
    items: SummaryItem[];
    highlightValue?: {
        label: string;
        value: string | number;
        colorClass?: string;
    };
    variant?: 'dark' | 'orange' | 'light' | 'slate';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, items, highlightValue, variant = 'light' }) => {
    if (variant === 'light' || variant === 'slate') {
        const isSlate = variant === 'slate';
        return (
            <div className={`${isSlate ? 'bg-[#F8FAFC] p-5 border-main gap-[15px]' : 'bg-[#22C55E]/5 p-6 border border-[#22C55E]/10'} rounded-main flex flex-col`}>
                {title && <p className="text-[14px] font-bold uppercase tracking-widest mb-4 secondary-color font-grotesk">{title}</p>}
                <div className={`flex flex-col ${isSlate ? 'gap-[15px]' : 'gap-3'}`}>
                    {items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <span className={`${isSlate ? 'font-grotesk secondary-color font-bold text-[14px]' : 'font-black text-slate-400 tracking-widest'} uppercase`}>
                                {item.label}
                            </span>
                            <span className={`font-bold font-black text-[14px] ${item.color || 'text-slate-950'}`}>{item.value}</span>
                        </div>
                    ))}
                </div>
                {highlightValue && (
                    <div className={`${isSlate ? 'mt-[15px] pt-[15px]' : 'mt-5 pt-5'} border-t ${isSlate ? 'border-[#E2E8F0]' : 'border-[#22C55E]/10'} flex justify-between items-center`}>
                        <span className={`${isSlate ? 'font-grotesk secondary-color font-bold text-[14px]' : 'text-xs font-black text-slate-900'} uppercase`}>
                            {highlightValue.label}
                        </span>
                        <span className={`text-2xl font-black ${highlightValue.colorClass || 'text-orange-600'}`}>{highlightValue.value}</span>
                    </div>
                )}
            </div>
        );
    }

    const bgClass = variant === 'dark' ? 'bg-black' : 'bg-[#F59E0B]';

    return (
        <div className={`p-8 rounded-main text-white relative overflow-hidden transition-colors ${bgClass}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            {title && <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4">{title}</p>}
            <div className="flex items-center justify-between">
                {items.map((item, i) => (
                    <React.Fragment key={i}>
                        <div className={i === items.length - 1 ? 'text-right' : ''}>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{item.label}</p>
                            <p className="text-base font-black">{item.value}</p>
                        </div>
                        {i < items.length - 1 && <div className="h-px w-10 bg-white/20"></div>}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default SummaryCard;
