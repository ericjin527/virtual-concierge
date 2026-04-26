import { prisma } from '@repo/db';
import { recommendSlots } from '@repo/scheduler';
import type { CandidateSlot, RecommendSlotsInput } from '@repo/types';
import type { ConfirmBookingParams, IBookingSystem } from './types';

export class InternalAdapter implements IBookingSystem {
  async getAvailableSlots(input: RecommendSlotsInput): Promise<CandidateSlot[]> {
    return recommendSlots(input);
  }

  async confirmBooking(params: ConfirmBookingParams): Promise<string | null> {
    const therapist = await prisma.therapist.findUnique({ where: { id: params.therapistId } });
    if (!therapist) return null;

    // Upsert customer by phone
    const customer = await prisma.customer.upsert({
      where: { businessId_phone: { businessId: params.businessId, phone: params.customerPhone } },
      create: { businessId: params.businessId, name: params.customerName, phone: params.customerPhone },
      update: { name: params.customerName },
    });

    const appointment = await prisma.appointment.create({
      data: {
        businessId: params.businessId,
        therapistId: params.therapistId,
        customerId: customer.id,
        startTime: new Date(params.startTime),
        endTime: new Date(params.endTime),
        notes: params.notes,
      },
    });

    return appointment.id;
  }
}
