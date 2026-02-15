import { useState } from 'react';

export interface PaginationState {
    currentPage: number;
    pageSize: number;
    totalItems: number;
}

export const usePagination = (initialPageSize: number = 10) => {
    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: 1,
        pageSize: initialPageSize,
        totalItems: 0,
    });

    const totalPages = Math.ceil(pagination.totalItems / pagination.pageSize);

    const goToPage = (page: number) => {
        setPagination((prev) => ({
            ...prev,
            currentPage: Math.max(1, Math.min(page, totalPages)),
        }));
    };

    const nextPage = () => goToPage(pagination.currentPage + 1);
    const prevPage = () => goToPage(pagination.currentPage - 1);

    const setTotalItems = (total: number) => {
        setPagination((prev) => ({ ...prev, totalItems: total }));
    };

    return {
        ...pagination,
        totalPages,
        goToPage,
        nextPage,
        prevPage,
        setTotalItems,
    };
};
