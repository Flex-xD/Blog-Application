import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import apiClient from "@/utility/axiosClient";
import { BLOG_ENDPOINTS } from "@/constants/constants";
import type { IBlog } from "@/types";
import type { AxiosError } from "axios";

interface PopularBlogsResponse {
    statusCode: number;
    success: boolean;
    msg: string;
    data: {
        blogs: IBlog[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
            nextPage: number | null;
            prevPage: number | null;
        };
    };
}

interface PopularBlogsData {
    data: {
        blogs: IBlog[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
            nextPage: number | null;
            prevPage: number | null;
        };
    };
}

const usePopularBlogs = (page: number = 1, limit: number = 10) => {
    return useQuery<PopularBlogsData, AxiosError>({
        queryKey: QUERY_KEYS.BLOGS.POPULAR(page, limit),
        queryFn: async (): Promise<PopularBlogsData> => {
            const response = await apiClient.get<PopularBlogsResponse>(
                `${BLOG_ENDPOINTS.POPULAR}?page=${page}&limit=${limit}`
            );

            console.log("Popular blogs response:", response.data);

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
        staleTime: 5 * 60 * 1000, 
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};

export default usePopularBlogs;
