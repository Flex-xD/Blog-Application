import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, Heart, MessageCircle, Send, Trash, Loader2 } from "lucide-react";
import Navbar from "@/pages/NormalComponents/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSingleBlogData } from "@/customHooks/SingleBlog";
import { useUserProfileData } from "@/customHooks/UserDataFetching";
import useLikeMutation from "@/customHooks/LikeBlogMutation";
import useUnLikeMutation from "@/customHooks/UnlikeBlogMutation";
import useSaveBlogMutation from "@/customHooks/SaveBlogMutation";
import useUnsaveBlogMutation from "@/customHooks/unsaveBlog";
import useDeleteBlogMutation from "@/customHooks/DeleteBlogMutation";
import useCommentMutation from "@/customHooks/CommentOnBlog";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { TUserComment } from "@/types";

/* The post page (decision record): this is a READING surface, not an exhibit.
   Title, byline, body, comments — one column, 42rem, body measure 68ch.
   No gold except the comment submit: gold marks a commit action, and on this
   page the only thing you commit is a comment.

   Reading is public. Everything that writes still needs a session, so the
   actions simply are not there for a signed-out reader instead of being
   rendered dead — a button that 401s is worse than no button. */

const formatDate = (value: Date | string | undefined) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const formatCommentDate = (value: Date | string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const PostPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: blog, isPending, isError } = useSingleBlogData(id);
    const { data: userInfo } = useUserProfileData();
    const userId = userInfo?._id ?? "";

    const { mutateAsync: likeBlog } = useLikeMutation(userId);
    const { mutateAsync: unlikeBlog } = useUnLikeMutation(userId);
    const { mutate: saveBlog, isPending: isSaving } = useSaveBlogMutation(id ?? "", userId);
    const { mutate: unsaveBlog, isPending: isUnsaving } = useUnsaveBlogMutation(id ?? "", userId);
    const { mutate: deleteBlog, isPending: isDeleting } = useDeleteBlogMutation(id ?? "", userId);

    const [likes, setLikes] = useState<string[]>([]);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setLikes(blog?.likes ?? []);
    }, [blog]);

    const [newComment, setNewComment] = useState("");

    const comments: TUserComment[] = blog?.comments ?? [];
    const isLiked = likes.includes(userId);
    const isAuthor = Boolean(blog && userId && blog.authorDetails._id === userId);

    const { mutateAsync: commentMutation } = useCommentMutation(id ?? "", {
        username: userInfo?.username ?? "",
        profilePicture: userInfo?.profilePicture?.url,
        _id: userId,
    });

    const readingTime = useMemo(() => {
        const words = blog?.body?.trim().split(/\s+/).filter(Boolean).length ?? 0;
        return Math.max(1, Math.ceil(words / 200));
    }, [blog?.body]);

    const paragraphs = useMemo(
        () => (blog?.body ?? "").split("\n").filter((paragraph) => paragraph.trim().length > 0),
        [blog?.body]
    );

    const handleLike = useCallback(async () => {
        if (!userId) return;
        if (isLiked) {
            setLikes((prev) => prev.filter((likerId) => likerId !== userId));
            await unlikeBlog(id ?? "");
        } else {
            setLikes((prev) => [...prev, userId]);
            await likeBlog(id ?? "");
        }
    }, [userId, isLiked, likeBlog, unlikeBlog, id]);

    const handleSave = useCallback(() => {
        if (!userId) return;
        const next = !isSaved;
        setIsSaved(next);
        if (next) saveBlog();
        else unsaveBlog();
    }, [userId, isSaved, saveBlog, unsaveBlog]);

    const handleDelete = useCallback(() => {
        deleteBlog(undefined, { onSuccess: () => navigate("/feed") });
    }, [deleteBlog, navigate]);

    const handleComment = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault();
            const body = newComment.trim();
            if (!body || !userId) return;

            setNewComment("");
            try {
                await commentMutation({ commentBody: body });
                await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BLOGS.BY_ID(id ?? "") });
            } catch {
                /* The mutation already surfaces the failure through a toast; the
                   composer stays empty so the reader can retype without losing
                   whatever was typed into a modal that closed on them. */
            }
        },
        [newComment, userId, commentMutation, queryClient, id]
    );

    if (isPending) {
        return (
            <>
                <Navbar />
                <main className="mx-auto w-full max-w-[42rem] px-6 pb-24 pt-12">
                    <div className="animate-pulse space-y-4" aria-hidden="true">
                        <div className="h-3 w-24 rounded-sm bg-muted" />
                        <div className="h-10 w-full rounded-sm bg-muted" />
                        <div className="h-10 w-2/3 rounded-sm bg-muted" />
                        <div className="h-3 w-48 rounded-sm bg-muted" />
                        <div className="space-y-3 pt-8">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="h-4 w-full rounded-sm bg-muted" />
                            ))}
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (isError || !blog) {
        return (
            <>
                <Navbar />
                <main className="mx-auto w-full max-w-[42rem] px-6 pb-24 pt-24 text-center">
                    <h1 className="font-serif text-3xl tracking-tight">This post isn't here</h1>
                    <p className="mx-auto mt-3 max-w-[46ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
                        It may have been deleted, or the link may be mistyped.
                    </p>
                    <div className="mt-6 flex justify-center gap-2">
                        <Button variant="ghost" asChild>
                            <Link to="/feed">Back to feed</Link>
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link to="/">Home</Link>
                        </Button>
                    </div>
                </main>
            </>
        );
    }

    const postedOn = formatDate(blog.createdAt);

    return (
        <>
            <Navbar />
            <main className="mx-auto w-full max-w-[42rem] px-6 pb-24 pt-10">
                {/* Signing in first: the way out of a post you arrived at from a
                    shared link is whatever you can actually reach. */}
                <Button variant="ghost" size="sm" className="-ml-2 gap-2 text-muted-foreground" asChild>
                    <Link to={userId ? "/feed" : "/"}>
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        {userId ? "Feed" : "Home"}
                    </Link>
                </Button>

                <article className="mt-6">
                    <header className="border-b border-border pb-8">
                        <h1 className="font-serif text-4xl font-medium leading-[1.12] tracking-tight md:text-[2.75rem]">
                            {blog.title}
                        </h1>

                        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
                            <Avatar className="size-9 shrink-0">
                                <AvatarImage
                                    src={blog.authorDetails.profilePicture || undefined}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                                <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                                    {(blog.authorDetails.username?.[0] ?? "").toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="text-sm font-medium leading-tight">{blog.authorDetails.username}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {postedOn}
                                    {postedOn && <span aria-hidden="true"> · </span>}
                                    {readingTime} min read
                                </p>
                            </div>
                        </div>
                    </header>

                    {blog.image?.url && (
                        <div className="mt-8 overflow-hidden border border-border">
                            <img
                                src={blog.image.url}
                                alt={blog.title}
                                width={blog.image.width}
                                height={blog.image.height}
                                className="w-full object-cover"
                            />
                        </div>
                    )}

                    {/* Reading typography: Newsreader at 18px on 1.75, held to 68ch.
                        The measure is set here, not inherited, because the page column
                        is wider than either of them. */}
                    <div className="mt-8 max-w-[68ch] font-serif text-[1.125rem] leading-[1.75]">
                        {paragraphs.map((paragraph, index) => (
                            <p key={index} className="mb-5 last:mb-0">
                                {paragraph}
                            </p>
                        ))}
                    </div>

                    <div className="mt-12 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-6">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 rounded-full px-3"
                                onClick={handleLike}
                                disabled={!userId}
                                aria-pressed={isLiked}
                                aria-label={isLiked ? "Unlike this post" : "Like this post"}
                            >
                                <Heart
                                    className={`h-5 w-5 ${isLiked ? "fill-foreground text-foreground" : "text-muted-foreground"}`}
                                    aria-hidden="true"
                                />
                                <span>{likes.length} likes</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 rounded-full px-3"
                                asChild
                            >
                                <a href="#comments">
                                    <MessageCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    <span>{comments.length}</span>
                                </a>
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={handleSave}
                                disabled={!userId || isSaving || isUnsaving}
                                aria-label={isSaved ? "Remove from saved" : "Save post"}
                                aria-pressed={isSaved}
                            >
                                <Bookmark
                                    className={`h-4 w-4 ${isSaved ? "fill-foreground text-foreground" : "text-muted-foreground"}`}
                                    aria-hidden="true"
                                />
                            </Button>

                            {isAuthor && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    aria-label="Delete this post"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-destructive" aria-hidden="true" />
                                    ) : (
                                        <Trash className="h-4 w-4 text-destructive" aria-hidden="true" />
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    {!userId && (
                        <p className="mt-4 text-sm text-muted-foreground">
                            <Link to="/auth" className="underline underline-offset-4 hover:text-foreground">
                                Sign in
                            </Link>{" "}
                            to like, save, or comment on this post.
                        </p>
                    )}
                </article>

                <section id="comments" className="mt-16 border-t border-border pt-10">
                    <h2 className="font-serif text-2xl tracking-tight">
                        Comments <span className="text-muted-foreground">({comments.length})</span>
                    </h2>

                    {userId && (
                        <form onSubmit={handleComment} className="mt-5 flex items-center gap-2">
                            <Input
                                value={newComment}
                                onChange={(event) => setNewComment(event.target.value)}
                                placeholder="Add a comment…"
                                aria-label="Add a comment"
                            />
                            <Button
                                type="submit"
                                size="sm"
                                className="shrink-0"
                                disabled={!newComment.trim()}
                                aria-label="Post comment"
                            >
                                <Send className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        </form>
                    )}

                    {comments.length === 0 ? (
                        <p className="py-10 text-sm text-muted-foreground">
                            No comments yet.{userId ? " Say the first thing." : ""}
                        </p>
                    ) : (
                        <ul className="mt-6 divide-y divide-border">
                            {comments.map((comment, index) => {
                                const posted = formatCommentDate(comment.date);
                                return (
                                    <li key={index} className="flex items-start gap-3 py-4">
                                        <Avatar className="size-8 shrink-0">
                                            <AvatarImage
                                                src={comment.commentAuthor?.profilePicture || undefined}
                                                alt=""
                                            />
                                            <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                                                {(comment.commentAuthor?.username?.[0] ?? "U").toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-sm font-medium">
                                                    {comment.commentAuthor?.username}
                                                </span>
                                                {posted && (
                                                    <span className="text-xs text-muted-foreground">{posted}</span>
                                                )}
                                            </div>
                                            <p className="mt-1 text-sm leading-relaxed">{comment.body}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </main>
        </>
    );
};

export default PostPage;
