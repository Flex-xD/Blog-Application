// hooks/usePagination.ts
import { useState, useCallback } from 'react';

interface PaginationState {
    page: number;
    limit: number;
    hasMore: boolean;
    isLoading: boolean;
}

export const usePagination = (initialPage = 1, initialLimit = 10) => {
    const [pagination, setPagination] = useState<PaginationState>({
        page: initialPage,
        limit: initialLimit,
        hasMore: true,
        isLoading: false,
    });

    const nextPage = useCallback(() => {
        setPagination(prev => ({
            ...prev,
            page: prev.page + 1,
        }));
    }, []);

    const prevPage = useCallback(() => {
        setPagination(prev => ({
            ...prev,
            page: Math.max(1, prev.page - 1),
        }));
    }, []);

    const goToPage = useCallback((page: number) => {
        setPagination(prev => ({
            ...prev,
            page: Math.max(1, page),
        }));
    }, []);

    const setLoading = useCallback((isLoading: boolean) => {
        setPagination(prev => ({ ...prev, isLoading }));
    }, []);

    const setHasMore = useCallback((hasMore: boolean) => {
        setPagination(prev => ({ ...prev, hasMore }));
    }, []);

    const reset = useCallback(() => {
        setPagination({
            page: initialPage,
            limit: initialLimit,
            hasMore: true,
            isLoading: false,
        });
    }, [initialPage, initialLimit]);

    return {
        ...pagination,
        nextPage,
        prevPage,
        goToPage,
        setLoading,
        setHasMore,
        reset,
    };
};