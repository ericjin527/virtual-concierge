import { Module } from '@nestjs/common';
import { VendorApplicationsController } from './vendor-applications.controller';
import { VendorApplicationsService } from './vendor-applications.service';

@Module({ controllers: [VendorApplicationsController], providers: [VendorApplicationsService] })
export class VendorApplicationsModule {}
