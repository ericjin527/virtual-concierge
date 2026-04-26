import { Controller, Post, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SchedulingService } from './scheduling.service';
import { GetSlotsDto } from './dto/get-slots.dto';

@ApiTags('scheduling')
@Controller('businesses/:businessId/scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Post('slots')
  getSlots(@Param('businessId') businessId: string, @Body() dto: GetSlotsDto) {
    return this.schedulingService.getSlots(businessId, dto);
  }
}
