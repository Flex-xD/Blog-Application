import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import apiClient from "@/utility/axiosClient";
import { BLOG_ENDPOINTS } from "@/constants/constants";
import type { IBlog } from "@/types";
import type { AxiosError } from "axios";

interface FeedResponse {
    statusCode: number;
    success: boolean;
    msg: string;
    data: {
        blogs: IBlog[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            hasMore: boolean;
        };
    };
}

const useUserFeedData = (userId: string) => {
    return useQuery<IBlog[], AxiosError>({
        queryKey: QUERY_KEYS.BLOGS.FEED(userId),
        queryFn: async () => {
            const response = await apiClient.get<FeedResponse>(`${BLOG_ENDPOINTS.USER_FEED}/${userId}`);
            return response.data?.data?.blogs || [];
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};

export default useUserFeedData;