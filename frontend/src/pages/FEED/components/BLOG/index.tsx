import * as React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface BlogCardProps {
    id: string;
    title: string;
    body: string;
    author: {
        name: string;
        avatar?: string;
    };
    image?: string;
    likes: number;
    comments: number;
    publishedAt: string;
    onLike?: (id: string) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({
    id,
    title,
    body,
    author,
    image,
    likes,
    comments,
    publishedAt,
    onLike,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [currentLikes, setCurrentLikes] = useState(likes);

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newLikeStatus = !isLiked;
        setIsLiked(newLikeStatus);
        setCurrentLikes(newLikeStatus ? currentLikes + 1 : currentLikes - 1);
        if (onLike) onLike(id);
    };

    const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });


    return (
        <>
            <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => setIsExpanded(true)}
                className="cursor-pointer"
            >
                <div className="flex flex-col md:flex-row border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-background">
                    {image && (
                        <div className="hidden md:block relative w-full md:w-48 lg:w-64 h-48 md:h-auto">
                            <img
                                src={image}
                                alt={title}
                                className="object-cover w-full h-full"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>
                    )}

                    <div className="flex-1 p-4 md:p-6 flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={author.avatar} />
                                <AvatarFallback>
                                    {author.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">{author.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formattedDate}
                                </p>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold line-clamp-2 mb-2">{title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {body}
                        </p>

                        <div className="mt-auto flex justify-between items-center">
                            <div className="flex gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 gap-1 text-sm"
                                    onClick={handleLike}
                                >
                                    <Heart
                                        className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                                    />
                                    <span>{currentLikes}</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 gap-1 text-sm"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    <span>{comments}</span>
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1 text-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(true);
                                }}
                            >
                                Read more
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

                    {/* Expanded Modal View */}
            <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden">
                    {image && (
                        <div className="relative h-48 w-full">
                            <img
                                src={image}
                                alt={title}
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>
                    )}

                    <div className="p-6 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                        <DialogHeader>
                            <div className="flex items-center space-x-3 mb-4">
                                <Avatar>
                                    <AvatarImage src={author.avatar} />
                                    <AvatarFallback>
                                        {author.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{author.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formattedDate}
                                    </p>
                                </div>
                            </div>
                            <DialogTitle className="text-2xl">{title}</DialogTitle>
                        </DialogHeader>

                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            {body.split("\n").map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>

                        <div className="flex space-x-4 pt-4 border-t">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center space-x-1"
                                onClick={handleLike}
                            >
                                <Heart
                                    className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                                />
                                <span>{currentLikes} likes</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center space-x-1"
                            >
                                <MessageCircle className="h-4 w-4" />
                                <span>{comments} comments</span>
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};