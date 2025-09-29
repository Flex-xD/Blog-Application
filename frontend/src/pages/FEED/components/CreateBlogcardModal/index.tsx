import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ImageIcon, Sparkles } from "lucide-react";
import { backdropVariants } from "@/constants/varients";
import { modalVariants } from "@/types";

interface CreateBlogCardModalProps {
    show: boolean;
    title: string;
    body: string;
    imagePreview: string | null;
    postingBlogPending: boolean;
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    setBody: React.Dispatch<React.SetStateAction<string>>;
    setSelectedImage: React.Dispatch<React.SetStateAction<File | null>>;
    setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
    setShowAIModal: React.Dispatch<React.SetStateAction<boolean>>;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBlogPost: () => void;
}

const CreateBlogCardModal: React.FC<CreateBlogCardModalProps> = ({
    show,
    title,
    body,
    imagePreview,
    postingBlogPending,
    setShow,
    setTitle,
    setBody,
    setSelectedImage,
    setImagePreview,
    setShowAIModal,
    handleImageUpload,
    handleBlogPost,
}) => {
    const handleClose = () => {
        setShow(false);
        setSelectedImage(null);
        setImagePreview(null);
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="create-modal"
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={backdropVariants}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        variants={modalVariants}
                        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Create New Blog</h3>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-500 hover:text-gray-700 transition-colors duration-150"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-4">
                                {/* Image Preview */}
                                {imagePreview && (
                                    <div className="relative float-left mr-4 mb-2">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-32 h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={() => {
                                                setSelectedImage(null);
                                                setImagePreview(null);
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors duration-150"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                {/* Title Input */}
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Blog Title"
                                    className="text-xl font-bold border-none focus-visible:ring-0"
                                />

                                {/* User Info */}
                                <div className="flex items-center space-x-3 clear-both">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src="https://randomuser.me/api/portraits/men/1.jpg" />
                                        <AvatarFallback>ME</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">You</p>
                                        <select className="text-sm text-gray-500 bg-transparent border-none focus:ring-0">
                                            <option>Public</option>
                                            <option>Followers Only</option>
                                            <option>Private</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Blog Body */}
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Write your blog content here..."
                                    className="w-full min-h-[200px] p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <ImageIcon className="h-4 w-4 mr-2" />
                                        Add Image
                                    </Button>
                                    <Button variant="ghost" onClick={() => setShowAIModal(true)}>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        AI
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleBlogPost}
                                disabled={postingBlogPending}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                                {postingBlogPending && (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                )}
                                Publish
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CreateBlogCardModal;
