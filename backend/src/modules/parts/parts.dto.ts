import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartCondition } from '../../entities/part.entity';

export class CreatePartDto {
    @ApiProperty({ example: 'BP-TOY-CAM-2020-F' })
    @IsString()
    sku: string;

    @ApiProperty({ example: 'Brake Pads Front Set' })
    @IsString()
    name: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsNumber()
    categoryId: number;

    @ApiPropertyOptional({ example: 'Bosch' })
    @IsString()
    @IsOptional()
    manufacturer?: string;

    @ApiPropertyOptional({ example: 'Bosch' })
    @IsString()
    @IsOptional()
    brand?: string;

    @ApiPropertyOptional({ example: '04465-06090' })
    @IsString()
    @IsOptional()
    oemNumber?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    alternativeNumbers?: string;

    @ApiProperty({ enum: PartCondition, default: PartCondition.NEW })
    @IsEnum(PartCondition)
    condition: PartCondition;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    supplierId?: number;

    @ApiProperty({ example: 45.00 })
    @IsNumber()
    @Min(0)
    costPrice: number;

    @ApiProperty({ example: 89.99 })
    @IsNumber()
    @Min(0)
    retailPrice: number;

    @ApiProperty({ example: 65.00 })
    @IsNumber()
    @Min(0)
    wholesalePrice: number;

    @ApiProperty({ example: 25, default: 0 })
    @IsNumber()
    @Min(0)
    quantityInStock: number;

    @ApiProperty({ example: 15, default: 0 })
    @IsNumber()
    @Min(0)
    minimumStockLevel: number;

    @ApiPropertyOptional({ example: 10 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    reorderPoint?: number;

    @ApiPropertyOptional({ example: 'Shelf B-15' })
    @IsString()
    @IsOptional()
    warehouseLocation?: string;

    @ApiPropertyOptional({ example: 2.5 })
    @IsNumber()
    @IsOptional()
    weightKg?: number;

    @ApiPropertyOptional({ example: '10x5x3 cm' })
    @IsString()
    @IsOptional()
    dimensions?: string;

    @ApiPropertyOptional({ example: 12 })
    @IsNumber()
    @IsOptional()
    warrantyMonths?: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    barcode?: string;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isCoreReturn?: boolean;

    @ApiPropertyOptional({ example: 25.00 })
    @IsNumber()
    @IsOptional()
    coreDeposit?: number;
}

export class UpdatePartDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    costPrice?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    retailPrice?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    wholesalePrice?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    quantityInStock?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    minimumStockLevel?: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    warehouseLocation?: string;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
