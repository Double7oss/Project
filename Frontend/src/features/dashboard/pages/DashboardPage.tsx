import React from 'react';
import { StatCard } from '../../../shared/components/StatCard';
import { StockAlertCard } from '../components/StockAlertCard';
import { RecentOrdersCard } from '../components/RecentOrdersCard';
import { TopSellersCard } from '../components/TopSellersCard';
import { SupplierStatusCard } from '../components/SupplierStatusCard';
import { SalesChart } from '../components/SalesChart';
import { CategoryPieChart } from '../components/CategoryPieChart';
import { formatCurrency } from '../../../shared/utils/formatters';
import {
    mockDashboardStats,
    mockStockAlerts,
    mockRecentOrders,
    mockTopSellers,
    mockSupplierStatus,
} from '../../../shared/utils/dashboardMockData';

export const DashboardPage: React.FC = () => {
    const stats = mockDashboardStats;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">🚗 Auto Parts Dashboard</h1>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Revenue"
                    value={formatCurrency(stats.revenue)}
                    icon="💰"
                    trend={{ value: 12.5, isPositive: true }}
                />
                <StatCard
                    title="Orders"
                    value={stats.orders}
                    icon="📦"
                    trend={{ value: 8.2, isPositive: true }}
                />
                <StatCard
                    title="Critical Parts"
                    value={stats.criticalParts}
                    icon="⚠️"
                />
                <StatCard
                    title="Back Orders"
                    value={stats.backOrders}
                    icon="🔄"
                />
                <StatCard
                    title="Quotes Pending"
                    value={stats.pendingQuotes}
                    icon="📋"
                />
            </div>

            {/* Critical Stock Alerts */}
            <StockAlertCard alerts={mockStockAlerts} />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesChart />
                <CategoryPieChart />
            </div>

            {/* Recent Orders */}
            <RecentOrdersCard orders={mockRecentOrders} />

            {/* Bottom Row - Top Sellers & Supplier Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopSellersCard topSellers={mockTopSellers} />
                <SupplierStatusCard suppliers={mockSupplierStatus} />
            </div>
        </div>
    );
};
