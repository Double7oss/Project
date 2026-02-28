import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class AddPhotoDto {
    @IsString()
    url: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    caption?: string;

    @IsOptional()
    @IsBoolean()
    is_primary?: boolean;

    @IsOptional()
    @IsInt()
    @Min(0)
    sort_order?: number;
}
