
import React, { useState } from 'react';
import { User, Gym, UserRole } from '../types';
import PlusIcon from '../components/icons/PlusIcon';
import TrashIcon from '../components/icons/TrashIcon';
import EditIcon from '../components/icons/EditIcon';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import ExclamationTriangleIcon from '../components/icons/ExclamationTriangleIcon';

interface StaffManagementProps {
  gym: Gym;
  staff: User[];
  onAddTrainer: (trainerData: Omit<User, 'id' | 'role'>) => void;
  onUpdateTrainer: (trainer: User) => void;
  onDeleteUser: (userId: number) => void;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ gym, staff, onAddTrainer, onUpdateTrainer, onDeleteUser }) => {
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
      onUpdateTrainer({
        ...editingStaff,
        name: formData.name,
        phone: formData.phone,
        password: formData.password.trim() || editingStaff.password,
      });
    } else {
      onAddTrainer({
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        gymId: gym.id
      });
    }

    setFormData({ name: '', phone: '', password: '' });
    handleCloseModals();
  };

  const confirmDeletion = () => {
    if (editingStaff) {
      onDeleteUser(editingStaff.id);
      handleCloseModals();
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-black text-slate-950 uppercase tracking-[0.2em] mb-1">Team Roster</h3>
          <p className="text-xs text-slate-400 font-bold">Manage credentials for your trainers and staff.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-6 py-3.5 bg-brand text-charcoal rounded-2xl font-black uppercase tracking-widest hover:bg-brand-400 transition-all shadow-xl shadow-brand/20 active:scale-95 text-[10px]"
        >
          <PlusIcon className="w-4 h-4 mr-2" /> Add Staff Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map(member => (
          <div key={member.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-brand/5 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl shadow-inner group-hover:bg-brand/10 transition-colors">
                {member.role === UserRole.GYM_OWNER ? '👑' : '🛡️'}
              </div>
              <div className="flex flex-col items-end">
                {member.role === UserRole.GYM_OWNER ? (
                  <Badge color="blue">Owner</Badge>
                ) : (
                  <Badge color="gray">Trainer</Badge>
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
              {member.role !== UserRole.GYM_OWNER && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(member)}
                    className="p-2 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-xl transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
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
              {member.role === UserRole.GYM_OWNER && (
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Primary Account</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModals} title={editingStaff ? "Edit Staff Account" : "Create Staff Account"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-brand/5 p-4 rounded-2xl border border-brand/10 mb-2">
            <p className="text-xs text-brand-800 font-medium leading-relaxed italic">
              {editingStaff
                ? "Update login phone number or reset the staff member's password. Leave password blank if you don't want to change it."
                : "Add professional staff members to help manage client registrations and renewals. They will not be able to see your earnings."}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-600 uppercase tracking-widest ml-1">Staff Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand focus:outline-none font-bold text-slate-900"
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
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand focus:outline-none font-bold text-slate-900"
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
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand focus:outline-none text-slate-900 font-bold"
              placeholder={editingStaff ? "Enter new password if resetting" : "e.g. TrainerPass123"}
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
              className="flex-1 py-4 bg-brand text-charcoal rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all"
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
            Removing the account for <span className="font-bold text-slate-900">{editingStaff?.phone}</span> will immediately revoke their access to this gym dashboard.
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
