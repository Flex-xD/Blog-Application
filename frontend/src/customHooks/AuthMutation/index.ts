import { AUTH_ENDPOINTS } from "@/constants/constants";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAppStore } from "@/store";
import type { IUser } from "@/types";
import apiClient from "@/utility/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthResponse {
    data: IUser;
    success: boolean;
    msg: string;
}

// useAuthMutation.ts
const useAuthMutation = (isSignUp: boolean) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (formData: { email: string; password: string; username?: string }) => {
            const endpoint = isSignUp ? AUTH_ENDPOINTS.REGISTER : AUTH_ENDPOINTS.LOGIN;
            const response = await apiClient.post(endpoint, formData, {
                withCredentials: true
            });
            return response.data;
        },
        onSuccess: (data: any) => {
            if (!data?.success) {
                toast.error(data?.msg || "Authentication failed");
                return;
            }

            console.log("✅ Auth successful, setting store state...");

            // Set authentication state in the persisted store
            useAppStore.getState().setIsAuthenticated(true);

            // Double-check the state was set
            console.log('🔄 Store auth state after login:', useAppStore.getState().isAuthenticated);

            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE.ME });
            toast.success(isSignUp ? "Registered Successfully!" : "Logged In Successfully!");

            setTimeout(() => {
                navigate("/feed", { replace: true });
            }, 1500);
        },
        onError: (error: AxiosError | Error) => {
            // Clear auth state on error
            useAppStore.getState().setIsAuthenticated(false);

            let message = `${isSignUp ? "Registration" : "Login"} failed!`;

            if ((error as AxiosError).isAxiosError && (error as AxiosError).response) {
                const responseData = (error as AxiosError).response?.data as { msg?: string };
                message = responseData?.msg || message;
            }

            toast.error(message);
        }
    });
};

export default useAuthMutation;