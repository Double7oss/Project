import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { document_type } from '@prisma/client';

export class UploadSupplierDocumentDto {
    @IsEnum(document_type)
    doc_type: document_type;

    @IsString()
    file_url: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    file_name?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    file_size?: number;
}
