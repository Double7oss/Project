import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class OrdersService {
    constructor(private readonly prisma: PrismaService) { }

    // ── Cart ───────────────────────────────────────────────────────────────────
    // Note: cart_items has no unit_price or supplier_id in DB.
    // Price is read from products at checkout time.

    async getCart(userId: string) {
        let cart = await this.prisma.carts.findUnique({
            where: { user_id: userId },
            include: {
                cart_items: {
                    include: {
                        products: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                stock_qty: true,
                                supplier_id: true,
                                product_images: { where: { is_primary: true }, take: 1, select: { url: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!cart) {
            cart = await this.prisma.carts.create({
                data: { user_id: userId },
                include: {
                    cart_items: {
                        include: {
                            products: {
                                select: {
                                    id: true, name: true, price: true, stock_qty: true, supplier_id: true,
                                    product_images: { where: { is_primary: true }, take: 1, select: { url: true } },
                                },
                            },
                        },
                    },
                },
            });
        }
        return cart;
    }

    async addToCart(userId: string, dto: AddToCartDto) {
        const cart = await this.getOrCreateCart(userId);

        const product = await this.prisma.products.findUnique({ where: { id: dto.product_id } });
        if (!product || product.status !== 'active') throw new NotFoundException('Product not available');
        if (product.stock_qty < dto.quantity) {
            throw new BadRequestException(`Only ${product.stock_qty} units available`);
        }

        // If item already in cart, update quantity
        const existing = await this.prisma.cart_items.findFirst({
            where: { cart_id: cart.id, product_id: dto.product_id },
        });

        if (existing) {
            return this.prisma.cart_items.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + dto.quantity },
            });
        }

        return this.prisma.cart_items.create({
            data: {
                cart_id: cart.id,
                product_id: dto.product_id,
                quantity: dto.quantity,
            },
        });
    }

    async updateCartItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
        const cart = await this.getOrCreateCart(userId);
        const item = await this.prisma.cart_items.findFirst({
            where: { id: itemId, cart_id: cart.id },
        });
        if (!item) throw new NotFoundException('Cart item not found');
        return this.prisma.cart_items.update({
            where: { id: itemId },
            data: { quantity: dto.quantity },
        });
    }

    async removeCartItem(userId: string, itemId: string) {
        const cart = await this.getOrCreateCart(userId);
        const item = await this.prisma.cart_items.findFirst({
            where: { id: itemId, cart_id: cart.id },
        });
        if (!item) throw new NotFoundException('Cart item not found');
        await this.prisma.cart_items.delete({ where: { id: itemId } });
        return { message: 'Item removed from cart' };
    }

    // ── Orders ─────────────────────────────────────────────────────────────────

    async checkout(userId: string, dto: CheckoutDto) {
        const cart = await this.prisma.carts.findUnique({
            where: { user_id: userId },
            include: { cart_items: { include: { products: true } } },
        });
        if (!cart || cart.cart_items.length === 0) {
            throw new BadRequestException('Cart is empty');
        }

        const subtotal = cart.cart_items.reduce(
            (sum, item) => sum + item.products.price * item.quantity,
            0,
        );

        const order = await this.prisma.orders.create({
            data: {
                buyer_id: userId,
                subtotal,
                total_amount: subtotal,
                payment_method: dto.payment_method ?? 'cod',
                delivery_address: dto.delivery_address as any,
                notes: dto.notes,
                order_items: {
                    create: cart.cart_items.map((item) => ({
                        product_id: item.product_id,
                        supplier_id: item.products.supplier_id,
                        product_name: item.products.name,
                        unit_price: item.products.price,
                        quantity: item.quantity,
                        total_price: item.products.price * item.quantity,
                    })),
                },
            },
            include: { order_items: true },
        });

        // Clear cart after checkout
        await this.prisma.cart_items.deleteMany({ where: { cart_id: cart.id } });

        return order;
    }

    async listOrders(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            this.prisma.orders.findMany({
                where: { buyer_id: userId },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: { order_items: true },
            }),
            this.prisma.orders.count({ where: { buyer_id: userId } }),
        ]);
        return { data: orders, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
    }

    async findOrder(userId: string, orderId: string) {
        const order = await this.prisma.orders.findFirst({
            where: { id: orderId, buyer_id: userId },
            include: {
                order_items: {
                    include: {
                        products: { select: { id: true, name: true } },
                        suppliers: { select: { id: true, business_name: true } },
                    },
                },
                payments: true,
                shipments: true,
            },
        });
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }

    private async getOrCreateCart(userId: string) {
        let cart = await this.prisma.carts.findUnique({ where: { user_id: userId } });
        if (!cart) cart = await this.prisma.carts.create({ data: { user_id: userId } });
        return cart;
    }
}
