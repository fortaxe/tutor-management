import React from 'react';
import { Member, MemberType } from '../types';
import { getPlanDates } from '../lib/utils';
import Tag from './Tag';
import ActionIcon from './ActionIcon';
import MemberAvatar from './MemberAvatar';

interface MobileMemberCardProps {
    member: Member;
    onRenew: (member: Member) => void;
    onEdit: (member: Member) => void;
    onCollect: (member: Member) => void;
    onDelete: (member: Member) => void;
    onWhatsApp?: (member: Member) => void;
}

const MobileMemberCard: React.FC<MobileMemberCardProps> = ({ member, onRenew, onEdit, onCollect, onDelete, onWhatsApp }) => {
    const { endDate, remainingDays } = getPlanDates(member);
    const isExpired = remainingDays <= 0;
    const balance = member.feesAmount - member.paidAmount;

    // Status Badge Logic
    let statusVariant: 'green' | 'red' | 'orange' = 'green';
    let statusText = `${remainingDays}D LEFT`;
    if (isExpired) {
        statusVariant = 'red';
        statusText = 'EXPIRED';
    } else if (remainingDays <= 10) {
        statusVariant = 'orange';
    }

    return (
        <div className="bg-white p-[15px] rounded-main border-main">
            {/* Top Row: Avatar + Info | Status Badge */}
            <div className="flex justify-between items-start mb-[5px]">
                <div className="flex items-center gap-2">
                    <MemberAvatar member={member} />
                    <div>
                        <h4 className="dashboard-primary-desc-geist text-black">{member.name}</h4>
                        <p className="dashboard-secondary-desc-geist secondary-color pt-[1px]">{member.phone}</p>
                    </div>
                </div>
                <Tag variant={statusVariant} >
                    {statusText}
                </Tag>
            </div>

            {/* Middle Row: Payment Status | Expiry Date */}
            <div className="flex justify-between items-end mb-[15px]">
                <div>
                    {balance > 0 ? (
                        <Tag variant="orange" className="uppercase px-3 py-1 text-xs font-black tracking-wide">
                            ₹{balance} DUE
                        </Tag>
                    ) : (
                        <Tag variant="green" className="uppercase px-3 py-1 text-xs font-black tracking-wide">
                            SETTLED
                        </Tag>
                    )}
                </div>
                <div className="text-right">
                    <p className="text uppercase font-grotesk !font-bold secondary-color mb-[0.5px] text-[12px] leading-[18px]">{remainingDays < 0 ? 'Expired On' : 'Expires On'}</p>
                    <p className="dashboard-primary-desc-geist text-black">{endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
            </div>

            {/* Bottom Row: Actions */}
            <div className="flex justify-between items-center">
                <div className="flex gap-[5px]">
                    <ActionIcon variant="reload" onClick={() => onRenew(member)} title="Renew" />
                    {remainingDays <= 10 && <ActionIcon variant="whatsup" onClick={() => onWhatsApp?.(member)} title="WhatsApp" />}
                    <ActionIcon variant="edit" onClick={() => onEdit(member)} title="Edit" />
                    {balance > 0 && <ActionIcon variant="card" onClick={() => onCollect(member)} title="Collect" />}
                </div>
                <div>
                    <ActionIcon variant="delete" onClick={() => onDelete(member)} title="Delete" />
                </div>
            </div>
        </div>
    );
};

export default MobileMemberCard;
