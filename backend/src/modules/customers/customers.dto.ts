import { IsString, IsEmail, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerType } from '../../entities/customer.entity';

export class CreateCustomerDto {
    @ApiProperty({ example: 'Garage XYZ' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'garage@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '+1234567890' })
    @IsString()
    phone: string;

    @ApiProperty({ enum: CustomerType, default: CustomerType.RETAIL })
    @IsEnum(CustomerType)
    customerType: CustomerType;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    city?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    companyName?: string;

    @ApiPropertyOptional({ example: 5000 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    creditLimit?: number;

    @ApiPropertyOptional({ example: 10 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    discountPercentage?: number;
}

export class UpdateCustomerDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    creditLimit?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    currentBalance?: number;
}
