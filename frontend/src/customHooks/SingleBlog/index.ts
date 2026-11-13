
import { BLOG_ENDPOINTS } from "@/constants/constants";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { IBlog, apiReponse } from "@/types";
import apiClient from "@/utility/axiosClient";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";


export const useSingleBlogData = (blogId: string | undefined) =>
    useQuery<IBlog, AxiosError>({
        queryKey: QUERY_KEYS.BLOGS.BY_ID(blogId ?? ""),
        queryFn: async () => {
            const response = await apiClient.get<apiReponse<IBlog>>(
                BLOG_ENDPOINTS.SINGLE_BLOG(blogId ?? "")
            );

            if (!response.data.data) {
                throw new Error("Post not found");
            }

            return response.data.data;
        },
        enabled: Boolean(blogId),
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
    });
