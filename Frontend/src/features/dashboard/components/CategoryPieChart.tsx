import React from 'react';

export const CategoryPieChart: React.FC = () => {
    const categories = [
        { name: 'Brakes', percentage: 28, color: 'bg-blue-500' },
        { name: 'Filters', percentage: 22, color: 'bg-green-500' },
        { name: 'Engine', percentage: 18, color: 'bg-yellow-500' },
        { name: 'Electrical', percentage: 15, color: 'bg-purple-500' },
        { name: 'Other', percentage: 17, color: 'bg-gray-500' },
    ];

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Parts by Category</h2>
            <div className="flex items-center justify-center h-64 mb-4">
                <div className="text-center">
                    <div className="text-6xl mb-2">🥧</div>
                    <p className="text-gray-600">Pie Chart</p>
                    <p className="text-sm text-gray-500 mt-2">(Integration ready)</p>
                </div>
            </div>
            <div className="space-y-2">
                {categories.map((category) => (
                    <div key={category.name} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${category.color}`}></div>
                        <span className="flex-1 text-sm text-gray-700">{category.name}</span>
                        <span className="text-sm font-semibold text-gray-900">{category.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
