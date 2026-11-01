import React from "react";
import { AlertCircle, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import useTrendingTopics from "@/customHooks/TrendingTopicsFetching";

interface TrendingTopic {
    id: string;
    name: string;
    postCount: number;
    growth?: number;
}

interface RightSidebarProps {
    className?: string;
}

const formatCount = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

const TrendingSkeleton: React.FC = () => (
    <div className="mt-3 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
            <div
                key={index}
                className="flex animate-pulse items-center gap-3"
            >
                <div className="h-4 w-4 rounded bg-muted" />
                <div className="h-4 flex-1 rounded bg-muted" />
                <div className="h-4 w-14 rounded bg-muted" />
            </div>
        ))}
    </div>
);

const ErrorState: React.FC = () => (
    <div className="mt-4 text-center text-muted-foreground">
        <AlertCircle
            className="mx-auto mb-2 size-6 text-destructive"
            aria-hidden="true"
        />
        <p className="text-sm">Failed to load trending topics</p>
        <p className="mt-1 text-xs">Please try again later</p>
    </div>
);

const RightSidebar: React.FC<RightSidebarProps> = ({ className }) => {
    const { data, isLoading, isError } = useTrendingTopics();

    const trendingTopics: TrendingTopic[] = data?.data || [];

    return (
        <section
            className={cn("border-t border-border pt-6", className)}
            aria-labelledby="trending-heading"
        >
            <h2
                id="trending-heading"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
                Trending topics
            </h2>

            {isLoading ? (
                <TrendingSkeleton />
            ) : isError ? (
                <ErrorState />
            ) : trendingTopics.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                    No trends yet — check back later.
                </p>
            ) : (
                <ol className="mt-2">
                    {trendingTopics.map((topic, index) => (
                        <li
                            key={topic.id}
                            className="border-b border-border/60 last:border-b-0"
                        >
                            <div className="flex items-baseline gap-3 py-2.5">
                                <span className="w-4 flex-shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
                                    {index + 1}
                                </span>

                                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                                    #{topic.name}
                                </span>

                                {typeof topic.growth === "number" && (
                                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                                        <ArrowUp
                                            className={cn(
                                                "size-3",
                                                topic.growth < 0 &&
                                                    "rotate-180"
                                            )}
                                            aria-hidden="true"
                                        />
                                        {Math.abs(topic.growth)}%
                                    </span>
                                )}

                                <span className="flex-shrink-0 text-xs text-muted-foreground">
                                    {formatCount(topic.postCount)} posts
                                </span>
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
};

export default RightSidebar;