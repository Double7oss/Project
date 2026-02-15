import { api } from '../../../shared/utils/api';
import type { Product, ProductFormData } from '../../../types/product';

export const productsApi = {
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        const response = await api.get<{ data: Product[]; total: number }>('/products', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },

    create: async (data: ProductFormData) => {
        const response = await api.post<Product>('/products', data);
        return response.data;
    },

    update: async (id: string, data: Partial<ProductFormData>) => {
        const response = await api.put<Product>(`/products/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/products/${id}`);
    },
};
