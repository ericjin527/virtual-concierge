import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TherapistsService } from './therapists.service';
import { CreateTherapistDto } from './dto/create-therapist.dto';
import { UpdateTherapistDto } from './dto/update-therapist.dto';
import { AssignSkillDto } from './dto/assign-skill.dto';

@ApiTags('therapists')
@Controller('businesses/:businessId/therapists')
export class TherapistsController {
  constructor(private readonly therapistsService: TherapistsService) {}

  @Post()
  create(@Param('businessId') businessId: string, @Body() dto: CreateTherapistDto) {
    return this.therapistsService.create(businessId, dto);
  }

  @Get()
  findAll(@Param('businessId') businessId: string) {
    return this.therapistsService.findAll(businessId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTherapistDto) {
    return this.therapistsService.update(id, dto);
  }

  @Post(':id/skills')
  assignSkill(@Param('id') id: string, @Body() dto: AssignSkillDto) {
    return this.therapistsService.assignSkill(id, dto.serviceId);
  }

  @Delete(':id/skills/:serviceId')
  removeSkill(@Param('id') id: string, @Param('serviceId') serviceId: string) {
    return this.therapistsService.removeSkill(id, serviceId);
  }
}
