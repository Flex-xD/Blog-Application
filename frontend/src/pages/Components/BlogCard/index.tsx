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
import type { IUser } from "@/types";

interface BlogCardProps {
    _id: string
    title: string;
    body: string;
    image: string;
    author: IUser
    likes: string[];
    comments: string[];
    createdAt: Date;
    updatedAt: Date;
    onLike?: (id: string) => void;
    onSave?: (id: string) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({
    _id,
    title,
    body,
    author,
    image,
    likes,
    comments,
    createdAt,
    onLike,
    onSave,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [currentLikes, setCurrentLikes] = useState(likes);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setCurrentLikes;
        // e.stopPropagation();
        // const newLikeStatus = !isLiked;
        // setIsLiked(newLikeStatus);
        // setCurrentLikes(newLikeStatus ? currentLikes + 1 : currentLikes - 1);
        // if (onLike) onLike(_id);
    };

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSaved(!isSaved);
        if (onSave) onSave(_id);
    };

    const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const readingTime = Math.ceil(body.split(" ").length / 200); // 200 wpm

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
                                    src={image}
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
                                        <AvatarImage src={author.profilePicture} />
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600">
                                            {(author?.username?.[0] || "").toUpperCase()
                                            }
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{author.username}</p>
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
                                        onClick={handleLike}
                                    >
                                        <Heart
                                            className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                                        />
                                        <span>{currentLikes.length}</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-3 gap-2 text-sm rounded-full"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        <span>{comments.length}</span>
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
                                            src={image}
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
                                                    <AvatarImage src={author.profilePicture} />
                                                    <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600">
                                                        {(author?.username?.[0] || "").toUpperCase()
                                                        }
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{author.username}</p>
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
                                            onClick={handleLike}
                                        >
                                            <Heart
                                                className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                                            />
                                            <span>{currentLikes.length} likes</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="flex items-center space-x-2"
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                            <span>{comments.length} comments</span>
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>
        </>
    );
};