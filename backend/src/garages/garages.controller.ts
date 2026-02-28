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
import { GaragesService } from './garages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateGarageDto } from './dto/create-garage.dto';
import { UpdateGarageDto } from './dto/update-garage.dto';
import { SearchGaragesDto } from './dto/search-garages.dto';
import { AddPhotoDto } from './dto/add-photo.dto';
import { AddServiceDto } from './dto/add-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { RejectGarageDto } from './dto/reject-garage.dto';

// ─── Public Controller ────────────────────────────────────────────────────────
@Controller('garages')
export class GaragesController {
    constructor(private readonly garagesService: GaragesService) { }

    // GET /api/garages
    @Get()
    search(@Query() query: SearchGaragesDto) {
        return this.garagesService.search(query);
    }

    // GET /api/garages/me  ← must be BEFORE /:slug to avoid "me" being treated as a slug
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('garage_owner')
    @Get('me')
    getMyGarage(@CurrentUser() user: any) {
        return this.garagesService.getMyGarage(user.id);
    }

    // GET /api/garages/:slug
    @Get(':slug')
    findBySlug(@Param('slug') slug: string) {
        return this.garagesService.findBySlug(slug);
    }

    // POST /api/garages
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('garage_owner')
    @Post()
    create(@CurrentUser() user: any, @Body() dto: CreateGarageDto) {
        return this.garagesService.create(user.id, dto);
    }

    // PUT /api/garages/me
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('garage_owner')
    @Put('me')
    update(@CurrentUser() user: any, @Body() dto: UpdateGarageDto) {
        return this.garagesService.update(user.id, dto);
    }

    // ── Photos ─────────────────────────────────────────────────────────────────

    // POST /api/garages/me/photos
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('garage_owner')
    @Post('me/photos')
    addPhoto(@CurrentUser() user: any, @Body() dto: AddPhotoDto) {
        return this.garagesService.addPhoto(user.id, dto);
    }

    // DELETE /api/garages/me/photos/:id
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('garage_owner')
    @Delete('me/photos/:id')
    @HttpCode(HttpStatus.OK)
    deletePhoto(@CurrentUser() user: any, @Param('id') id: string) {
        return this.garagesService.deletePhoto(user.id, id);
    }

    // ── Services ───────────────────────────────────────────────────────────────

    // POST /api/garages/me/services
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('garage_owner')
    @Post('me/services')
    addService(@CurrentUser() user: any, @Body() dto: AddServiceDto) {
        return this.garagesService.addService(user.id, dto);
    }

    // PUT /api/garages/me/services/:id
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('garage_owner')
    @Put('me/services/:id')
    updateService(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateServiceDto,
    ) {
        return this.garagesService.updateService(user.id, id, dto);
    }

    // DELETE /api/garages/me/services/:id
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('garage_owner')
    @Delete('me/services/:id')
    @HttpCode(HttpStatus.OK)
    deleteService(@CurrentUser() user: any, @Param('id') id: string) {
        return this.garagesService.deleteService(user.id, id);
    }

    // ── Documents ──────────────────────────────────────────────────────────────

    // POST /api/garages/me/documents
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('garage_owner')
    @Post('me/documents')
    uploadDocument(@CurrentUser() user: any, @Body() dto: UploadDocumentDto) {
        return this.garagesService.uploadDocument(user.id, dto);
    }
}

// ─── Admin Controller ─────────────────────────────────────────────────────────
@Controller('admin/garages')
export class AdminGaragesController {
    constructor(private readonly garagesService: GaragesService) { }

    // GET /api/admin/garages/pending
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get('pending')
    listPending(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.garagesService.listPending(page, limit);
    }

    // POST /api/admin/garages/:id/approve
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post(':id/approve')
    @HttpCode(HttpStatus.OK)
    approve(@Param('id') id: string) {
        return this.garagesService.approve(id);
    }

    // POST /api/admin/garages/:id/reject
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post(':id/reject')
    @HttpCode(HttpStatus.OK)
    reject(@Param('id') id: string, @Body() dto: RejectGarageDto) {
        return this.garagesService.reject(id, dto);
    }
}
