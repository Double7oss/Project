import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { CreateOrderDto, UpdateOrderDto } from './orders.dto';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemsRepository: Repository<OrderItem>,
        private dataSource: DataSource,
    ) { }

    async create(createOrderDto: CreateOrderDto): Promise<Order> {
        return await this.dataSource.transaction(async (manager) => {
            // Generate order number
            const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

            // Calculate totals
            let subtotal = 0;
            createOrderDto.items.forEach(item => {
                subtotal += item.quantity * item.unitPrice;
            });

            const taxAmount = subtotal * 0.1; // 10% tax
            const totalAmount = subtotal + taxAmount;

            // Create order
            const order = manager.create(Order, {
                ...createOrderDto,
                orderNumber,
                subtotal,
                taxAmount,
                totalAmount,
                amountDue: totalAmount,
            });

            const savedOrder = await manager.save(order);

            // Create order items
            const orderItems = createOrderDto.items.map(item =>
                manager.create(OrderItem, {
                    ...item,
                    orderId: savedOrder.id,
                    totalPrice: item.quantity * item.unitPrice,
                })
            );

            await manager.save(orderItems);

            return savedOrder;
        });
    }

    async findAll(): Promise<Order[]> {
        return await this.ordersRepository.find({
            relations: ['customer', 'items', 'items.part'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Order> {
        const order = await this.ordersRepository.findOne({
            where: { id },
            relations: ['customer', 'items', 'items.part', 'payments'],
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        return order;
    }

    async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
        const order = await this.findOne(id);
        Object.assign(order, updateOrderDto);
        return await this.ordersRepository.save(order);
    }

    async remove(id: number): Promise<void> {
        const order = await this.findOne(id);
        await this.ordersRepository.remove(order);
    }
}
