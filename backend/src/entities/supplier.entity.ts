import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Part } from './part.entity';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('suppliers')
export class Supplier {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    name: string;

    @Column({ length: 255, nullable: true })
    email: string;

    @Column({ length: 50, nullable: true })
    phone: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ length: 100, nullable: true })
    city: string;

    @Column({ length: 100, nullable: true })
    country: string;

    @Column({ name: 'contact_person', length: 255, nullable: true })
    contactPerson: string;

    @Column({ name: 'tax_id', length: 50, nullable: true })
    taxId: string;

    @Column({ length: 255, nullable: true })
    website: string;

    @Column({ name: 'average_lead_time_days', type: 'int', nullable: true })
    averageLeadTimeDays: number;

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
    rating: number;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relationships
    @OneToMany(() => Part, (part) => part.supplier)
    parts: Part[];

    @OneToMany(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.supplier)
    purchaseOrders: PurchaseOrder[];
}
