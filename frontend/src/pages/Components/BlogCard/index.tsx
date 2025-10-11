import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, ArrowRight, Bookmark, Clock, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import useLikeMutation from "@/customHooks/LikeBlogMutation";
import useUnLikeMutation from "@/customHooks/UnlikeBlogMutation";
import useSaveBlogMutation from "@/customHooks/SaveBlogMutation";
import useUnsaveBlogMutation from "@/customHooks/unsaveBlog";
import useDeleteBlogMutation from "@/customHooks/DeleteBlogMutation";
import { useUserProfileData } from "@/customHooks/UserDataFetching";
import { CommentModal } from "./components/CommentModal";

export interface BlogCardProps {
    _id: string;
    title: string;
    body: string;
    image: {
        url: string;
        publicId: string;
        width: number;
        height: number;
        format: string;
    };
    authorDetails: {
        username: string;
        _id: string;
        profilePicture: string;
    };
    likes: string[];
    comments: any[];
    createdAt: Date;
    updatedAt: Date;
    onSave?: (id: string) => void;
    // Add this prop to check if blog is saved
    isInitiallySaved?: boolean;
    // Add this callback for when blog is deleted
    onBlogDeleted?: () => void;
    isSaveLoading?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({
    _id,
    title,
    body,
    authorDetails,
    image,
    likes,
    comments,
    createdAt,
    isInitiallySaved = false,
    onBlogDeleted, // ADD THIS PROP
    isSaveLoading = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(isInitiallySaved);
    const [currentLikes, setCurrentLikes] = useState<string[]>(likes);
    const [blogComments, setBlogComments] = useState<any[]>(comments);
    const { data: userInfo } = useUserProfileData();

    // Update isSaved when isInitiallySaved changes (e.g., after refresh)
    useEffect(() => {
        setIsSaved(isInitiallySaved);
    }, [isInitiallySaved]);

    const isLiked = Array.isArray(currentLikes) && userInfo?._id
        ? currentLikes.includes(userInfo._id)
        : false;

    // --- React Query mutations ---
    const { mutateAsync: handleBlogLike } = useLikeMutation(userInfo!._id);
    const { mutateAsync: handleBlogUnlike } = useUnLikeMutation(userInfo!._id);
    const { mutate: saveBlogMutation, isPending: isSaving } = useSaveBlogMutation(_id, userInfo!._id);
    const { mutate: unsaveBlogMutation, isPending: isUnsaving } = useUnsaveBlogMutation(_id, userInfo!._id);
    const { mutate: deleteBlogMutation, isPending: isDeleting } = useDeleteBlogMutation(_id, userInfo!._id);

    // --- Handlers ---
    const handleLikeAndUnlike = async (e: React.MouseEvent, blogToBeLikedId: string) => {
        e.stopPropagation();
        if (isLiked) {
            await handleBlogUnlike(blogToBeLikedId);
            setCurrentLikes((prev) => prev.filter((id) => id !== userInfo?._id));
        } else {
            await handleBlogLike(blogToBeLikedId);
            setCurrentLikes((prev) => [...prev, userInfo?._id ?? ""]);
        }
    };

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newSavedState = !isSaved;
        setIsSaved(newSavedState);

        if (newSavedState) {
            // Save the blog
            saveBlogMutation();
        } else {
            // Unsave the blog
            unsaveBlogMutation();
        }

        // Trigger a custom event to update the profile page
        window.dispatchEvent(new CustomEvent('blogSaved', {
            detail: { blogId: _id, isSaved: newSavedState }
        }));
    };

    // UPDATED: Handle blog deletion with callback
    // UPDATED: Handle blog deletion with callback
const handleBlogDelete = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!userInfo?._id || userInfo._id !== authorDetails._id) return;

