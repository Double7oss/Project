import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { service_type } from '@prisma/client';

export class AddServiceDto {
    @IsEnum(service_type)
    service_type: service_type;

    @IsString()
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    name_ar?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    price_from?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    price_to?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    duration_minutes?: number;
}
