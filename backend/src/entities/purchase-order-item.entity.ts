import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { Part } from './part.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'purchase_order_id' })
    purchaseOrderId: number;

    @Column({ name: 'part_id' })
    partId: number;

    @Column({ name: 'quantity_ordered', type: 'int' })
    quantityOrdered: number;

    @Column({ name: 'quantity_received', type: 'int', default: 0 })
    quantityReceived: number;

    @Column({ name: 'unit_cost', type: 'decimal', precision: 10, scale: 2 })
    unitCost: number;

    @Column({ name: 'total_cost', type: 'decimal', precision: 10, scale: 2 })
    totalCost: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relationships
    @ManyToOne(() => PurchaseOrder, (po) => po.items)
    @JoinColumn({ name: 'purchase_order_id' })
    purchaseOrder: PurchaseOrder;

    @ManyToOne(() => Part)
    @JoinColumn({ name: 'part_id' })
    part: Part;
}
