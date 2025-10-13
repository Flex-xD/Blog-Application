import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function Pagination({
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    className
}: PaginationProps) {
    
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    return (
        <div className={cn('flex items-center justify-center space-x-2', className)}>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
            >
                <ChevronLeft className="h-4 w-4" />
                Previous
            </Button>

            <div className="flex items-center space-x-1">
                {getVisiblePages().map((page, index) =>
                    page === '...' ? (
                        <Button
                            key={`dots-${index}`}
                            variant="outline"
                            size="sm"
                            disabled
                            className="w-9 px-0"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(page as number)}
                            className="w-9 px-0"
                        >
                            {page}
                        </Button>
                    )
                )}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
            >
                Next
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}