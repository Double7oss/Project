import React from 'react';

export const SalesChart: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Sales Chart</h2>
            <p className="text-sm text-gray-600 mb-4">Last 30 Days</p>
            <div className="flex items-center justify-center h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-center">
                    <div className="text-6xl mb-2">📈</div>
                    <p className="text-gray-600">Chart visualization</p>
                    <p className="text-sm text-gray-500 mt-2">(Integration ready)</p>
                </div>
            </div>
        </div>
    );
};
