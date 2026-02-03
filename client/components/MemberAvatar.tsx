import React from 'react';
import { Member } from '../types';
import { getPlanDates } from '../lib/utils';

const MemberAvatar: React.FC<{ member: Member }> = ({ member }) => {
    if (member.photo) {
        return (
            <img
                src={member.photo}
                alt={member.name}
                className="size-[46px] rounded-main object-cover border-main"
            />
        );
    }

    const { remainingDays } = getPlanDates(member);
    const isExpired = remainingDays < 0;
    const balance = member.feesAmount - member.paidAmount;

    let themeClass = '';

    if (isExpired) {
        themeClass = 'red-secondary-bg border-red red-color';
    } else if (balance > 0) {
        themeClass = 'orange-secondary-bg border-orange orange-text-color';
    } else {
        themeClass = 'green-secondary-bg border-green green-text-color';
    }

    return (
        <div className={`size-[46px] rounded-main border flex items-center justify-center font-black text-[16px] leading-[22px] uppercase font-bold font-grotesk ${themeClass}`}>
            {member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
        </div>
    );
};

export default MemberAvatar;
