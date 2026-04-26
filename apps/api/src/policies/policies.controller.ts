import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PoliciesService } from './policies.service';
import { UpsertPolicyDto } from './dto/upsert-policy.dto';

@ApiTags('policies')
@Controller('businesses/:businessId/policy')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Get()
  findOne(@Param('businessId') businessId: string) {
    return this.policiesService.findOne(businessId);
  }

  @Post()
  upsert(@Param('businessId') businessId: string, @Body() dto: UpsertPolicyDto) {
    return this.policiesService.upsert(businessId, dto);
  }
}
