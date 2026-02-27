import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) { }

    // ─── Validate user for LocalStrategy ────────────────────────────────────────
    async validateUser(identifier: string, password: string) {
        const user = await this.prisma.users.findFirst({
            where: {
                OR: [{ email: identifier }, { phone: identifier }],
                deleted_at: null,
            },
        });

        if (!user || !user.password_hash) return null;

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return null;

        return user;
    }

    // ─── Register ────────────────────────────────────────────────────────────────
    async register(dto: RegisterDto) {
        if (!dto.email && !dto.phone) {
            throw new BadRequestException('Email or phone is required');
        }

        // Check duplicates
        if (dto.email) {
            const exists = await this.prisma.users.findUnique({ where: { email: dto.email } });
            if (exists) throw new BadRequestException('Email already registered');
        }
        if (dto.phone) {
            const exists = await this.prisma.users.findUnique({ where: { phone: dto.phone } });
            if (exists) throw new BadRequestException('Phone already registered');
        }

        const password_hash = dto.password
            ? await bcrypt.hash(dto.password, 12)
            : null;

        const user = await this.prisma.users.create({
            data: {
                email: dto.email ?? null,
                phone: dto.phone ?? null,
                password_hash,
                first_name: dto.first_name,
                last_name: dto.last_name,
                role: dto.role ?? 'car_owner',
                preferred_lang: dto.preferred_lang ?? 'ar',
                status: 'pending',
            },
        });

        const tokens = await this.generateTokens(user);
        await this.storeRefreshToken(user.id, tokens.refresh_token);

        return { user: this.sanitizeUser(user), ...tokens };
    }

    // ─── Login (called after LocalStrategy validates) ────────────────────────────
    async login(user: any) {
        const tokens = await this.generateTokens(user);
        await this.storeRefreshToken(user.id, tokens.refresh_token);
        return { user: this.sanitizeUser(user), ...tokens };
    }

    // ─── Send OTP ────────────────────────────────────────────────────────────────
    async sendOtp(phone: string) {
        const user = await this.prisma.users.findUnique({ where: { phone } });
        if (!user) throw new NotFoundException('No account found with this phone number');

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const code_hash = await bcrypt.hash(code, 10);

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await this.prisma.otp_codes.create({
            data: {
                user_id: user.id,
                identifier: phone,
                code_hash,
                purpose: 'phone_verification',
                expires_at: expiresAt,
            },
        });

        // Send via Twilio or log in dev
        const sid = this.config.get('TWILIO_ACCOUNT_SID');
        const token = this.config.get('TWILIO_AUTH_TOKEN');
        const from = this.config.get('TWILIO_PHONE_NUMBER');

        if (sid && token && from) {
            const twilio = require('twilio')(sid, token);
            await twilio.messages.create({
                body: `Your MecaPro verification code is: ${code}. Valid for 10 minutes.`,
                from,
                to: phone,
            });
        } else {
            // Dev fallback — log to console
            console.log(`\n🔑 [DEV OTP] Phone: ${phone} → Code: ${code}\n`);
        }

        return { message: 'OTP sent successfully' };
    }

    // ─── Verify OTP ───────────────────────────────────────────────────────────────
    async verifyOtp(phone: string, code: string) {
        const now = new Date();

        const otpRecord = await this.prisma.otp_codes.findFirst({
            where: {
                identifier: phone,
                purpose: 'phone_verification',
                expires_at: { gt: now },
                used_at: null,
            },
            orderBy: { created_at: 'desc' },
        });

        if (!otpRecord) {
            throw new BadRequestException('OTP not found or has expired');
        }

        const isValid = await bcrypt.compare(code, otpRecord.code_hash);
        if (!isValid) {
            // Increment attempts
            await this.prisma.otp_codes.update({
                where: { id: otpRecord.id },
                data: { attempts: { increment: 1 } },
            });
            throw new BadRequestException('Invalid OTP code');
        }

        // Mark OTP as used and phone as verified
        await this.prisma.otp_codes.update({
            where: { id: otpRecord.id },
            data: { used_at: now },
        });

        await this.prisma.users.update({
            where: { id: otpRecord.user_id! },
            data: { is_phone_verified: true, status: 'active' },
        });

        return { message: 'Phone verified successfully' };
    }

    // ─── Refresh token ────────────────────────────────────────────────────────────
    async refresh(refreshToken: string) {
        const tokenHash = this.hashToken(refreshToken);

        const stored = await this.prisma.refresh_tokens.findFirst({
            where: {
                token_hash: tokenHash,
                revoked_at: null,
                expires_at: { gt: new Date() },
            },
            include: { users: true },
        });

        if (!stored) {
            throw new UnauthorizedException('Refresh token is invalid or expired');
        }

        // Rotate: revoke old, issue new
        await this.prisma.refresh_tokens.update({
            where: { id: stored.id },
            data: { revoked_at: new Date() },
        });

        const tokens = await this.generateTokens(stored.users);
        await this.storeRefreshToken(stored.users.id, tokens.refresh_token);

        return { user: this.sanitizeUser(stored.users), ...tokens };
    }

    // ─── Logout ───────────────────────────────────────────────────────────────────
    async logout(userId: string, refreshToken?: string) {
        if (refreshToken) {
            const tokenHash = this.hashToken(refreshToken);
            await this.prisma.refresh_tokens.updateMany({
                where: { user_id: userId, token_hash: tokenHash, revoked_at: null },
                data: { revoked_at: new Date() },
            });
        } else {
            // Revoke ALL refresh tokens for this user (logout everywhere)
            await this.prisma.refresh_tokens.updateMany({
                where: { user_id: userId, revoked_at: null },
                data: { revoked_at: new Date() },
            });
        }
        return { message: 'Logged out successfully' };
    }

    // ─── Private helpers ──────────────────────────────────────────────────────────
    private async generateTokens(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role,
        };

        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_ACCESS_SECRET'),
                expiresIn: this.config.get('JWT_ACCESS_EXPIRES') ?? '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: this.config.get('JWT_REFRESH_EXPIRES') ?? '7d',
            }),
        ]);

        return { access_token, refresh_token };
    }

    private async storeRefreshToken(userId: string, token: string) {
        const tokenHash = this.hashToken(token);
        const expires = this.config.get('JWT_REFRESH_EXPIRES') ?? '7d';
        const days = parseInt(expires) || 7;

        await this.prisma.refresh_tokens.create({
            data: {
                user_id: userId,
                token_hash: tokenHash,
                expires_at: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
            },
        });
    }

    private hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    private sanitizeUser(user: any) {
        const { password_hash, ...safe } = user;
        return safe;
    }
}
