import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ExpertsService } from './experts.service';

@Controller('experts')
export class ExpertsController {
  constructor(private readonly expertsService: ExpertsService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.expertsService.findAll(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expertsService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.expertsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.expertsService.update(id, body);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.expertsService.approve(id);
  }

  @Post(':id/suspend')
  suspend(@Param('id') id: string) {
    return this.expertsService.suspend(id);
  }
}
