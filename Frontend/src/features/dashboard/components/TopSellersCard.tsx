import React from 'react';
import type { TopSeller } from '../../../types/dashboard';
import { formatCurrency } from '../../../shared/utils/formatters';

interface TopSellersCardProps {
    topSellers: TopSeller[];
}

export const TopSellersCard: React.FC<TopSellersCardProps> = ({ topSellers }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🔥</span>
                <h2 className="text-lg font-bold text-gray-900">Top Sellers</h2>
            </div>
            <div className="space-y-4">
                {topSellers.map((seller, index) => (
                    <div key={seller.id} className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                            }`}>
                            {index + 1}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-900">{seller.name}</p>
                            <p className="text-sm text-gray-600">{seller.unitsSold} units sold</p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatCurrency(seller.revenue)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
