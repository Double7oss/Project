import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Supplier } from './supplier.entity';
import { User } from './user.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';

export enum PurchaseOrderStatus {
    DRAFT = 'draft',
    SENT = 'sent',
    CONFIRMED = 'confirmed',
    PARTIALLY_RECEIVED = 'partially_received',
    RECEIVED = 'received',
    CANCELLED = 'cancelled',
}

@Entity('purchase_orders')
export class PurchaseOrder {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'po_number', unique: true, length: 50 })
    poNumber: string;

    @Column({ name: 'supplier_id' })
    supplierId: number;

    @Column({ name: 'created_by_id' })
    createdById: number;

    @Column({
        type: 'enum',
        enum: PurchaseOrderStatus,
        default: PurchaseOrderStatus.DRAFT,
    })
    status: PurchaseOrderStatus;

    @Column({ name: 'order_date', type: 'date' })
    orderDate: Date;

    @Column({ name: 'expected_delivery_date', type: 'date', nullable: true })
    expectedDeliveryDate: Date;

    @Column({ name: 'actual_delivery_date', type: 'date', nullable: true })
    actualDeliveryDate: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    subtotal: number;

    @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    taxAmount: number;

    @Column({ name: 'shipping_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
    shippingCost: number;

    @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalAmount: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relationships
    @ManyToOne(() => Supplier, (supplier) => supplier.purchaseOrders)
    @JoinColumn({ name: 'supplier_id' })
    supplier: Supplier;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;

    @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder)
    items: PurchaseOrderItem[];
}
