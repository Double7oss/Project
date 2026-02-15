import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="text-4xl opacity-20">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};
