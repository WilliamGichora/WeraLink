import api from '@/lib/api';
import type { ProfileData } from '../types';

export const getMyProfile = async (): Promise<ProfileData> => {
    const { data } = await api.get('/profiles/me');
    return data.data.profile;
};

type UpdateProfilePayload = Partial<Omit<ProfileData, 'user' | 'verified'>> & {
    name?: string;
    phone?: string;
};

export const updateMyProfile = async (updates: UpdateProfilePayload): Promise<ProfileData> => {
    const { data } = await api.patch('/profiles/me', updates);
    return data.data.profile;
};

export const addProfileSkill = async (skills: {skillId: string, level: number}[]) => {
    const { data } = await api.post('/profiles/me/skills', { skills });
    return data.data;
};

export const removeProfileSkill = async (skillId: string) => {
    const { data } = await api.delete(`/profiles/me/skills/${skillId}`);
    return data.data;
};
