import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { VendorApplicationsService } from './vendor-applications.service';

@Controller('vendor-applications')
export class VendorApplicationsController {
  constructor(private readonly service: VendorApplicationsService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.service.findAll(status);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.service.approve(id);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string) {
    return this.service.reject(id);
  }
}
