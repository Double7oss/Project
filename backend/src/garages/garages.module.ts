import { Module } from '@nestjs/common';
import { GaragesController, AdminGaragesController } from './garages.controller';
import { GaragesService } from './garages.service';

@Module({
    controllers: [GaragesController, AdminGaragesController],
    providers: [GaragesService],
    exports: [GaragesService],
})
export class GaragesModule { }
