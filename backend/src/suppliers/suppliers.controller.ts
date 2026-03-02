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
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { SearchSuppliersDto } from './dto/search-suppliers.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { UploadSupplierDocumentDto } from './dto/upload-supplier-document.dto';
import { RejectSupplierDto } from './dto/reject-supplier.dto';

@Controller('suppliers')
export class SuppliersController {
    constructor(private readonly suppliersService: SuppliersService) { }

    @Get()
    search(@Query() query: SearchSuppliersDto) {
        return this.suppliersService.search(query);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('supplier')
    @Get('me')
    getMyProfile(@CurrentUser() user: any) {
        return this.suppliersService.getMyProfile(user.id);
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.suppliersService.findById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('supplier')
    @Post()
    create(@CurrentUser() user: any, @Body() dto: CreateSupplierDto) {
        return this.suppliersService.create(user.id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('supplier')
    @Put('me')
    update(@CurrentUser() user: any, @Body() dto: UpdateSupplierDto) {
        return this.suppliersService.update(user.id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('supplier')
    @Post('me/documents')
    uploadDocument(@CurrentUser() user: any, @Body() dto: UploadSupplierDocumentDto) {
        return this.suppliersService.uploadDocument(user.id, dto);
    }
}

@Controller('admin/suppliers')
export class AdminSuppliersController {
    constructor(private readonly suppliersService: SuppliersService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get('pending')
    listPending(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.suppliersService.listPending(page, limit);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post(':id/approve')
    @HttpCode(HttpStatus.OK)
    approve(@Param('id') id: string) {
        return this.suppliersService.approve(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post(':id/reject')
    @HttpCode(HttpStatus.OK)
    reject(@Param('id') id: string, @Body() dto: RejectSupplierDto) {
        return this.suppliersService.reject(id, dto);
    }
}
