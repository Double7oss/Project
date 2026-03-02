import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

// ─── Car owner endpoints ──────────────────────────────────────────────────────
@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('car_owner')
    @Post()
    createBooking(@CurrentUser() user: any, @Body() dto: CreateBookingDto) {
        return this.bookingsService.createBooking(user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    listMyBookings(
        @CurrentUser() user: any,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.bookingsService.listMyBookings(user.id, page, limit);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@CurrentUser() user: any, @Param('id') id: string) {
        return this.bookingsService.findOne(user.id, id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/cancel')
    @HttpCode(HttpStatus.OK)
    cancel(@CurrentUser() user: any, @Param('id') id: string) {
        return this.bookingsService.cancelBooking(user.id, id);
    }
}

// ─── Garage owner endpoints ───────────────────────────────────────────────────
@Controller('garages/me/bookings')
export class GarageBookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('garage_owner')
    @Get()
    listGarageBookings(
        @CurrentUser() user: any,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.bookingsService.listGarageBookings(user.id, page, limit);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('garage_owner')
    @Put(':id/status')
    updateStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateBookingStatusDto,
    ) {
        return this.bookingsService.updateBookingStatus(user.id, id, dto);
    }
}
