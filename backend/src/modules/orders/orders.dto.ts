import { IsString, IsNumber, IsEnum, IsOptional, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderType, OrderStatus, DeliveryMethod } from '../../entities/order.entity';

export class CreateOrderItemDto {
    @ApiProperty()
    @IsNumber()
    partId: number;

    @ApiProperty()
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiProperty()
    @IsNumber()
    unitPrice: number;
}

export class CreateOrderDto {
    @ApiProperty()
    @IsNumber()
    customerId: number;

    @ApiProperty()
    @IsNumber()
    createdById: number;

    @ApiProperty({ enum: OrderType, default: OrderType.RETAIL })
    @IsEnum(OrderType)
    orderType: OrderType;

    @ApiProperty({ enum: DeliveryMethod, default: DeliveryMethod.PICKUP })
    @IsEnum(DeliveryMethod)
    deliveryMethod: DeliveryMethod;

    @ApiProperty({ type: [CreateOrderItemDto] })
    @IsArray()
    items: CreateOrderItemDto[];

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    customerNotes?: string;
}

export class UpdateOrderDto {
    @ApiPropertyOptional({ enum: OrderStatus })
    @IsEnum(OrderStatus)
    @IsOptional()
    status?: OrderStatus;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    trackingNumber?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    internalNotes?: string;
}
