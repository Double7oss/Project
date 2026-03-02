import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { payment_method } from '@prisma/client';

export class CheckoutDto {
    @IsObject()
    delivery_address: {
        full_name: string;
        phone: string;
        address: string;
        city_id: number;
    };

    @IsOptional()
    @IsEnum(payment_method)
    payment_method?: payment_method;

    @IsOptional()
    @IsString()
    notes?: string;
}
