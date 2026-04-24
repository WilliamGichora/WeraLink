import api from '@/lib/api';

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export const getAllSkills = async (category?: string): Promise<Skill[]> => {
  const params = category ? { category } : {};
  const { data } = await api.get('/skills', { params });
  return data.data.skills;
};
