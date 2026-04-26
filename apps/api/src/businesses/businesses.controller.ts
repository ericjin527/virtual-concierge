import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@ApiTags('businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  create(@Body() dto: CreateBusinessDto) {
    return this.businessesService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBusinessDto) {
    return this.businessesService.update(id, dto);
  }
}
