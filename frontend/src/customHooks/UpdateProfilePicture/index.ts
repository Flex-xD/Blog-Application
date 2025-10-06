import { SOCIAL_ENDPOINTS } from '@/constants/constants';
import { QUERY_KEYS } from '@/constants/queryKeys';
import apiClient from '@/utility/axiosClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ProfilePictureResponse {
    success: boolean;
    msg: string;
    data: {
        profilePicture: {
            url: string;
            publicId: string;
            width?: number;
            height?: number;
            format?: string;
        } | undefined;
    };
}

export const useUpdateProfilePicture = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('profilePicture', file);

            console.log('Sending file to backend:', file.name, file.size, file.type);

            const response = await apiClient.post<ProfilePictureResponse>(
                SOCIAL_ENDPOINTS.UPDATE_PROFILE_PICTURE ,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success && data.data.profilePicture) {
                toast.success(data.msg);
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE.ME });
            } else {
                console.error('No profile picture data in response:', data);
                toast.error('Profile picture upload failed: No image data returned');
            }
        },
        onError: (error: any) => {
            console.error('Profile picture upload error:', error);
            toast.error(error.response?.data?.msg || 'Failed to update profile picture');
        },
    });
};