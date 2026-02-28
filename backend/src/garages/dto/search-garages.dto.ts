import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { garage_type } from '@prisma/client';

export class SearchGaragesDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    city_id?: number;

    @IsOptional()
    @IsEnum(garage_type)
    type?: garage_type;

    @IsOptional()
    @IsString()
    specialization?: string;

    @IsOptional()
    @Type(() => Number)
    @Min(0)
    @Max(5)
    rating_min?: number;

    @IsOptional()
    @IsString()
    q?: string; // free-text name search

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 20;
}
