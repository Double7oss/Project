import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Part } from './part.entity';

@Entity('part_compatibility')
@Index(['make', 'model'])
@Index(['yearStart', 'yearEnd'])
@Index(['partId'])
export class PartCompatibility {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'part_id' })
    partId: number;

    @Column({ length: 100 })
    make: string;

    @Column({ length: 100 })
    model: string;

    @Column({ name: 'year_start', type: 'int' })
    yearStart: number;

    @Column({ name: 'year_end', type: 'int', nullable: true })
    yearEnd: number;

    @Column({ length: 50, nullable: true })
    engine: string;

    @Column({ length: 50, nullable: true })
    transmission: string;

    @Column({ name: 'body_type', length: 50, nullable: true })
    bodyType: string;

    @Column({ length: 50, nullable: true })
    trim: string;

    @Column({ length: 50, nullable: true })
    position: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relationships
    @ManyToOne(() => Part, (part) => part.compatibilities)
    @JoinColumn({ name: 'part_id' })
    part: Part;
}
