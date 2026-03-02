import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Injectable()
export class BookingsService {
    constructor(private readonly prisma: PrismaService) { }

    async createBooking(userId: string, dto: CreateBookingDto) {
        const garage = await this.prisma.garages.findUnique({
            where: { id: dto.garage_id, status: 'approved' },
        });
        if (!garage) throw new NotFoundException('Garage not found or not approved');

        return this.prisma.bookings.create({
            data: {
                user_id: userId,
                garage_id: dto.garage_id,
                quote_id: dto.service_quote_id,
                vehicle_id: dto.vehicle_id,
                scheduled_at: new Date(dto.service_date),
                client_notes: dto.notes,
                status: 'pending',
                service_types: [],
            },
            include: {
                garages: { select: { id: true, name: true, slug: true, phone: true } },
            },
        });
    }

    async listMyBookings(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [bookings, total] = await Promise.all([
            this.prisma.bookings.findMany({
                where: { user_id: userId },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    garages: { select: { id: true, name: true, slug: true, logo_url: true } },
                },
            }),
            this.prisma.bookings.count({ where: { user_id: userId } }),
        ]);
        return { data: bookings, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
    }

    async findOne(userId: string, bookingId: string) {
        const booking = await this.prisma.bookings.findUnique({
            where: { id: bookingId },
            include: {
                garages: true,
                service_quotes: true,
                user_vehicles: true,
                garage_reviews: true,
            },
        });
        if (!booking) throw new NotFoundException('Booking not found');
        if (booking.user_id !== userId) throw new ForbiddenException('Access denied');
        return booking;
    }

    async cancelBooking(userId: string, bookingId: string) {
        const booking = await this.prisma.bookings.findUnique({ where: { id: bookingId } });
        if (!booking) throw new NotFoundException('Booking not found');
        if (booking.user_id !== userId) throw new ForbiddenException('Access denied');
        if (!['pending', 'confirmed'].includes(booking.status)) {
            throw new BadRequestException(`Cannot cancel a booking with status '${booking.status}'`);
        }
        return this.prisma.bookings.update({
            where: { id: bookingId },
            data: { status: 'cancelled', cancelled_at: new Date() },
        });
    }

    // ── Garage owner ───────────────────────────────────────────────────────────

    async listGarageBookings(userId: string, page = 1, limit = 20) {
        const garage = await this.prisma.garages.findUnique({ where: { user_id: userId } });
        if (!garage) throw new NotFoundException('No garage profile found');
        const skip = (page - 1) * limit;
        const [bookings, total] = await Promise.all([
            this.prisma.bookings.findMany({
                where: { garage_id: garage.id },
                skip,
                take: limit,
                orderBy: { scheduled_at: 'asc' },
                include: {
                    users: { select: { id: true, first_name: true, last_name: true, phone: true } },
                    user_vehicles: true,
                },
            }),
            this.prisma.bookings.count({ where: { garage_id: garage.id } }),
        ]);
        return { data: bookings, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
    }

    async updateBookingStatus(userId: string, bookingId: string, dto: UpdateBookingStatusDto) {
        const garage = await this.prisma.garages.findUnique({ where: { user_id: userId } });
        if (!garage) throw new NotFoundException('No garage profile found');
        const booking = await this.prisma.bookings.findUnique({ where: { id: bookingId } });
        if (!booking || booking.garage_id !== garage.id) {
            throw new ForbiddenException('Booking not found or does not belong to your garage');
        }
        return this.prisma.bookings.update({
            where: { id: bookingId },
            data: {
                status: dto.status as any,
                ...(dto.status === 'completed' && { completed_at: new Date() }),
            },
        });
    }
}