    deleteBlogMutation(undefined, {
        onSuccess: () => {
            setIsExpanded(false);
            if (onBlogDeleted) {
                onBlogDeleted();
            }
            // Force refresh all feeds
            window.dispatchEvent(new CustomEvent('refreshAllFeeds'));
        }
    });
};

    const openCommentModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsCommentModalOpen(true);
    };

    // --- Misc ---
    const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
    const readingTime = Math.ceil(body.split(" ").length / 200);

    const isSaveLoadingCombined = isSaveLoading || isSaving || isUnsaving;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
                viewport={{ once: true }}
                onClick={() => setIsExpanded(true)}
                className="cursor-pointer"
            >
                <Card className="group overflow-hidden transition-all hover:shadow-lg">
                    <div className="flex flex-col md:flex-row">
                        {image && (
                            <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden">
                                <motion.img
                                    src={image.url}
                                    alt={title}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        )}

                        <div className="flex-1 p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8 border-2 border-white shadow overflow-hidden">
                                        <AvatarImage
                                            src={authorDetails.profilePicture}
                                            className="h-full w-full object-cover"
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-medium">
                                            {(authorDetails?.username?.[0] || "").toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{authorDetails.username}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-muted-foreground">
                                                {formattedDate}
                                            </p>
                                            <span className="text-muted-foreground">•</span>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {readingTime} min read
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleSave}
                                    disabled={isSaveLoadingCombined}
                                >
                                    <Bookmark
                                        className={`h-4 w-4 ${isSaved ? "fill-indigo-500 text-indigo-500" : ""}`}
                                    />
                                </Button>
                            </div>

                            <h3 className="text-xl font-bold line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                                {title}
                            </h3>
                            <p className="text-muted-foreground line-clamp-2 mb-4">
                                {body}
                            </p>

                            <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-3 gap-2 text-sm rounded-full"
                                        onClick={(e) => handleLikeAndUnlike(e, _id)}
                                    >
                                        <Heart
                                            className={`h-5 w-5 ${isLiked ? "fill-red-500 stroke-red-500" : "stroke-gray-500"}`}
                                        />
                                        <span>{currentLikes.length} likes</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-3 gap-2 text-sm rounded-full"
                                        onClick={openCommentModal}
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        <span>{blogComments.length}</span>
                                    </Button>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-2 text-sm rounded-full"
                                >
                                    Read more
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Expanded Blog Modal */}
            <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl">
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {image && (
                                    <div className="relative h-64 w-full overflow-hidden">
                                        <img
                                            src={image.url}
                                            alt={title}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                )}

                                <div className="p-8 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                                    <DialogHeader>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-8 w-8 border-2 border-white shadow overflow-hidden">
                                                    <AvatarImage
                                                        src={authorDetails.profilePicture}
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-medium">
                                                        {(authorDetails?.username?.[0] || "").toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{authorDetails.username}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm text-muted-foreground">{formattedDate}</p>
                                                        <span className="text-muted-foreground">•</span>
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Clock className="h-3 w-3" />
                                                            {readingTime} min read
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={handleSave} disabled={isSaveLoadingCombined}>
                                                    <Bookmark
                                                        className={`h-5 w-5 ${isSaved ? "fill-indigo-500 text-indigo-500" : ""}`}
                                                    />
                                                </Button>

                                                {userInfo?._id === authorDetails._id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={handleBlogDelete}
                                                        disabled={isDeleting}
                                                    >
                                                        <Trash className="h-5 w-5 text-red-500" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <DialogTitle className="text-3xl font-bold mb-4">{title}</DialogTitle>
                                    </DialogHeader>

                                    <div className="prose prose-lg dark:prose-invert max-w-none">
                                        {body.split("\n").map((paragraph, index) => (
                                            <p key={index} className="mb-4 last:mb-0">
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>

                                    <div className="flex space-x-4 pt-6 border-t border-gray-200">
                                        <Button
                                            variant="ghost"
                                            className="flex items-center space-x-2"
                                            onClick={(e) => handleLikeAndUnlike(e, _id)}
                                        >
                                            <Heart
                                                className={`h-5 w-5 ${isLiked ? "fill-red-500 stroke-red-500" : "stroke-gray-500"}`}
                                            />
                                            <span>{currentLikes.length} likes</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="flex items-center space-x-2"
                                            onClick={openCommentModal}
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                            <span>{blogComments.length} comments</span>
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>

            {userInfo && (
                <CommentModal
                    userInfo={userInfo}
                    isOpen={isCommentModalOpen}
                    onClose={() => setIsCommentModalOpen(false)}
                    setBlogComments={setBlogComments}
                    comments={blogComments}
                    blogId={_id}
                />
            )}
        </>
    );
};