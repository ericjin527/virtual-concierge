import { Module } from '@nestjs/common';
import { TravelButlerController } from './travel-butler.controller';
import { TravelButlerService } from './travel-butler.service';

@Module({ controllers: [TravelButlerController], providers: [TravelButlerService] })
export class TravelButlerModule {}
