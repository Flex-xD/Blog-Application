import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollProps {
    onLoadMore: () => void;
    hasMore: boolean;
    isLoading: boolean;
    threshold?: number;
    children: React.ReactNode;
}

function InfiniteScroll({
    onLoadMore,
    hasMore,
    isLoading,
    threshold = 100,
    children,
}: InfiniteScrollProps) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!hasMore || isLoading) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onLoadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasMore, isLoading, onLoadMore]);

    return (
        <div>
            {children}
            <div ref={loadMoreRef} className="h-4" />
            {isLoading && hasMore && (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            )}
            {!hasMore && (
                <div className="text-center py-8 text-muted-foreground">
                    You've reached the end of the feed
                </div>
            )}
        </div>
    );
}