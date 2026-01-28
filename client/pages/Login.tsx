import React, { useState } from 'react';


import Button from '../components/Button';
import LoginCard from '@/components/login-card';

interface LoginProps {
  onLogin: (creds: { phone: string; password: string }) => void;
  isLoading?: boolean;
  backendError?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, isLoading, backendError }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ phone?: string; password?: string; general?: string }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    if (backendError) {
      setErrors(prev => ({ ...prev, password: backendError }));
    }
  }, [backendError]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (phone.length !== 10) {
      setErrors({ phone: '*Enter a valid 10-digit mobile number' });
      return;
    }

    onLogin({ phone, password });
  };

  return (
    <div className="w-full h-screen bg-white relative flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Hero Banner - Left Side (50%) */}
      <div className="w-full md:w-1/2 h-full bg-black relative flex flex-col justify-between px-4 pb-4 pt-6 md:p-[50px] z-10">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero.jpg" alt="Gym Background" className="w-full h-full object-cover opacity-60" />

        </div>

        {/* Top Header on Left Side */}
        <div className="relative z-20 flex justify-between items-center w-full">
          <div className="flex items-center gap-2">

            <span className="text-white font-semibold text-[24px] leading-[24px] " >Gym <span className="text-brand-500">Stack</span></span>
          </div>
          <Button className='md:hidden' onClick={() => setIsModalOpen(true)}>
            Login
          </Button>

        </div>

        {/* Bottom Content on Left Side */}
        <div className="relative z-20  mb-[109px] md:mb-0">
          <h1 className="primary-heading">
            Professional<br />
            Membership<br />
            <span className="text-brand-500">Management</span>
          </h1>
          <p className="primary-description my-5">
            The ultimate platform for gym owners to track members, manage payments, and streamline operations effortlessly.
          </p>
          <div className='flex justify-between items-end'>
            <Button href="tel:+919676675576">
              Book Demo Today
            </Button>

            <a href="tel:+919676675576" className="primary-description hidden md:block">Need Help?</a>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 z-20 md:hidden">
          <a href="tel:+919676675576" className="primary-description">Need Help?</a>
        </div>
      </div>

      {/* Login Section - Right Side (50%) */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-center p-6 md:p-24 bg-[#F8FAFC] hidden md:flex">
        <LoginCard
          phone={phone}
          handlePhoneChange={handlePhoneChange}
          password={password}
          setPassword={setPassword}
          handleSubmit={handleSubmit}
          errors={errors}
          isLoading={isLoading}
        />
      </div>

      {/* Mobile Modal Overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center  p-4 md:hidden"
          onClick={() => setIsModalOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[420px]">
            <LoginCard
              phone={phone}
              handlePhoneChange={handlePhoneChange}
              password={password}
              setPassword={setPassword}
              handleSubmit={handleSubmit}
              errors={errors}
              isLoading={isLoading}
            />
          </div>
        </div>

      )}
    </div>
  );
};

export default Login;
