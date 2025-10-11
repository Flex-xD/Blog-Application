import { AUTH_ENDPOINTS } from "@/constants/constants"
import { useAppStore } from "@/store";
import type { IUser } from "@/types";
import apiClient from "@/utility/axiosClient"
import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import type { AxiosError } from "axios";


export const useUserProfileData = () => {

    const { setIsAuthenticated } = useAppStore();

    return useQuery(
        {
            queryKey: ["profile", "me"],
            queryFn: async () => {
                const response = await apiClient.get(AUTH_ENDPOINTS.GET_USER_DATA);
                if (response.data.data) {
                    setIsAuthenticated(true)
                }
                console.log("THIS IS USER DATA : ",response.data.data)
                return response.data.data as IUser;
            },
            staleTime: 5 * 60 * 1000,
            cacheTime: 30 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
        } as UseQueryOptions<IUser, AxiosError>
    );
};