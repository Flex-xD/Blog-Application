import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useUpdateProfilePicture } from '@/customHooks/UpdateProfilePicture';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPicture?: string;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
    isOpen,
    onClose,
    currentPicture,
}) => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(currentPicture || null);
    const { mutateAsync: updateProfilePicture, isPending , data:profilePictureData} = useUpdateProfilePicture();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!selectedImage) {
            toast.error('Please select an image');
            return;
        }

        try {
            await updateProfilePicture(selectedImage);
            console.log("This is the profile picture data : " , profilePictureData);
            onClose();
            setSelectedImage(null);
            setImagePreview(null);
        } catch (error) {
            console.error('Error uploading profile picture:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {imagePreview && (
                        <div className="flex justify-center">
                            <img
                                src={imagePreview}
                                alt="Profile preview"
                                className="h-32 w-32 rounded-full object-cover border-2 border-gray-200"
                            />
                        </div>
                    )}
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isPending || !selectedImage}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                            {isPending ? 'Uploading...' : 'Save'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};