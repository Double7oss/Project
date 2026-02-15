import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { Customer } from './customer.entity';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';

export enum OrderType {
    RETAIL = 'retail',
    WHOLESALE = 'wholesale',
    INTERNAL = 'internal',
}

export enum OrderStatus {
    QUOTE = 'quote',
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PREPARING = 'preparing',
    READY = 'ready',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

export enum DeliveryMethod {
    PICKUP = 'pickup',
    DELIVERY = 'delivery',
    SHIPPING = 'shipping',
}

@Entity('orders')
@Index(['orderNumber'], { unique: true })
@Index(['customerId'])
@Index(['status'])
@Index(['createdAt'])
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'order_number', unique: true, length: 50 })
    orderNumber: string;

    @Column({ name: 'customer_id' })
    customerId: number;

    @Column({ name: 'created_by_id' })
    createdById: number;

    @Column({
        name: 'order_type',
        type: 'enum',
        enum: OrderType,
        default: OrderType.RETAIL,
    })
    orderType: OrderType;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Column({
        name: 'delivery_method',
        type: 'enum',
        enum: DeliveryMethod,
        default: DeliveryMethod.PICKUP,
    })
    deliveryMethod: DeliveryMethod;

    // PRICING
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    subtotal: number;

    @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
    discountPercentage: number;

    @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    discountAmount: number;

    @Column({ name: 'tax_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
    taxPercentage: number;

    @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    taxAmount: number;

    @Column({ name: 'shipping_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
    shippingCost: number;

    @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalAmount: number;

    @Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2, default: 0 })
    amountPaid: number;

    @Column({ name: 'amount_due', type: 'decimal', precision: 10, scale: 2, default: 0 })
    amountDue: number;

    // DELIVERY
    @Column({ name: 'delivery_address', type: 'text', nullable: true })
    deliveryAddress: string;

    @Column({ name: 'delivery_city', length: 100, nullable: true })
    deliveryCity: string;

    @Column({ name: 'delivery_phone', length: 50, nullable: true })
    deliveryPhone: string;

    @Column({ name: 'expected_delivery_date', type: 'date', nullable: true })
    expectedDeliveryDate: Date;

    @Column({ name: 'actual_delivery_date', type: 'date', nullable: true })
    actualDeliveryDate: Date;

    @Column({ name: 'tracking_number', length: 100, nullable: true })
    trackingNumber: string;

    // NOTES
    @Column({ name: 'customer_notes', type: 'text', nullable: true })
    customerNotes: string;

    @Column({ name: 'internal_notes', type: 'text', nullable: true })
    internalNotes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relationships
    @ManyToOne(() => Customer, (customer) => customer.orders)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
    items: OrderItem[];

    @OneToMany(() => Payment, (payment) => payment.order)
    payments: Payment[];
}
