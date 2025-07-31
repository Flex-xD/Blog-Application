import { AUTH_ENDPOINTS } from "@/constants/constants";
import apiClient from "@/utility/axiosClient";
import { useMutation } from "@tanstack/react-query";



const useAuthMutation = (isSignUp: boolean, validateAuth: (isSignUp: boolean) => boolean) => {
    if (!validateAuth(isSignUp)) return;
    return useMutation({
        mutationFn: async (formData:{email:string , password:string , username?:string}) => {
            if (!validateAuth(isSignUp)) return;
            const endpoint = isSignUp ? AUTH_ENDPOINTS.REGISTER : AUTH_ENDPOINTS.LOGIN;
            const sideData = isSignUp ? {...formData , username:formData.username} : {...formData};
            const response = await apiClient.post(endpoint, sideData);;
        }
    })
}

export default useAuthMutation;

