import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    contactPerson?: string;

    @ApiPropertyOptional({ example: 5, minimum: 0, maximum: 5 })
    @IsNumber()
    @Min(0)
    @Max(5)
    @IsOptional()
    rating?: number;
}

export class UpdateSupplierDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    rating?: number;
}
