import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessesService {
  async create(dto: CreateBusinessDto) {
    return prisma.business.create({ data: dto });
  }

  async findOne(id: string) {
    const business = await prisma.business.findUnique({
      where: { id },
      include: { services: true, therapists: true },
    });
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async update(id: string, dto: UpdateBusinessDto) {
    return prisma.business.update({ where: { id }, data: dto });
  }
}
