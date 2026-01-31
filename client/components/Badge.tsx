
import React from 'react';

interface BadgeProps {
  color: 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange';
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ color, children }) => {
  const colorClasses = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    yellow: 'bg-orange-50 text-orange-700 border-orange-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    gray: 'bg-slate-100 text-slate-600 border-slate-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
  };

  return (
    <span className={`px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-black uppercase tracking-widest rounded-lg border shadow-sm ${colorClasses[color]}`}>
      {children}
    </span>
  );
};

export default Badge;
