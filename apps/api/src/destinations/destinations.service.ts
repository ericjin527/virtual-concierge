import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class DestinationsService {
  findAll(status?: string) {
    return prisma.destination.findMany({
      where: status ? { status: status as any } : { status: 'active' },
      include: { areas: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const dest = await prisma.destination.findUnique({
      where: { id },
      include: { areas: { orderBy: { name: 'asc' } } },
    });
    if (!dest) throw new NotFoundException('Destination not found');
    return dest;
  }

  create(data: any) {
    return prisma.destination.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return prisma.destination.update({ where: { id }, data });
  }

  createArea(destinationId: string, data: any) {
    return prisma.destinationArea.create({ data: { ...data, destinationId } });
  }

  listAreas(destinationId: string) {
    return prisma.destinationArea.findMany({
      where: { destinationId },
      orderBy: { name: 'asc' },
    });
  }

  async updateArea(areaId: string, data: any) {
    return prisma.destinationArea.update({ where: { id: areaId }, data });
  }
}
