import { userEndPoint } from "@/constants/constants"
import { useAppStore } from "@/store";
import type { IUser } from "@/types";
import apiClient from "@/utility/axiosClient"
import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import type { AxiosError } from "axios";
import { toast } from "sonner";


export const useUserProfileData = () => {
    const { isAuthenticated } = useAppStore();

    return useQuery(
        {
            queryKey: ["profile", "me"],
            queryFn: async () => {
                const response = await apiClient.get(userEndPoint.GET_USER_DATD);
                return response.data as IUser;
            },
            enabled: isAuthenticated,
            onSuccess: (data:IUser) => {
                console.log("Fetched user:", data);
            },
            onError: (error:AxiosError) => {
                toast.error(error.message);
            },
        } as UseQueryOptions<IUser, AxiosError>
    );
};