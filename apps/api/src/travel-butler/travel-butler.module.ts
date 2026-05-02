import { Module } from '@nestjs/common';
import { TravelButlerController } from './travel-butler.controller';
import { TravelButlerService } from './travel-butler.service';
import { DbModule } from '@repo/db';

@Module({
  imports: [DbModule],
  controllers: [TravelButlerController],
  providers: [TravelButlerService],
})
export class TravelButlerModule {}
