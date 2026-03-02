import {
    Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CheckoutDto } from './dto/checkout.dto';

@Controller()
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    // ── Cart ─────────────────────────────────────────────────────────────────
    @UseGuards(JwtAuthGuard)
    @Get('cart')
    getCart(@CurrentUser() user: any) {
        return this.ordersService.getCart(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('cart/items')
    addToCart(@CurrentUser() user: any, @Body() dto: AddToCartDto) {
        return this.ordersService.addToCart(user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Put('cart/items/:id')
    updateCartItem(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateCartItemDto) {
        return this.ordersService.updateCartItem(user.id, id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('cart/items/:id')
    @HttpCode(HttpStatus.OK)
    removeCartItem(@CurrentUser() user: any, @Param('id') id: string) {
        return this.ordersService.removeCartItem(user.id, id);
    }

    // ── Orders ────────────────────────────────────────────────────────────────
    @UseGuards(JwtAuthGuard)
    @Post('orders')
    checkout(@CurrentUser() user: any, @Body() dto: CheckoutDto) {
        return this.ordersService.checkout(user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('orders')
    listOrders(@CurrentUser() user: any, @Query('page') page?: number, @Query('limit') limit?: number) {
        return this.ordersService.listOrders(user.id, page, limit);
    }

    @UseGuards(JwtAuthGuard)
    @Get('orders/:id')
    findOrder(@CurrentUser() user: any, @Param('id') id: string) {
        return this.ordersService.findOrder(user.id, id);
    }
}
