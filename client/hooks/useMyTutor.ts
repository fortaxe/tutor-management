import { useQuery } from '@tanstack/react-query';
import client from '../lib/client';
import { User, UserRole } from '../types';

export const useMyTutor = (currentUser: User | null) => {
    return useQuery({
        queryKey: ['myTutor', currentUser?.tutorId],
        queryFn: async () => {
            const res = await client.get(`/tutors/${currentUser?.tutorId}`);
            return res.data;
        },
        enabled: !!currentUser?.tutorId && currentUser?.role !== UserRole.SUPER_ADMIN,
    });
};
