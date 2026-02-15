import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { Order } from './order.entity';

export enum CustomerType {
    RETAIL = 'retail',
    WHOLESALE = 'wholesale',
    DEALER = 'dealer',
}

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    name: string;

    @Column({ unique: true, length: 255 })
    email: string;

    @Column({ length: 50 })
    phone: string;

    @Column({
        name: 'customer_type',
        type: 'enum',
        enum: CustomerType,
        default: CustomerType.RETAIL,
    })
    customerType: CustomerType;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ length: 100, nullable: true })
    city: string;

    @Column({ name: 'tax_id', length: 50, nullable: true })
    taxId: string;

    @Column({ name: 'company_name', length: 255, nullable: true })
    companyName: string;

    @Column({ name: 'credit_limit', type: 'decimal', precision: 10, scale: 2, default: 0 })
    creditLimit: number;

    @Column({ name: 'current_balance', type: 'decimal', precision: 10, scale: 2, default: 0 })
    currentBalance: number;

    @Column({ name: 'discount_percentage', type: 'int', default: 0 })
    discountPercentage: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relationships
    @OneToMany(() => Vehicle, (vehicle) => vehicle.customer)
    vehicles: Vehicle[];

    @OneToMany(() => Order, (order) => order.customer)
    orders: Order[];
}
