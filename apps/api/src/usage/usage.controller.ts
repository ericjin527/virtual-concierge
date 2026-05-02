import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsageService } from './usage.service';

@ApiTags('usage')
@Controller('businesses/:businessId')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get('usage/monthly')
  getMonthlyUsage(@Param('businessId') businessId: string) {
    return this.usageService.getMonthlyUsage(businessId);
  }

  @Get('calls')
  listCalls(@Param('businessId') businessId: string) {
    return this.usageService.listCalls(businessId);
  }

  @Get('calls/:callId')
  async getCall(@Param('businessId') businessId: string, @Param('callId') callId: string) {
    const call = await this.usageService.getCall(businessId, callId);
    if (!call) throw new NotFoundException('Call session not found');
    return call;
  }
}
