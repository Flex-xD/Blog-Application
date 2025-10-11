import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utility/axiosClient";
import { BLOG_ENDPOINTS } from "@/constants/constants";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { apiReponse, errorResponse } from "@/types";
import { toast } from "sonner";

interface UnsaveBlogResponse {
    blogId: string;
    unsavedAt: string;
}

interface UnsaveBlogContext {
    prevSavedBlogs?: string[];
}

const useUnsaveBlogMutation = (blogId: string, userId: string) => {
    const queryClient = useQueryClient();

    return useMutation<
        apiReponse<UnsaveBlogResponse>,
        errorResponse,
        void,
        UnsaveBlogContext
    >({
        mutationFn: async () => {
            const response = await apiClient.post<apiReponse<UnsaveBlogResponse>>(
                BLOG_ENDPOINTS.UNSAVE_BLOG(blogId),
                { timeout: 30000 }
            );
            return response.data;
        },

        onMutate: async () => {
            await queryClient.cancelQueries({
                queryKey: QUERY_KEYS.BLOGS.SAVED(userId),
            });

            const prevSavedBlogs = queryClient.getQueryData<string[]>(
                QUERY_KEYS.BLOGS.SAVED(userId)
            );

            queryClient.setQueryData<string[]>(
                QUERY_KEYS.BLOGS.SAVED(userId),
                (old) => (old ? old.filter((id) => id !== blogId) : [])
            );

            return { prevSavedBlogs };
        },

        onSuccess: (data) => {
            if (data.success === true) {
                toast.success(data.msg || "Blog unsaved successfully!");
            } else {
                toast.info(data.msg || "Problem while unsaving the blog!");
            }
        },

        onError: (error, _, context) => {
            if (context?.prevSavedBlogs) {
                queryClient.setQueryData(
                    QUERY_KEYS.BLOGS.SAVED(userId),
                    context.prevSavedBlogs
                );
            }
            toast.error(error.msg || "Failed to unsave blog!");
        },

        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.BLOGS.SAVED(userId),
            });
            await queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.BLOGS.BY_ID(blogId),
            });
        },
    });
};

export default useUnsaveBlogMutation;