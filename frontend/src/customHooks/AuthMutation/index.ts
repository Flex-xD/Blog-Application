import { AUTH_ENDPOINTS } from "@/constants/constants";
import apiClient from "@/utility/axiosClient";
import { useMutation } from "@tanstack/react-query";
import type {  AxiosError } from "axios";
import { toast } from "sonner";

const useAuthMutation = (isSignUp: boolean) => {
    return useMutation({
        mutationFn: async (formData: { email: string; password: string; username?: string }) => {
            const endpoint = isSignUp ? AUTH_ENDPOINTS.REGISTER : AUTH_ENDPOINTS.LOGIN;
            const response = await apiClient.post(endpoint, formData);
            return response.data;
        },
        onSuccess:(data:undefined) => {
            if (data === undefined || null) return;
            toast.success(isSignUp ? "Registerd Successfully!" : "Logged In Successfully!");
            setTimeout(( ) => {
                window.location.href = "/";
            } , 2300)
        }, 
        onError:(error: AxiosError | Error) => {
            let message = `${isSignUp ? "Registeration" : "Login"} failed !`;
            if ((error as AxiosError).isAxiosError && (error as AxiosError).response) {
                const data = (error as AxiosError).response?.data as { msg?: string };
                message = data?.msg || message;
            }
            toast.error(message);
        }
    })
}


    //     try {
    //     if (!validateAuth(isSignup)) return;
    //     const endpoint = isSignup ? AUTH_ENDPOINTS.REGISTER : AUTH_ENDPOINTS.LOGIN;
    //     const sideData = isSignup ? { email, password, username } : { email, password };
    //     const response = await apiClient.post(endpoint, sideData);;
    //     if (response.status === 200 || response.status === 201) {
    //         toast.success(response.data.msg);
    //         console.log("Login successful : ", response.data)
    //         setTimeout(() => {
    //             naviagte("/")
    //         }, 2000)
    //     }
    // } catch (error) {
    //     if (error instanceof AxiosError) {
    //         console.log({ error });
    //         if (error.response || error.response!.data.msg) {
    //             return toast.error(error.response?.data.msg);
    //         }
    //         return toast.error(`${isSignup ? "Signup" : "Login"} failed!`);
    //     } else {
    //         toast.error("An error occurred!");
    //     }
    // }

export default useAuthMutation;

