import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class ProposalsService {
  listByTask(taskId: string) {
    return prisma.expertProposal.findMany({
      where: { taskId },
      include: {
        expert: {
          select: {
            id: true, name: true, glamCategory: true, photoUrl: true,
            rating: true, completedJobs: true, bio: true, metadata: true,
            _count: { select: { reviews: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const proposal = await prisma.expertProposal.findUnique({
      where: { id },
      include: { expert: true, task: true },
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    return proposal;
  }

  // Expert: self-submit a bid from the job board (creates proposal with status accepted directly)
  async selfSubmit(taskId: string, clerkUserId: string, data: {
    proposedPrice: number;
    currency: string;
    note?: string;
    portfolioSampleUrl?: string;
    availableStart: string;
    availableEnd: string;
  }) {
    const expert = await prisma.expert.findUnique({ where: { clerkUserId } });
    if (!expert) throw new ForbiddenException('Expert profile not found. Complete onboarding first.');

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found.');
    if (task.status !== 'new') throw new ConflictException('This task is no longer available.');

    return prisma.expertProposal.upsert({
      where: { taskId_expertId: { taskId, expertId: expert.id } },
      create: {
        taskId, expertId: expert.id, status: 'accepted',
        proposedPrice: data.proposedPrice, currency: data.currency,
        note: data.note, portfolioSampleUrl: data.portfolioSampleUrl,
        availableStart: new Date(data.availableStart),
        availableEnd: new Date(data.availableEnd),
      },
      update: {
        status: 'accepted',
        proposedPrice: data.proposedPrice, currency: data.currency,
        note: data.note, portfolioSampleUrl: data.portfolioSampleUrl,
        availableStart: new Date(data.availableStart),
        availableEnd: new Date(data.availableEnd),
      },
    });
  }

  // Admin: invite expert to a task
  async invite(taskId: string, expertId: string, note?: string) {
    return prisma.expertProposal.upsert({
      where: { taskId_expertId: { taskId, expertId } },
      create: { taskId, expertId, note, status: 'invited' },
      update: { note, status: 'invited' },
    });
  }

  // Expert: accept with price and availability
  async accept(id: string, clerkUserId: string, data: {
    proposedPrice: number;
    currency: string;
    note?: string;
    portfolioSampleUrl?: string;
    availableStart: string;
    availableEnd: string;
  }) {
    const proposal = await this.findOne(id);
    const expert = await prisma.expert.findUnique({ where: { clerkUserId } });
    if (!expert || proposal.expertId !== expert.id) throw new ForbiddenException();
    if (!['invited', 'declined'].includes(proposal.status)) {
      throw new ForbiddenException('Proposal cannot be updated in its current state');
    }
    return prisma.expertProposal.update({
      where: { id },
      data: {
        status: 'accepted',
        proposedPrice: data.proposedPrice,
        currency: data.currency,
        note: data.note,
        portfolioSampleUrl: data.portfolioSampleUrl,
        availableStart: new Date(data.availableStart),
        availableEnd: new Date(data.availableEnd),
      },
    });
  }

  // Expert: decline
  async decline(id: string, clerkUserId: string, note?: string) {
    const proposal = await this.findOne(id);
    const expert = await prisma.expert.findUnique({ where: { clerkUserId } });
    if (!expert || proposal.expertId !== expert.id) throw new ForbiddenException();
    return prisma.expertProposal.update({ where: { id }, data: { status: 'declined', note } });
  }

  // Admin: select a proposal → assign expert to task
  async select(id: string) {
    const proposal = await this.findOne(id);
    if (proposal.status !== 'accepted') throw new ForbiddenException('Can only select an accepted proposal');

    // Reject all other proposals for this task
    await prisma.expertProposal.updateMany({
      where: { taskId: proposal.taskId, id: { not: id } },
      data: { status: 'rejected' },
    });

    // Mark this one selected
    await prisma.expertProposal.update({ where: { id }, data: { status: 'selected' } });

    // Assign expert to task
    return prisma.task.update({
      where: { id: proposal.taskId },
      data: { expertId: proposal.expertId, status: 'accepted' },
    });
  }

  // Customer: select a proposal (verifies task ownership via lead.clerkUserId)
  async customerSelect(id: string, clerkUserId: string) {
    const proposal = await this.findOne(id);
    if (proposal.status !== 'accepted') throw new ForbiddenException('Can only select an accepted proposal');

    const task = await prisma.task.findUnique({
      where: { id: proposal.taskId },
      include: { lead: { select: { clerkUserId: true } } },
    });
    if (!task?.lead?.clerkUserId || task.lead.clerkUserId !== clerkUserId) {
      throw new ForbiddenException('Not authorized to select on this task');
    }

    await prisma.expertProposal.updateMany({
      where: { taskId: proposal.taskId, id: { not: id } },
      data: { status: 'rejected' },
    });
    await prisma.expertProposal.update({ where: { id }, data: { status: 'selected' } });
    return prisma.task.update({
      where: { id: proposal.taskId },
      data: { expertId: proposal.expertId, status: 'accepted' },
    });
  }

  // Admin: reject a specific proposal
  async reject(id: string, note?: string) {
    return prisma.expertProposal.update({ where: { id }, data: { status: 'rejected', note } });
  }

  // Expert: get my proposals
  listByExpert(clerkUserId: string) {
    return prisma.expertProposal.findMany({
      where: { expert: { clerkUserId } },
      include: { task: { include: { experience: { select: { city: true, dates: true, travelers: true, budget: true, occasion: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
