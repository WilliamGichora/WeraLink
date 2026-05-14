import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import axios from 'axios';

const extractErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0].message;
    }
    return data?.message || error.message || 'An unexpected error occurred';
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred';
};

export const useRaiseDispute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ assignmentId, reason, evidenceUrls }: {
      assignmentId: string; reason: string; evidenceUrls?: { url: string; label: string }[];
    }) => {
      const { data } = await api.post('/disputes', { assignmentId, reason, evidenceUrls });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workerAssignments'] });
      qc.invalidateQueries({ queryKey: ['employerReviews'] });
      qc.invalidateQueries({ queryKey: ['myDisputes'] });
    },
    onError: (err) => { throw new Error(extractErrorMessage(err)); },
  });
};

export const useGetMyDisputes = (params: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: ['myDisputes', params],
    queryFn: async () => {
      const { data } = await api.get('/disputes/mine', { params });
      return data.data;
    },
  });
};

export const useGetDispute = (disputeId: string | null) => {
  return useQuery({
    queryKey: ['dispute', disputeId],
    queryFn: async () => {
      if (!disputeId) return null;
      const { data } = await api.get(`/disputes/${disputeId}`);
      return data.data;
    },
    enabled: !!disputeId,
  });
};

export const useAddDisputeEvidence = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ disputeId, evidenceUrls }: {
      disputeId: string; evidenceUrls: { url: string; label: string }[];
    }) => {
      const { data } = await api.post(`/disputes/${disputeId}/evidence`, { evidenceUrls });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myDisputes'] });
      qc.invalidateQueries({ queryKey: ['dispute'] });
    },
    onError: (err) => { throw new Error(extractErrorMessage(err)); },
  });
};
