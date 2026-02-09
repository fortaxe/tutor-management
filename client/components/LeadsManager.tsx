
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../lib/client';
import { Lead } from '../types';
import Badge from './Badge';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import Modal from './Modal';
import Input from './Input';
import Toast from './Toast';

const LeadsManager: React.FC = () => {
    const queryClient = useQueryClient();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Fetch Leads
    const { data: leads = [], isLoading } = useQuery({
        queryKey: ['leads'],
        queryFn: async () => {
            const res = await client.get('/leads');
            return res.data;
        }
    });

    // Delete Mutation
    const deleteLeadMutation = useMutation({
        mutationFn: async (id: string) => {
            await client.delete(`/leads/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            setToast({ message: 'Lead deleted successfully', type: 'success' });
        }
    });

    // Update Mutation
    const updateLeadMutation = useMutation({
        mutationFn: async (lead: Lead) => {
            const res = await client.patch(`/leads/${lead._id}`, lead);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            setIsEditModalOpen(false);
            setToast({ message: 'Lead updated successfully', type: 'success' });
        }
    });

    const handleStatusChange = (status: Lead['status']) => {
        if (selectedLead) {
            setSelectedLead({ ...selectedLead, status });
        }
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedLead) {
            updateLeadMutation.mutate(selectedLead);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new': return <Badge color="blue">New</Badge>;
            case 'contacted': return <Badge color="yellow">Contacted</Badge>;
            case 'converted': return <Badge color="green">Converted</Badge>;
            case 'rejected': return <Badge color="red">Rejected</Badge>;
            default: return <Badge color="gray">{status}</Badge>;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-black text-slate-900">Leads Tracking</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-widest">Track and manage prospective tutors</p>
            </div>

            {isLoading ? (
                <div className="p-10 text-center text-slate-500">Loading leads...</div>
            ) : leads.length === 0 ? (
                <div className="p-10 text-center text-slate-400">No leads found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tutor Owner</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tutor Name</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phone</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {leads.map((lead: Lead) => (
                                <tr key={lead._id || lead.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-bold">
                                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900">
                                        {lead.tutorOwnerName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900">
                                        {lead.tutorName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-500">
                                        {lead.phone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {getStatusBadge(lead.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => { setSelectedLead(lead); setIsEditModalOpen(true); }}
                                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                                        >
                                            <EditIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => { if (confirm('Delete this lead?')) deleteLeadMutation.mutate(lead._id || (lead.id as string)); }}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Lead Status">
                {selectedLead && (
                    <form onSubmit={handleUpdateSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {['new', 'contacted', 'converted', 'rejected'].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => handleStatusChange(s as any)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedLead.status === s ? 'bg-black text-yellow-400 border-black shadow-lg shadow-black/10' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Input
                                label="Owner Name"
                                value={selectedLead.tutorOwnerName}
                                onChange={(e) => setSelectedLead({ ...selectedLead, tutorOwnerName: e.target.value })}
                            />
                            <Input
                                label="Tutor Name"
                                value={selectedLead.tutorName}
                                onChange={(e) => setSelectedLead({ ...selectedLead, tutorName: e.target.value })}
                            />
                            <Input
                                label="Phone"
                                value={selectedLead.phone}
                                onChange={(e) => setSelectedLead({ ...selectedLead, phone: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-200">Cancel</button>
                            <button type="submit" className="flex-1 py-4 bg-yellow-400 text-black rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-yellow-100 hover:bg-yellow-500">Save Changes</button>
                        </div>
                    </form>
                )}
            </Modal>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default LeadsManager;
