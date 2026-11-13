import { BlogCard } from "@/pages/NormalComponents/BlogCard";
import { Loader2, RefreshCw, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Pagination } from "../Pagination";
import type { AxiosError } from "axios";
import type { TUserComment } from "@/types";

interface Blog {
    _id: string;
    title: string;
    body: string;
    image:
        | string
        | {
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
    comments: TUserComment[];
    createdAt: Date;
    updatedAt: Date;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
    nextPage: number | null;
    prevPage: number | null;
}

interface UserFeedData {
    data: {
        blogs: Blog[];
        pagination: PaginationInfo;
    };
}

interface UserFeedProps {
    userFeedData?: UserFeedData;
    userFeedDataError?: AxiosError | Error | null | undefined;
    userDataPending: boolean;
    userFeedDataPending: boolean;

    onPageChange?: (page: number) => void;
    currentPage?: number;

    onRefresh?: () => void;

    showRefresh?: boolean;


    onLoadMore?: () => void;
    newPostCount?: number;
    onShowNewPosts?: () => void;

    feedTitle?: string;
}

const getBlogs = (userFeedData?: UserFeedData): Blog[] => {
    return userFeedData?.data?.blogs || [];
};

const getPagination = (
    userFeedData?: UserFeedData
): PaginationInfo | null => {
    if (!userFeedData?.data?.pagination) return null;
    return userFeedData.data.pagination;
};

const getCurrentPage = (userFeedData?: UserFeedData): number => {
    return getPagination(userFeedData)?.page || 1;
};

const getTotalPages = (userFeedData?: UserFeedData): number => {
    return getPagination(userFeedData)?.totalPages || 1;
};

function UserFeed({
    userFeedData,
    userFeedDataError,
    userDataPending,
    userFeedDataPending,
    onPageChange,
    onRefresh,
    showRefresh = true,
    onLoadMore,
    newPostCount = 0,
    onShowNewPosts,
    feedTitle,
}: UserFeedProps) {
    const [showScrollTop, setShowScrollTop] = useState(false);

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const blogs = useMemo(
        () => getBlogs(userFeedData),
        [userFeedData]
    );

    const pagination = getPagination(userFeedData);

    const totalPages = useMemo(
        () => getTotalPages(userFeedData),
        [userFeedData]
    );

    const feedCurrentPage = getCurrentPage(userFeedData);

    const hasMore = pagination?.hasMore ?? false;

    const handleRefresh = () => onRefresh?.();

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        onPageChange?.(page);
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };

        window.addEventListener("scroll", handleScroll, {
            passive: true,
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, [feedCurrentPage]);

    useEffect(() => {
        if (!onLoadMore || !hasMore) return;

        const node = sentinelRef.current;

        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    onLoadMore();
                }
            },
            {
                rootMargin: "600px 0px",
            }
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [onLoadMore, hasMore, blogs.length]);

    if (userDataPending && blogs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                <Loader2
                    className="size-6 animate-spin"
                    aria-hidden="true"
                />
                <p className="text-sm">Loading feed…</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {feedTitle && (
                <div className="flex items-center justify-between gap-3">
                    <h2 className="font-serif text-lg font-semibold">
                        {feedTitle}
                    </h2>

                    {showRefresh && onRefresh && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={userFeedDataPending}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    userFeedDataPending
                                        ? "animate-spin"
                                        : ""
                                }`}
                                aria-hidden="true"
                            />
                            Refresh
                        </Button>
                    )}
                </div>
            )}

            {userFeedDataError && (
                <div className="py-8 text-center">
                    <p className="mb-4 text-sm text-destructive">
                        Error loading feed:{" "}
                        {userFeedDataError.message || "Unknown error"}

                        {(userFeedDataError as AxiosError)?.response
                            ?.status && (
                            <span>
                                {" "}
                                (Status:{" "}
                                {
                                    (userFeedDataError as AxiosError)
                                        .response!.status
                                }
                                )
                            </span>
                        )}
                    </p>

                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                    >
                        Retry
                    </Button>
                </div>
            )}

            {!userFeedDataError && (
                <>
                    {blogs.length > 0 ? (
                        <>
                            {newPostCount > 0 && onShowNewPosts && (
                                <button
                                    type="button"
                                    onClick={onShowNewPosts}
                                    className="sticky top-14 z-30 mx-auto flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                                >
                                    <ArrowUp
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    {newPostCount} new{" "}
                                    {newPostCount === 1
                                        ? "post"
                                        : "posts"}
                                </button>
                            )}

                            <div className="space-y-6">
                                {blogs.map((blog, index) => (
                                    <BlogCard
                                        key={
                                            blog._id ||
                                            `blog-${index}`
                                        }
                                        {...blog}
                                        image={
                                            typeof blog.image ===
                                            "string"
                                                ? {
                                                      url: blog.image,
                                                      publicId: "",
                                                      width: 0,
                                                      height: 0,
                                                      format: "",
                                                  }
                                                : blog.image
                                        }
                                        authorDetails={{
                                            ...blog.authorDetails,
                                        }}
                                    />
                                ))}
                            </div>

                            {onLoadMore && (
                                <div
                                    ref={sentinelRef}
                                    className="flex h-12 items-center justify-center"
                                    aria-hidden="true"
                                >
                                    {userFeedDataPending && (
                                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                    )}
                                </div>
                            )}

                            {onPageChange && totalPages > 1 && (
                                <Pagination
                                    currentPage={feedCurrentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                    className="mt-8"
                                />
                            )}
                        </>
                    ) : userFeedDataPending ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2
                                className="size-8 animate-spin text-muted-foreground"
                                aria-hidden="true"
                            />
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-muted-foreground">
                                No blogs available
                            </p>

                            <Button
                                variant="outline"
                                onClick={handleRefresh}
                                className="mt-4"
                            >
                                Try Again
                            </Button>
                        </div>
                    )}
                </>
            )}

            {showScrollTop && (
                <div className="fixed bottom-6 left-6 z-50">
                    <Button
                        onClick={scrollToTop}
                        size="icon"
                        variant="outline"
                        aria-label="Scroll back to top"
                        className="size-12 rounded-full bg-card"
                    >
                        <ArrowUp
                            className="size-5"
                            aria-hidden="true"
                        />
                    </Button>
                </div>
            )}
        </div>
    );
}

export default React.memo(UserFeed);
