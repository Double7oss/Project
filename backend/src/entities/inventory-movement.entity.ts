import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Part } from './part.entity';
import { User } from './user.entity';

export enum MovementType {
    PURCHASE = 'purchase',
    SALE = 'sale',
    ADJUSTMENT = 'adjustment',
    RETURN = 'return',
    DAMAGE = 'damage',
    TRANSFER = 'transfer',
}

@Entity('inventory_movements')
export class InventoryMovement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'part_id' })
    partId: number;

    @Column({
        name: 'movement_type',
        type: 'enum',
        enum: MovementType,
    })
    movementType: MovementType;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ name: 'quantity_before', type: 'int' })
    quantityBefore: number;

    @Column({ name: 'quantity_after', type: 'int' })
    quantityAfter: number;

    @Column({ name: 'reference_id', type: 'int', nullable: true })
    referenceId: number;

    @Column({ name: 'reference_type', length: 50, nullable: true })
    referenceType: string;

    @Column({ name: 'from_location', length: 100, nullable: true })
    fromLocation: string;

    @Column({ name: 'to_location', length: 100, nullable: true })
    toLocation: string;

    @Column({ name: 'created_by_id' })
    createdById: number;

    @Column({ type: 'text', nullable: true })
    reason: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relationships
    @ManyToOne(() => Part, (part) => part.inventoryMovements)
    @JoinColumn({ name: 'part_id' })
    part: Part;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;
}
