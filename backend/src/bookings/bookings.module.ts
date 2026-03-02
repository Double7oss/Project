import { Module } from '@nestjs/common';
import { BookingsController, GarageBookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
    controllers: [BookingsController, GarageBookingsController],
    providers: [BookingsService],
    exports: [BookingsService],
})
export class BookingsModule { }
