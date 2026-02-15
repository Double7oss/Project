import React from 'react';
import type { StockAlert } from '../../../types/dashboard';

interface StockAlertCardProps {
    alerts: StockAlert[];
}

export const StockAlertCard: React.FC<StockAlertCardProps> = ({ alerts }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚠️</span>
                <h2 className="text-lg font-bold text-gray-900">CRITICAL STOCK ALERTS</h2>
            </div>
            <div className="space-y-3">
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${alert.severity === 'critical' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
                            }`}
                    >
                        <div className="flex-1">
                            <p className="font-medium text-gray-900">{alert.partName}</p>
                            <p className="text-sm text-gray-600">
                                {alert.currentStock} units left (Min: {alert.minStock})
                            </p>
                        </div>
                        <div className="text-2xl">
                            {alert.severity === 'critical' ? '🔴' : '🟡'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
