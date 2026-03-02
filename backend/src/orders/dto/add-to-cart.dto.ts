import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AddToCartDto {
    @IsString()
    product_id: string;

    @IsString()
    supplier_id: string;

    @IsInt()
    @Min(1)
    quantity: number;
}
