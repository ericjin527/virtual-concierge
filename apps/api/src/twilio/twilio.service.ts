import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@repo/db';
import { chatWithTools } from '@repo/agent';
import { sendSms, buildTwimlGather, buildTwimlHangup } from '@repo/integrations';
import type { AgentContext, AgentMessage } from '@repo/agent';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);

  private digitsOnly(phone: string): string {
    return phone.replace(/\D/g, '').slice(-10);
  }

  async handleIncomingCall(callSid: string, fromPhone: string, toPhone: string): Promise<string> {
    const digits = this.digitsOnly(toPhone);
    const allBusinesses = await prisma.business.findMany({ where: { active: true } });
    const business = allBusinesses.find((b) => this.digitsOnly(b.publicPhone) === digits) ?? null;

    if (!business) {
      this.logger.warn(`No business found for phone ${toPhone}`);
      return buildTwimlHangup("I'm sorry, this number is not in service. Goodbye.");
    }

    const session = await prisma.callSession.create({
      data: { businessId: business.id, twilioCallSid: callSid, callerPhone: fromPhone },
    });

    await prisma.conversation.create({
      data: { businessId: business.id, callSessionId: session.id, channel: 'phone', messagesJson: [] },
    });

    const lang = business.primaryLanguage === 'zh' ? 'zh-CN' : 'en-US';
    const voice = business.primaryLanguage === 'zh' ? 'Polly.Zhiyu' : 'Polly.Joanna';
    const greeting =
      business.primaryLanguage === 'zh'
        ? `您好，欢迎致电${business.name}。请问有什么可以帮您？`
        : `Hello, thank you for calling ${business.name}. How can I help you today?`;

    return buildTwimlGather(greeting, voice, lang);
  }

  async processVoiceTurn(callSid: string, speechResult: string | undefined): Promise<string> {
    const session = await prisma.callSession.findUnique({
      where: { twilioCallSid: callSid },
      include: {
        business: true,
        conversations: { orderBy: { createdAt: 'asc' }, take: 1 },
      },
    });

    if (!session) {
      return buildTwimlHangup("I'm sorry, I lost track of our conversation. Please call again. Goodbye.");
    }

    const lang = session.business.primaryLanguage === 'zh' ? 'zh-CN' : 'en-US';
    const voice = session.business.primaryLanguage === 'zh' ? 'Polly.Zhiyu' : 'Polly.Joanna';

    // No speech detected — re-prompt once
    if (!speechResult?.trim()) {
      const reprompt =
        lang === 'zh-CN' ? '抱歉，我没有听清楚。请问有什么可以帮您？' : "I'm sorry, I didn't catch that. How can I help you today?";
      return buildTwimlGather(reprompt, voice, lang);
    }

    const conversation = session.conversations[0];
    const history = (conversation?.messagesJson ?? []) as AgentMessage[];

    const ctx: AgentContext = {
      businessId: session.businessId,
      channel: 'phone',
      customerPhone: session.callerPhone ?? undefined,
      messages: history,
    };

    let result;
    try {
      result = await chatWithTools(ctx, speechResult);
    } catch (err) {
      this.logger.error('Agent error:', err);
      const sorry =
        lang === 'zh-CN'
          ? '非常抱歉，我遇到了一点问题。请稍后再试。再见。'
          : "I'm sorry, I'm having trouble right now. Please try again shortly. Goodbye.";
      return buildTwimlHangup(sorry);
    }

    // Persist conversation history
    const updatedHistory: AgentMessage[] = [
      ...history,
      { role: 'user', content: speechResult },
      { role: 'assistant', content: result.message },
    ];

    if (conversation) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { messagesJson: updatedHistory },
      });
    }

    // Create booking request if agent decided to book
    if (result.bookingIntent) {
      try {
        const intent = result.bookingIntent;
        await prisma.bookingRequest.create({
          data: {
            businessId: session.businessId,
            customerName: intent.customerName,
            customerPhone: session.callerPhone ?? '',
            requestedDate: intent.requestedDate,
            preferredSlot: intent.preferredSlot,
            serviceId: intent.serviceId,
            notes: intent.notes,
            source: 'phone',
          },
        });

        await prisma.callSession.update({
          where: { id: session.id },
          data: { outcome: 'booking_request_created' },
        });

        // SMS confirmation to caller
        if (session.callerPhone) {
          const smsBody =
            lang === 'zh-CN'
              ? `您好！您的预约请求已发送至${session.business.name}，他们将尽快与您确认。`
              : `Hi! Your booking request has been sent to ${session.business.name}. They'll confirm with you shortly.`;
          sendSms(session.callerPhone, smsBody).catch((e) =>
            this.logger.error('SMS send failed:', e),
          );
        }

        // Notify owner
        if (session.business.ownerPhone) {
          const ownerSms = `New booking request from ${intent.customerName} (${session.callerPhone ?? 'unknown'}) for ${intent.requestedDate}${intent.preferredSlot ? ' at ' + intent.preferredSlot : ''}. Check your dashboard.`;
          sendSms(session.business.ownerPhone, ownerSms).catch((e) =>
            this.logger.error('Owner SMS failed:', e),
          );
        }
      } catch (err) {
        this.logger.error('Failed to create booking request:', err);
      }
    }

    // Handoff or end of call
    if (result.handoff || result.bookingIntent) {
      if (!result.bookingIntent) {
        await prisma.callSession.update({
          where: { id: session.id },
          data: { outcome: 'human_handoff', endedAt: new Date() },
        });
      } else {
        await prisma.callSession.update({
          where: { id: session.id },
          data: { endedAt: new Date() },
        });
      }
      return buildTwimlHangup(result.message, voice);
    }

    return buildTwimlGather(result.message, voice, lang);
  }
}
