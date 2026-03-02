import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { request_urgency } from '@prisma/client';

export class CreateBookingDto {
    @IsString()
    garage_id: string;

    @IsOptional()
    @IsString()
    service_quote_id?: string;

    @IsOptional()
    @IsString()
    vehicle_id?: string;

    @IsString()
    service_date: string; // ISO date string

    @IsOptional()
    @IsString()
    notes?: string;
}
