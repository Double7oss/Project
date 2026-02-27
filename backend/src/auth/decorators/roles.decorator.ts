import { SetMetadata } from '@nestjs/common';
import { user_role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route to specific user roles.
 * Must be combined with @UseGuards(JwtAuthGuard, RolesGuard).
 *
 * Usage:
 *   @Roles('admin', 'garage_owner')
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Get('admin-only')
 */
export const Roles = (...roles: user_role[]) => SetMetadata(ROLES_KEY, roles);
