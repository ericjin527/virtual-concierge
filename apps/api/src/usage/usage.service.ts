import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class UsageService {
  async getMonthlyUsage(businessId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [calls, bookingRequests, notifications, conversations] = await Promise.all([
      prisma.callSession.findMany({
        where: { businessId, startedAt: { gte: monthStart } },
        select: { id: true, durationSeconds: true, outcome: true },
      }),
      prisma.bookingRequest.findMany({
        where: { businessId, createdAt: { gte: monthStart } },
        select: { id: true, status: true },
      }),
      prisma.notification.findMany({
        where: { businessId, createdAt: { gte: monthStart } },
        select: { id: true },
      }),
      prisma.conversation.findMany({
        where: { businessId, createdAt: { gte: monthStart } },
        select: { messagesJson: true },
      }),
    ]);

    const totalCalls = calls.length;
    const totalCallMinutes = calls.reduce((sum, c) => sum + (c.durationSeconds ?? 0) / 60, 0);
    const bookingRequestsCreated = bookingRequests.length;
    const callbacksCreated = bookingRequests.filter((r) => r.status === 'needs_callback').length;
    const smsSent = notifications.length;

    // Rough turn count for token estimate
    const totalTurns = conversations.reduce((sum, c) => {
      const msgs = (c.messagesJson ?? []) as Array<{ role: string }>;
      return sum + Math.ceil(msgs.filter((m) => m.role === 'user').length);
    }, 0);

    // Cost estimates (rough)
    const twilioCostUsd = totalCallMinutes * 0.013 + smsSent * 0.0079;
    const openAiCostUsd = totalTurns * 0.000135; // ~500 input + 100 output tokens per turn at gpt-4o-mini rates
    const totalCostUsd = twilioCostUsd + openAiCostUsd;

    return {
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      totalCalls,
      totalCallMinutes: Math.round(totalCallMinutes * 10) / 10,
      bookingRequestsCreated,
      callbacksCreated,
      smsSent,
      estimatedTwilioCostUsd: Math.round(twilioCostUsd * 100) / 100,
      estimatedOpenAiCostUsd: Math.round(openAiCostUsd * 10000) / 10000,
      estimatedTotalCostUsd: Math.round(totalCostUsd * 100) / 100,
    };
  }

  async listCalls(businessId: string) {
    const sessions = await prisma.callSession.findMany({
      where: { businessId },
      orderBy: { startedAt: 'desc' },
      take: 100,
      include: {
        conversations: { select: { id: true, messagesJson: true } },
      },
    });

    return sessions.map((s) => {
      const msgs = (s.conversations[0]?.messagesJson ?? []) as Array<{ role: string; content: string }>;
      return {
        id: s.id,
        callerPhone: s.callerPhone,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        durationSeconds: s.durationSeconds,
        outcome: s.outcome,
        turnCount: msgs.filter((m) => m.role === 'user').length,
      };
    });
  }

  async getCall(businessId: string, callId: string) {
    const session = await prisma.callSession.findFirst({
      where: { id: callId, businessId },
      include: {
        conversations: { select: { messagesJson: true } },
      },
    });
    if (!session) return null;

    const messages = (session.conversations[0]?.messagesJson ?? []) as Array<{ role: string; content: string }>;
    return {
      id: session.id,
      callerPhone: session.callerPhone,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      durationSeconds: session.durationSeconds,
      outcome: session.outcome,
      messages,
    };
  }
}
