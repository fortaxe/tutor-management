import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { closeAddMemberModal, openAddMemberModal } from '../store/uiSlice';
import { User, Tutor, Student, PaymentStatus, StudentType, PaymentMode } from '../types';
import Modal from '../components/Modal';
import StudentForm from '../components/StudentForm';
import UserGroupIcon from '../components/icons/UserGroupIcon';
import ExclamationTriangleIcon from '../components/icons/ExclamationTriangleIcon';
import Button from '../components/Button';
import Tag from '../components/Tag';
import Input from '../components/Input';
import StatsCard from '../components/StatsCard';
import ActionIcon from '../components/ActionIcon';
import MobileStudentCard from '../components/MobileStudentCard';
import StudentAvatar from '@/components/StudentAvatar';
import { getPlanDates } from '@/lib/utils';
import { Table, Column } from '../components/Table';
import Drawer from '../components/Drawer';
import CollectBalanceForm from '../components/CollectBalanceForm';
import RenewPlanForm from '../components/RenewPlanForm';
import { generateInvoice } from '../lib/invoiceGenerator';

interface TutorDashboardProps {
  user: User;
  tutor: Tutor;
  students: Student[];
  onLogout: () => void;
  onAddStudent: (student: Omit<Student, 'id' | '_id'>) => Promise<any>;
  onUpdateStudent: (student: Student) => Promise<any>;
  onRenewStudent: (studentId: string | number, renewalData: { planStart: string; planDurationMonths: number; feesAmount: number; paidAmount: number; feesStatus: PaymentStatus; studentType: StudentType; paymentMode: PaymentMode }) => Promise<any>;
  onDeleteStudent: (studentId: string | number) => void;
}

type Tab = 'students' | 'expiry' | 'expired' | 'dues';

