import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import apiClient from "@/utility/axiosClient";
import { BLOG_ENDPOINTS } from "@/constants/constants";
import type { IBlog } from "@/types";
import type { AxiosError } from "axios";

interface FollowingBlogsResponse {
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
            totalPages?: number;
            nextPage?: number | null;
            prevPage?: number | null;
        };
    };
}

export interface UserFollowingBlogsData {
    data: {
        blogs: IBlog[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            hasMore: boolean;
            totalPages?: number;
            nextPage?: number | null;
            prevPage?: number | null;
        };
    };
}

const useUserFollowingBlogsData = (userId: string, page: number = 1, limit: number = 10) => {
    return useQuery<UserFollowingBlogsData, AxiosError>({
        queryKey: QUERY_KEYS.BLOGS.FOLLOWING(userId, page, limit),
        queryFn: async (): Promise<UserFollowingBlogsData> => {
            const response = await apiClient.get<FollowingBlogsResponse>(
                `${BLOG_ENDPOINTS.USER_FOLLOWING_BLOGS}?page=${page}&limit=${limit}`
            );

            console.log("This is the response of the following blogs data: ", response.data);

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
                    }
                }
            };
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};

export default useUserFollowingBlogsData;