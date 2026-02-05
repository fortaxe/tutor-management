import React, { useState } from 'react';
import Drawer from './Drawer';
import Input from './Input';
import Button from './Button';
import { SubmitArrowIcon } from './icons/FormIcons';

interface ChangePasswordDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (password: string) => void;
    isLoading: boolean;
}

const ChangePasswordDrawer: React.FC<ChangePasswordDrawerProps> = ({ isOpen, onClose, onUpdate, isLoading }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passError, setPassError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPassError('Passwords do not match');
            return;
        }
        setPassError('');
        onUpdate(newPassword);
        handleClose();
    };

    const handleClose = () => {
        setNewPassword('');
        setConfirmPassword('');
        setPassError('');
        onClose();
    };

    return (
        <Drawer isOpen={isOpen} onClose={handleClose} title="Security Settings">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1 space-y-[15px]">
                    <Input
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (passError) setPassError('');
                        }}
                        required
                        minLength={6}
                        placeholder="Min 6 characters"
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (passError) setPassError('');
                        }}
                        required
                        minLength={6}
                        placeholder="Re-enter password"
                        error={passError}
                    />
                </div>
                <div className="flex gap-[10px] pt-10 pb-[30px] bg-white">
                    <Button
                        type="button"
                        variant="secondary"
                        className="flex-1 h-[46px] text-14-grotesk tracking-[1px] font-bold"
                        onClick={handleClose}
                    >
                        CANCEL
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1 h-[46px] text-14-grotesk text-white tracking-[1px] font-bold"
                        isLoading={isLoading}
                    >
                        UPDATE
                        <SubmitArrowIcon className="ml-[5px]" stroke="white" />
                    </Button>
                </div>
            </form>
        </Drawer>
    );
};

export default ChangePasswordDrawer;
