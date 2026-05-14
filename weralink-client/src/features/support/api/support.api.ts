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

export const useCreateTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ category, subject, message }: {
      category: string; subject: string; message: string;
    }) => {
      const { data } = await api.post('/support/tickets', { category, subject, message });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myTickets'] });
    },
    onError: (err) => { throw new Error(extractErrorMessage(err)); },
  });
};

export const useGetMyTickets = () => {
  return useQuery({
    queryKey: ['myTickets'],
    queryFn: async () => {
      const { data } = await api.get('/support/tickets/mine');
      return data.data?.tickets || [];
    },
  });
};

export const useGetTicketById = (ticketId: string | null) => {
  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      if (!ticketId) return null;
      const { data } = await api.get(`/support/tickets/${ticketId}`);
      return data.data;
    },
    enabled: !!ticketId,
  });
};
