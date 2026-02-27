import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
    sub: string;
    email: string | null;
    phone: string | null;
    role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_ACCESS_SECRET')!,
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.prisma.users.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                phone: true,
                first_name: true,
                last_name: true,
                role: true,
                status: true,
                is_phone_verified: true,
                is_email_verified: true,
            },
        });

        if (!user || user.status === 'banned' || user.status === 'suspended') {
            throw new UnauthorizedException('Account is not active');
        }

        return user;
    }
}
