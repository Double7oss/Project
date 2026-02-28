import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGarageDto } from './dto/create-garage.dto';
import { UpdateGarageDto } from './dto/update-garage.dto';
import { SearchGaragesDto } from './dto/search-garages.dto';
import { AddPhotoDto } from './dto/add-photo.dto';
import { AddServiceDto } from './dto/add-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { RejectGarageDto } from './dto/reject-garage.dto';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')   // strip accents
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 200);
}

async function uniqueSlug(prisma: PrismaService, base: string): Promise<string> {
    let slug = slugify(base);
    let attempt = 0;
    while (true) {
        const candidate = attempt === 0 ? slug : `${slug}-${attempt}`;
        const existing = await prisma.garages.findUnique({ where: { slug: candidate } });
        if (!existing) return candidate;
        attempt++;
    }
}

@Injectable()
export class GaragesService {
    constructor(private readonly prisma: PrismaService) { }

    // ══════════════════════════════════════════════════════════════════════════
    // PUBLIC
    // ══════════════════════════════════════════════════════════════════════════

    async search(query: SearchGaragesDto) {
        const { city_id, type, specialization, rating_min, q, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const where: any = {
            status: 'approved',
            deleted_at: null,
        };

        if (city_id) where.city_id = city_id;
        if (type) where.garage_type = type;
        if (specialization) {
            where.specializations = { has: specialization };
        }
        if (rating_min !== undefined) {
            where.rating_avg = { gte: rating_min };
        }
        if (q) {
            where.name = { contains: q, mode: 'insensitive' };
        }

        const [garages, total] = await Promise.all([
            this.prisma.garages.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ is_featured: 'desc' }, { rating_avg: 'desc' }],
                select: {
                    id: true,
                    name: true,
                    name_ar: true,
                    slug: true,
                    garage_type: true,
                    address: true,
                    rating_avg: true,
                    rating_count: true,
                    is_featured: true,
                    is_certified: true,
                    price_range: true,
                    specializations: true,
                    logo_url: true,
                    cities: { select: { id: true, name_fr: true, name_ar: true } },
                    garage_photos: {
                        where: { is_primary: true },
                        take: 1,
                        select: { url: true, caption: true },
                    },
                },
            }),
            this.prisma.garages.count({ where }),
        ]);

        return {
            data: garages,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async findBySlug(slug: string) {
        const garage = await this.prisma.garages.findUnique({
            where: { slug, status: 'approved', deleted_at: null },
            include: {
                cities: true,
                garage_photos: { orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }] },
                garage_services: { where: { is_active: true }, orderBy: { service_type: 'asc' } },
                garage_reviews: {
                    where: { is_visible: true },
                    orderBy: { created_at: 'desc' },
                    take: 10,
                    include: { users: { select: { first_name: true, last_name: true, avatar_url: true } } },
                },
            },
        });

        if (!garage) throw new NotFoundException('Garage not found');
        return garage;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // GARAGE OWNER
    // ══════════════════════════════════════════════════════════════════════════

    async create(userId: string, dto: CreateGarageDto) {
        const existing = await this.prisma.garages.findUnique({ where: { user_id: userId } });
        if (existing) throw new BadRequestException('You already have a garage profile');

        const slug = await uniqueSlug(this.prisma, dto.name);

        return this.prisma.garages.create({
            data: {
                user_id: userId,
                slug,
                name: dto.name,
                name_ar: dto.name_ar,
                description: dto.description,
                description_ar: dto.description_ar,
                garage_type: dto.garage_type ?? 'general',
                city_id: dto.city_id,
                address: dto.address,
                phone: dto.phone,
                whatsapp: dto.whatsapp,
                email: dto.email,
                website_url: dto.website_url,
                logo_url: dto.logo_url,
                banner_url: dto.banner_url,
                specializations: dto.specializations ?? [],
                brands_served: dto.brands_served ?? [],
                opening_hours: dto.opening_hours,
                price_range: dto.price_range,
                status: 'pending_review',
            },
        });
    }

    async getMyGarage(userId: string) {
        const garage = await this.prisma.garages.findUnique({
            where: { user_id: userId, deleted_at: null },
            include: {
                cities: true,
                garage_photos: { orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }] },
                garage_services: { orderBy: { service_type: 'asc' } },
                garage_documents: { orderBy: { created_at: 'desc' } },
            },
        });
        if (!garage) throw new NotFoundException('No garage profile found. Create one first.');
        return garage;
    }

    async update(userId: string, dto: UpdateGarageDto) {
        const garage = await this.prisma.garages.findUnique({
            where: { user_id: userId, deleted_at: null },
        });
        if (!garage) throw new NotFoundException('Garage not found');

        return this.prisma.garages.update({
            where: { id: garage.id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.name_ar !== undefined && { name_ar: dto.name_ar }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.description_ar !== undefined && { description_ar: dto.description_ar }),
                ...(dto.garage_type && { garage_type: dto.garage_type }),
                ...(dto.city_id && { city_id: dto.city_id }),
                ...(dto.address && { address: dto.address }),
                ...(dto.phone && { phone: dto.phone }),
                ...(dto.whatsapp !== undefined && { whatsapp: dto.whatsapp }),
                ...(dto.email !== undefined && { email: dto.email }),
                ...(dto.website_url !== undefined && { website_url: dto.website_url }),
                ...(dto.logo_url !== undefined && { logo_url: dto.logo_url }),
                ...(dto.banner_url !== undefined && { banner_url: dto.banner_url }),
                ...(dto.specializations && { specializations: dto.specializations }),
                ...(dto.brands_served && { brands_served: dto.brands_served }),
                ...(dto.opening_hours !== undefined && { opening_hours: dto.opening_hours }),
                ...(dto.price_range !== undefined && { price_range: dto.price_range }),
                updated_at: new Date(),
            },
        });
    }

    // ── Photos ─────────────────────────────────────────────────────────────────

    async addPhoto(userId: string, dto: AddPhotoDto) {
        const garage = await this.getGarageByOwner(userId);

        // If this is set as primary, unset other primary photos
        if (dto.is_primary) {
            await this.prisma.garage_photos.updateMany({
                where: { garage_id: garage.id },
                data: { is_primary: false },
            });
        }

        return this.prisma.garage_photos.create({
            data: {
                garage_id: garage.id,
                url: dto.url,
                caption: dto.caption,
                is_primary: dto.is_primary ?? false,
                sort_order: dto.sort_order ?? 0,
            },
        });
    }

    async deletePhoto(userId: string, photoId: string) {
        const garage = await this.getGarageByOwner(userId);
        const photo = await this.prisma.garage_photos.findUnique({ where: { id: photoId } });

        if (!photo || photo.garage_id !== garage.id) {
            throw new ForbiddenException('Photo not found or does not belong to your garage');
        }

        await this.prisma.garage_photos.delete({ where: { id: photoId } });
        return { message: 'Photo deleted successfully' };
    }

    // ── Services ───────────────────────────────────────────────────────────────

    async addService(userId: string, dto: AddServiceDto) {
        const garage = await this.getGarageByOwner(userId);
        return this.prisma.garage_services.create({
            data: {
                garage_id: garage.id,
                service_type: dto.service_type,
                name: dto.name,
                name_ar: dto.name_ar,
                price_from: dto.price_from,
                price_to: dto.price_to,
                duration_minutes: dto.duration_minutes,
            },
        });
    }

    async updateService(userId: string, serviceId: string, dto: UpdateServiceDto) {
        const garage = await this.getGarageByOwner(userId);
        await this.assertServiceOwnership(garage.id, serviceId);

        return this.prisma.garage_services.update({
            where: { id: serviceId },
            data: {
                ...(dto.service_type && { service_type: dto.service_type }),
                ...(dto.name && { name: dto.name }),
                ...(dto.name_ar !== undefined && { name_ar: dto.name_ar }),
                ...(dto.price_from !== undefined && { price_from: dto.price_from }),
                ...(dto.price_to !== undefined && { price_to: dto.price_to }),
                ...(dto.duration_minutes !== undefined && { duration_minutes: dto.duration_minutes }),
                ...(dto.is_active !== undefined && { is_active: dto.is_active }),
            },
        });
    }

    async deleteService(userId: string, serviceId: string) {
        const garage = await this.getGarageByOwner(userId);
        await this.assertServiceOwnership(garage.id, serviceId);
        await this.prisma.garage_services.delete({ where: { id: serviceId } });
        return { message: 'Service deleted successfully' };
    }

    // ── Documents ──────────────────────────────────────────────────────────────

    async uploadDocument(userId: string, dto: UploadDocumentDto) {
        const garage = await this.getGarageByOwner(userId);
        return this.prisma.garage_documents.create({
            data: {
                garage_id: garage.id,
                doc_type: dto.doc_type,
                file_url: dto.file_url,
                file_name: dto.file_name,
                file_size: dto.file_size,
                status: 'pending',
            },
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ADMIN
    // ══════════════════════════════════════════════════════════════════════════

    async listPending(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [garages, total] = await Promise.all([
            this.prisma.garages.findMany({
                where: { status: 'pending_review' },
                skip,
                take: limit,
                orderBy: { created_at: 'asc' },  // oldest first
                include: {
                    users: { select: { id: true, first_name: true, last_name: true, email: true, phone: true } },
                    cities: { select: { id: true, name_fr: true } },
                    garage_documents: { select: { id: true, doc_type: true, status: true, file_url: true } },
                },
            }),
            this.prisma.garages.count({ where: { status: 'pending_review' } }),
        ]);
        return { data: garages, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
    }

    async approve(garageId: string) {
        const garage = await this.findGarageById(garageId);
        if (garage.status !== 'pending_review') {
            throw new BadRequestException(`Garage status is already '${garage.status}'`);
        }
        return this.prisma.garages.update({
            where: { id: garageId },
            data: { status: 'approved', accepted_at: new Date(), rejected_reason: null },
        });
    }

    async reject(garageId: string, dto: RejectGarageDto) {
        const garage = await this.findGarageById(garageId);
        if (garage.status !== 'pending_review') {
            throw new BadRequestException(`Garage status is already '${garage.status}'`);
        }
        return this.prisma.garages.update({
            where: { id: garageId },
            data: { status: 'rejected', rejected_reason: dto.reason },
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    private async getGarageByOwner(userId: string) {
        const garage = await this.prisma.garages.findUnique({
            where: { user_id: userId, deleted_at: null },
        });
        if (!garage) throw new NotFoundException('No garage profile found. Create one first.');
        return garage;
    }

    private async findGarageById(garageId: string) {
        const garage = await this.prisma.garages.findUnique({ where: { id: garageId } });
        if (!garage) throw new NotFoundException('Garage not found');
        return garage;
    }

    private async assertServiceOwnership(garageId: string, serviceId: string) {
        const service = await this.prisma.garage_services.findUnique({ where: { id: serviceId } });
        if (!service || service.garage_id !== garageId) {
            throw new ForbiddenException('Service not found or does not belong to your garage');
        }
    }
}
