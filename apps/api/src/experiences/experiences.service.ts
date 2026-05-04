import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class ExperiencesService {
  listByClerkUser(clerkUserId: string) {
    return prisma.experience.findMany({
      where: { lead: { clerkUserId } },
      include: { _count: { select: { tasks: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  list(status?: string, type?: string, phone?: string) {
    return prisma.experience.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(type ? { type: type as any } : {}),
        ...(phone ? { lead: { phone } } : {}),
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

  async deleteOwned(id: string, clerkUserId: string) {
    const exp = await prisma.experience.findUnique({
      where: { id },
      include: { lead: { select: { clerkUserId: true } } },
    });
    if (!exp) throw new Error('Not found');
    if (exp.lead?.clerkUserId !== clerkUserId) throw new Error('Forbidden');
    return prisma.experience.delete({ where: { id } });
  }
}
