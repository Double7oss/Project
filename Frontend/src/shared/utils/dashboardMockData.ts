import type { DashboardStats, StockAlert, RecentOrder, TopSeller, SupplierStatus } from '../../types/dashboard';

export const mockDashboardStats: DashboardStats = {
    revenue: 15420,
    orders: 87,
    criticalParts: 45,
    backOrders: 23,
    pendingQuotes: 12,
};

export const mockStockAlerts: StockAlert[] = [
    {
        id: '1',
        partName: 'Brake Pads (Toyota)',
        currentStock: 3,
        minStock: 15,
        severity: 'critical',
    },
    {
        id: '2',
        partName: 'Oil Filter (Universal)',
        currentStock: 8,
        minStock: 25,
        severity: 'warning',
    },
    {
        id: '3',
        partName: 'Air Filter (Honda)',
        currentStock: 12,
        minStock: 20,
        severity: 'warning',
    },
];

export const mockRecentOrders: RecentOrder[] = [
    {
        id: '1',
        orderNumber: '#2456',
        customer: 'Garage XYZ',
        items: 'Brake pads',
        amount: 245,
        status: 'ready',
        date: new Date().toISOString(),
    },
    {
        id: '2',
        orderNumber: '#2455',
        customer: 'Ali Motors',
        items: 'Engine oil',
        amount: 450,
        status: 'paid',
        date: new Date().toISOString(),
    },
    {
        id: '3',
        orderNumber: '#2454',
        customer: 'Speed Auto',
        items: 'Spark plugs, Air filter',
        amount: 189,
        status: 'processing',
        date: new Date().toISOString(),
    },
    {
        id: '4',
        orderNumber: '#2453',
        customer: 'City Garage',
        items: 'Timing belt kit',
        amount: 320,
        status: 'pending',
        date: new Date().toISOString(),
    },
];

export const mockTopSellers: TopSeller[] = [
    {
        id: '1',
        name: 'Oil Filter',
        unitsSold: 156,
        revenue: 2028,
    },
    {
        id: '2',
        name: 'Brake Pads',
        unitsSold: 89,
        revenue: 8010,
    },
    {
        id: '3',
        name: 'Spark Plugs',
        unitsSold: 78,
        revenue: 2730,
    },
    {
        id: '4',
        name: 'Air Filter',
        unitsSold: 65,
        revenue: 1624,
    },
];

export const mockSupplierStatus: SupplierStatus[] = [
    {
        id: '1',
        name: 'AutoParts Direct',
        status: 'active',
        pendingOrders: 5,
        lastDelivery: '2 days ago',
    },
    {
        id: '2',
        name: 'FilterPro Inc',
        status: 'active',
        pendingOrders: 3,
        lastDelivery: '1 day ago',
    },
    {
        id: '3',
        name: 'Engine Parts Co',
        status: 'delayed',
        pendingOrders: 8,
        lastDelivery: '7 days ago',
    },
    {
        id: '4',
        name: 'CoolTech Parts',
        status: 'issue',
        pendingOrders: 2,
        lastDelivery: '14 days ago',
    },
];
