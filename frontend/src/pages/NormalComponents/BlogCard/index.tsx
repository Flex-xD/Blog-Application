import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, ArrowRight, Bookmark, Clock } from "lucide-react";
import { useState, useEffect, useCallback, memo } from "react";
import { Card } from "@/components/ui/card";
import useLikeMutation from "@/customHooks/LikeBlogMutation";
import useUnLikeMutation from "@/customHooks/UnlikeBlogMutation";
import useSaveBlogMutation from "@/customHooks/SaveBlogMutation";
import useUnsaveBlogMutation from "@/customHooks/unsaveBlog";
import { useUserProfileData } from "@/customHooks/UserDataFetching";
import { CommentModal } from "./components/CommentModal";
import type { TUserComment } from "@/types";

export interface BlogCardProps {
    _id: string;
    title: string;
    body: string;
    image: { url: string; publicId: string; width: number; height: number; format: string };
    authorDetails: { username: string; _id: string; profilePicture: string };
    likes: string[];
    comments: TUserComment[];
    createdAt: Date;
    onSave?: (id: string) => void;
    isInitiallySaved?: boolean;
    isSaveLoading?: boolean;
}

/* The card is a link now, not a click target that opens the article in a dialog.
   A post has a URL, so the whole card navigates to it and the title is the real
   <a> — one tab stop, real link semantics, middle-click works, and the browser's
   back button returns the reader to their place in the feed.

   The link is stretched over the card with an ::after overlay instead of wrapping
   the card in <a>, because the card contains buttons and an <a> around a <button>
   is invalid and swallows keyboard focus. Interactive children sit at z-10. */
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
    isSaveLoading = false,
}) => {
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(isInitiallySaved);
    const [currentLikes, setCurrentLikes] = useState<string[]>(likes);
    const [blogComments, setBlogComments] = useState<TUserComment[]>(comments);
    const { data: userInfo } = useUserProfileData();

    useEffect(() => setIsSaved(isInitiallySaved), [isInitiallySaved]);

    const isLiked = React.useMemo(
        () => currentLikes.includes(userInfo?._id ?? ""),
        [currentLikes, userInfo?._id]
    );

    const { mutateAsync: handleBlogLike } = useLikeMutation(userInfo?._id ?? "");
    const { mutateAsync: handleBlogUnlike } = useUnLikeMutation(userInfo?._id ?? "");
    const { mutate: saveBlogMutation, isPending: isSaving } = useSaveBlogMutation(_id, userInfo?._id ?? "");
    const { mutate: unsaveBlogMutation, isPending: isUnsaving } = useUnsaveBlogMutation(_id, userInfo?._id ?? "");

    const handleLikeAndUnlike = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (!userInfo?._id) return;
            if (isLiked) {
                await handleBlogUnlike(_id);
                setCurrentLikes((prev) => prev.filter((id) => id !== userInfo._id));
            } else {
                await handleBlogLike(_id);
                setCurrentLikes((prev) => [...prev, userInfo._id]);
            }
        },
        [isLiked, userInfo?._id, handleBlogLike, handleBlogUnlike, _id]
    );

    const handleSave = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const newSavedState = !isSaved;
            setIsSaved(newSavedState);

            if (newSavedState) saveBlogMutation();
            else unsaveBlogMutation();

            window.dispatchEvent(new CustomEvent("blogSaved", { detail: { blogId: _id, isSaved: newSavedState } }));
        },
        [isSaved, saveBlogMutation, unsaveBlogMutation, _id]
    );

    const openCommentModal = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsCommentModalOpen(true);
    }, []);

    const formattedDate = React.useMemo(
        () => new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        [createdAt]
    );

    const readingTime = React.useMemo(
        () => Math.max(1, Math.ceil(body.split(" ").filter(Boolean).length / 200)),
        [body]
    );
    const isSaveLoadingCombined = isSaveLoading || isSaving || isUnsaving;

    return (
        <>
            {/* One hover response only: the border darkens. No lift, no image zoom, no
                title color change — those were three answers to the same question. */}
            <Card className="group relative overflow-hidden py-0 shadow-none transition-colors hover:border-foreground/25">
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
                                    <AvatarImage src={authorDetails.profilePicture} className="h-full w-full object-cover" alt="" />
                                    <AvatarFallback className="flex items-center justify-center bg-muted font-medium text-muted-foreground">
                                        {(authorDetails?.username?.[0] || "").toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">{authorDetails.username}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-muted-foreground">{formattedDate}</p>
                                        <span className="text-muted-foreground">•</span>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" /> {readingTime} min read
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative z-10 h-8 w-8"
                                onClick={handleSave}
                                disabled={isSaveLoadingCombined}
                                aria-label={isSaved ? "Remove from saved" : "Save post"}
                                aria-pressed={isSaved}
                            >
                                <Bookmark className={`h-4 w-4 ${isSaved ? "fill-foreground text-foreground" : "text-muted-foreground"}`} />
                            </Button>
                        </div>

                        {/* Serif, larger, semibold: the title is the one thing this card
                            is for — and now it is also the link. */}
                        <h3 className="mb-2 text-2xl font-semibold leading-snug">
                            <Link
                                to={`/blog/${_id}`}
                                className="block line-clamp-2 outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring"
                            >
                                {title}
                            </Link>
                        </h3>
                        <p className="mb-4 text-[0.9375rem] leading-relaxed text-muted-foreground line-clamp-2">{body}</p>

                        <div className="relative z-10 mt-auto flex items-center justify-between border-t border-border pt-4">
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-2 rounded-full px-3 text-sm"
                                    onClick={handleLikeAndUnlike}
                                    aria-pressed={isLiked}
                                    aria-label={isLiked ? "Unlike this post" : "Like this post"}
                                >
                                    <Heart className={`h-5 w-5 ${isLiked ? "fill-foreground text-foreground" : "text-muted-foreground"}`} />
                                    <span>{currentLikes.length} likes</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-2 rounded-full px-3 text-sm"
                                    onClick={openCommentModal}
                                    aria-label={`Comments (${blogComments.length})`}
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    <span>{blogComments.length}</span>
                                </Button>
                            </div>
                            {/* Not a button any more: the whole card is the link, and a
                                second control pointing at the same place was the dead
                                affordance — it had no handler at all. */}
                            <span className="flex items-center gap-2 text-sm text-muted-foreground" aria-hidden="true">
                                Read more
                                <ArrowRight className="h-4 w-4" />
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

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

export const BlogCard = memo(BlogCardComponent);
