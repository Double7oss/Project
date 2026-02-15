export interface DashboardStats {
    revenue: number;
    orders: number;
    criticalParts: number;
    backOrders: number;
    pendingQuotes: number;
}

export interface StockAlert {
    id: string;
    partName: string;
    currentStock: number;
    minStock: number;
    severity: 'critical' | 'warning';
}

export interface RecentOrder {
    id: string;
    orderNumber: string;
    customer: string;
    items: string;
    amount: number;
    status: 'ready' | 'paid' | 'pending' | 'processing';
    date: string;
}

export interface TopSeller {
    id: string;
    name: string;
    unitsSold: number;
    revenue: number;
}

export interface SupplierStatus {
    id: string;
    name: string;
    status: 'active' | 'delayed' | 'issue';
    pendingOrders: number;
    lastDelivery: string;
}
