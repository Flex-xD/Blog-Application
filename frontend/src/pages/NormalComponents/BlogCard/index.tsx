import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Heart,
    MessageCircle,
    ArrowRight,
    Bookmark,
    Clock,
    Trash,
} from "lucide-react";
import { useState, useEffect, useCallback, memo } from "react";
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
    onSave?: (id: string) => void;
    isInitiallySaved?: boolean;
    onBlogDeleted?: () => void;
    isSaveLoading?: boolean;
}

const BlogCardComponent: React.FC<BlogCardProps> = ({
    _id,
    title,
    body,
    authorDetails,
    image,
    likes,
    comments,
    createdAt,
    isInitiallySaved = false,
    onBlogDeleted,
    isSaveLoading = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCommentModalOpen, setIsCommentModalOpen] =
        useState(false);
    const [isSaved, setIsSaved] = useState(isInitiallySaved);
    const [currentLikes, setCurrentLikes] =
        useState<string[]>(likes);
    const [blogComments, setBlogComments] =
        useState<any[]>(comments);

    const { data: userInfo } = useUserProfileData();

    useEffect(() => {
        setIsSaved(isInitiallySaved);
    }, [isInitiallySaved]);

    const isLiked = React.useMemo(
        () => currentLikes.includes(userInfo?._id ?? ""),
        [currentLikes, userInfo?._id]
    );

    const { mutateAsync: handleBlogLike } =
        useLikeMutation(userInfo!._id);

    const { mutateAsync: handleBlogUnlike } =
        useUnLikeMutation(userInfo!._id);

    const {
        mutate: saveBlogMutation,
        isPending: isSaving,
    } = useSaveBlogMutation(_id, userInfo!._id);

    const {
        mutate: unsaveBlogMutation,
        isPending: isUnsaving,
    } = useUnsaveBlogMutation(_id, userInfo!._id);

    const {
        mutate: deleteBlogMutation,
        isPending: isDeleting,
    } = useDeleteBlogMutation(_id, userInfo!._id);

    const handleLikeAndUnlike = useCallback(
        async (e: React.MouseEvent) => {
            e.stopPropagation();

            if (!userInfo?._id) return;

            if (isLiked) {
                await handleBlogUnlike(_id);

                setCurrentLikes((prev) =>
                    prev.filter((id) => id !== userInfo._id)
                );
            } else {
                await handleBlogLike(_id);

                setCurrentLikes((prev) => [
                    ...prev,
                    userInfo._id,
                ]);
            }
        },
        [
            isLiked,
            userInfo?._id,
            handleBlogLike,
            handleBlogUnlike,
            _id,
        ]
    );

    const handleSave = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();

            const newSavedState = !isSaved;

            setIsSaved(newSavedState);

            if (newSavedState) {
                saveBlogMutation();
            } else {
                unsaveBlogMutation();
            }

            window.dispatchEvent(
                new CustomEvent("blogSaved", {
                    detail: {
                        blogId: _id,
                        isSaved: newSavedState,
                    },
                })
            );
        },
        [
            isSaved,
            saveBlogMutation,
            unsaveBlogMutation,
            _id,
        ]
    );

    const handleBlogDelete = useCallback(
        (e?: React.MouseEvent) => {
            e?.stopPropagation();

            if (
                !userInfo?._id ||
                userInfo._id !== authorDetails._id
            ) {
                return;
            }

            deleteBlogMutation(undefined, {
                onSuccess: () => {
                    setIsExpanded(false);
                    onBlogDeleted?.();

                    window.dispatchEvent(
                        new CustomEvent("refreshAllFeeds")
                    );
                },
            });
        },
        [
            userInfo?._id,
            authorDetails._id,
            deleteBlogMutation,
            onBlogDeleted,
        ]
    );

    const openCommentModal = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            setIsCommentModalOpen(true);
        },
        []
    );

    const formattedDate = React.useMemo(
        () =>
            new Date(createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            }),
        [createdAt]
    );

    const readingTime = React.useMemo(
        () => Math.ceil(body.split(" ").length / 200),
        [body]
    );

    const isSaveLoadingCombined =
        isSaveLoading || isSaving || isUnsaving;

    return (
        <>
            <div
                onClick={() => setIsExpanded(true)}
                className="cursor-pointer"
            >
                <Card className="group overflow-hidden py-0 shadow-none transition-colors hover:border-foreground/25">
                    <div className="flex flex-col md:flex-row">
                        {image && (
                            <div className="relative h-48 w-full overflow-hidden md:h-auto md:w-64">
                                <img
                                    src={image.url}
                                    alt={title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}

                        <div className="flex flex-1 flex-col p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-8 overflow-hidden">
                                        <AvatarImage
                                            src={
                                                authorDetails.profilePicture
                                            }
                                            className="h-full w-full object-cover"
                                            alt=""
                                        />

                                        <AvatarFallback className="flex items-center justify-center bg-muted font-medium text-muted-foreground">
                                            {(
                                                authorDetails?.username?.[0] ||
                                                ""
                                            ).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <p className="text-sm font-medium">
                                            {authorDetails.username}
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-muted-foreground">
                                                {formattedDate}
                                            </p>

                                            <span className="text-muted-foreground">
                                                •
                                            </span>

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
                                    disabled={
                                        isSaveLoadingCombined
                                    }
                                    aria-label={
                                        isSaved
                                            ? "Remove from saved"
                                            : "Save post"
                                    }
                                >
                                    <Bookmark
                                        className={`h-4 w-4 ${
                                            isSaved
                                                ? "fill-foreground text-foreground"
                                                : "text-muted-foreground"
                                        }`}
                                    />
                                </Button>
                            </div>

                            <h3 className="mb-2 line-clamp-2 text-2xl font-semibold leading-snug">
                                {title}
                            </h3>

                            <p className="mb-4 line-clamp-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
                                {body}
                            </p>

                            <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 gap-2 rounded-full px-3 text-sm"
                                        onClick={
                                            handleLikeAndUnlike
                                        }
                                        aria-pressed={isLiked}
                                    >
                                        <Heart
                                            className={`h-5 w-5 ${
                                                isLiked
                                                    ? "fill-foreground text-foreground"
                                                    : "text-muted-foreground"
                                            }`}
                                        />

                                        <span>
                                            {currentLikes.length} likes
                                        </span>
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 gap-2 rounded-full px-3 text-sm"
                                        onClick={openCommentModal}
                                    >
                                        <MessageCircle className="h-4 w-4" />

                                        <span>
                                            {blogComments.length}
                                        </span>
                                    </Button>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-2 rounded-full px-3 text-sm"
                                >
                                    Read more
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Expanded Blog Modal */}
            <Dialog
                open={isExpanded}
                onOpenChange={setIsExpanded}
            >
                <DialogContent className="max-w-4xl overflow-hidden p-0">
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 20,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -20,
                                }}
                                transition={{
                                    duration: 0.2,
                                }}
                            >
                                {image && (
                                    <div className="relative h-64 w-full overflow-hidden">
                                        <img
                                            src={image.url}
                                            alt={title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="max-h-[calc(100vh-300px)] space-y-6 overflow-y-auto p-8">
                                    <DialogHeader>
                                        <div className="mb-6 flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="size-8 overflow-hidden">
                                                    <AvatarImage
                                                        src={
                                                            authorDetails.profilePicture
                                                        }
                                                        className="h-full w-full object-cover"
                                                        alt=""
                                                    />

                                                    <AvatarFallback className="flex items-center justify-center bg-muted font-medium text-muted-foreground">
                                                        {(
                                                            authorDetails?.username?.[0] ||
                                                            ""
                                                        ).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div>
                                                    <p className="font-medium">
                                                        {
                                                            authorDetails.username
                                                        }
                                                    </p>

                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm text-muted-foreground">
                                                            {
                                                                formattedDate
                                                            }
                                                        </p>

                                                        <span className="text-muted-foreground">
                                                            •
                                                        </span>

                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Clock className="h-3 w-3" />
                                                            {
                                                                readingTime
                                                            }{" "}
                                                            min read
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={
                                                        handleSave
                                                    }
                                                    disabled={
                                                        isSaveLoadingCombined
                                                    }
                                                    aria-label={
                                                        isSaved
                                                            ? "Remove from saved"
                                                            : "Save post"
                                                    }
                                                >
                                                    <Bookmark
                                                        className={`h-5 w-5 ${
                                                            isSaved
                                                                ? "fill-foreground text-foreground"
                                                                : "text-muted-foreground"
                                                        }`}
                                                    />
                                                </Button>

                                                {userInfo?._id ===
                                                    authorDetails._id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={
                                                            handleBlogDelete
                                                        }
                                                        disabled={
                                                            isDeleting
                                                        }
                                                        aria-label="Delete post"
                                                    >
                                                        <Trash className="h-5 w-5 text-destructive" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        <DialogTitle className="mb-4 text-3xl font-semibold leading-tight">
                                            {title}
                                        </DialogTitle>
                                    </DialogHeader>

                                    <div className="max-w-[68ch] font-serif text-[1.0625rem] leading-[1.7]">
                                        {body
                                            .split("\n")
                                            .map((p, i) => (
                                                <p
                                                    key={i}
                                                    className="mb-4 last:mb-0"
                                                >
                                                    {p}
                                                </p>
                                            ))}
                                    </div>

                                    <div className="flex space-x-4 border-t border-border pt-6">
                                        <Button
                                            variant="ghost"
                                            className="flex items-center space-x-2"
                                            onClick={
                                                handleLikeAndUnlike
                                            }
                                            aria-pressed={isLiked}
                                        >
                                            <Heart
                                                className={`h-5 w-5 ${
                                                    isLiked
                                                        ? "fill-foreground text-foreground"
                                                        : "text-muted-foreground"
                                                }`}
                                            />

                                            <span>
                                                {currentLikes.length} likes
                                            </span>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            className="flex items-center space-x-2"
                                            onClick={
                                                openCommentModal
                                            }
                                        >
                                            <MessageCircle className="h-5 w-5" />

                                            <span>
                                                {blogComments.length}{" "}
                                                comments
                                            </span>
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
                    onClose={() =>
                        setIsCommentModalOpen(false)
                    }
                    setBlogComments={setBlogComments}
                    comments={blogComments}
                    blogId={_id}
                />
            )}
        </>
    );
};

export const BlogCard = memo(BlogCardComponent);