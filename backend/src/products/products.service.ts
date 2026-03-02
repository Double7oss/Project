import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchProductsDto } from './dto/search-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) { }

    async search(query: SearchProductsDto) {
        const { q, category_id, supplier_id, condition, price_min, price_max, part_brand, page = 1, limit = 24 } = query;
        const skip = (page - 1) * limit;

        const where: any = { status: 'active', deleted_at: null };
        if (q) where.name = { contains: q, mode: 'insensitive' };
        if (category_id) where.category_id = Number(category_id);
        if (supplier_id) where.supplier_id = supplier_id;
        if (condition) where.condition = condition;
        if (part_brand) where.part_brand = { contains: part_brand, mode: 'insensitive' };
        if (price_min !== undefined || price_max !== undefined) {
            where.price = {};
            if (price_min !== undefined) where.price.gte = price_min;
            if (price_max !== undefined) where.price.lte = price_max;
        }

        const [products, total] = await Promise.all([
            this.prisma.products.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    categories: { select: { id: true, name_fr: true, name_ar: true } },
                    suppliers: { select: { id: true, business_name: true } },
                    product_images: { where: { is_primary: true }, take: 1, select: { url: true } },
                },
            }),
            this.prisma.products.count({ where }),
        ]);

        return { data: products, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
    }

    async findOne(id: string) {
        const product = await this.prisma.products.findUnique({
            where: { id, status: 'active', deleted_at: null },
            include: {
                categories: true,
                suppliers: { select: { id: true, business_name: true, phone: true, city_id: true } },
                product_images: { orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }] },
                product_compatibility: { include: { car_models: { include: { car_brands: true } } } },
            },
        });
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async getMyProducts(userId: string, page = 1, limit = 24) {
        const supplier = await this.prisma.suppliers.findUnique({ where: { user_id: userId } });
        if (!supplier) throw new NotFoundException('No supplier profile found');
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            this.prisma.products.findMany({
                where: { supplier_id: supplier.id, deleted_at: null },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: { product_images: { where: { is_primary: true }, take: 1 } },
            }),
            this.prisma.products.count({ where: { supplier_id: supplier.id, deleted_at: null } }),
        ]);
        return { data: products, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
    }

    async create(userId: string, dto: CreateProductDto) {
        const supplier = await this.prisma.suppliers.findUnique({ where: { user_id: userId } });
        if (!supplier) throw new NotFoundException('No supplier profile found. Create one first.');

        const { images, ...rest } = dto;

        const product = await this.prisma.products.create({
            data: {
                supplier_id: supplier.id,
                name: rest.name,
                name_ar: rest.name_ar,
                description: rest.description,
                category_id: rest.category_id ?? 1,
                price: rest.price,
                price_before_discount: rest.price_before_discount,
                condition: rest.condition ?? 'new',
                part_type: rest.part_type ?? 'aftermarket',
                part_brand: rest.part_brand,
                oem_number: rest.oem_number,
                stock_qty: rest.stock_quantity ?? 0,
                status: 'draft',
            },
        });

        if (images?.length) {
            await this.prisma.product_images.createMany({
                data: images.map((url, idx) => ({
                    product_id: product.id,
                    url,
                    is_primary: idx === 0,
                    sort_order: idx,
                })),
            });
        }

        return product;
    }

    async update(userId: string, productId: string, dto: UpdateProductDto) {
        await this.assertOwnership(userId, productId);
        const { images, ...rest } = dto;
        const updateData: any = { ...rest, updated_at: new Date() };
        if (rest.category_id !== undefined) updateData.category_id = Number(rest.category_id);
        if (rest.stock_quantity !== undefined) {
            updateData.stock_qty = rest.stock_quantity;
            delete updateData.stock_quantity;
        }
        return this.prisma.products.update({ where: { id: productId }, data: updateData });
    }

    async remove(userId: string, productId: string) {
        await this.assertOwnership(userId, productId);
        await this.prisma.products.update({
            where: { id: productId },
            data: { deleted_at: new Date(), status: 'archived' },
        });
        return { message: 'Product deleted successfully' };
    }

    private async assertOwnership(userId: string, productId: string) {
        const supplier = await this.prisma.suppliers.findUnique({ where: { user_id: userId } });
        if (!supplier) throw new NotFoundException('No supplier profile found');
        const product = await this.prisma.products.findUnique({ where: { id: productId } });
        if (!product || product.supplier_id !== supplier.id) {
            throw new ForbiddenException('Product not found or does not belong to you');
        }
    }
}
