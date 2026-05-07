import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

/**
 * Analytics API hooks.
 * 
 * Performance:
 * - staleTime: 2 minutes (analytics are dynamic but don't need real-time updates)
 * - refetchOnWindowFocus: false (prevent unnecessary recalculations on tab switch)
 */

export const useWorkerAnalytics = (months = 6) => {
  return useQuery({
    queryKey: ['workerAnalytics', months],
    queryFn: async () => {
      const response = await api.get('/analytics/worker', { params: { months } });
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useEmployerAnalytics = (months = 6) => {
  return useQuery({
    queryKey: ['employerAnalytics', months],
    queryFn: async () => {
      const response = await api.get('/analytics/employer', { params: { months } });
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useAdminAnalytics = (months = 6) => {
  return useQuery({
    queryKey: ['adminAnalytics', months],
    queryFn: async () => {
      const response = await api.get('/analytics/admin', { params: { months } });
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
