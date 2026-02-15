import { useState } from 'react';
import { productsApi } from '../api/productsApi';
import type { ProductFormData } from '../../../types/product';

export const useProductForm = (onSuccess?: () => void) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createProduct = async (data: ProductFormData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await productsApi.create(data);
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create product');
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateProduct = async (id: string, data: Partial<ProductFormData>) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await productsApi.update(id, data);
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update product');
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteProduct = async (id: string) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await productsApi.delete(id);
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete product');
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        createProduct,
        updateProduct,
        deleteProduct,
        isSubmitting,
        error,
    };
};
