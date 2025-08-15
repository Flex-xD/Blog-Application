import { AUTH_ENDPOINTS } from "@/constants/constants"
import { useAppStore } from "@/store";
import type { IUser } from "@/types";
import apiClient from "@/utility/axiosClient"
import {  useQuery, type UseQueryOptions } from "@tanstack/react-query"
import type { AxiosError } from "axios";
import { toast } from "sonner";


export const useUserProfileData = () => {
    const { setIsAuthenticated} = useAppStore();

    return useQuery(
        {
            queryKey: ["profile", "me"],
            queryFn: async () => {
                const response = await apiClient.get(AUTH_ENDPOINTS.GET_USER_DATA);
                if (response.data.data) {
                    setIsAuthenticated(true)
                }
                return response.data.data as IUser;
            },
            staleTime: 5 * 60 * 1000,
            retry: 1,
            onSuccess: (data: IUser) => {
                console.log("Fetched user:", data);
            },
            onError: (error: AxiosError) => {
                setIsAuthenticated(false);
                const errorMessage =
                    (error.response?.data && typeof error.response.data === "object" && "msg" in error.response.data
                        ? (error.response.data as { msg?: string }).msg
                        : undefined)
                    || error.message
                    || "Failed to fetch user profile";
                toast.error(errorMessage);
            },
        } as UseQueryOptions<IUser, AxiosError>
    );
};