import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../../entities/supplier.entity';
import { CreateSupplierDto, UpdateSupplierDto } from './suppliers.dto';

@Injectable()
export class SuppliersService {
    constructor(
        @InjectRepository(Supplier)
        private suppliersRepository: Repository<Supplier>,
    ) { }

    async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
        const supplier = this.suppliersRepository.create(createSupplierDto);
        return await this.suppliersRepository.save(supplier);
    }

    async findAll(): Promise<Supplier[]> {
        return await this.suppliersRepository.find({ order: { name: 'ASC' } });
    }

    async findOne(id: number): Promise<Supplier> {
        const supplier = await this.suppliersRepository.findOne({
            where: { id },
            relations: ['parts'],
        });
        if (!supplier) {
            throw new NotFoundException(`Supplier with ID ${id} not found`);
        }
        return supplier;
    }

    async update(id: number, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
        const supplier = await this.findOne(id);
        Object.assign(supplier, updateSupplierDto);
        return await this.suppliersRepository.save(supplier);
    }

    async remove(id: number): Promise<void> {
        const supplier = await this.findOne(id);
        await this.suppliersRepository.remove(supplier);
    }
}
