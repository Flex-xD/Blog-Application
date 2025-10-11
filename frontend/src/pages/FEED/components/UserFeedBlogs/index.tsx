import { BlogCard } from "@/pages/Components/BlogCard";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, ArrowUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Pagination } from "../Pagination";
import type { AxiosError } from "axios";

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
    userFeedDataError?: AxiosError | Error | null | undefined;
    userDataPending: boolean;
    userFeedDataPending: boolean;
    onPageChange?: (page: number) => void;
    onRefresh?: () => void;
    feedTitle?: string;
    currentPage:number
}

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
    feedTitle = "Your Feed",
}: UserFeedProps) {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const blogs = useMemo(() => getBlogs(userFeedData), [userFeedData]);
    const totalPages = useMemo(() => getTotalPages(userFeedData), [userFeedData]);
    const feedCurrentPage = getCurrentPage(userFeedData);

    const handleRefresh = () => {
        if (onRefresh) {
            onRefresh();
        }
    };
    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        onPageChange?.(page);
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [feedCurrentPage]);

    if (userDataPending && blogs.length === 0) {
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
            ref={containerRef}
        >
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{feedTitle}</h2>
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

            {userFeedDataError && (
                <div className="text-center py-8">
                    <p className="text-destructive mb-4">
                        Error loading feed: {userFeedDataError.message || "Unknown error"}
                        {(userFeedDataError as AxiosError)?.response?.status && (
                            <span> (Status: {(userFeedDataError as AxiosError).response!.status})</span>
                        )}
                    </p>
                    <Button onClick={handleRefresh}>
                        Retry
                    </Button>
                </div>
            )}

            {!userFeedDataError && (
                <>
                    {blogs.length > 0 ? (
                        <>
                            <div className="space-y-6">
                                {blogs.map((blog, index) => (
                                    <motion.div
                                        key={blog._id || `blog-${index}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.4,
                                            delay: Math.min(index * 0.05, 0.3),
                                            ease: "easeOut"
                                        }}
                                    >
                                        <BlogCard
                                            {...blog}
                                            image={
                                                typeof blog.image === "string"
                                                    ? { url: blog.image, publicId: "", width: 0, height: 0, format: "" }
                                                    : blog.image
                                            }
                                            authorDetails={{ ...blog.authorDetails }}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Pagination Component */}
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={feedCurrentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                    className="mt-8"
                                />
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

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="fixed bottom-6 left-6 z-50"
                >
                    <Button
                        onClick={scrollToTop}
                        size="icon"
                        className="rounded-full shadow-lg h-12 w-12 bg-primary hover:bg-primary/90"
                    >
                        <ArrowUp className="h-5 w-5" />
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
}