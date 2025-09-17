import { QUERY_KEYS } from "@/constants/queryKeys"
import { useQuery } from "@tanstack/react-query"
import { useUserProfileData } from "../UserDataFetching"
import apiClient from "@/utility/axiosClient";
import { SOCIAL_ENDPOINTS } from "@/constants/constants";
import type { apiReponse, IUser } from "@/types";


const useSuggestedUserData = () => {
    const {data} = useUserProfileData();
    return useQuery({
        queryKey: data?._id ? [QUERY_KEYS.SOCIAL.SUGGESTIONS(data._id)] : [],
        queryFn: async () => {
            const response  = await apiClient.get<apiReponse<IUser>>(SOCIAL_ENDPOINTS.USER_SUGGESTIONS);
            // console.log(response.data.data)
            return response.data.data;
        },
        enabled: !!data?._id
    })
}

export default useSuggestedUserData;