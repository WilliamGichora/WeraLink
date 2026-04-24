import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CreateGigInput, GigCategory } from '../schemas/gig.schema';

export interface Skill {
  id: string;
  name: string;
  category: GigCategory;
}

export const gigHooks = {
  useGetSkills: (category?: GigCategory) => {
    return useQuery({
      queryKey: ['skills', category],
      queryFn: async () => {
        const params = category ? { category } : {};
        const { data } = await api.get<{ data: { skills: Skill[] } }>('/skills', { params });
        return data.data.skills;
      },
    });
  },

  useCreateGig: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (payload: CreateGigInput) => {
        const payloadData: any = { ...payload };
        
        // Transform skillIds string[] back to { skillId: string }[] for backend
        if (payloadData.skillIds) {
            payloadData.skills = payloadData.skillIds.map((id: string) => ({ skillId: id }));
            delete payloadData.skillIds;
        }

        try {
          const { data } = await api.post<{ success: boolean; data: any }>('/gigs', payloadData);
          return data.data;
        } catch (error: any) {
          console.error("GIG CREATE API ERROR RESPONSE:", error.response?.data);
          throw error;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gigs'] });
      },
    });
  },
  
  useGetMyGigs: (filters: any = {}) => {
    return useQuery({
      queryKey: ['gigs', 'mine', filters],
      queryFn: async () => {
        const { data } = await api.get<{ success: boolean; data: { gigs: any[] } }>('/gigs/mine', { params: filters });
        return data.data.gigs;
      },
    });
  },

  useGetMarketplaceGigs: (filters: any) => {
    return useInfiniteQuery({
      queryKey: ['gigs', 'marketplace', filters],
      queryFn: async ({ pageParam = 1 }) => {
        const { data } = await api.get<{ success: boolean; data: { gigs: any[] }, meta: { totalPages: number, page: number } }>('/gigs', { 
            params: { ...filters, page: pageParam, limit: 10 } 
        });
        return {
            gigs: data.data.gigs,
            meta: data.meta,
        };
      },
      getNextPageParam: (lastPage) => {
        if (lastPage.meta.page < lastPage.meta.totalPages) {
            return lastPage.meta.page + 1;
        }
        return undefined;
      },
      initialPageParam: 1,
    });
  },

  useGetGigById: (id: string | undefined) => {
    return useQuery({
      queryKey: ['gigs', id],
      queryFn: async () => {
        if (!id) return null;
        const { data } = await api.get<{ success: boolean; data: { gig: any } }>(`/gigs/${id}`);
        return data.data.gig;
      },
      enabled: !!id,
    });
  },

  useUpdateGig: (id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (payload: Partial<CreateGigInput>) => {
        const { data } = await api.put<{ success: boolean; data: { gig: any } }>(`/gigs/${id}`, payload);
        return data.data.gig;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gigs'] });
      },
    });
  },

  useDeleteGig: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (id: string) => {
        const { data } = await api.delete<{ success: boolean; data: any }>(`/gigs/${id}`);
        return data.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gigs'] });
      },
    });
  },

  // ─── Matching Algorithm Hooks ────────────────────────────────────────────

  /** Worker: Get recommended gigs based on the matching algorithm */
  useGetRecommendedGigs: (limit: number = 20) => {
    return useQuery({
      queryKey: ['matches', 'recommended-gigs', limit],
      queryFn: async () => {
        const { data } = await api.get<{ success: boolean; data: any }>('/matches/gigs', {
          params: { limit },
        });
        return data.data;
      },
    });
  },

  /** Employer: Get recommended workers for a specific gig */
  useGetMatchesForGig: (gigId: string | undefined, limit: number = 20) => {
    return useQuery({
      queryKey: ['matches', 'workers-for-gig', gigId, limit],
      queryFn: async () => {
        if (!gigId) return null;
        const { data } = await api.get<{ success: boolean; data: any }>(`/gigs/${gigId}/matches`, {
          params: { limit },
        });
        return data.data;
      },
      enabled: !!gigId,
    });
  },
};
