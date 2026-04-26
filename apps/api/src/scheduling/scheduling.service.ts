import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { getBookingSystem } from '@repo/integrations';
import type { GetSlotsDto } from './dto/get-slots.dto';

@Injectable()
export class SchedulingService {
  async getSlots(businessId: string, dto: GetSlotsDto) {
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException('Business not found');

    const adapter = getBookingSystem(business);
    return adapter.getAvailableSlots({ businessId, ...dto });
  }
}
