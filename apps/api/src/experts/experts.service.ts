import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class ExpertsService {
  findAll(category?: string) {
    return prisma.expert.findMany({
      where: {
        status: 'approved',
        ...(category ? { category: category as any } : {}),
      },
      orderBy: { completedJobs: 'desc' },
    });
  }

  async findOne(id: string) {
    const expert = await prisma.expert.findUnique({
      where: { id },
      include: { reviews: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    if (!expert) throw new NotFoundException('Expert not found');
    return expert;
  }

  create(data: any) {
    return prisma.expert.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return prisma.expert.update({ where: { id }, data });
  }

  async approve(id: string) {
    return prisma.expert.update({ where: { id }, data: { status: 'approved' } });
  }

  async suspend(id: string) {
    return prisma.expert.update({ where: { id }, data: { status: 'suspended' } });
  }
}
