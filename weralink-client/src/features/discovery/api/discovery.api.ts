import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const discoveryHooks = {
    useGetStats: () => {
        return useQuery({
            queryKey: ['landing-stats'],
            queryFn: async () => {
                const response = await api.get('/discovery/stats');
                return response.data.data;
            },
            staleTime: 1000 * 60 * 5, // 5 minutes
        });
    },

    useGetFeatured: () => {
        return useQuery({
            queryKey: ['featured-content'],
            queryFn: async () => {
                const response = await api.get('/discovery/featured');
                return response.data.data;
            }
        });
    },

    useGetPublicProfile: (userId: string | undefined) => {
        return useQuery({
            queryKey: ['public-profile', userId],
            queryFn: async () => {
                if (!userId) return null;
                const response = await api.get(`/discovery/profile/${userId}`);
                return response.data.data.profile;
            },
            enabled: !!userId
        });
    }
};
