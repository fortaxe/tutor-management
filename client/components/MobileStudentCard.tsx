import { Student } from '../types';
import { getPlanDates } from '../lib/utils';
import Tag from './Tag';
import ActionIcon from './ActionIcon';
import StudentAvatar from './StudentAvatar';

interface MobileStudentCardProps {
    student: Student;
    onRenew: (student: Student) => void;
    onEdit: (student: Student) => void;
    onCollect: (student: Student) => void;
    onDelete?: (student: Student) => void;
    onWhatsApp?: (student: Student) => void;
    showWhatsApp?: boolean;
}

const MobileStudentCard: React.FC<MobileStudentCardProps> = ({ student, onRenew, onEdit, onCollect, onDelete, onWhatsApp, showWhatsApp }) => {
    const { endDate, remainingDays } = getPlanDates(student);
    const isExpired = remainingDays <= 0;
    const balance = student.feesAmount - student.paidAmount;

    let statusVariant: 'green' | 'red' | 'orange' = 'green';
    let statusText = `${remainingDays}${remainingDays === 1 ? ' DAY' : 'D'} LEFT`;
    if (isExpired) {
        statusVariant = 'red';
        statusText = 'EXPIRED';
    } else if (remainingDays <= 10) {
        statusVariant = 'red';
    } else if (remainingDays <= 20) {
        statusVariant = 'orange';
    } else {
        statusVariant = 'green';
    }

    return (
        <div className="bg-white p-[15px] rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-[5px]">
                <div className="flex items-center gap-2">
                    <StudentAvatar student={student} />
                    <div>
                        <h4 className="font-bold text-slate-900">{student.name}</h4>
                        <p className="text-xs text-slate-500">{student.studentPhone || 'No mobile'}</p>
                    </div>
                </div>
                <Tag variant={statusVariant} >
                    {statusText}
                </Tag>
            </div>

            <div className="flex justify-between items-end mb-[15px] mt-3">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Parent Info</p>
                    <p className="text-sm font-semibold text-slate-700">{student.parentName}</p>
                    <p className="text-xs text-slate-500">{student.parentPhone}</p>
                </div>
                <div className="text-right">
                    {balance > 0 ? (
                        <p className="text-orange-600 font-bold text-sm mb-1">₹{balance} Due</p>
                    ) : (
                        <p className="text-green-600 font-bold text-sm mb-1">Settled</p>
                    )}
                    <p className="text-[10px] text-slate-400 uppercase">Ends: {endDate.toLocaleDateString('en-GB')}</p>
                </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                <div className="flex gap-2">
                    <ActionIcon variant="reload" onClick={() => onRenew(student)} title="Renew" />
                    {showWhatsApp && <ActionIcon variant="whatsup" onClick={() => onWhatsApp?.(student)} title="WhatsApp" />}
                    <ActionIcon variant="edit" onClick={() => onEdit(student)} title="Edit" />
                    {balance > 0 && <ActionIcon variant="card" onClick={() => onCollect(student)} title="Collect Balance" />}
                </div>
                <div>
                    {onDelete && <ActionIcon variant="delete" onClick={() => onDelete(student)} title="Delete" />}
                </div>
            </div>
        </div>
    );
};

export default MobileStudentCard;
