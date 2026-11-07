import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import apiClient from "@/utility/axiosClient";
import { BLOG_ENDPOINTS } from "@/constants/constants";
import type { AxiosError } from "axios";

export interface IFeaturedBlog {
    _id: string;
    title: string;
    body: string;
    image: { url: string | null } | null;
    createdAt: string;
    likesCount: number;
    commentsCount: number;
    authorDetails?: {
        _id: string;
        username: string;
        profilePicture?: string;
    };
}

interface FeaturedBlogsResponse {
    statusCode: number;
    success: boolean;
    msg: string;
    data: {
        blogs: IFeaturedBlog[];
    };
}

const useFeaturedBlogs = (limit: number = 3) => {
    return useQuery<FeaturedBlogsResponse, AxiosError, IFeaturedBlog[]>({
        queryKey: QUERY_KEYS.BLOGS.FEATURED(limit),

        queryFn: async (): Promise<FeaturedBlogsResponse> => {
            const response = await apiClient.get<FeaturedBlogsResponse>(
                `${BLOG_ENDPOINTS.FEATURED}?limit=${limit}`
            );

            return response.data;
        },

        select: (response) => response.data.blogs,

        staleTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};

export default useFeaturedBlogs;