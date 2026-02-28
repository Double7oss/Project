import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';
import { garage_type } from '@prisma/client';

export class CreateGarageDto {
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
    @IsString()
    description_ar?: string;

    @IsOptional()
    @IsEnum(garage_type)
    garage_type?: garage_type;

    @IsInt()
    city_id: number;

    @IsString()
    address: string;

    @IsString()
    @MaxLength(20)
    phone: string;

    @IsOptional()
    @IsString()
    whatsapp?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    website_url?: string;

    @IsOptional()
    @IsString()
    logo_url?: string;

    @IsOptional()
    @IsString()
    banner_url?: string;

    @IsOptional()
    specializations?: string[];

    @IsOptional()
    brands_served?: string[];

    @IsOptional()
    opening_hours?: Record<string, any>;

    @IsOptional()
    @IsString()
    @MaxLength(5)
    price_range?: string;
}
