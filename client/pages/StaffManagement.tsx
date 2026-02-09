import React, { useState } from 'react';
import { User, Tutor, UserRole } from '../types';
import PlusIcon from '../components/icons/PlusIcon';
import TrashIcon from '../components/icons/TrashIcon';
import EditIcon from '../components/icons/EditIcon';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import ExclamationTriangleIcon from '../components/icons/ExclamationTriangleIcon';

interface StaffManagementProps {
  tutor: Tutor;
  staff: User[];
  onAddAssistant: (staffData: Omit<User, 'id' | 'role'>) => void;
  onUpdateAssistant: (staff: User) => void;
  onDeleteUser: (userId: string) => void;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ tutor, staff, onAddAssistant, onUpdateAssistant, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', password: '' });

  const handleOpenModal = (member?: User) => {
    if (member) {
      setEditingStaff(member);
      setFormData({ name: member.name || '', phone: member.phone, password: '' });
    } else {
      setEditingStaff(null);
      setFormData({ name: '', phone: '', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleOpenDeleteConfirm = (member: User) => {
    setEditingStaff(member);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setEditingStaff(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      alert("Mobile number must be 10 digits.");
      return;
    }

    if (editingStaff) {
      onUpdateAssistant({
        ...editingStaff,
        name: formData.name,
        phone: formData.phone,
        password: formData.password.trim() || editingStaff.password,
      });
    } else {
      onAddAssistant({
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        tutorId: tutor.id
      });
    }

    setFormData({ name: '', phone: '', password: '' });
    handleCloseModals();
  };

  const confirmDeletion = () => {
    if (editingStaff && editingStaff._id) {
      onDeleteUser(editingStaff._id);
      handleCloseModals();
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-black text-slate-950 uppercase tracking-[0.2em] mb-1">Team Roster</h3>
          <p className="text-xs text-slate-400 font-bold">Manage credentials for your assistants and staff.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-6 py-3.5 bg-yellow-400 text-black rounded-2xl font-black uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-xl shadow-yellow-400/20 active:scale-95 text-[10px]"
        >
          <PlusIcon className="w-4 h-4 mr-2" /> Add Staff Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map(member => (
          <div key={member._id || member.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-yellow-400/5 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl shadow-inner group-hover:bg-yellow-400/10 transition-colors">
                {member.role === UserRole.TUTOR ? '👑' : '🛡️'}
              </div>
              <div className="flex flex-col items-end">
                {member.role === UserRole.TUTOR ? (
                  <Badge color="blue">Primary</Badge>
                ) : (
                  <Badge color="gray">Staff</Badge>
                )}
              </div>
            </div>

            <div className="space-y-1 mb-6">
              {member.name && <h4 className="font-bold text-slate-900">{member.name}</h4>}
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Login Phone</p>
                <p className="text-lg font-black text-slate-950 tracking-tight">{member.phone}</p>
              </div>
            </div>

            <div className="flex justify-end items-center pt-4 border-t border-slate-50">
              {member.role !== UserRole.TUTOR && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(member)}
                    className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
                    title="Edit Credentials"
                  >
                    <EditIcon className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleOpenDeleteConfirm(member)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
                    title="Remove Account"
                  >
                    <TrashIcon className="w-4 h-4" /> Remove
                  </button>
                </div>
              )}
              {member.role === UserRole.TUTOR && (
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Primary Account</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModals} title={editingStaff ? "Edit Staff Account" : "Create Staff Account"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-yellow-400/5 p-4 rounded-2xl border border-yellow-400/10 mb-2">
            <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
              {editingStaff
                ? "Update login phone number or reset the staff member's password. Leave password blank if you don't want to change it."
                : "Add professional staff members to help manage student registrations and renewals. They will not be able to see your earnings."}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-600 uppercase tracking-widest ml-1">Staff Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:outline-none font-bold text-slate-900"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-600 uppercase tracking-widest ml-1">Staff Mobile Number</label>
            <input
              type="tel"
              required
              maxLength={10}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:outline-none font-bold text-slate-900"
              placeholder="10-digit login number"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-600 uppercase tracking-widest ml-1">
              {editingStaff ? "New Password (Leave blank to keep current)" : "Assigned Password"}
            </label>
            <input
              type="text"
              required={!editingStaff}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:outline-none text-slate-900 font-bold"
              placeholder={editingStaff ? "Enter new password if resetting" : "e.g. StaffPass123"}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleCloseModals}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-yellow-400 text-black rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-yellow-400/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {editingStaff ? "Update Credentials" : "Create Account"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        title="Confirm Deletion"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h4 className="text-lg font-black text-slate-900 mb-2">Delete Staff Account?</h4>
          <p className="text-sm text-slate-500 mb-8 px-4 leading-relaxed">
            Removing the account for <span className="font-bold text-slate-900">{editingStaff?.phone}</span> will immediately revoke their access to this tutor dashboard.
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleCloseModals}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeletion}
              className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 transition-colors active:scale-95"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StaffManagement;
