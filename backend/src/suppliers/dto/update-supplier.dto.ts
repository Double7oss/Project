import { IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateSupplierDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    business_name?: string;

    @IsOptional()
    @IsString()
    business_name_ar?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    city_id?: number;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @IsOptional()
    @IsString()
    whatsapp?: string;

    @IsOptional()
    @IsString()
    logo_url?: string;

    @IsOptional()
    @IsString()
    rc_number?: string;

    @IsOptional()
    @IsString()
    ice_number?: string;

    @IsOptional()
    specializations?: string[];

    @IsOptional()
    brands_carried?: string[];
}
