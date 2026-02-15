import React from 'react';
import type { Product } from '../../../types/product';
import { formatCurrency } from '../../../shared/utils/formatters';

interface ProductCardProps {
    product: Product;
    onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
    const stockStatus = product.stock <= product.minStock ? 'low' : 'normal';

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
        >
            <div className="h-48 bg-gray-200 flex items-center justify-center">
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-6xl">📦</span>
                )}
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{product.name}</h3>
                    <span
                        className={`px-2 py-1 text-xs rounded-full ${stockStatus === 'low' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}
                    >
                        {stockStatus === 'low' ? 'Low Stock' : 'In Stock'}
                    </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(product.price)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Stock</p>
                        <p className="text-lg font-semibold">{product.stock}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
