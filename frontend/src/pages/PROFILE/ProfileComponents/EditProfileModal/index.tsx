import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUpdateProfilePicture } from "@/customHooks/UpdateProfilePicture";

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
    const [imagePreview, setImagePreview] = useState<string | null>(
        currentPicture || null
    );

    const { mutateAsync: updateProfilePicture, isPending } =
        useUpdateProfilePicture();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image.");
            return;
        }

        setSelectedImage(file);

        const reader = new FileReader();

        reader.onload = (event) => {
            setImagePreview(event.target?.result as string);
        };

        reader.readAsDataURL(file);
    };

    const handleClose = () => {
        if (isPending) return;

        setSelectedImage(null);
        setImagePreview(currentPicture || null);
        onClose();
    };

    const handleSubmit = async () => {
        if (!selectedImage) {
            toast.error("Please select an image.");
            return;
        }

        try {
            await updateProfilePicture(selectedImage);
            toast.success("Profile picture updated successfully.");
            setSelectedImage(null);
            onClose();
        } catch (error) {
            console.error("Error uploading profile picture:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
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
                                className="h-32 w-32 rounded-full border-2 border-border object-cover"
                            />
                        </div>
                    )}

                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isPending}
                    />

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleSubmit}
                            disabled={isPending || !selectedImage}
                        >
                            {isPending ? "Uploading..." : "Save"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
