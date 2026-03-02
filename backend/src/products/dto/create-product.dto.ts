import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';
import { product_condition, part_type } from '@prisma/client';

export class CreateProductDto {
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    name_ar?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    category_id?: number;  // Int in DB

    @IsInt()
    @Min(0)
    price: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    price_before_discount?: number;

    @IsOptional()
    @IsEnum(product_condition)
    condition?: product_condition;

    @IsOptional()
    @IsEnum(part_type)
    part_type?: part_type;

    @IsOptional()
    @IsString()
    part_brand?: string;

    @IsOptional()
    @IsString()
    oem_number?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    stock_quantity?: number;  // mapped to stock_qty in DB

    @IsOptional()
    images?: string[];
}
