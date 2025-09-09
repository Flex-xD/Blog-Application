import { BLOG_ENDPOINTS } from "@/constants/constants";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { IBlog } from "@/types";
import apiClient from "@/utility/axiosClient";
import getErrorMessage from "@/utility/errorUtility";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios";
import { toast } from "sonner";

export interface IUserBlog {
    title: string,
    body: string,
    image?: File | null
}

const usePostUserBlog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (blog: IUserBlog) => {
            const fd = new FormData();
            fd.append("title", blog.title);
            fd.append("body", blog.body);
            if (blog.image) {fd.append("image", blog.image)};

            const response = await apiClient.post(BLOG_ENDPOINTS.CREATE_BLOG, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            return response.data;
        },
        onSuccess: (data: IBlog) => {
            if (!data) return;
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE.ME });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BLOGS.ALL });
            console.log(`Blog successfully Created : ${data}`);
            toast.success("Blog Posted Successfully !");
        },
        onError: (error: AxiosError | Error) => {
            return toast.error(getErrorMessage(error));
        }
    })
}

export default usePostUserBlog;