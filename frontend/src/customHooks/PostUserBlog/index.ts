import { BLOG_ENDPOINTS } from "@/constants/constants";
import { QUERY_KEYS } from "@/constants/queryKeys";
import apiClient from "@/utility/axiosClient";
import getErrorMessage from "@/utility/errorUtility";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

interface IUserBlog {
    title: string;
    body: string;
    image?: File | null;
}

const usePostUserBlog = (refreshFeed?: () => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (blog: IUserBlog) => {
            const fd = new FormData();
            fd.append("title", blog.title);
            fd.append("body", blog.body);
            if (blog.image) {
                fd.append("image", blog.image);
            }

            const response = await apiClient.post(BLOG_ENDPOINTS.CREATE_BLOG, fd, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data;
        },
        onSuccess: (data: any) => {
            console.log("Blog creation success:", data);
            const userId = data.data?.authorDetails?._id;

            if (!userId) {
                console.warn("No user ID found in response, cannot invalidate user-specific queries");
            }

            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.BLOGS.FEED(userId, 1, 10),
                exact: true,
            });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BLOGS.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE.ME });
            queryClient.invalidateQueries({ queryKey: ["blogs", "following"] });
            queryClient.invalidateQueries({ queryKey: ["blogs", "popular"] });

            refreshFeed?.(); 

            toast.success("Blog Posted Successfully!");
        },
        onError: (error: AxiosError | Error) => {
            console.error("Blog creation error:", error);
            toast.error(getErrorMessage(error));
        },
    });
};

export default usePostUserBlog;