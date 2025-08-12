import { AUTH_ENDPOINTS } from "@/constants/constants";
import { useAppStore } from "@/store";
import apiClient from "@/utility/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const useAuthMutation = (isSignUp: boolean) => {
    const queryClient = useQueryClient();
    const { setIsAuthenticated } = useAppStore();
    const navigate = useNavigate();
    return useMutation({
        mutationFn: async (formData: { email: string; password: string; username?: string }) => {
            const endpoint = isSignUp ? AUTH_ENDPOINTS.REGISTER : AUTH_ENDPOINTS.LOGIN;
            const response = await apiClient.post(endpoint, formData);
            return response.data;
        },
        onSuccess: (data: undefined) => {
            if (data === undefined || null) return;
            console.log(data);
            queryClient.invalidateQueries({queryKey:["profile"]})
            setIsAuthenticated(true);
            toast.success(isSignUp ? "Registerd Successfully!" : "Logged In Successfully!");
            return setTimeout(() => {
                navigate("/");
            }, 1500)
        },
        onError: (error: AxiosError | Error) => {
            setIsAuthenticated(false);
            let message = `${isSignUp ? "Registeration" : "Login"} failed !`;
            if ((error as AxiosError).isAxiosError && (error as AxiosError).response) {
                const data = (error as AxiosError).response?.data as { msg?: string };
                message = data?.msg || message;
            }
            return toast.error(message);
        }
    })
}

export default useAuthMutation;

