import useExhibitPosts from "@/customHooks/ExhibitPosts";
import PostExhibit from "@/pages/NormalComponents/PostExhibit";

const FeaturedPosts = () => {
    const { posts, isPending, isSample } = useExhibitPosts(3);

    return (
        <section
            id="featured"
            aria-labelledby="featured-heading"
            className="border-t border-border py-12 md:py-16"
        >
            <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2
                    id="featured-heading"
                    className="text-2xl md:text-3xl"
                >
                    {isSample ? "A taste of Blogcraft" : "Published recently"}
                </h2>

                <p className="text-sm text-muted-foreground">
                    {isSample
                        ? "A few stories to show you what's possible"
                        : "Ranked by how readers responded"}
                </p>
            </div>

            {isPending ? (
                <div className="grid gap-6 md:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-border bg-card p-5"
                        >
                            <div className="h-7 w-28 animate-pulse rounded bg-muted" />
                            <div className="mt-4 h-6 w-3/4 animate-pulse rounded bg-muted" />
                            <div className="mt-3 space-y-2">
                                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                                <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : posts.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-3">
                    {posts.map((post) => (
                        <PostExhibit
                            key={post.id}
                            post={post}
                            // variant="card"
                        />
                    ))}
                </div>
            ) : (
                <p className="font-serif text-lg text-muted-foreground">
                    No posts yet — yours could be the first.
                </p>
            )}
        </section>
    );
};

export default FeaturedPosts;
