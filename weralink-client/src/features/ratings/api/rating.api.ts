import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { extractErrorMessage } from '@/features/execution/api/execution.api';

// ─── Mutations ──────────────────────────────────────────────

/**
 * Submit a rating for a completed (PAID) assignment.
 * Invalidates related queries on success.
 */
export const useSubmitRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      assignmentId: string;
      score: number;
      dimensions?: { quality?: number; communication?: number; timeliness?: number };
      comment?: string;
    }) => {
      try {
        const response = await api.post('/ratings', data);
        return response.data.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    },
    onSuccess: (_data, variables) => {
      // Invalidate related queries to reflect new rating
      queryClient.invalidateQueries({ queryKey: ['ratingCheck', variables.assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['assignmentRatings', variables.assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['workerAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['ratingSummary'] });
      queryClient.invalidateQueries({ queryKey: ['userRatings'] });
    },
  });
};

// ─── Queries ────────────────────────────────────────────────

/**
 * Get paginated ratings received by a user.
 */
export const useGetUserRatings = (userId: string | undefined, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['userRatings', userId, page, limit],
    queryFn: async () => {
      if (!userId) return null;
      try {
        const response = await api.get(`/ratings/user/${userId}`, {
          params: { page, limit },
        });
        return response.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    },
    enabled: !!userId,
  });
};

/**
 * Get aggregate rating summary (avg, distribution, dimensions).
 */
export const useGetRatingSummary = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['ratingSummary', userId],
    queryFn: async () => {
      if (!userId) return null;
      try {
        const response = await api.get(`/ratings/user/${userId}/summary`);
        return response.data.data?.summary;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes — ratings don't change frequently
  });
};

/**
 * Check if the current user has already rated a specific assignment.
 */
export const useCheckRating = (assignmentId: string | undefined) => {
  return useQuery({
    queryKey: ['ratingCheck', assignmentId],
    queryFn: async () => {
      if (!assignmentId) return null;
      try {
        const response = await api.get(`/ratings/check/${assignmentId}`);
        return response.data.data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    },
    enabled: !!assignmentId,
    staleTime: 60 * 1000, // 1 minute cache
  });
};

/**
 * Get all ratings for a specific assignment (both directions).
 */
export const useGetAssignmentRatings = (assignmentId: string | undefined) => {
  return useQuery({
    queryKey: ['assignmentRatings', assignmentId],
    queryFn: async () => {
      if (!assignmentId) return null;
      try {
        const response = await api.get(`/ratings/assignment/${assignmentId}`);
        return response.data.data?.ratings;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    },
    enabled: !!assignmentId,
  });
};
