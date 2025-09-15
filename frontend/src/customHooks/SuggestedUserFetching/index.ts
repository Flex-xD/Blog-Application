import { QUERY_KEYS } from "@/constants/queryKeys"
import { useQuery } from "@tanstack/react-query"
import { useUserProfileData } from "../UserDataFetching"
import apiClient from "@/utility/axiosClient";
import { SOCIAL_ENDPOINTS } from "@/constants/constants";
import type { apiReponse, IUser } from "@/types";


const useSuggestedUserData = async () => {
    const {data} = useUserProfileData();
    return useQuery({
        queryKey: data?._id ? [QUERY_KEYS.SOCIAL.SUGGESTIONS(data._id)] : [],
        queryFn: async () => {
            const response  = await apiClient.get<apiReponse<IUser>>(SOCIAL_ENDPOINTS.USER_SUGGESTIONS);
            return response.data;
        },
        enabled: !!data?._id
    })
}

// TEST THIS IF IT IS FETCHING OR NOT FROM THE BACKEND API
export default useSuggestedUserData;