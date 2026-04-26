import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  async create(businessId: string, dto: CreateServiceDto) {
    return prisma.service.create({ data: { ...dto, businessId } });
  }

  async findAll(businessId: string) {
    return prisma.service.findMany({ where: { businessId }, orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(id: string, dto: UpdateServiceDto) {
    return prisma.service.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return prisma.service.update({ where: { id }, data: { active: false } });
  }
}
