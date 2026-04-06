import api from '@/lib/api';
import type { ProfileData } from '../types';

export const getMyProfile = async (): Promise<ProfileData> => {
    const { data } = await api.get('/profiles/me');
    return data.data.profile;
};

export const updateMyProfile = async (updates: Partial<Omit<ProfileData, 'user' | 'verified'>>): Promise<ProfileData> => {
    const { data } = await api.patch('/profiles/me', updates);
    return data.data.profile;
};

export const addProfileSkill = async (skillId: string, level: number = 1) => {
    const { data } = await api.post('/profiles/me/skills', { skillId, level });
    return data.data;
};

export const removeProfileSkill = async (skillId: string) => {
    const { data } = await api.delete(`/profiles/me/skills/${skillId}`);
    return data.data;
};
