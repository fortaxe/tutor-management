import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ArrowBackIcon from './icons/ArrowBackIcon';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    width?: string;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children, width = 'max-w-[459px]' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[7.5px]"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`fixed inset-y-0 right-0 z-[101] w-full ${width} bg-white shadow-2xl flex flex-col h-full pt-[30px] px-[30px] pb-[20px]`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between bg-white">
                            <h3 className="text-[24px] leading-[28px] font-grotesk text-black uppercase font-bold">
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="group rounded-full p-1 text-gray-400 hover:text-black transition-colors"
                            >
                                <ArrowBackIcon className="size-[26px]" />
                            </button>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto pt-5 bg-white">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Drawer;
