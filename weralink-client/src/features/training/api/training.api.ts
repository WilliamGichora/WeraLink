import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface TrainingModule {
    id: string;
    title: string;
    skillId: string;
    videoUrl: string | null;
    docUrl: string | null;
    passScore: number;
    skill: { name: string; category: string };
    status: 'PASSED' | 'FAILED' | 'NOT_STARTED';
    bestScore: number | null;
    skillLevel: number;
    isVerified: boolean;
    isRecommended: boolean;
}

interface QuestionOption {
    id: string;
    text: string;
    questionId: string;
    isCorrect?: boolean; // Only present in demo cheat sheet
}

interface Question {
    id: string;
    moduleId: string;
    text: string;
    options: QuestionOption[];
}

interface ModuleDetails extends TrainingModule {
    questions: Question[];
    cheatSheet?: { questionId: string, correctOptionId: string }[] | null;
    isDemoMode: boolean;
}

export const trainingHooks = {
    useGetModules: () => {
        return useQuery({
            queryKey: ['training', 'modules'],
            queryFn: async () => {
                const { data } = await api.get('/training/modules');
                return data.data as TrainingModule[];
            }
        });
    },

    useGetModule: (id: string) => {
        return useQuery({
            queryKey: ['training', 'module', id],
            queryFn: async () => {
                const { data } = await api.get(`/training/modules/${id}`);
                return data.data as ModuleDetails;
            },
            enabled: !!id
        });
    },

    useSubmitQuiz: (id: string) => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: async (answers: { questionId: string, optionId: string }[]) => {
                const { data } = await api.post(`/training/modules/${id}/submit`, { answers });
                return data.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['training', 'modules'] });
                queryClient.invalidateQueries({ queryKey: ['profile'] }); 
            }
        });
    }
};
