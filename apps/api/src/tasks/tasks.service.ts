import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { sendSms } from '@repo/integrations';

@Injectable()
export class TasksService {
  findAll(status?: string, category?: string) {
    return prisma.task.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(category ? { category: category as any } : {}),
      },
      include: { lead: true, expert: true, quotes: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        lead: true,
        expert: true,
        quotes: { include: { expert: true } },
        booking: true,
        reviews: true,
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  create(data: { category: any; intakeBrief: any; address?: string; urgency?: string; source?: any; leadName?: string; leadPhone?: string; leadEmail?: string }) {
    return prisma.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          name: data.leadName,
          phone: data.leadPhone,
          email: data.leadEmail,
        },
      });

      return tx.task.create({
        data: {
          leadId: lead.id,
          category: data.category,
          intakeBrief: data.intakeBrief,
          address: data.address,
          urgency: data.urgency,
          source: data.source ?? 'web',
        },
        include: { lead: true },
      });
    });
  }

  async assignExpert(taskId: string, expertId: string) {
    const task = await this.findOne(taskId);
    const expert = await prisma.expert.findUnique({ where: { id: expertId } });
    if (!expert) throw new NotFoundException('Expert not found');

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { expertId, status: 'matched' },
    });

    // Notify expert
    if (expert.phone) {
      const brief = task.intakeBrief as Record<string, any>;
      sendSms(
        expert.phone,
        `New job request: ${brief.applianceType ?? task.category} — ${brief.symptoms ?? 'see details'}. Address: ${task.address ?? 'TBD'}. Log in to accept: localbutler.app/portal`,
      ).catch(() => {});
    }

    // Notify customer
    if (task.lead?.phone) {
      sendSms(
        task.lead.phone,
        `Great news! We matched you with ${expert.name}${expert.businessName ? ` (${expert.businessName})` : ''}. They'll be in touch shortly to confirm.`,
      ).catch(() => {});
    }

    return updated;
  }

  async updateStatus(taskId: string, status: any) {
    return prisma.task.update({ where: { id: taskId }, data: { status } });
  }

  async addMessage(taskId: string, fromRole: any, body: string) {
    return prisma.taskMessage.create({ data: { taskId, fromRole, body } });
  }
}
