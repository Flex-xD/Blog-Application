import { QUERY_KEYS } from "@/constants/queryKeys"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/utility/axiosClient";
import { SOCIAL_ENDPOINTS } from "@/constants/constants";
import type { apiReponse, IUser } from "@/types";


const useSuggestedUserData = (userId:string) => {
    return useQuery({
        queryKey: userId ? QUERY_KEYS.SOCIAL.SUGGESTIONS(userId) : [],
        queryFn: async () => {
            const response  = await apiClient.get<apiReponse<IUser>>(SOCIAL_ENDPOINTS.USER_SUGGESTIONS);
            console.log("This is suggestedUser data : " , response.data.data);
            return response.data.data;
        },
        enabled: !!userId
    })
}

export default useSuggestedUserData;