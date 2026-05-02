import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class ExperiencesService {
  list(status?: string, type?: string) {
    return prisma.experience.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(type ? { type: type as any } : {}),
      },
      include: { lead: true, _count: { select: { tasks: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  get(id: string) {
    return prisma.experience.findUniqueOrThrow({
      where: { id },
      include: {
        lead: true,
        tasks: {
          include: { expert: true, quotes: true, messages: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  updateStatus(id: string, status: string) {
    return prisma.experience.update({
      where: { id },
      data: { status: status as any },
    });
  }
}
