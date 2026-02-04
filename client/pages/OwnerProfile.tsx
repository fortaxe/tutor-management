import React, { useState } from 'react';
import moment from 'moment';
import { INDIAN_STATES } from '../data';
import { Gym, User } from '../types';
import Input from '../components/Input';
import UploadInput from '../components/UploadInput';
import Button from '../components/Button';
import ShieldIcon from '../components/icons/ShieldIcon';
import CrownIcon from '../components/icons/CrownIcon';

const ProfileCard: React.FC<{
    icon: React.ReactNode;
    title?: React.ReactNode;
    subtitle?: string;
    fields: { label: string; value: string; valueColor?: string }[];
}> = ({ icon, title, subtitle, fields }) => (
    <div className="bg-white rounded-[10px] p-[15px] border border-main relative h-full w-full min-w-[200px] shrink-0 md:min-w-0">
        <div className="absolute top-[15px] right-[15px] size-[43px] rounded-full border-main rounded-main flex items-center justify-center">
            {icon}
        </div>

        <div className="mb-5">
            {title && <h3 className="dashboard-16-grotesk text-black">{title}</h3>}
            {subtitle && <p className="dashboard-16-grotesk secondary-color pt-[10px]">{subtitle}</p>}
        </div>

        <div className="flex justify-between items-end mt-auto">
            {fields.map((field, index) => (
                <div key={index} className={index === 1 ? "text-right" : ""}>
                    <h4 className="dashboard-primary-desc secondary-color mb-1">{field.label}</h4>
                    <p className={`dashboard-16-grotesk ${field.valueColor || 'text-black'}`}>{field.value}</p>
                </div>
            ))}
        </div>
    </div>
);

interface OwnerProfileProps {
    gym: Gym;
    user: User;
    onUpdateGym?: (gymData: any) => void;
    onChangePasswordRequest?: () => void;
    isLoading?: boolean;
}

const OwnerProfile: React.FC<OwnerProfileProps> = ({ gym, user, onUpdateGym, onChangePasswordRequest, isLoading }) => {
    const [logoName, setLogoName] = useState('UPLOAD');
    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [gymDetails, setGymDetails] = useState({
        gstNumber: gym.gstNumber || '',
        instagramId: gym.instagramId || '',
        address: gym.address || '',
        state: gym.state || 'Delhi',
        city: gym.city || '',
        pincode: gym.pincode || '',
        logo: null as File | null,
    });

    const handleInputChange = (field: string, value: string) => {
        setGymDetails(prev => ({ ...prev, [field]: value }));
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Mar 01 2026';
        return moment(dateString).format('MMM DD YYYY');
    };

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0">
            {/* Info Cards Row */}
            <div className="flex md:grid  md:grid-cols-3 gap-[10px] md:gap-[15px] overflow-x-auto no-scrollbar">
                {/* Owner Info Card */}
                <ProfileCard
                    icon={<ShieldIcon className="w-5 h-5" />}
                    title={user.name || ''}
                    subtitle={user.phone}
                    fields={[
                        { label: 'STATE', value: gym.state || '' },
                        { label: 'PIN', value: gym.pincode || '' }
                    ]}
                />

                {/* Subscription Info Card */}
                <ProfileCard
                    icon={<CrownIcon className="w-5 h-5 text-slate-700" />}
                    title={
                        <div>
                            <h4 className="dashboard-primary-desc secondary-color mb-[10px]">SUBSCRIPTION START</h4>
                            <p className="dashboard-16-grotesk text-[#22C55E]">{formatDate(gym.subscriptionStartDate)}</p>
                        </div>
                    }
                    fields={[
                        { label: 'SUBSCRIPTION ENDS', value: formatDate(gym.subscriptionEndDate), valueColor: 'text-[#EF4444]' }
                    ]}
                />
            </div>

            {/* Gym Details Form */}
            <div className="bg-white rounded-[10px] p-5 border border-[#E2E8F0] shadow-sm">
                <h3 className="dashboard-16-grotesk text-black mb-[15px]">GYM DETAILS</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px] mb-5">
                    {/* Logo Upload Placeholder */}
                    <UploadInput
                        label="LOGO"
                        placeholder={logoName.length > 20 ? logoName.substring(0, 20) + '...' : logoName}
                        onFileSelect={(file) => {
                            setLogoName(file.name);
                            setGymDetails(prev => ({ ...prev, logo: file }));
                        }}
                    />

                    {/* GST */}
                    <Input
                        label="GST (OPTIONAL)"
                        placeholder="GST Number"
                        value={gymDetails.gstNumber}
                        maxLength={15}
                        onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                    />

                    {/* Instagram */}
                    <Input
                        label="INSTAGRAM ID"
                        placeholder="Gym Instagram ID"
                        value={gymDetails.instagramId}
                        onChange={(e) => handleInputChange('instagramId', e.target.value)}
                    />
                </div>

                <h3 className="dashboard-16-grotesk text-black mb-[15px]">ADDRESS DETAILS</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
                    <Input
                        label="ADDRESS"
                        placeholder="Enter full address"
                        value={gymDetails.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                    />

                    <Input
                        label="CITY"
                        placeholder="City"
                        value={gymDetails.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-center pb-10">
                <Button
                    onClick={() => onUpdateGym?.(gymDetails)}
                    className="w-full md:w-auto px-5"
                    isLoading={isLoading}
                >
                    SAVE
                </Button>
            </div>
        </div>
    );
};

export default OwnerProfile;



// <div className="relative">
//     <Input
//         label="STATE"
//         placeholder="Search or Select State"
//         value={gymDetails.state}
//         onChange={(e) => handleInputChange('state', e.target.value)}
//         onFocus={() => setShowStateDropdown(true)}
//         autoComplete="off"
//     />
//     {showStateDropdown && (
//         <>
//             <div className="absolute z-50 w-full mt-1 bg-white border border-[#E2E8F0] rounded-main shadow-lg max-h-[200px] overflow-y-auto no-scrollbar">
//                 {INDIAN_STATES.filter(s => s.toLowerCase().includes(gymDetails.state.toLowerCase())).length > 0 ? (
//                     INDIAN_STATES.filter(s => s.toLowerCase().includes(gymDetails.state.toLowerCase())).map(state => (
//                         <div
//                             key={state}
//                             className="px-4 py-2 hover:bg-[#F8FAFC] cursor-pointer text-black text-sm font-medium"
//                             onClick={() => {
//                                 handleInputChange('state', state);
//                                 setShowStateDropdown(false);
//                             }}
//                         >
//                             {state}
//                         </div>
//                     ))
//                 ) : (
//                     <div className="px-4 py-2 text-[#9CA3AF] text-sm">No states found</div>
//                 )}
//             </div>
//             <div className="fixed inset-0 z-40" onClick={() => setShowStateDropdown(false)} />
//         </>
//     )}
// </div>