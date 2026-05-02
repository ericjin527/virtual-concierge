import { Injectable, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class ExpertTasksService {
  // Job board — open tasks, no traveler PII
  async listOpen(category?: string, city?: string) {
    const tasks = await prisma.task.findMany({
      where: {
        status: 'new',
        expertId: null,
        experienceId: { not: null },
        ...(category ? { category: category as any } : {}),
      },
      include: {
        experience: { select: { city: true, dates: true, startDate: true, endDate: true, travelers: true, budget: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Filter by city if provided
    const filtered = city
      ? tasks.filter(t => t.experience?.city?.toLowerCase().includes(city.toLowerCase()))
      : tasks;

    // Strip traveler PII
    return filtered.map(t => ({
      id: t.id,
      category: t.category,
      status: t.status,
      urgency: t.urgency,
      createdAt: t.createdAt,
      intakeBrief: {
        title: (t.intakeBrief as any).title,
        description: (t.intakeBrief as any).description,
        day: (t.intakeBrief as any).day,
        time: (t.intakeBrief as any).time,
      },
      experience: t.experience
        ? { city: t.experience.city, dates: t.experience.dates, startDate: t.experience.startDate, endDate: t.experience.endDate, travelers: t.experience.travelers, budget: t.experience.budget }
        : null,
    }));
  }

  // Atomic accept — first-come-first-served
  async accept(taskId: string, clerkUserId: string) {
    const expert = await prisma.expert.findUnique({ where: { clerkUserId } });
    if (!expert) throw new ForbiddenException('Expert profile not found. Complete onboarding first.');
    if (expert.status !== 'approved') throw new ForbiddenException('Your account is pending approval.');

    // Check concurrent job limit
    const activeCount = await prisma.task.count({
      where: { expertId: expert.id, status: { in: ['accepted', 'in_progress'] } },
    });
    if (activeCount >= expert.maxConcurrentJobs) {
      throw new ConflictException(`You have ${activeCount} active jobs (limit: ${expert.maxConcurrentJobs}).`);
    }

    // Atomic accept
    const updated = await prisma.task.updateMany({
      where: { id: taskId, status: 'new', expertId: null },
      data: { expertId: expert.id, status: 'accepted', claimedAt: new Date() },
    });

    if (updated.count === 0) throw new ConflictException('Task already claimed by another expert.');

    // Return full task with lead contact (PII revealed post-accept)
    return prisma.task.findUniqueOrThrow({
      where: { id: taskId },
      include: { lead: true, experience: true },
    });
  }

  async start(taskId: string, clerkUserId: string) {
    const { expert, task } = await this.guardOwnership(taskId, clerkUserId);
    if (task.status !== 'accepted') throw new ForbiddenException('Task must be in accepted state to start.');
    return prisma.task.update({
      where: { id: taskId },
      data: { status: 'in_progress' },
      include: { lead: true, experience: true },
    });
  }

  async complete(taskId: string, clerkUserId: string, deliverable?: any) {
    const { task } = await this.guardOwnership(taskId, clerkUserId);
    if (!['accepted', 'in_progress'].includes(task.status)) throw new ForbiddenException('Task cannot be completed from its current status.');

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        ...(deliverable ? { deliverable } : {}),
      },
      include: { lead: true, experience: true },
    });

    // Update expert completedJobs count
    const expert = await prisma.expert.findUnique({ where: { clerkUserId } });
    if (expert) {
      await prisma.expert.update({
        where: { id: expert.id },
        data: { completedJobs: { increment: 1 } },
      });
    }

    return updated;
  }

  async getMine(clerkUserId: string, status?: string) {
    const expert = await prisma.expert.findUnique({ where: { clerkUserId } });
    if (!expert) return [];
    return prisma.task.findMany({
      where: {
        expertId: expert.id,
        ...(status ? { status: status as any } : {}),
      },
      include: { lead: true, experience: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getOneForExpert(taskId: string, clerkUserId: string) {
    const { task } = await this.guardOwnership(taskId, clerkUserId);
    return task;
  }

  private async guardOwnership(taskId: string, clerkUserId: string) {
    const expert = await prisma.expert.findUnique({ where: { clerkUserId } });
    if (!expert) throw new ForbiddenException('Expert profile not found.');
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { lead: true, experience: true },
    });
    if (!task) throw new NotFoundException('Task not found.');
    if (task.expertId !== expert.id) throw new ForbiddenException('This task is not assigned to you.');
    return { expert, task };
  }
}
