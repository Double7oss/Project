import { Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    list(
        @CurrentUser() user: any,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.notificationsService.list(user.id, page, limit);
    }

    @UseGuards(JwtAuthGuard)
    @Post('read-all')
    @HttpCode(HttpStatus.OK)
    markAllRead(@CurrentUser() user: any) {
        return this.notificationsService.markAllRead(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/read')
    @HttpCode(HttpStatus.OK)
    markRead(@CurrentUser() user: any, @Param('id') id: string) {
        return this.notificationsService.markRead(user.id, id);
    }
}
