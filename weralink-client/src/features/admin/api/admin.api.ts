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

// ─── Platform Stats ────────────────────────────────────────

export const useAdminPlatformStats = () => {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data.data;
    },
    refetchInterval: 60000,
  });
};

// ─── User Management ───────────────────────────────────────

export const useAdminListUsers = (params: {
  page?: number; limit?: number; search?: string; role?: string; status?: string;
  sortBy?: string; order?: string; startDate?: string; endDate?: string;
} = {}) => {
  return useQuery({
    queryKey: ['adminUsers', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', { params });
      return data.data;
    },
  });
};

export const useAdminUserDetail = (userId: string | null) => {
  return useQuery({
    queryKey: ['adminUserDetail', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await api.get(`/admin/users/${userId}`);
      return data.data;
    },
    enabled: !!userId,
  });
};

export const useAdminSuspendUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const { data } = await api.post(`/admin/users/${userId}/suspend`, { reason });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminUsers'] });
      qc.invalidateQueries({ queryKey: ['adminUserDetail'] });
    },
    onError: (err) => { throw new Error(extractErrorMessage(err)); },
  });
};

export const useAdminUnsuspendUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.post(`/admin/users/${userId}/unsuspend`);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminUsers'] });
      qc.invalidateQueries({ queryKey: ['adminUserDetail'] });
    },
    onError: (err) => { throw new Error(extractErrorMessage(err)); },
  });
};

export const useAdminEditUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Record<string, any> }) => {
      const { data } = await api.patch(`/admin/users/${userId}`, updates);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminUsers'] });
      qc.invalidateQueries({ queryKey: ['adminUserDetail'] });
    },
    onError: (err) => { throw new Error(extractErrorMessage(err)); },
  });
};

// ─── Dispute Management (Admin) ────────────────────────────

export const useAdminListDisputes = (params: {
  page?: number; limit?: number; status?: string; search?: string;
} = {}) => {
  return useQuery({
    queryKey: ['adminDisputes', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/disputes', { params });
      return data.data;
    },
  });
};

export const useAdminDisputeDetail = (disputeId: string | null) => {
  return useQuery({
    queryKey: ['adminDisputeDetail', disputeId],
    queryFn: async () => {
      if (!disputeId) return null;
      const { data } = await api.get(`/admin/disputes/${disputeId}`);
      return data.data;
    },
    enabled: !!disputeId,
  });
};

export const useAdminResolveDispute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ disputeId, resolution, resolvedFor, adminNotes }: {
      disputeId: string; resolution: string; resolvedFor: 'WORKER' | 'EMPLOYER'; adminNotes?: string;
    }) => {
      const { data } = await api.post(`/admin/disputes/${disputeId}/resolve`, { resolution, resolvedFor, adminNotes });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminDisputes'] });
      qc.invalidateQueries({ queryKey: ['adminDisputeDetail'] });
      qc.invalidateQueries({ queryKey: ['adminStats'] });
    },
    onError: (err) => { throw new Error(extractErrorMessage(err)); },
  });
};

// ─── Support Ticket Management (Admin) ─────────────────────

export const useAdminListTickets = (params: {
  page?: number; limit?: number; status?: string; category?: string; search?: string;
} = {}) => {
  return useQuery({
    queryKey: ['adminTickets', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/support-tickets', { params });
      return data.data;
    },
  });
};

export const useAdminUpdateTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, status, adminNotes }: { ticketId: string; status: string; adminNotes?: string }) => {
      const { data } = await api.patch(`/admin/support-tickets/${ticketId}`, { status, adminNotes });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminTickets'] });
      qc.invalidateQueries({ queryKey: ['adminStats'] });
    },
    onError: (err) => { throw new Error(extractErrorMessage(err)); },
  });
};

// ─── Gig Management (Admin) ────────────────────────────────

