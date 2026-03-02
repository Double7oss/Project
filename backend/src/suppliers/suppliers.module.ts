import { Module } from '@nestjs/common';
import { SuppliersController, AdminSuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';

@Module({
    controllers: [SuppliersController, AdminSuppliersController],
    providers: [SuppliersService],
    exports: [SuppliersService],
})
export class SuppliersModule { }
