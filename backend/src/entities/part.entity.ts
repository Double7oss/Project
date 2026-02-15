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
import { Category } from './category.entity';
import { Supplier } from './supplier.entity';
import { PartCompatibility } from './part-compatibility.entity';
import { OrderItem } from './order-item.entity';
import { InventoryMovement } from './inventory-movement.entity';

export enum PartCondition {
    NEW = 'new',
    OEM = 'oem',
    AFTERMARKET = 'aftermarket',
    REFURBISHED = 'refurbished',
    USED = 'used',
}

@Entity('parts')
@Index(['sku'], { unique: true })
@Index(['oemNumber'])
@Index(['categoryId'])
@Index(['supplierId'])
export class Part {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 100 })
    sku: string;

    @Column({ length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'category_id' })
    categoryId: number;

    @Column({ length: 255, nullable: true })
    manufacturer: string;

    @Column({ length: 255, nullable: true })
    brand: string;

    @Column({ name: 'oem_number', length: 100, nullable: true })
    oemNumber: string;

    @Column({ name: 'alternative_numbers', type: 'text', nullable: true })
    alternativeNumbers: string;

    @Column({
        type: 'enum',
        enum: PartCondition,
        default: PartCondition.NEW,
    })
    condition: PartCondition;

    @Column({ name: 'supplier_id', nullable: true })
    supplierId: number;

    // PRICING
    @Column({ name: 'cost_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
    costPrice: number;

    @Column({ name: 'retail_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
    retailPrice: number;

    @Column({ name: 'wholesale_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
    wholesalePrice: number;

    // INVENTORY
    @Column({ name: 'quantity_in_stock', type: 'int', default: 0 })
    quantityInStock: number;

    @Column({ name: 'quantity_reserved', type: 'int', default: 0 })
    quantityReserved: number;

    @Column({ name: 'minimum_stock_level', type: 'int', default: 0 })
    minimumStockLevel: number;

    @Column({ name: 'reorder_point', type: 'int', default: 0 })
    reorderPoint: number;

    @Column({ name: 'maximum_stock_level', type: 'int', nullable: true })
    maximumStockLevel: number;

    @Column({ name: 'warehouse_location', length: 100, nullable: true })
    warehouseLocation: string;

    // PHYSICAL
    @Column({ name: 'weight_kg', type: 'decimal', precision: 8, scale: 2, nullable: true })
    weightKg: number;

    @Column({ length: 100, nullable: true })
    dimensions: string;

    @Column({ name: 'warranty_months', type: 'int', nullable: true })
    warrantyMonths: number;

    @Column({ length: 100, nullable: true })
    barcode: string;

    @Column({ type: 'text', nullable: true })
    images: string;

    // OTHER
    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'is_core_return', default: false })
    isCoreReturn: boolean;

    @Column({ name: 'core_deposit', type: 'decimal', precision: 10, scale: 2, default: 0 })
    coreDeposit: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relationships
    @ManyToOne(() => Category, (category) => category.parts)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @ManyToOne(() => Supplier, (supplier) => supplier.parts, { nullable: true })
    @JoinColumn({ name: 'supplier_id' })
    supplier: Supplier;

    @OneToMany(() => PartCompatibility, (compatibility) => compatibility.part)
    compatibilities: PartCompatibility[];

    @OneToMany(() => OrderItem, (orderItem) => orderItem.part)
    orderItems: OrderItem[];

    @OneToMany(() => InventoryMovement, (movement) => movement.part)
    inventoryMovements: InventoryMovement[];
}
