import { IsEnum } from 'class-validator';

export enum BookingStatusAction {
    CONFIRM = 'confirmed',
    COMPLETE = 'completed',
    CANCEL = 'cancelled',
    IN_PROGRESS = 'in_progress',
}

export class UpdateBookingStatusDto {
    @IsEnum(BookingStatusAction)
    status: BookingStatusAction;
}
