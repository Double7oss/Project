import React from 'react';
import type { RecentOrder } from '../../../types/dashboard';
import { formatCurrency } from '../../../shared/utils/formatters';

interface RecentOrdersCardProps {
    orders: RecentOrder[];
}

const statusColors = {
    ready: 'bg-green-100 text-green-800',
    paid: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-purple-100 text-purple-800',
};

export const RecentOrdersCard: React.FC<RecentOrdersCardProps> = ({ orders }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Orders & Quotes</h2>
            <div className="space-y-3">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-4 flex-1">
                            <span className="font-mono font-semibold text-gray-700">{order.orderNumber}</span>
                            <span className="text-gray-600">|</span>
                            <span className="text-gray-900">{order.customer}</span>
                            <span className="text-gray-600">|</span>
                            <span className="text-gray-600">{order.items}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900">{formatCurrency(order.amount)}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
