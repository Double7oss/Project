import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { product_condition, product_status } from '@prisma/client';

export class SearchProductsDto {
    @IsOptional()
    @IsString()
    q?: string;

    @IsOptional()
    @IsString()
    category_id?: string;

    @IsOptional()
    @IsString()
    supplier_id?: string;

    @IsOptional()
    @IsEnum(product_condition)
    condition?: product_condition;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    price_min?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    price_max?: number;

    @IsOptional()
    @IsString()
    part_brand?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 24;
}
