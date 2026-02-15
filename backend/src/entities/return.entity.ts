import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Customer } from './customer.entity';
import { Part } from './part.entity';

export enum ReturnReason {
    DEFECTIVE = 'defective',
    WRONG_PART = 'wrong_part',
    NOT_NEEDED = 'not_needed',
    WARRANTY = 'warranty',
    DAMAGED = 'damaged',
    OTHER = 'other',
}

export enum ReturnStatus {
    REQUESTED = 'requested',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    RECEIVED = 'received',
    REFUNDED = 'refunded',
    REPLACED = 'replaced',
}

@Entity('returns')
export class Return {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'return_number', unique: true, length: 50 })
    returnNumber: string;

    @Column({ name: 'order_id' })
    orderId: number;

    @Column({ name: 'customer_id' })
    customerId: number;

    @Column({ name: 'part_id' })
    partId: number;

    @Column({ type: 'int' })
    quantity: number;

    @Column({
        type: 'enum',
        enum: ReturnReason,
    })
    reason: ReturnReason;

    @Column({
        type: 'enum',
        enum: ReturnStatus,
        default: ReturnStatus.REQUESTED,
    })
    status: ReturnStatus;

    @Column({ name: 'customer_description', type: 'text', nullable: true })
    customerDescription: string;

    @Column({ name: 'inspection_notes', type: 'text', nullable: true })
    inspectionNotes: string;

    @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    refundAmount: number;

    @Column({ name: 'is_warranty_claim', default: false })
    isWarrantyClaim: boolean;

    @Column({ name: 'requested_date', type: 'date' })
    requestedDate: Date;

    @Column({ name: 'approved_date', type: 'date', nullable: true })
    approvedDate: Date;

    @Column({ name: 'received_date', type: 'date', nullable: true })
    receivedDate: Date;

    @Column({ name: 'refunded_date', type: 'date', nullable: true })
    refundedDate: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relationships
    @ManyToOne(() => Order)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @ManyToOne(() => Part)
    @JoinColumn({ name: 'part_id' })
    part: Part;
}
