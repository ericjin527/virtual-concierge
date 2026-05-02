import { Injectable } from '@nestjs/common';
import { PrismaService } from '@repo/db';

@Injectable()
export class ExperiencesService {
  constructor(private prisma: PrismaService) {}

  list(status?: string, type?: string) {
    return this.prisma.experience.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(type ? { type: type as any } : {}),
      },
      include: { lead: true, _count: { select: { tasks: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  get(id: string) {
    return this.prisma.experience.findUniqueOrThrow({
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
    return this.prisma.experience.update({
      where: { id },
      data: { status: status as any },
    });
  }
}
