import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { SearchProductsDto } from './dto/search-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    search(@Query() query: SearchProductsDto) {
        return this.productsService.search(query);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('supplier')
    @Get('me')
    getMyProducts(
        @CurrentUser() user: any,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.productsService.getMyProducts(user.id, page, limit);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('supplier')
    @Post()
    create(@CurrentUser() user: any, @Body() dto: CreateProductDto) {
        return this.productsService.create(user.id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('supplier')
    @Put(':id')
    update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productsService.update(user.id, id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('supplier')
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    remove(@CurrentUser() user: any, @Param('id') id: string) {
        return this.productsService.remove(user.id, id);
    }
}
