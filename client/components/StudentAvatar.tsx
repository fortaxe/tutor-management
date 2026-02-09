import { Student } from '../types';
import { getPlanDates } from '../lib/utils';

const StudentAvatar: React.FC<{ student: Student }> = ({ student }) => {
    if (student.photo) {
        return (
            <img
                src={student.photo}
                alt={student.name}
                className="size-[46px] rounded-main object-cover border-main"
            />
        );
    }

    const { remainingDays } = getPlanDates(student);
    const isExpired = remainingDays < 0;
    const balance = student.feesAmount - student.paidAmount;

    let themeClass = '';

    if (isExpired) {
        themeClass = 'bg-red-50 border-red-200 text-red-600';
    } else if (balance > 0) {
        themeClass = 'bg-orange-50 border-orange-200 text-orange-600';
    } else {
        themeClass = 'bg-green-50 border-green-200 text-green-600';
    }

    return (
        <div className={`size-[46px] rounded-main border flex items-center justify-center font-black text-[16px] leading-[22px] uppercase font-bold font-grotesk ${themeClass}`}>
            {student.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
        </div>
    );
};

export default StudentAvatar;
