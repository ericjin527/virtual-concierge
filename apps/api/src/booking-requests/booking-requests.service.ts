import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { getBookingSystem } from '@repo/integrations';
import type { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import type { UpdateBookingRequestDto } from './dto/update-booking-request.dto';

@Injectable()
export class BookingRequestsService {
  async create(businessId: string, dto: CreateBookingRequestDto) {
    const customer = dto.customerPhone
      ? await prisma.customer.upsert({
          where: { businessId_phone: { businessId, phone: dto.customerPhone } },
          create: { businessId, name: dto.customerName, phone: dto.customerPhone },
          update: { name: dto.customerName },
        })
      : null;

    return prisma.bookingRequest.create({
      data: {
        businessId,
        customerId: customer?.id,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        requestedDate: dto.requestedDate,
        serviceId: dto.serviceId,
        preferredSlot: dto.preferredSlot,
        recommendedSlotsJson: dto.recommendedSlotsJson ?? undefined,
        notes: dto.notes,
        source: dto.source ?? 'web',
      },
      include: { service: true, customer: true },
    });
  }

  async findAll(businessId: string, status?: string) {
    return prisma.bookingRequest.findMany({
      where: {
        businessId,
        ...(status ? { status: status as never } : {}),
      },
      include: { service: true, customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const req = await prisma.bookingRequest.findUnique({
      where: { id },
      include: { service: true, customer: true },
    });
    if (!req) throw new NotFoundException('Booking request not found');
    return req;
  }

  async updateStatus(id: string, dto: UpdateBookingRequestDto) {
    const req = await this.findOne(id);

    const updated = await prisma.bookingRequest.update({
      where: { id },
      data: { status: dto.status, ...(dto.notes ? { notes: dto.notes } : {}) },
      include: { service: true, customer: true },
    });

    // When confirmed, create the real booking in the target system
    if (dto.status === 'confirmed' && req.preferredSlot && req.serviceId) {
      try {
        const business = await prisma.business.findUnique({ where: { id: req.businessId } });
        if (business) {
          const adapter = getBookingSystem(business);
          const slots = req.recommendedSlotsJson as Array<{ startTime: string; endTime: string; therapistId: string }> | null;
          const chosen = slots?.find((s) => s.startTime.includes(req.preferredSlot!)) ?? slots?.[0];
          if (chosen) {
            await adapter.confirmBooking({
              businessId: req.businessId,
              therapistId: chosen.therapistId,
              serviceId: req.serviceId,
              serviceName: req.service?.name ?? 'Service',
              startTime: chosen.startTime,
              endTime: chosen.endTime,
              customerName: req.customerName,
              customerPhone: req.customerPhone,
              notes: req.notes ?? undefined,
            });
          }
        }
      } catch (err) {
        // Log but don't fail — owner confirmed, booking system sync is best-effort
        console.error('Booking system sync failed:', err);
      }
    }

    return updated;
  }
}
