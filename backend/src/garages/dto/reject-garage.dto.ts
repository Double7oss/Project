import { IsString } from 'class-validator';

export class RejectGarageDto {
    @IsString()
    reason: string;
}
