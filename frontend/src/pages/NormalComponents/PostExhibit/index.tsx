import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle } from "lucide-react";

/**
 * Read-only exhibit card, shared by the landing page and /auth.
 * Deliberately NOT BlogCard: that one carries like/save/delete mutations, and every
 * one of them would 401 for the signed-out visitor both of these pages are aimed at.
 *
 * `isSample` controls one thing and one thing only: whether the card claims to be
 * something someone actually published. Sample posts lose their date and their
 * counters and get a "Sample" chip instead — fabricated engagement numbers on
 * placeholder content is the cheapest way to lose a reader's trust.
 */
export interface IExhibitPost {
    id: string;
    title: string;
    body: string;
    author: string;
    avatarUrl?: string | null;
    /** ISO date for real posts, null for samples. */
    date: string | null;
    likesCount: number | null;
    commentsCount: number | null;
    isSample: boolean;
}

interface PostExhibitProps {
    post: IExhibitPost;
    /** "grid" = one of three landing cells; "single" = the one card beside the auth form. */
    variant?: "grid" | "single";
}

const PostExhibit = ({ post, variant = "grid" }: PostExhibitProps) => {
    const isSingle = variant === "single";
    const published = post.date
        ? new Date(post.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : null;

    return (
        <article
            className={
                isSingle
                    ? "rounded-lg border border-border bg-card p-6"
                    : "flex h-full flex-col rounded-lg border border-border bg-card p-5"
            }
        >
            <div className="flex items-center gap-2.5">
                <Avatar className="h-7 w-7">
                    <AvatarImage src={post.avatarUrl ?? undefined} className="object-cover" alt="" />
                    <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                        {(post.author[0] ?? "").toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <span className="truncate text-sm font-medium">{post.author}</span>

                <span className="ml-auto shrink-0">
                    {post.isSample ? (
                        <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                            Sample
                        </span>
                    ) : (
                        <span className="text-sm text-muted-foreground">{published}</span>
                    )}
                </span>
            </div>

            <h3
                className={
                    isSingle
                        ? "mt-4 font-serif text-2xl leading-snug"
                        : "mt-3 font-serif text-xl leading-snug"
                }
            >
                {post.title}
            </h3>
            <p
                className={
                    isSingle
                        ? "mt-3 font-serif leading-relaxed text-muted-foreground"
                        : "mt-2 line-clamp-3 font-serif leading-relaxed text-muted-foreground"
                }
            >
                {post.body}
            </p>

            {/* Counts are text, not buttons: these pages exhibit, they never mutate.
                Samples have none, because there is nothing real to count. */}
            {post.likesCount !== null && post.commentsCount !== null && (
                <div
                    className={
                        isSingle
                            ? "mt-5 flex items-center gap-4 text-sm text-muted-foreground"
                            : "mt-4 flex items-center gap-4 text-sm text-muted-foreground"
                    }
                >
                    <span className="flex items-center gap-1.5">
                        <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                        {post.likesCount}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        {post.commentsCount}
                    </span>
                </div>
            )}
        </article>
    );
};

export default PostExhibit;