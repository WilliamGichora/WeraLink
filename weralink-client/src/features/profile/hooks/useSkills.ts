import { useQuery } from '@tanstack/react-query';
import { getAllSkills } from '../api/skill.api';

export const useSkills = (category?: string) => {
    return useQuery({
        queryKey: ['skills', category],
        queryFn: () => getAllSkills(category),
        staleTime: 1000 * 60 * 60, // 1 hour (rarely changes)
    });
};