const TutorDashboard: React.FC<TutorDashboardProps> = ({ user: _user, tutor, students, onAddStudent, onUpdateStudent, onRenewStudent, onDeleteStudent }) => {
  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isAddStudentModalOpen = useSelector((state: RootState) => state.ui.isAddMemberModalOpen);
  const dispatch = useDispatch();
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [initialType, setInitialType] = useState<StudentType>(StudentType.SUBSCRIPTION);

  const [sortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });

  const [successData, setSuccessData] = useState<{
    type: 'ADD' | 'RENEW' | 'COLLECT';
    student: Student;
    title: string;
    description?: string;
    amount?: number;
  } | null>(null);

  const expiryFilter = 5;
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const expiredStudents = students.filter(s => getPlanDates(s).remainingDays <= 0).length;
    const expiringSoon = students.filter(s => {
      const { remainingDays } = getPlanDates(s);
      return remainingDays > 0 && remainingDays <= expiryFilter;
    }).length;
    const duesPendingStudents = students.filter(s => (s.feesAmount - s.paidAmount) > 0 && getPlanDates(s).remainingDays >= 0);
    const duesPending = duesPendingStudents.length;
    const totalDuesAmount = duesPendingStudents.reduce((sum, s) => sum + (s.feesAmount - s.paidAmount), 0);

    const activeStudents = students.length - expiredStudents;

    return { activeStudents, expiredStudents, duesPending, totalDuesAmount, expiringSoon };
  }, [students, expiryFilter]);

  const columns: Column<Student>[] = [
    {
      key: 'profile',
      header: "STUDENT",
      headerClassName: "table-th pl-5 pr-[50px]",
      className: "w-1 py-[15px] pl-5 pr-[50px] whitespace-nowrap",
      render: (student) => (
        <div className="flex items-center">
          <StudentAvatar student={student} />
          <div className="ml-2">
            <div className="font-bold text-slate-900">{student.name}</div>
            <div className="text-slate-500 text-xs">{student.studentPhone || 'No student mobile'}</div>
            <div className="flex gap-1 mt-0.5">
              <span className="px-1.5 py-0.5 bg-slate-100 text-[10px] font-black uppercase text-slate-500 rounded">{student.studentClass}</span>
              <span className="px-1.5 py-0.5 bg-yellow-100 text-[10px] font-black uppercase text-yellow-700 rounded">{student.board}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'parent',
      header: "PARENT INFO",
      headerClassName: "table-th pr-[50px]",
      className: "w-1 py-5 pr-[50px] whitespace-nowrap text-sm",
      render: (student) => (
        <>
          <div className="text-slate-900 font-medium">{student.parentName}</div>
          <div className="text-slate-400 font-bold uppercase text-[10px] tracking-tight">{student.parentPhone}</div>
        </>
      )
    },
    {
      key: 'expiry',
      header: "EXPIRY DATE",
      headerClassName: "table-th pr-[50px]",
      className: "w-1 py-5 pr-[50px] whitespace-nowrap text-sm",
      render: (student) => {
        const { endDate, remainingDays } = getPlanDates(student);
        const isExpired = remainingDays < 0;
        return (
          <>
            <div className="text-slate-900 font-medium">{endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}</div>
            <div className="text-slate-400 font-bold uppercase text-[10px] tracking-tight">{isExpired ? 'Expired On' : 'Expires On'}</div>
          </>
        )
      }
    },
    {
      key: 'days_left',
      header: "STATUS",
      headerClassName: "table-th pr-[50px]",
      className: "w-1 py-5 pr-[50px] whitespace-nowrap text-sm",
      render: (student) => {
        const { remainingDays } = getPlanDates(student);
        const isExpired = remainingDays <= 0;
        if (isExpired) return <Tag variant="red">EXPIRED</Tag>;
        return (
          <span className={`font-bold ${remainingDays <= 10 ? 'text-red-500' : 'text-green-600'}`}>
            {remainingDays} {remainingDays === 1 ? 'Day' : 'Days'} Left
          </span>
        )
      }
    },
    {
      key: 'payment',
      header: "PAYMENT",
      headerClassName: "table-th text-left w-full",
      className: " py-5 whitespace-nowrap text-sm w-full",
      render: (student) => {
        const balance = student.feesAmount - student.paidAmount;
        const { remainingDays } = getPlanDates(student);
        const isExpired = remainingDays <= 0;

        return (
          <div className="flex items-center gap-[5px]">
            {isExpired ? (
              <Tag variant="red">EXPIRED</Tag>
            ) : (
              <>
                {(student.feesStatus === PaymentStatus.PAID || balance <= 0) ? (
                  <Tag variant="green">SETTLED</Tag>
                ) : (
                  <Tag variant="orange">DUE : ₹{balance}</Tag>
                )}
              </>
            )}
          </div>
        )
      }
    },
    {
      key: 'actions',
      header: "ACTIONS",
      headerClassName: "table-th text-right px-5",
      className: "px-5 py-5 whitespace-nowrap text-right text-sm font-medium",
      render: (student) => {
        const { remainingDays, endDate } = getPlanDates(student);
        const isExpired = remainingDays < 0;
        const balance = student.feesAmount - student.paidAmount;

        const handleWhatsApp = () => {
          const text = isExpired
            ? `Hi ${student.name},\n\nYour classes with ${tutor.name} expired on ${endDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '')}.\n\nPlease renew today.\n\nThank you`
            : `Hi ${student.name},\n\nYour subscription with ${tutor.name} expires in ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}.\n\nKindly renew soon.\n\nThank you`;
          window.open(`https://wa.me/91${student.parentPhone}?text=${encodeURIComponent(text)}`, '_blank');
        };

        return (
          <div className="flex items-center justify-end gap-[5px]">
            {(activeTab === 'expiry' || activeTab === 'expired') && (
              <ActionIcon variant="whatsup" onClick={handleWhatsApp} title="WhatsApp Reminder" />
            )}
            <ActionIcon variant="reload" onClick={() => handleOpenRenewModal(student)} title="Renew Plan" />
            {balance > 0 && (
              <ActionIcon variant="card" onClick={() => handleOpenCollectModal(student)} title="Collect Fees" />
            )}
            <ActionIcon variant="edit" onClick={() => handleOpenModal(student)} />
            <ActionIcon variant="delete" onClick={() => handleOpenDeleteConfirm(student)} />
          </div>
        )
      }
    }
  ];

  const filteredStudents = useMemo(() => {
    let baseList = students;

    switch (activeTab) {
      case 'expiry':
        baseList = students
          .filter(s => {
            const { remainingDays } = getPlanDates(s);
            return remainingDays > 0 && remainingDays <= expiryFilter;
          })
          .sort((a, b) => getPlanDates(a).remainingDays - getPlanDates(b).remainingDays);
        break;
      case 'dues':
        baseList = students.filter(s => {
          const { remainingDays } = getPlanDates(s);
          return (s.feesAmount - s.paidAmount) > 0 && remainingDays >= 0;
        });
        break;
      case 'expired':
        baseList = students.filter(s => getPlanDates(s).remainingDays <= 0);
        break;
      case 'students':
      default:
        baseList = students;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      baseList = baseList.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.parentPhone.includes(q) ||
        s.studentPhone?.includes(q)
      );
    }

    return [...baseList].sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA: any = (a as any)[key];
      let valB: any = (b as any)[key];

      if (key === 'planStart' || key === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [students, activeTab, searchQuery, sortConfig, expiryFilter]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const handleOpenModal = (student: Student | null = null, type: StudentType = StudentType.SUBSCRIPTION) => {
    setEditingStudent(student);
    setInitialType(type);
    setIsEditModalOpen(true);
    setSuccessData(null);
  };

  const handleOpenCollectModal = (student: Student) => {
    setEditingStudent(student);
    setIsCollectModalOpen(true);
    setSuccessData(null);
  };

  const handleOpenRenewModal = (student: Student) => {
    setEditingStudent(student);
    setIsRenewModalOpen(true);
    setSuccessData(null);
  };

  const handleOpenDeleteConfirm = (student: Student) => {
    setEditingStudent(student);
    setIsDeleteModalOpen(true);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCloseModal = () => {
    setEditingStudent(null);
    setIsEditModalOpen(false);
    dispatch(closeAddMemberModal());
    setIsCollectModalOpen(false);
    setIsRenewModalOpen(false);
    setIsDeleteModalOpen(false);
    setSuccessData(null);
    setIsSubmitting(false);
  };

  const handleFormSubmit = async (studentData: Omit<Student, 'id' | '_id'> | Student) => {
    setIsSubmitting(true);
    try {
      if ('id' in studentData || '_id' in studentData) {
        await onUpdateStudent(studentData as Student);
        handleCloseModal();
      } else {
        const newStudent = await onAddStudent({ ...studentData, tutorId: tutor.id });
        if (newStudent) {
          setSuccessData({
            type: 'ADD',
            student: newStudent,
            title: 'Student Registered Successfully',
            description: 'New Admission'
          });
        } else {
          handleCloseModal();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCollectSubmit = async (amount: number, paymentMode: PaymentMode) => {
    if (!editingStudent) return;
    const maxAllowed = editingStudent.feesAmount - editingStudent.paidAmount;
    if (amount <= 0 || amount > maxAllowed) {
      alert(`Invalid amount (Max: ₹${maxAllowed})`);
      return;
    }

    const newTotalPaid = editingStudent.paidAmount + amount;
    const newStatus = newTotalPaid >= editingStudent.feesAmount ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

    setIsSubmitting(true);
    try {
      const updated = await onUpdateStudent({
        ...editingStudent,
        paidAmount: newTotalPaid,
        feesStatus: newStatus,
        paymentMode
      });

      setSuccessData({
        type: 'COLLECT',
        student: updated || { ...editingStudent, paidAmount: newTotalPaid, feesStatus: newStatus },
        title: 'Fees Collected',
        amount: amount
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRenewStudentSubmit = async (renewalData: {
    planStart: string;
    planDurationMonths: number;
    feesAmount: number;
    paidAmount: number;
    feesStatus: PaymentStatus;
    studentType: StudentType;
    paymentMode: PaymentMode;
  }) => {
    if (!editingStudent) return;
    setIsSubmitting(true);
    try {
      const updated = await onRenewStudent(editingStudent._id || editingStudent.id!, renewalData);
      setSuccessData({
        type: 'RENEW',
        student: updated || editingStudent,
        title: 'Plan Renewed Successfully'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeletion = () => {
    if (editingStudent) {
      onDeleteStudent(editingStudent._id || editingStudent.id!);
      handleCloseModal();
    }
  };

  const tabClasses = (tabName: Tab) => `
    flex-1 text-center px-[15px] py-[5px] uppercase font-black transition-all duration-300 w-fit text-[12px]
    ${activeTab === tabName ? 'bg-black text-yellow-400 z-10' : 'bg-gray-100 text-gray-500 border border-gray-200'}
  `;

  const SuccessView = () => {
    if (!successData) return null;
    const { student, title, description, amount } = successData;
    const displayAmount = amount !== undefined ? amount : student.paidAmount;
    const showInvoiceOptions = displayAmount > 0;

    const handleShare = async () => {
      try {
        const dateStr = new Date().toISOString();
        if (navigator.share) {
          const blob = await generateInvoice(tutor, student as any, dateStr, description, true, displayAmount);
          if (blob instanceof Blob) {
            const file = new File([blob], `${student.name.replace(/\s+/g, '_')}_Receipt.pdf`, { type: 'application/pdf' });
            try {
              await navigator.share({
                files: [file],
                title: 'Payment Receipt',
                text: `Hi ${student.name}, here is your payment receipt from ${tutor.name}.`
              });
              return;
            } catch (shareError) {
              console.log("Share failed (likely file sharing not supported)", shareError);
            }
          }
        }

      } catch (e) {
        console.error("Total share failed", e);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center p-6 h-full text-center">
        <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-500 mb-8">{showInvoiceOptions ? 'Transaction recorded successfully.' : 'Action completed successfully.'}</p>

        {showInvoiceOptions && (
          <div className="flex flex-col gap-3 w-full max-w-sm mb-8">
            <Button
              onClick={handleShare}
              className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white h-[52px] rounded-xl font-bold border-none"
            >
              Share Receipt on WhatsApp
            </Button>
            <Button
              onClick={() => generateInvoice(tutor, student as any, new Date().toISOString(), description, false, displayAmount)}
              variant="secondary"
              className="w-full h-[52px] !text-slate-900 !border-slate-200"
            >
              Download Invoice
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4 px-4 md:px-5 lg:px-0 no-scrollbar">
        <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 gap-4 no-scrollbar">
          <StatsCard
            label="Active Students"
            value={stats.activeStudents}
            variant="green"
            isActive={activeTab === 'students'}
            onClick={() => setActiveTab('students')}
          />
          <StatsCard
            label="Expiring"
            value={stats.expiringSoon}
            variant="red"
            isActive={activeTab === 'expiry'}
            onClick={() => setActiveTab('expiry')}
          />
          <StatsCard
            label="Balance Due"
            value={stats.duesPending}
            variant="orange"
            isActive={activeTab === 'dues'}
            onClick={() => setActiveTab('dues')}
          />
        </div>

        <Button
          onClick={() => dispatch(openAddMemberModal())}
          className="md:hidden w-full bg-yellow-400 text-black border-none hover:bg-yellow-500 font-black h-12 rounded-xl text-xs tracking-widest uppercase mb-2"
        >
          + Add Student
        </Button>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className='flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar'>
            {['students', 'expiry', 'expired', 'dues'].map((t) => (
              <button key={t} onClick={() => handleTabChange(t as Tab)} className={`${tabClasses(t as Tab)} rounded-lg whitespace-nowrap`}>
                {t === 'students' ? 'All' : t === 'expiry' ? 'Expiring' : t}
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <img src="/icons/search.svg" alt="" className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 h-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <div className="hidden md:block">
            <Table
              data={filteredStudents}
              columns={columns}
              keyExtractor={(item) => item._id || item.id!.toString()}
            />
          </div>

          <div className="md:hidden space-y-2 p-4">
            {filteredStudents.map(student => (
              <MobileStudentCard
                key={student._id || student.id}
                student={student}
                onRenew={handleOpenRenewModal}
                onEdit={handleOpenModal}
                onCollect={handleOpenCollectModal}
                onDelete={handleOpenDeleteConfirm}
              />
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-20">
              <UserGroupIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No matching records</p>
            </div>
          )}
        </div>
      </div>

      <Drawer isOpen={isEditModalOpen || isAddStudentModalOpen} onClose={handleCloseModal} title={successData ? successData.title : (editingStudent ? 'Edit Student' : 'New Admission')} >
        {successData ? <SuccessView /> : (
          <StudentForm
            student={editingStudent}
            initialType={initialType}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
            isLoading={isSubmitting}
          />
        )}
      </Drawer>

      <Drawer isOpen={isCollectModalOpen} onClose={handleCloseModal} title={successData ? successData.title : "Collect Fees"}>
        {successData ? <SuccessView /> : editingStudent && (
          <CollectBalanceForm
            student={editingStudent}
            onSubmit={handleCollectSubmit}
            onCancel={handleCloseModal}
            isLoading={isSubmitting}
          />
        )}
      </Drawer>

      <Drawer isOpen={isRenewModalOpen} onClose={handleCloseModal} title={successData ? successData.title : "Renew Plan"}>
        {successData ? <SuccessView /> : editingStudent && (
          <RenewPlanForm
            student={editingStudent}
            onSubmit={onRenewStudentSubmit}
            onCancel={handleCloseModal}
            isLoading={isSubmitting}
          />
        )}
      </Drawer>

      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModal} title="Confirm Delete">
        <div className="text-center py-4">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h4 className="text-lg font-bold mb-2">Delete Student Profile?</h4>
          <p className="text-sm text-gray-500 mb-6">Are you sure you want to remove <span className="font-bold">{editingStudent?.name}</span>? This cannot be undone.</p>
          <div className="flex gap-2">
            <Button onClick={handleCloseModal} variant="secondary" className="flex-1">Cancel</Button>
            <Button onClick={confirmDeletion} className="flex-1 bg-red-600 text-white hover:bg-red-700">Delete</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TutorDashboard;
