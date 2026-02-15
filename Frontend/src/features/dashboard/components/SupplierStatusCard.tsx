import React from 'react';
import type { SupplierStatus } from '../../../types/dashboard';

interface SupplierStatusCardProps {
    suppliers: SupplierStatus[];
}

const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', icon: '✓', label: 'Active' },
    delayed: { color: 'bg-yellow-100 text-yellow-800', icon: '⏱️', label: 'Delayed' },
    issue: { color: 'bg-red-100 text-red-800', icon: '⚠️', label: 'Issue' },
};

export const SupplierStatusCard: React.FC<SupplierStatusCardProps> = ({ suppliers }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📦</span>
                <h2 className="text-lg font-bold text-gray-900">Supplier Status</h2>
            </div>
            <div className="space-y-3">
                {suppliers.map((supplier) => {
                    const config = statusConfig[supplier.status];
                    return (
                        <div
                            key={supplier.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">{supplier.name}</p>
                                <p className="text-sm text-gray-600">
                                    {supplier.pendingOrders} pending • Last: {supplier.lastDelivery}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
                                <span>{config.icon}</span>
                                {config.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
