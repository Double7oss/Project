import { useState, useEffect } from 'react';
import type { Product } from '../../../types/product';
import { mockProducts } from '../../../shared/utils/mockData';

export const useProducts = (page: number = 1, limit: number = 10, search: string = '') => {
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));

                // Filter products based on search
                let filtered = mockProducts;
                if (search) {
                    filtered = mockProducts.filter(p =>
                        p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.description.toLowerCase().includes(search.toLowerCase()) ||
                        p.sku.toLowerCase().includes(search.toLowerCase())
                    );
                }

                // Paginate
                const start = (page - 1) * limit;
                const end = start + limit;
                const paginated = filtered.slice(start, end);

                setProducts(paginated);
                setTotal(filtered.length);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch products');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [page, limit, search]);

    const refetch = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setProducts(mockProducts.slice(0, limit));
            setTotal(mockProducts.length);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch products');
        } finally {
            setIsLoading(false);
        }
    };

    return { products, total, isLoading, error, refetch };
};
