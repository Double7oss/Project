import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Part } from '../../entities/part.entity';
import { CreatePartDto, UpdatePartDto } from './parts.dto';

@Injectable()
export class PartsService {
    constructor(
        @InjectRepository(Part)
        private partsRepository: Repository<Part>,
    ) { }

    async create(createPartDto: CreatePartDto): Promise<Part> {
        const part = this.partsRepository.create(createPartDto);
        return await this.partsRepository.save(part);
    }

    async findAll(): Promise<Part[]> {
        return await this.partsRepository.find({
            relations: ['category', 'supplier'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Part> {
        const part = await this.partsRepository.findOne({
            where: { id },
            relations: ['category', 'supplier', 'compatibilities'],
        });

        if (!part) {
            throw new NotFoundException(`Part with ID ${id} not found`);
        }

        return part;
    }

    async findLowStock(): Promise<Part[]> {
        return await this.partsRepository
            .createQueryBuilder('part')
            .where('part.quantityInStock <= part.minimumStockLevel')
            .orderBy('part.quantityInStock', 'ASC')
            .getMany();
    }

    async findBySku(sku: string): Promise<Part> {
        const part = await this.partsRepository.findOne({ where: { sku } });
        if (!part) {
            throw new NotFoundException(`Part with SKU ${sku} not found`);
        }
        return part;
    }

    async update(id: number, updatePartDto: UpdatePartDto): Promise<Part> {
        const part = await this.findOne(id);
        Object.assign(part, updatePartDto);
        return await this.partsRepository.save(part);
    }

    async remove(id: number): Promise<void> {
        const part = await this.findOne(id);
        await this.partsRepository.remove(part);
    }
}
