import { IsString } from 'class-validator';

export class RejectSupplierDto {
    @IsString()
    reason: string;
}
