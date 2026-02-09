import { useState, useEffect } from 'react';
import moment from 'moment';
import { Tutor, User } from '../types';
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
    <div className="bg-white rounded-[10px] p-[15px] border border-gray-100 shadow-sm relative h-full w-[280px] md:w-full shrink-0 md:min-w-0">
        <div className="absolute top-[15px] right-[15px] size-[43px] rounded-full border border-gray-100 flex items-center justify-center">
            {icon}
        </div>

        <div className="mb-5">
            {title && <h3 className="font-bold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 pt-[10px]">{subtitle}</p>}
        </div>

        <div className="flex justify-between items-end mt-auto">
            {fields.map((field, index) => (
                <div key={index} className={index === 1 ? "text-right" : ""}>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{field.label}</h4>
                    <p className={`font-bold ${field.valueColor || 'text-slate-900'}`}>{field.value}</p>
                </div>
            ))}
        </div>
    </div>
);

interface OwnerProfileProps {
    tutor: Tutor;
    user: User;
    onUpdateTutor?: (tutorData: any) => void;
    onChangePasswordRequest?: () => void;
    isLoading?: boolean;
}

const OwnerProfile: React.FC<OwnerProfileProps> = ({ tutor, user, onUpdateTutor, onChangePasswordRequest, isLoading }) => {
    const [logoName, setLogoName] = useState('UPLOAD');
    const [tutorDetails, setTutorDetails] = useState({
        gstNumber: tutor.gstNumber || '',
        instagramId: tutor.instagramId || '',
        address: tutor.address || '',
        state: tutor.state || 'Delhi',
        city: tutor.city || '',
        pincode: tutor.pincode || '',
        logo: null as File | null,
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(tutor.logo || null);

    useEffect(() => {
        return () => {
            if (logoPreview && logoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    const handleInputChange = (field: string, value: string) => {
        setTutorDetails(prev => ({ ...prev, [field]: value }));
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Mar 01 2026';
        return moment(dateString).format('MMM DD YYYY');
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0">
            <div className="md:hidden flex justify-between items-center">
                <Button
                    variant="secondary"
                    className='border border-yellow-400 text-black h-[36px] py-0 px-4 text-[12px] font-bold bg-yellow-400 hover:bg-yellow-500'
                    onClick={() => onChangePasswordRequest?.()}
                >
                    Change Password
                </Button>
            </div>

            <div className="flex md:grid md:grid-cols-3 gap-[10px] md:gap-[15px] overflow-x-auto no-scrollbar">
                <ProfileCard
                    icon={<ShieldIcon className="w-5 h-5 text-slate-700" />}
                    title={user.name || ''}
                    subtitle={user.phone}
                    fields={[
                        { label: 'STATE', value: tutor.state || '' },
                        { label: 'PIN', value: tutor.pincode || '' }
                    ]}
                />

                <ProfileCard
                    icon={<CrownIcon className="w-5 h-5 text-slate-700" />}
                    title={
                        <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-[10px]">SUBSCRIPTION START</h4>
                            <p className="font-bold text-green-600">{formatDate(tutor.subscriptionStartDate)}</p>
                        </div>
                    }
                    fields={[
                        { label: 'SUBSCRIPTION ENDS', value: formatDate(tutor.subscriptionEndDate), valueColor: 'text-red-500' }
                    ]}
                />
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-[15px] uppercase tracking-wider text-sm">TUTOR DETAILS</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px] mb-5">
                    <div className="flex flex-col gap-3">
                        {logoPreview && (
                            <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-100 shadow-sm shrink-0 bg-slate-50 flex items-center justify-center">
                                <img src={logoPreview} alt="Tutor Logo" className="max-w-full max-h-full object-contain" />
                            </div>
                        )}
                        <UploadInput
                            label="LOGO (RECOMMENDED 500x500)"
                            placeholder={logoName.length > 20 ? logoName.substring(0, 20) + '...' : logoName}
                            onFileSelect={(file) => {
                                setLogoName(file.name);
                                setTutorDetails(prev => ({ ...prev, logo: file }));
                                const objectUrl = URL.createObjectURL(file);
                                setLogoPreview(objectUrl);
                            }}
                        />
                    </div>

                    <div className="flex flex-col justify-end">
                        <Input
                            label="GST (OPTIONAL)"
                            placeholder="GST Number"
                            value={tutorDetails.gstNumber}
                            maxLength={15}
                            onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col justify-end">
                        <Input
                            label="INSTAGRAM ID (OPTIONAL)"
                            placeholder="Instagram Handle"
                            value={tutorDetails.instagramId}
                            onChange={(e) => handleInputChange('instagramId', e.target.value)}
                        />
                    </div>
                </div>

                <h3 className="font-bold text-slate-900 mb-[15px] uppercase tracking-wider text-sm">ADDRESS DETAILS</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
                    <Input
                        label="ADDRESS (OPTIONAL)"
                        placeholder="Full Address"
                        value={tutorDetails.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                    />

                    <Input
                        label="CITY (OPTIONAL)"
                        placeholder="City"
                        value={tutorDetails.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-center pb-10">
                <Button
                    onClick={() => onUpdateTutor?.(tutorDetails)}
                    className="w-full md:w-auto px-10 bg-black text-yellow-400 font-bold hover:bg-slate-900"
                    isLoading={isLoading}
                >
                    SAVE PROFILE
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