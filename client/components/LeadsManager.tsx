
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
                <h3 className="text-lg font-bold text-gray-900">Leads Management</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Track and manage prospective gym owners</p>
            </div>

            {isLoading ? (
                <div className="p-10 text-center text-gray-500">Loading leads...</div>
            ) : leads.length === 0 ? (
                <div className="p-10 text-center text-gray-400">No leads found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Gym Owner</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Gym Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Phone</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {leads.map((lead: Lead) => (
                                <tr key={lead._id || lead.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">
                                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {lead.gymOwnerName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {lead.gymName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500">
                                        {lead.phone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {getStatusBadge(lead.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => { setSelectedLead(lead); setIsEditModalOpen(true); }}
                                            className="p-1.5 bg-gray-100 text-gray-600 rounded-md border border-gray-200 hover:bg-gray-200"
                                        >
                                            <EditIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => { if (confirm('Delete this lead?')) deleteLeadMutation.mutate(lead._id || lead.id as string); }}
                                            className="p-1.5 bg-red-50 text-red-600 rounded-md border border-red-100 hover:bg-red-100"
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
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {['new', 'contacted', 'converted', 'rejected'].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => handleStatusChange(s as any)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${selectedLead.status === s ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Input
                                label="Owner Name"
                                value={selectedLead.gymOwnerName}
                                onChange={(e) => setSelectedLead({ ...selectedLead, gymOwnerName: e.target.value })}
                            />
                            <Input
                                label="Gym Name"
                                value={selectedLead.gymName}
                                onChange={(e) => setSelectedLead({ ...selectedLead, gymName: e.target.value })}
                            />
                            <Input
                                label="Phone"
                                value={selectedLead.phone}
                                onChange={(e) => setSelectedLead({ ...selectedLead, phone: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200">Cancel</button>
                            <button type="submit" className="flex-1 py-3 bg-charcoal text-white rounded-xl font-bold shadow-lg hover:bg-black">Save Changes</button>
                        </div>
                    </form>
                )}
            </Modal>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default LeadsManager;
