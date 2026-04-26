import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { CreateTherapistDto } from './dto/create-therapist.dto';
import { UpdateTherapistDto } from './dto/update-therapist.dto';
import { CreateShiftDto } from './dto/create-shift.dto';

@Injectable()
export class TherapistsService {
  async create(businessId: string, dto: CreateTherapistDto) {
    return prisma.therapist.create({
      data: { ...dto, businessId, languages: dto.languages ?? ['en'] },
      include: { skills: { include: { service: true } } },
    });
  }

  async findAll(businessId: string) {
    return prisma.therapist.findMany({
      where: { businessId },
      orderBy: { name: 'asc' },
      include: { skills: { include: { service: true } } },
    });
  }

  async findOne(id: string) {
    const therapist = await prisma.therapist.findUnique({
      where: { id },
      include: { skills: { include: { service: true } } },
    });
    if (!therapist) throw new NotFoundException('Therapist not found');
    return therapist;
  }

  async update(id: string, dto: UpdateTherapistDto) {
    return prisma.therapist.update({
      where: { id },
      data: dto,
      include: { skills: { include: { service: true } } },
    });
  }

  async assignSkill(therapistId: string, serviceId: string) {
    return prisma.therapistSkill.upsert({
      where: { therapistId_serviceId: { therapistId, serviceId } },
      create: { therapistId, serviceId },
      update: {},
    });
  }

  async removeSkill(therapistId: string, serviceId: string) {
    return prisma.therapistSkill.delete({
      where: { therapistId_serviceId: { therapistId, serviceId } },
    });
  }

  async createShift(therapistId: string, dto: CreateShiftDto) {
    return prisma.therapistShift.create({
      data: {
        therapistId,
        dayOfWeek: dto.dayOfWeek ?? null,
        date: dto.date ? new Date(dto.date) : null,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });
  }

  async findShifts(therapistId: string) {
    return prisma.therapistShift.findMany({
      where: { therapistId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async removeShift(shiftId: string) {
    return prisma.therapistShift.delete({ where: { id: shiftId } });
  }
}
