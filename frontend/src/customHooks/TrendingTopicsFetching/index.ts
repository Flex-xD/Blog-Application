import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utility/axiosClient";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {  SOCIAL_ENDPOINTS } from "@/constants/constants";
import type { AxiosError } from "axios";

export interface TrendingTopic {
    id: string;
    name: string;
    postCount: number;
}

interface TrendingTopicsResponse {
    statusCode: number;
    success: boolean;
    msg: string;
    data: TrendingTopic[];
}

interface TrendingTopicsData {
    data: TrendingTopic[];
}

const useTrendingTopics = () => {
    return useQuery<TrendingTopicsData, AxiosError>({
        queryKey: QUERY_KEYS.SOCIAL.TRENDING, // you can define a key like this
        queryFn: async (): Promise<TrendingTopicsData> => {
            const response = await apiClient.get<TrendingTopicsResponse>(SOCIAL_ENDPOINTS.TRENDING_TOPICS);

            const topicsWithId = response.data.data.map((topic, index) => ({
                ...topic,
                id: topic.name + index,
            }));

            return { data: topicsWithId };
        },
        staleTime: 5 * 60 * 1000, 
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};

export default useTrendingTopics;
