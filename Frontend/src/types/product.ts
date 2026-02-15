export interface Product {
    id: string;
    name: string;
    description: string;
    sku: string;
    price: number;
    cost: number;
    category: string;
    supplier: string;
    stock: number;
    minStock: number;
    maxStock: number;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductFormData {
    name: string;
    description: string;
    sku: string;
    price: number;
    cost: number;
    category: string;
    supplier: string;
    stock: number;
    minStock: number;
    maxStock: number;
    imageUrl?: string;
}
