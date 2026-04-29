import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { chatWithTools } from '@repo/agent';
import type { AgentContext, AgentMessage } from '@repo/agent';

@Injectable()
export class WidgetService {
  async getConfig(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true, primaryLanguage: true, tonePreset: true, active: true },
    });
    if (!business || !business.active) throw new NotFoundException('Business not found');
    return business;
  }

  async chat(
    businessId: string,
    sessionId: string | undefined,
    message: string,
    customerPhone?: string,
  ): Promise<{ sessionId: string; reply: string; bookingCreated: boolean }> {
    // Load or create conversation
    let conversation = sessionId
      ? await prisma.conversation.findFirst({ where: { id: sessionId, businessId, channel: 'web' } })
      : null;

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { businessId, channel: 'web', messagesJson: [] },
      });
    }

    const history = (conversation.messagesJson ?? []) as AgentMessage[];

    const ctx: AgentContext = {
      businessId,
      channel: 'web',
      customerPhone,
      messages: history,
    };

    const result = await chatWithTools(ctx, message);

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        messagesJson: [
          ...history,
          { role: 'user', content: message },
          { role: 'assistant', content: result.message },
        ],
      },
    });

    let bookingCreated = false;
    if (result.bookingIntent) {
      await prisma.bookingRequest.create({
        data: {
          businessId,
          customerName: result.bookingIntent.customerName,
          customerPhone: customerPhone ?? '',
          requestedDate: result.bookingIntent.requestedDate,
          preferredSlot: result.bookingIntent.preferredSlot,
          serviceId: result.bookingIntent.serviceId,
          notes: result.bookingIntent.notes,
          source: 'web',
        },
      });
      bookingCreated = true;
    }

    return { sessionId: conversation.id, reply: result.message, bookingCreated };
  }
}
