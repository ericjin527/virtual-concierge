import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { CreateTherapistDto } from './dto/create-therapist.dto';
import { UpdateTherapistDto } from './dto/update-therapist.dto';

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
}
