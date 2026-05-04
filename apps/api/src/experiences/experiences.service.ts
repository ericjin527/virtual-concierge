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

  async cleanupStale() {
    // Delete experiences (cascades to tasks) where:
    // - status is still 'intake' or 'plan_ready' (never confirmed), OR
    // - city is a test city (Tampa, hawaii)
    // Keeps in_coordination / confirmed / completed real trips.
    const staleExperiences = await prisma.experience.findMany({
      where: {
        OR: [
          { status: { in: ['intake', 'plan_ready'] as any[] } },
          { city: { in: ['tampa', 'Tampa', 'hawaii', 'Hawaii'] } },
        ],
      },
      select: { id: true, city: true, status: true, _count: { select: { tasks: true } } },
    });

    if (staleExperiences.length === 0) return { deleted: { experiences: 0, tasks: 0 } };

    const ids = staleExperiences.map(e => e.id);
    const taskCount = staleExperiences.reduce((s, e) => s + e._count.tasks, 0);

    await prisma.experience.deleteMany({ where: { id: { in: ids } } });

    return {
      deleted: { experiences: ids.length, tasks: taskCount },
      summary: staleExperiences.map(e => ({ id: e.id, city: e.city, status: e.status, tasks: e._count.tasks })),
    };
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
