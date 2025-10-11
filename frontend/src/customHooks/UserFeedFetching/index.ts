import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
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

export interface UserFeedData {
    data: {
        blogs: IBlog[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            hasMore: boolean;
            totalPages: number;
            nextPage: number | null;
            prevPage: number | null;
        };
    };
}

const useUserFeedData = (
    userId: string,
    page: number = 1,
    limit: number = 10,
    options?: Omit<UseQueryOptions<UserFeedData, AxiosError>, "queryKey" | "queryFn">
) => {
    return useQuery<UserFeedData, AxiosError>({
        queryKey: QUERY_KEYS.BLOGS.FEED(userId, page, limit),
        queryFn: async (): Promise<UserFeedData> => {
            const response = await apiClient.get<FeedResponse>(
                `${BLOG_ENDPOINTS.USER_FEED}?page=${page}&limit=${limit}`
            );

            const apiData = response.data.data;
            const pagination = apiData.pagination;

            return {
                data: {
                    blogs: apiData.blogs,
                    pagination: {
                        ...pagination,
                        totalPages: Math.ceil(pagination.total / pagination.limit),
                        nextPage: pagination.hasMore ? pagination.page + 1 : null,
                        prevPage: pagination.page > 1 ? pagination.page - 1 : null,
                    },
                },
            };
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
        retry: 3,
        retryDelay: (attempt) => Math.min(attempt * 1000, 5000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        ...options,
    });
};

export default useUserFeedData;
