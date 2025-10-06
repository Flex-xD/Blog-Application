// components/UserFeed.tsx
import { BlogCard } from "@/pages/Components/BlogCard";
import { motion } from "framer-motion";
import { Loader2, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { InfiniteScroll } from "../InfiniteScrollComponent";
import { Pagination } from "../Pagination";

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
    comments: string[];
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
    userFeedDataError?: Error | null;
    userDataPending: boolean;
    userFeedDataPending: boolean;
    onPageChange?: (page: number) => void;
    onRefresh?: () => void;
    onLoadMore?: () => void; // Add this for infinite scroll
    useInfiniteScroll?: boolean;
    currentPage?: number; // Add this
    hasMore?: boolean; // Add this
}

// Safe access helper functions
const getBlogs = (userFeedData?: UserFeedData): Blog[] => {
    return userFeedData?.data?.blogs || [];
};

const getPagination = (userFeedData?: UserFeedData): PaginationInfo | null => {
    if (!userFeedData?.data?.pagination) return null;
    return userFeedData.data.pagination;
};

const getCurrentPage = (userFeedData?: UserFeedData): number => {
    return getPagination(userFeedData)?.page || 1;
};

const getHasMore = (userFeedData?: UserFeedData): boolean => {
    return getPagination(userFeedData)?.hasMore || false;
};

const getTotalPages = (userFeedData?: UserFeedData): number => {
    return getPagination(userFeedData)?.totalPages || 1;
};

export default function UserFeed({
    userFeedData,
    userFeedDataError,
    userDataPending,
    userFeedDataPending,
    onPageChange,
    onRefresh,
    useInfiniteScroll = false,
}: UserFeedProps) {
    const [localBlogs, setLocalBlogs] = useState<Blog[]>([]);

    useEffect(() => {
        const blogs = getBlogs(userFeedData);
        const currentPage = getCurrentPage(userFeedData);

        if (blogs.length > 0) {
            if (currentPage === 1) {
                setLocalBlogs(blogs);
            } else if (useInfiniteScroll) {
                setLocalBlogs(prev => {
                    // Avoid duplicates by checking IDs
                    const existingIds = new Set(prev.map(blog => blog._id));
                    const newBlogs = blogs.filter(blog => !existingIds.has(blog._id));
                    return [...prev, ...newBlogs];
                });
            } else {
                setLocalBlogs(blogs);
            }
        } else {
            // Reset if no blogs
            if (currentPage === 1) {
                setLocalBlogs([]);
            }
        }
    }, [userFeedData, useInfiniteScroll]);

    const handleLoadMore = () => {
        const pagination = getPagination(userFeedData);
        if (pagination?.hasMore && onPageChange) {
            onPageChange(pagination.page + 1);
        }
    };

    const handleRefresh = () => {
        setLocalBlogs([]);
        onRefresh?.();
    };

    const handlePageChange = (page: number) => {
        onPageChange?.(page);
    };

    // Show loading state for initial load
    if (userDataPending && localBlogs.length === 0) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Header with refresh button */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Feed</h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={userFeedDataPending}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${userFeedDataPending ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Error State */}
            {userFeedDataError && (
                <div className="text-center py-8">
                    <p className="text-destructive mb-4">
                        Error loading feed: {userFeedDataError.message}
                    </p>
                    <Button onClick={handleRefresh}>
                        Retry
                    </Button>
                </div>
            )}

            {/* Blog List */}
            {!userFeedDataError && (
                <>
                    {localBlogs.length > 0 ? (
                        <>
                            {useInfiniteScroll ? (
                                <InfiniteScroll
                                    onLoadMore={handleLoadMore}
                                    hasMore={getHasMore(userFeedData)}
                                    isLoading={userFeedDataPending}
                                >
                                    {localBlogs.map((blog) => (
                                        <BlogCard
                                            key={`${blog._id}-${blog.createdAt}`}
                                            {...blog}
                                            image={
                                                typeof blog.image === "string"
                                                    ? { url: blog.image, publicId: "", width: 0, height: 0, format: "" }
                                                    : blog.image
                                            }
                                            authorDetails={{ ...blog.authorDetails }}
                                        />
                                    ))}
                                </InfiniteScroll>
                            ) : (
                                <>
                                    {localBlogs.map((blog) => (
                                        <BlogCard
                                            key={blog._id}
                                            {...blog}
                                            image={
                                                typeof blog.image === "string"
                                                    ? { url: blog.image, publicId: "", width: 0, height: 0, format: "" }
                                                    : blog.image
                                            }
                                            authorDetails={{ ...blog.authorDetails }}
                                        />
                                    ))}

                                    {/* Traditional Pagination */}
                                    <Pagination
                                        currentPage={getCurrentPage(userFeedData)}
                                        totalPages={getTotalPages(userFeedData)}
                                        onPageChange={handlePageChange}
                                        className="mt-8"
                                    />
                                </>
                            )}
                        </>
                    ) : userFeedDataPending ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No blogs available</p>
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
        </motion.div>
    );
}