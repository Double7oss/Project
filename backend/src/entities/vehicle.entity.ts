import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

@Entity('vehicles')
export class Vehicle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'customer_id' })
    customerId: number;

    @Column({ length: 17, nullable: true })
    vin: string;

    @Column({ length: 100 })
    make: string;

    @Column({ length: 100 })
    model: string;

    @Column({ type: 'int' })
    year: number;

    @Column({ length: 50, nullable: true })
    engine: string;

    @Column({ length: 50, nullable: true })
    transmission: string;

    @Column({ length: 50, nullable: true })
    color: string;

    @Column({ name: 'license_plate', length: 20, nullable: true })
    licensePlate: string;

    @Column({ type: 'int', nullable: true })
    mileage: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relationships
    @ManyToOne(() => Customer, (customer) => customer.vehicles)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;
}
