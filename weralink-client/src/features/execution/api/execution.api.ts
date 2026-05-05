import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import axios from 'axios';

/**
 * Extracts a human-readable error message from the backend response
 */
export const extractErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0].message;
    }
    return data?.message || error.message || 'An unexpected error occurred';
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred';
};

/**
 * Mutation for a worker to apply to a gig
 */
export const useApplyForGig = () => {
  return useMutation({
    mutationFn: async (gigId: string) => {
      try {
        const response = await api.post(`/gigs/${gigId}/apply`);
        return response.data.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    }
  });
};

/**
 * Query to get assignments for the current worker
 */
export const useGetWorkerAssignments = (statuses?: string[]) => {
  return useQuery({
    queryKey: ['workerAssignments', statuses],
    queryFn: async () => {
      try {
        const params = statuses && statuses.length > 0 ? { statuses: statuses.join(',') } : {};
        const response = await api.get('/assignments/worker', { params });
        return response.data.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    }
  });
};

/**
 * Query to get a single assignment by its ID
 */
export const useGetAssignmentById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['assignment', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const response = await api.get(`/assignments/${id}`);
        return response.data.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    },
    enabled: !!id
  });
};

/**
 * Mutation to fetch a presigned URL
 */
export const useGetPresignedUrl = () => {
  return useMutation({
    mutationFn: async ({ assignmentId, fileName }: { assignmentId: string, fileName: string }) => {
      try {
        const response = await api.post('/evidence/presigned-url', { assignmentId, fileName });
        return response.data; // { signedUploadUrl, path, token }
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    }
  });
};

/**
 * Uploads a file directly to Supabase using a presigned URL
 */
export const uploadFileToPresignedUrl = async (file: File, presignedUrl: string) => {
  try {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      }
    });
  } catch (error) {
    throw new Error('Failed to upload file to storage. Please try again.');
  }
};

/**
 * Mutation to finalize evidence submission
 */
export const useSubmitWork = () => {
  return useMutation({
    mutationFn: async ({ assignmentId, completionNotes, evidenceData }: { assignmentId: string, completionNotes: string, evidenceData: any[] }) => {
      try {
        const response = await api.post(`/assignments/${assignmentId}/submit`, { completionNotes, evidenceData });
        return response.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    }
  });
};

/**
 * Mutation for Employer to review the work
 */
export const useReviewWork = () => {
  return useMutation({
    mutationFn: async ({ assignmentId, action, reason }: { assignmentId: string, action: 'APPROVE' | 'REVISE' | 'DISPUTE', reason?: string }) => {
      try {
        const response = await api.post(`/assignments/${assignmentId}/review`, { action, reason });
        return response.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    }
  });
};

/**
 * Query to get all applicants for a specific gig (Employer view)
 */
export const useGetGigApplicants = (gigId: string | undefined) => {
  return useQuery({
    queryKey: ['gigApplicants', gigId],
    queryFn: async () => {
      if (!gigId) return null;
      try {
        const response = await api.get(`/gigs/${gigId}/applicants`);
        return response.data.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    },
    enabled: !!gigId
  });
};

/**
 * Query to get all pending applications for an employer (Global view)
 */
export const useGetEmployerApplicants = () => {
  return useQuery({
    queryKey: ['employerApplicants'],
    queryFn: async () => {
      try {
        const response = await api.get('/assignments/employer');
        return response.data.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    }
  });
};

/**
 * Query to get all pending reviews for an employer
 */
export const useGetEmployerPendingReviews = () => {
  return useQuery({
    queryKey: ['employerReviews'],
    queryFn: async () => {
      try {
        const response = await api.get('/assignments/employer/reviews');
        return response.data.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    }
  });
};

/**
 * Mutation for Employer to initiate Escrow (Accept Application)
 * This will eventually trigger the M-Pesa STK push.
 */
export const useInitiateEscrow = () => {
  return useMutation({
    mutationFn: async ({ assignmentId, phoneNumber }: { assignmentId: string, phoneNumber: string }) => {
      try {
        const response = await api.post(`/mpesa/stk-push`, { assignmentId, phoneNumber, type: 'DEPOSIT_TO_ESCROW' });
        return response.data.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    }
  });
};

/**
 * Mutation to get a temporary download URL for evidence
 */
export const useGetDownloadUrl = () => {
  return useMutation({
    mutationFn: async ({ assignmentId, filePath }: { assignmentId: string, filePath: string }) => {
      try {
        const response = await api.post('/evidence/download-url', { assignmentId, filePath });
        return response.data.data.downloadUrl;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    }
  });
};

/**
 * Query to poll for the status of an M-Pesa transaction
 */
export const useGetTransactionStatus = (checkoutRequestId: string | null) => {
  return useQuery({
    queryKey: ['mpesaStatus', checkoutRequestId],
    queryFn: async () => {
      try {
        const response = await api.get(`/mpesa/status/${checkoutRequestId}`);
        return response.data.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    },
    enabled: !!checkoutRequestId,
    refetchInterval: (query) => {
      // Poll every 3 seconds while status is PENDING
      if (query.state.data?.status === 'PENDING') return 3000;
      return false;
    }
  });
};
/**
 * Query to get notifications for the current user
 */
export const useGetNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const response = await api.get('/notifications');
        return response.data.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

/**
 * Mutation to mark a notification as read
 */
export const useMarkNotificationRead = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    }
  });
};

/**
 * Mutation to mark all notifications as read
 */
export const useMarkAllNotificationsRead = () => {
  return useMutation({
    mutationFn: async () => {
      try {
        const response = await api.patch('/notifications/read-all');
        return response.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    }
  });
};

export const useGetTransactionByAssignment = (assignmentId: string | undefined) => {
  return useQuery({
    queryKey: ['transaction', assignmentId],
    queryFn: async () => {
      if (!assignmentId) return null;
      const { data } = await api.get(`/transactions/assignment/${assignmentId}`);
      return data.data;
    },
    enabled: !!assignmentId,
  });
};
