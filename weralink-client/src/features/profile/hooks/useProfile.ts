import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyProfile, updateMyProfile, addProfileSkill, removeProfileSkill } from '../api/profile.api';
import type { ProfileData } from '../types';

export const useProfile = () => {
    return useQuery<ProfileData>({
        queryKey: ['my-profile'],
        queryFn: getMyProfile,
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateMyProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-profile'] });
        },
    });
};

export const useAddSkill = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ skillId, level }: { skillId: string; level: number }) => addProfileSkill(skillId, level),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-profile'] });
        },
    });
};

export const useRemoveSkill = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: removeProfileSkill,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-profile'] });
        },
    });
};
