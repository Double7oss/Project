import { IsEmail, IsEnum, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { user_role } from '@prisma/client';

export class RegisterDto {
    @ValidateIf((o) => !o.phone)
    @IsEmail()
    email?: string;

    @ValidateIf((o) => !o.email)
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    @MinLength(8)
    password?: string;

    @IsString()
    first_name: string;

    @IsString()
    last_name: string;

    @IsOptional()
    @IsEnum(user_role)
    role?: user_role;

    @IsOptional()
    @IsString()
    preferred_lang?: string;
}
