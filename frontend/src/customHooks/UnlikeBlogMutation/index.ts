import { SOCIAL_ENDPOINTS } from "@/constants/constants";
import apiClient from "@/utility/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ApiResponse } from "../Follow&Unfollow";
import type { errorResponse } from "@/types";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "sonner";

const useUnLikeMutation = (userId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (targetBlogId: string) => {
            const endpoint = SOCIAL_ENDPOINTS.UNLIKE_BLOG(targetBlogId);
            const response = await apiClient.post<ApiResponse>(endpoint);
            return response.data;
        },
        onMutate: async (targetBlogId: string) => {
            await queryClient.cancelQueries({
                queryKey: QUERY_KEYS.LIKES.PERSONAL_LIKES(userId, targetBlogId)
            });

            const previousLikes = queryClient.getQueryData<string[]>(
                QUERY_KEYS.LIKES.PERSONAL_LIKES(userId, targetBlogId)
            );

            queryClient.setQueryData<string[]>(
                QUERY_KEYS.LIKES.PERSONAL_LIKES(userId, targetBlogId),
                (old = []) => old.filter((id) => id !== userId)
            );

            return { previousLikes, targetBlogId };
        },
        onSuccess: (data) => {
            console.log("Unliked:", data);
        },
        onError: (error: errorResponse, _variables, context) => {
            if (context?.previousLikes) {
                queryClient.setQueryData(
                    QUERY_KEYS.LIKES.PERSONAL_LIKES(userId, context.targetBlogId),
                    context.previousLikes
                );
                toast.error(error.msg);
            }
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.LIKES.PERSONAL_LIKES(userId, variables)
            });
        }
    });
};



export default useUnLikeMutation;