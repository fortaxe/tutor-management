import React from 'react';
import Input from './Input';
import Button from './Button';

interface LoginCardProps {
    phone: string;
    handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    password: string;
    setPassword: (password: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    errors: { phone?: string; password?: string; general?: string };
    isLoading?: boolean;
}

const LoginCard: React.FC<LoginCardProps> = ({
    phone,
    handlePhoneChange,
    password,
    setPassword,
    handleSubmit,
    errors,
    isLoading
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

    return (
        <div className="w-full max-w-[420px] bg-white border-main p-5 md:p-[30px] rounded-main bg-white" >
            <div className="mb-[15px]">
                <h2 className="secondary-heading text-black mb-[10px] font-grotesk !font-bold">Dashboard Login</h2>
                <p className="text-[#9CA3AF] text-[14px] md:text-[16px]  leading-[20px] md:leading-[22px] tracking-[0em] font-semibold">Manage members, payments, and daily operations in one place.</p>
            </div>

            <form onSubmit={handleSubmit} >
                {errors.general && (
                    <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-xs text-red-600 font-medium">{errors.general}</p>
                    </div>
                )}

                <div className="space-y-[6px] md:space-y-[8px]">
                    <Input
                        label="Username"
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="Enter mobile number"
                        error={errors.phone}
                    />

                    <Input
                        label="Password"
                        id="password"
                        type={isPasswordVisible ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        error={errors.password}
                        endContent={
                            <button
                                type="button"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                className="focus:outline-none"
                            >
                                <img src="/icons/eye.svg" alt="Show Password" className="size-[18px]" />
                            </button>
                        }
                    />
                </div>

                <div className="flex items-center  py-[15px] primary-description font-semibold secondary-color">
                    <img src="/icons/lock.svg" alt="Lock" className="w-6 h-6" />
                    <span>Your data is securely encrypted.</span>
                </div>

                <Button
                    type="submit"
                    isLoading={isLoading}
                    block
                >
                    Access Dashboard
                </Button>

            </form>
        </div>
    )
}

export default LoginCard
