import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GaragesModule } from './garages/garages.module';
import { CitiesModule } from './cities/cities.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ProductsModule } from './products/products.module';
import { BookingsModule } from './bookings/bookings.module';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    // ── Config (with early crash if required vars are missing) ──────────────
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_ACCESS_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_SECRET: Joi.string().min(32).required(),
        JWT_ACCESS_EXPIRES: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRES: Joi.string().default('7d'),
        PORT: Joi.number().default(3001),
        TWILIO_ACCOUNT_SID: Joi.string().optional().allow(''),
        TWILIO_AUTH_TOKEN: Joi.string().optional().allow(''),
        TWILIO_PHONE_NUMBER: Joi.string().optional().allow(''),
      }),
    }),

    // ── Serve uploaded files as static assets ───────────────────────────────
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    // ── Core ────────────────────────────────────────────────────────────────
    PrismaModule,
    AuthModule,

    // ── Feature modules ─────────────────────────────────────────────────────
    CitiesModule,
    GaragesModule,
    SuppliersModule,
    ProductsModule,
    BookingsModule,
    OrdersModule,
    NotificationsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
