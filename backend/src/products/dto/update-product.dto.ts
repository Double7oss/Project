import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';
import { product_condition, part_type, product_status } from '@prisma/client';

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    name_ar?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    category_id?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    price?: number;

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
    stock_quantity?: number;

    @IsOptional()
    @IsEnum(product_status)
    status?: product_status;

    @IsOptional()
    images?: string[];
}
