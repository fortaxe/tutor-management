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
                <h2 className="secondary-heading text-black mb-[10px] font-grotesk !font-bold uppercase">Dashboard Login</h2>
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
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.16354 9.23979C1.11215 9.08533 1.11215 8.91839 1.16354 8.76393C2.19643 5.65633 5.12828 3.41481 8.58365 3.41481C12.0375 3.41481 14.9679 5.6541 16.003 8.76021C16.0551 8.91436 16.0551 9.08117 16.003 9.23607C14.9709 12.3437 12.039 14.5852 8.58365 14.5852C5.12977 14.5852 2.19867 12.3459 1.16354 9.23979Z" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M10.8178 9C10.8178 9.59251 10.5824 10.1608 10.1635 10.5797C9.7445 10.9987 9.17626 11.2341 8.58374 11.2341C7.99123 11.2341 7.42299 10.9987 7.00402 10.5797C6.58505 10.1608 6.34967 9.59251 6.34967 9C6.34967 8.40749 6.58505 7.83924 7.00402 7.42027C7.42299 7.0013 7.99123 6.76593 8.58374 6.76593C9.17626 6.76593 9.7445 7.0013 10.1635 7.42027C10.5824 7.83924 10.8178 8.40749 10.8178 9Z" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>

                            </button>
                        }
                    />
                </div>

                <div className="flex items-center  py-[15px] primary-description font-semibold secondary-color">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.75 14.5C5.75 12.7322 5.75 11.8484 6.29918 11.2992C6.84835 10.75 7.73223 10.75 9.5 10.75H14.5C16.2678 10.75 17.1516 10.75 17.7008 11.2992C18.25 11.8484 18.25 12.7322 18.25 14.5C18.25 16.2678 18.25 17.1516 17.7008 17.7008C17.1516 18.25 16.2678 18.25 14.5 18.25H9.5C7.73223 18.25 6.84835 18.25 6.29918 17.7008C5.75 17.1516 5.75 16.2678 5.75 14.5Z" stroke="#9CA3AF" stroke-width="1.2" />
                        <path d="M8.25 10.75V9.5C8.25 7.42893 9.92893 5.75 12 5.75C14.0711 5.75 15.75 7.42893 15.75 9.5V10.75" stroke="#9CA3AF" stroke-width="1.3" stroke-linecap="round" />
                    </svg>

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
