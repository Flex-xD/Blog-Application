import { Button } from "@/components/ui/button";
import { useUserProfileData } from "@/customHooks/UserDataFetching";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { motion } from "framer-motion";
import { ImageIcon, Link, PenSquare } from "lucide-react";

export const CreateBlogCard = ({
    setShowCreateModal,
    setSelectedImage
}: {
    setShowCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedImage: React.Dispatch<React.SetStateAction<File | null>>;
}) => {

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
            setShowCreateModal(true);
        }
    };
    // const {data:userInfo} = useUserProfileData();
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6"
        >
            <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src="https://randomuser.me/api/portraits/men/1.jpg" />
                    <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full text-left bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-gray-600 transition-colors"
                    >
                        What's on your mind today?
                    </button>
                </div>
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
                <Button
                    variant="ghost"
                    className="text-gray-600 hover:bg-gray-100"
                    onClick={() => setShowCreateModal(true)}
                >
                    <PenSquare className="h-4 w-4 mr-2" />
                    Write
                </Button>
                <Button variant="ghost" className="text-gray-600 hover:bg-gray-100 relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Photo
                </Button>
                <Button variant="ghost" className="text-gray-600 hover:bg-gray-100">
                    <Link className="h-4 w-4 mr-2" />
                    Link
                </Button>
            </div>
        </motion.div>
    )
}