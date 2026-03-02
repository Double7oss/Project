import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchSuppliersDto } from './dto/search-suppliers.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { UploadSupplierDocumentDto } from './dto/upload-supplier-document.dto';
import { RejectSupplierDto } from './dto/reject-supplier.dto';

@Injectable()
export class SuppliersService {
    constructor(private readonly prisma: PrismaService) { }

    // ── Public ─────────────────────────────────────────────────────────────────

    async search(query: SearchSuppliersDto) {
        const { city_id, q, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const where: any = { status: 'approved', deleted_at: null };
        if (city_id) where.city_id = city_id;
        if (q) where.business_name = { contains: q, mode: 'insensitive' };

        const [suppliers, total] = await Promise.all([
            this.prisma.suppliers.findMany({
                where,
                skip,
                take: limit,
                orderBy: { rating_avg: 'desc' },
                select: {
                    id: true,
                    business_name: true,
                    business_name_ar: true,
                    city_id: true,
                    address: true,
                    phone: true,
                    rating_avg: true,
                    rating_count: true,
                    is_verified: true,
                    logo_url: true,
                    specializations: true,
                    brands_carried: true,
                    cities: { select: { id: true, name_fr: true, name_ar: true } },
                },
            }),
            this.prisma.suppliers.count({ where }),
        ]);

        return {
            data: suppliers,
            meta: { total, page, limit, pages: Math.ceil(total / limit) },
        };
    }

    async findById(supplierId: string) {
        const supplier = await this.prisma.suppliers.findFirst({
            where: { id: supplierId, status: 'approved', deleted_at: null },
            include: {
                cities: true,
                supplier_documents: { select: { id: true, doc_type: true, status: true } },
            },
        });
        if (!supplier) throw new NotFoundException('Supplier not found');
        return supplier;
    }

    // ── Owner ──────────────────────────────────────────────────────────────────

    async create(userId: string, dto: CreateSupplierDto) {
        const existing = await this.prisma.suppliers.findUnique({ where: { user_id: userId } });
        if (existing) throw new BadRequestException('You already have a supplier profile');

        return this.prisma.suppliers.create({
            data: {
                user_id: userId,
                business_name: dto.business_name,
                business_name_ar: dto.business_name_ar,
                description: dto.description,
                city_id: dto.city_id,
                address: dto.address,
                phone: dto.phone,
                whatsapp: dto.whatsapp,
                logo_url: dto.logo_url,
                rc_number: dto.rc_number,
                ice_number: dto.ice_number,
                specializations: dto.specializations ?? [],
                brands_carried: dto.brands_carried ?? [],
                status: 'pending_review',
            },
        });
    }

    async getMyProfile(userId: string) {
        const supplier = await this.prisma.suppliers.findUnique({
            where: { user_id: userId, deleted_at: null },
            include: {
                cities: true,
                supplier_documents: { orderBy: { created_at: 'desc' } },
            },
        });
        if (!supplier) throw new NotFoundException('No supplier profile found. Create one first.');
        return supplier;
    }

    async update(userId: string, dto: UpdateSupplierDto) {
        const supplier = await this.getSupplierByOwner(userId);
        return this.prisma.suppliers.update({
            where: { id: supplier.id },
            data: {
                ...(dto.business_name && { business_name: dto.business_name }),
                ...(dto.business_name_ar !== undefined && { business_name_ar: dto.business_name_ar }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.city_id && { city_id: dto.city_id }),
                ...(dto.address !== undefined && { address: dto.address }),
                ...(dto.phone && { phone: dto.phone }),
                ...(dto.whatsapp !== undefined && { whatsapp: dto.whatsapp }),
                ...(dto.logo_url !== undefined && { logo_url: dto.logo_url }),
                ...(dto.rc_number !== undefined && { rc_number: dto.rc_number }),
                ...(dto.ice_number !== undefined && { ice_number: dto.ice_number }),
                ...(dto.specializations && { specializations: dto.specializations }),
                ...(dto.brands_carried && { brands_carried: dto.brands_carried }),
                updated_at: new Date(),
            },
        });
    }

    async uploadDocument(userId: string, dto: UploadSupplierDocumentDto) {
        const supplier = await this.getSupplierByOwner(userId);
        return this.prisma.supplier_documents.create({
            data: {
                supplier_id: supplier.id,
                doc_type: dto.doc_type,
                file_url: dto.file_url,
                file_name: dto.file_name,
                file_size: dto.file_size,
                status: 'pending',
            },
        });
    }

    // ── Admin ──────────────────────────────────────────────────────────────────

    async listPending(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [suppliers, total] = await Promise.all([
            this.prisma.suppliers.findMany({
                where: { status: 'pending_review' },
                skip,
                take: limit,
                orderBy: { created_at: 'asc' },
                include: {
                    users: { select: { id: true, first_name: true, last_name: true, email: true } },
                    cities: { select: { id: true, name_fr: true } },
                    supplier_documents: { select: { id: true, doc_type: true, status: true, file_url: true } },
                },
            }),
            this.prisma.suppliers.count({ where: { status: 'pending_review' } }),
        ]);
        return { data: suppliers, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
    }

    async approve(supplierId: string) {
        const supplier = await this.requireSupplierById(supplierId);
        if (supplier.status !== 'pending_review') {
            throw new BadRequestException(`Supplier status is already '${supplier.status}'`);
        }
        return this.prisma.suppliers.update({
            where: { id: supplierId },
            data: { status: 'approved', rejected_reason: null },
        });
    }

    async reject(supplierId: string, dto: RejectSupplierDto) {
        const supplier = await this.requireSupplierById(supplierId);
        if (supplier.status !== 'pending_review') {
            throw new BadRequestException(`Supplier status is already '${supplier.status}'`);
        }
        return this.prisma.suppliers.update({
            where: { id: supplierId },
            data: { status: 'rejected', rejected_reason: dto.reason },
        });
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private async getSupplierByOwner(userId: string) {
        const supplier = await this.prisma.suppliers.findUnique({
            where: { user_id: userId, deleted_at: null },
        });
        if (!supplier) throw new NotFoundException('No supplier profile found. Create one first.');
        return supplier;
    }

    private async requireSupplierById(id: string) {
        const supplier = await this.prisma.suppliers.findUnique({ where: { id } });
        if (!supplier) throw new NotFoundException('Supplier not found');
        return supplier;
    }
}
