import { useQuery } from '@tanstack/react-query';
import client from '../lib/client';
import { User, UserRole } from '../types';

export const useMyGym = (currentUser: User | null) => {
    return useQuery({
        queryKey: ['myGym', currentUser?.gymId],
        queryFn: async () => {
            const res = await client.get(`/gyms/${currentUser?.gymId}`);
            return res.data;
        },
        enabled: !!currentUser?.gymId && currentUser?.role !== UserRole.SUPER_ADMIN,
    });
};
