import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) { }

    async list(userId: string, page = 1, limit = 30) {
        const skip = (page - 1) * limit;
        const [notifications, total, unreadCount] = await Promise.all([
            this.prisma.notifications.findMany({
                where: { user_id: userId },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
            }),
            this.prisma.notifications.count({ where: { user_id: userId } }),
            this.prisma.notifications.count({ where: { user_id: userId, is_read: false } }),
        ]);
        return {
            data: notifications,
            meta: { total, page, limit, pages: Math.ceil(total / limit), unread_count: unreadCount },
        };
    }

    async markRead(userId: string, notificationId: string) {
        const notification = await this.prisma.notifications.findUnique({
            where: { id: notificationId },
        });
        if (!notification || notification.user_id !== userId) {
            throw new NotFoundException('Notification not found');
        }
        return this.prisma.notifications.update({
            where: { id: notificationId },
            data: { is_read: true, read_at: new Date() },
        });
    }

    async markAllRead(userId: string) {
        const result = await this.prisma.notifications.updateMany({
            where: { user_id: userId, is_read: false },
            data: { is_read: true, read_at: new Date() },
        });
        return { message: `${result.count} notifications marked as read` };
    }
}
