import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductList } from '../components/ProductList';
import { Button, Modal } from '../../../shared/components';
import { ProductForm } from '../components/ProductForm';
import { useProductForm } from '../hooks/useProductForm';

export const ProductsListPage: React.FC = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { createProduct } = useProductForm(() => {
        setIsModalOpen(false);
        window.location.reload(); // Refresh to show new product
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Auto Parts Inventory</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    + Add Part
                </Button>
            </div>

            <ProductList onProductClick={(id) => navigate(`/products/${id}`)} />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Product"
            >
                <ProductForm
                    onSubmit={createProduct}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};
