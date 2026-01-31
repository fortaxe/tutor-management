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
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        error={errors.password}
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
