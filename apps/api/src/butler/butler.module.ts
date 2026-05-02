import { Module } from '@nestjs/common';
import { ButlerController } from './butler.controller';
import { ButlerService } from './butler.service';

@Module({ controllers: [ButlerController], providers: [ButlerService] })
export class ButlerModule {}
