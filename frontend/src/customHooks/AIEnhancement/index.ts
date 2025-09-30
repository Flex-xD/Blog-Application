import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utility/axiosClient';
import { toast } from 'sonner';
import { BLOG_ENDPOINTS } from '@/constants/constants';
import { QUERY_KEYS } from '@/constants/queryKeys';

interface EnhanceContentPayload {
    title?: string;
    body: string;
    tone?: string;
    customInstructions?: string;
}

interface EnhanceContentResponse {
    statusCode: number;
    msg: string;
    success: boolean;
    data: {
        title: string;
        body: string;
    } | null;
}

interface EnhanceContentError {
    statusCode: number;
    msg: string;
    success: boolean;
    data: null;
}

const useEnhanceContentMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<
        EnhanceContentResponse,
        EnhanceContentError,
        EnhanceContentPayload,
        { previousContent: EnhanceContentResponse | undefined }
    >({
        mutationFn: async (payload: EnhanceContentPayload) => {
            if (!payload.body || payload.body.trim() === '') {
                throw { statusCode: 400, msg: 'Body is required', success: false, data: null };
            }
            if (payload.body.length > 5000) {
                throw { statusCode: 400, msg: 'Body must be 5000 characters or less', success: false, data: null };
            }
            if (payload.title && payload.title.length > 200) {
                throw { statusCode: 400, msg: 'Title must be 200 characters or less', success: false, data: null };
            }
            if (payload.customInstructions && payload.customInstructions.length > 500) {
                throw { statusCode: 400, msg: 'Custom instructions must be 500 characters or less', success: false, data: null };
            }
            if (payload.tone && payload.customInstructions) {
                throw { statusCode: 400, msg: 'Cannot provide both tone and custom instructions', success: false, data: null };
            }
            if (payload.tone && !['professional', 'casual', 'persuasive', 'educational', 'storytelling', 'inspirational'].includes(payload.tone)) {
                throw { statusCode: 400, msg: 'Invalid tone', success: false, data: null };
            }

            const response = await apiClient.post<EnhanceContentResponse>(
                BLOG_ENDPOINTS.AI_ENHCANCEMENT,
                payload,
                { timeout: 30000 }
            );
            return response.data;
        },

        onMutate: async (payload) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.CONTENT.ENHANCEMENT });
            const previousContent = queryClient.getQueryData<EnhanceContentResponse>(QUERY_KEYS.CONTENT.ENHANCEMENT);
            queryClient.setQueryData(QUERY_KEYS.CONTENT.ENHANCEMENT, {
                statusCode: 200,
                msg: 'Blog content enhanced successfully',
                success: true,
                data: { title: payload.title || 'Optimistic Title', body: payload.body },
            });
            return { previousContent };
        },

        onSuccess: (data) => {
            if (data.success && data.data) {
                queryClient.setQueryData(QUERY_KEYS.CONTENT.ENHANCEMENT, data);
                toast.success('Content enhanced successfully!');
            } else {
                toast.error(data.msg || 'Failed to enhance content');
            }
        },

        onError: (error, _payload, context) => {
            console.error('Content enhancement error:', {
                message: error.msg,
                status: error.statusCode,
            });
            if (context?.previousContent !== undefined) {
                queryClient.setQueryData(QUERY_KEYS.CONTENT.ENHANCEMENT, context.previousContent);
            }
            toast.error(error.msg || 'Failed to enhance content');
        },

        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTENT.ENHANCEMENT });
        },
    });
};

export default useEnhanceContentMutation;