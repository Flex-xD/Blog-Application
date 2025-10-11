import { BLOG_ENDPOINTS } from "@/constants/constants";
import { QUERY_KEYS } from "@/constants/queryKeys";
import apiClient from "@/utility/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { apiReponse, errorResponse } from "@/types";
import { toast } from "sonner";

interface DeleteBlogContext {
    prevUserBlogs?: any[];
}

const useDeleteBlogMutation = (blogId: string, userId: string, refreshFeed?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation<apiReponse<null>, errorResponse, void, DeleteBlogContext>({
        mutationFn: async () => {
            const response = await apiClient.delete<apiReponse<null>>(
                BLOG_ENDPOINTS.DELETE_USER_BLOG(blogId),
                { timeout: 30000 }
            );
            return response.data;
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.BLOGS.ALL });

            const prevUserBlogs = queryClient.getQueryData<any[]>(QUERY_KEYS.BLOGS.BY_USER(userId));

            queryClient.setQueryData<any[]>(
                QUERY_KEYS.BLOGS.BY_USER(userId),
                (old) => (old ? old.filter((blog) => blog._id !== blogId) : [])
            );

            return { prevUserBlogs };
        },
        onSuccess: (data) => {
            if (data.success === true) {
                toast.success(data.msg || "Blog deleted successfully!");

                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.BLOGS.FEED(userId, 1, 10),
                    exact: true,
                });
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BLOGS.ALL });
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BLOGS.BY_USER(userId) });
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BLOGS.SAVED(userId) });
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BLOGS.POPULAR(1, 10) });
                queryClient.invalidateQueries({ queryKey: ["blogs", "following"] });
                queryClient.invalidateQueries({ queryKey: ["blogs", "popular"] });

                refreshFeed?.(); 
            } else {
                toast.info("Problem while deleting the blog!");
            }
        },
        onError: (error, _, context) => {
            if (context?.prevUserBlogs) {
                queryClient.setQueryData(QUERY_KEYS.BLOGS.BY_USER(userId), context.prevUserBlogs);
            }
            toast.error(error.msg || "Failed to delete blog!");
        },
    });
};

export default useDeleteBlogMutation;