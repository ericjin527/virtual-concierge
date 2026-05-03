import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { DestinationsService } from './destinations.service';

@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.destinationsService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.destinationsService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.destinationsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.destinationsService.update(id, body);
  }

  @Get(':id/areas')
  listAreas(@Param('id') id: string) {
    return this.destinationsService.listAreas(id);
  }

  @Post(':id/areas')
  createArea(@Param('id') id: string, @Body() body: any) {
    return this.destinationsService.createArea(id, body);
  }

  @Patch(':id/areas/:areaId')
  updateArea(@Param('areaId') areaId: string, @Body() body: any) {
    return this.destinationsService.updateArea(areaId, body);
  }
}
