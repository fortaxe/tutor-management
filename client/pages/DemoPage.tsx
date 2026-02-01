
import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import client from '../lib/client';
import Input from '../components/Input';
import Toast from '../components/Toast';
import Button from '../components/Button';

import Modal from '../components/Modal';

const DemoPage: React.FC = () => {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        gymOwnerName: '',
        gymName: '',
        phone: ''
    });
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const submitLeadMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            await client.post('/leads', data);
        },
        onSuccess: () => {
            setIsSubmitted(true);
            setToast({ message: "Thanks! We'll be in touch shortly.", type: 'success' });
            setFormData({ gymOwnerName: '', gymName: '', phone: '' });
        },
        onError: (err: any) => {
            setToast({ message: err.response?.data?.error || 'Failed to submit not allowed same number', type: 'error' });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.gymOwnerName || !formData.gymName || !formData.phone) {
            setToast({ message: 'All fields are required', type: 'error' });
            return;
        }
        submitLeadMutation.mutate(formData);
    };



    return (
        <div className="w-full h-full md:h-screen bg-white relative flex flex-col lg:flex-row overflow-hidden font-sans">
            {/* Left Side - Video Section */}
            {/* Left Side - Video Section */}
            <div className="relative w-full lg:w-1/2 h-full bg-black flex items-center justify-center p-4 md:p-8 lg:p-12">
                {/* Video Container - Trigger Modal */}
                <div
                    className="relative w-full max-w-[600px] bg-[#101010] rounded-3xl overflow-hidden shadow-2xl border border-white/20 group cursor-pointer hover:border-white/30 transition-all"
                    onClick={() => setIsVideoModalOpen(true)}
                >
                    <video
                        loop
                        muted
                        playsInline
                        className="w-full h-auto max-h-[80vh] object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        src="https://pub-690b36db005d4893847aa0c6474898d6.r2.dev/demo.mp4"
                    />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] group-hover:bg-black/10 transition-all">
                        <div className="w-20 h-20 bg-white backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform duration-300">
                            <svg className="size-12 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Brand Overlay Top Left */}
                <div className="absolute top-4 left-4 z-10">

                </div>
            </div>

            {/* Right Side - Form Section (Mimicking Login Style) */}
            <div className="relative w-full lg:w-1/2 h-full flex flex-col justify-center items-center p-4 lg:p-[25px] bg-[#F8FAFC]">
                {/* Top Right Contact */}
                <div className="absolute top-4 lg:top-[25px] right-4 lg:right-[25px]">
                    <a href="tel:+919676675576" className="text-[#0F172A] primary-description underline decoration-[1px] font-semibold">Contact us</a>
                </div>

                <div className="w-full max-w-[420px] bg-white p-[30px] rounded-[30px] shadow-[0px_8px_40px_rgba(0,0,0,0.06)]">
                    <div className="">
                        {/* <h1 className="text-[32px] font-bold text-[#0F172A] mb-[20px] uppercase font-grotesk">Take Control of Your Gym</h1> */}

                    </div>

                    {isSubmitted ? (
                        <div className="text-center py-10 animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Request Received!</h3>
                            <p className="text-slate-500 mb-8">We'll reach you soon.</p>
                            {/* <button
                                onClick={() => setIsSubmitted(false)}
                                className="text-sm font-bold text-brand-600 hover:text-brand-800 underline"
                            >
                                Submit another request
                            </button> */}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
                            <Input
                                label="Owner Name"
                                placeholder="Your Name"
                                value={formData.gymOwnerName}
                                onChange={(e) => setFormData({ ...formData, gymOwnerName: e.target.value })}
                                required
                            />
                            <Input
                                label="Gym Name"
                                placeholder="Gym Name"
                                value={formData.gymName}
                                onChange={(e) => setFormData({ ...formData, gymName: e.target.value })}
                                required
                            />
                            <Input
                                label="Phone Number"
                                placeholder="9876543210"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                inputMode="numeric"
                                required
                                maxLength={10}
                            />

                            <Button
                                type="submit"
                                isLoading={submitLeadMutation.isPending}
                                block
                                className='mt-[10px]'
                            >
                                I'm Interested
                            </Button>
                        </form>
                    )}
                </div>


            </div>

            {/* Video Modal */}
            <Modal
                isOpen={isVideoModalOpen}
                onClose={() => setIsVideoModalOpen(false)}
                title="Demo Video"
                maxWidth="sm:max-w-[70vw]"
            >
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-2xl">
                    <video
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                        src="https://pub-690b36db005d4893847aa0c6474898d6.r2.dev/demo.mp4"
                    />
                </div>
            </Modal>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default DemoPage;
