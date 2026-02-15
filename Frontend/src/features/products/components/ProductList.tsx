import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from './ProductCard';
import { ProductFilters } from './ProductFilters';
import { usePagination } from '../../../shared/hooks/usePagination';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { Button } from '../../../shared/components';

interface ProductListProps {
    onProductClick?: (productId: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ onProductClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const pagination = usePagination(12);

    const { products, total, isLoading, error } = useProducts(
        pagination.currentPage,
        pagination.pageSize,
        debouncedSearch
    );

    React.useEffect(() => {
        pagination.setTotalItems(total);
    }, [total]);

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 text-lg">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ProductFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No products found</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={() => onProductClick?.(product.id)}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <Button
                            variant="secondary"
                            onClick={pagination.prevPage}
                            disabled={pagination.currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="px-4 py-2 text-gray-700">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        <Button
                            variant="secondary"
                            onClick={pagination.nextPage}
                            disabled={pagination.currentPage === pagination.totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};
