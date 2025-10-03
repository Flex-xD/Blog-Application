import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, ArrowRight, Bookmark, Share2, Clock } from "lucide-react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import useLikeMutation from "@/customHooks/LikeBlogMutation";
import { useUserProfileData } from "@/customHooks/UserDataFetching";
import useUnLikeMutation from "@/customHooks/UnlikeBlogMutation";
import { CommentModal } from "./components/CommentModal";
import useCommentMutation from "@/customHooks/CommentOnBlog";

export interface BlogCardProps {
    _id: string
    title: string;
    body: string;
    image: {
        url: string,
        publicId: string,
        width: number,
        height: number,
        format: string
    };
    authorDetails: {
        username: string,
        _id: string,
        profilePicture: string
    }
    likes: string[];
    comments: any[]; // Updated to accept comment objects
    createdAt: Date;
    updatedAt: Date;
    onLike?: (id: string) => void;
    onSave?: (id: string) => void;
}

const dummyComments = [
    {
        _id: "comment1",
        commentAuthor: {
            _id: "user2",
            username: "sarah_writer",
            profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
        },
        body: "This is such an insightful post! I really enjoyed reading about your perspective on this topic.",
        date: "2024-01-15T10:30:00Z"
    },
    {
        _id: "comment2",
        commentAuthor: {
            _id: "user3",
            username: "tech_enthusiast",
            profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        },
        body: "Great points! Have you considered the implications of recent developments in this field?",
        date: "2024-01-15T14:45:00Z"
    },
    {
        _id: "comment3",
        commentAuthor: {
            _id: "user4",
            username: "design_lover",
            profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
        },
        body: "The examples you provided really helped clarify the concepts. Looking forward to more content like this!",
        date: "2024-01-16T09:15:00Z"
    },
    {
        _id: "comment4",
        commentAuthor: {
            _id: "user5",
            username: "code_master",
            profilePicture: ""
        },
        body: "Interesting approach. I've implemented something similar in my projects and found it works well.",
        date: "2024-01-16T16:20:00Z"
    }
];

export const BlogCard: React.FC<BlogCardProps> = ({
    _id,
    title,
    body,
    authorDetails,
    image,
    likes,
    comments = dummyComments,
    createdAt,
    onSave,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [currentLikes, setCurrentLikes] = useState<string[]>(likes);
    const [blogComments, setBlogComments] = useState<any[]>(comments);
    const [newComment, setNewComment] = useState<string>("")
    const { data: userInfo } = useUserProfileData();
    const isLiked = currentLikes.includes(userInfo?._id ?? "");

    const { mutateAsync: handleBlogLike } = useLikeMutation(userInfo!._id);
    const { mutateAsync: handleBlogUnlike } = useUnLikeMutation(userInfo!._id);

    const handleLikeAndUnlike = async (e: React.MouseEvent, blogToBeLikedId: string) => {
        e.stopPropagation();
        if (isLiked) {
            await handleBlogUnlike(blogToBeLikedId);
            setCurrentLikes((prev) => prev.filter((id) => id !== userInfo?._id))
        } else {
            await handleBlogLike(blogToBeLikedId);
            setCurrentLikes((prev) => [...prev, userInfo?._id ?? ""]);
        }
    };

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSaved(!isSaved);
        if (onSave) onSave(_id);
    };
    const commentMutation = useCommentMutation(_id, {
        username: userInfo?.username || "",
        profilePicture: userInfo?.profilePicture?.url,
        _id: userInfo?._id || ""
    });

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment?.trim()) return;

        commentMutation.mutate({ commentBody: newComment.trim() });
        setNewComment("");

        const openCommentModal = (e: React.MouseEvent) => {
            e.stopPropagation();
            setIsCommentModalOpen(true);
        };

        const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

        const readingTime = Math.ceil(body.split(" ").length / 200);

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
                                        <Avatar className="h-8 w-8 border-2 border-white shadow">
                                            <AvatarImage src={authorDetails.profilePicture} />
                                            <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600">
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
                                                className={`h-5 w-5 ${isLiked ? "fill-red-500 stroke-red-500" : "stroke-gray-500"
                                                    }`}
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

                {/* Expanded Modal View */}
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
                                                    <Avatar className="h-10 w-10 border-2 border-white shadow">
                                                        <AvatarImage src={authorDetails.profilePicture} />
                                                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600">
                                                            {(authorDetails?.username?.[0] || "").toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{authorDetails.username}</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm text-muted-foreground">
                                                                {formattedDate}
                                                            </p>
                                                            <span className="text-muted-foreground">•</span>
                                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                <Clock className="h-3 w-3" />
                                                                {readingTime} min read
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={handleSave}
                                                    >
                                                        <Bookmark
                                                            className={`h-5 w-5 ${isSaved ? "fill-indigo-500 text-indigo-500" : ""}`}
                                                        />
                                                    </Button>
                                                    <Button variant="ghost" size="icon">
                                                        <Share2 className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <DialogTitle className="text-3xl font-bold mb-4">
                                                {title}
                                            </DialogTitle>
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
                                                    className={`h-5 w-5 ${isLiked ? "fill-red-500 stroke-red-500" : "stroke-gray-500"
                                                        }`}
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

                {/* Comment Modal */}
                <CommentModal
                    isOpen={isCommentModalOpen}
                    onClose={() => setIsCommentModalOpen(false)}
                    comments={blogComments}
                    blogId={_id}
                    onCommentSubmit={handleSubmitComment}
                    currentUser={userInfo ? {
                        _id: userInfo._id,
                        username: userInfo.username,
                        profilePicture: userInfo.profilePicture?.url || ""
                    } : undefined}
                />
            </>
        );
    }
};