export const useAdminListGigs = (params: {
  page?: number; limit?: number; search?: string; status?: string; difficulty?: string;
  category?: string; employerId?: string; workerId?: string; startDate?: string; endDate?: string;
  sortBy?: string; order?: string;
} = {}) => {
  return useQuery({
    queryKey: ['adminGigs', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/gigs', { params });
      return data.data;
    },
  });
};

export const useAdminGigDetail = (gigId: string | null) => {
  return useQuery({
    queryKey: ['adminGigDetail', gigId],
    queryFn: async () => {
      if (!gigId) return null;
      const { data } = await api.get(`/admin/gigs/${gigId}`);
      return data.data;
    },
    enabled: !!gigId,
  });
};

// ─── LMS & Learning Hub Management (Admin) ─────────────────

export interface LmsSkill {
  id: string;
  name: string;
  category: string;
}

export interface LmsOption {
  id?: string;
  text: string;
  isCorrect: boolean;
}

export interface LmsQuestion {
  id?: string;
  text: string;
  options: LmsOption[];
}

export interface LmsCompletion {
  id: string;
  score: number;
  passed: boolean;
  completedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LmsModule {
  id: string;
  title: string;
  skillId: string;
  videoUrl?: string | null;
  docUrl?: string | null;
  passScore: number;
  isActive: boolean;
  createdAt: string;
  skill: LmsSkill;
  questions?: LmsQuestion[];
  completions?: LmsCompletion[];
  stats: {
    totalCompletions: number;
    passedCompletions: number;
    avgScore: number;
    passRate: number;
  };
  _count?: {
    questions: number;
  };
}

export const useAdminListLmsModules = (params: {
  page?: number; limit?: number; search?: string; category?: string;
  skillId?: string; isActive?: string | boolean; startDate?: string; endDate?: string;
  sortBy?: string; order?: string;
} = {}) => {
  return useQuery({
    queryKey: ['adminLmsModules', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/lms/modules', { params });
      return data.data as {
        modules: LmsModule[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      };
    },
  });
};

export const useAdminLmsModuleDetail = (moduleId: string | null) => {
  return useQuery({
    queryKey: ['adminLmsModuleDetail', moduleId],
    queryFn: async () => {
      if (!moduleId) return null;
      const { data } = await api.get(`/admin/lms/modules/${moduleId}`);
      return data.data as LmsModule;
    },
    enabled: !!moduleId,
  });
};

export const useAdminCreateLmsModule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      skillId: string;
      videoUrl?: string;
      docUrl?: string;
      passScore?: number;
      isActive?: boolean;
      questions?: { text: string; options: { text: string; isCorrect: boolean }[] }[];
    }) => {
      const { data } = await api.post('/admin/lms/modules', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminLmsModules'] });
    },
    onError: (err) => { throw new Error(extractErrorMessage(err)); },
  });
};

export const useAdminUpdateLmsModule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ moduleId, payload }: {
      moduleId: string;
      payload: {
        title?: string;
        skillId?: string;
        videoUrl?: string;
        docUrl?: string;
        passScore?: number;
        isActive?: boolean;
        questions?: { text: string; options: { text: string; isCorrect: boolean }[] }[];
      };
    }) => {
      const { data } = await api.patch(`/admin/lms/modules/${moduleId}`, payload);
      return data.data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['adminLmsModules'] });
      qc.invalidateQueries({ queryKey: ['adminLmsModuleDetail', variables.moduleId] });
    },
    onError: (err) => { throw new Error(extractErrorMessage(err)); },
  });
};

export const useAdminDeleteLmsModule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (moduleId: string) => {
      const { data } = await api.delete(`/admin/lms/modules/${moduleId}`);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminLmsModules'] });
    },
    onError: (err) => { throw new Error(extractErrorMessage(err)); },
  });
};

export const useAdminListSkills = () => {
  return useQuery({
    queryKey: ['adminSkillsList'],
    queryFn: async () => {
      const { data } = await api.get('/admin/lms/skills');
      return data.data as LmsSkill[];
    },
  });
};

