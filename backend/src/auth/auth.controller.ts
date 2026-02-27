import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // POST /api/auth/register
    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    // POST /api/auth/login
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Request() req: any) {
        return this.authService.login(req.user);
    }

    // POST /api/auth/otp/send
    @Post('otp/send')
    @HttpCode(HttpStatus.OK)
    async sendOtp(@Body() dto: SendOtpDto) {
        return this.authService.sendOtp(dto.phone);
    }

    // POST /api/auth/otp/verify
    @Post('otp/verify')
    @HttpCode(HttpStatus.OK)
    async verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOtp(dto.phone, dto.code);
    }

    // POST /api/auth/refresh
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() dto: RefreshDto) {
        return this.authService.refresh(dto.refresh_token);
    }

    // POST /api/auth/logout
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @CurrentUser() user: any,
        @Body() body: { refresh_token?: string },
    ) {
        return this.authService.logout(user.id, body.refresh_token);
    }

    // GET /api/auth/me
    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() user: any) {
        return user;
    }
}
