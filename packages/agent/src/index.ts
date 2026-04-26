import OpenAI from 'openai';
import { prisma } from '@repo/db';
import { recommendSlots } from '@repo/scheduler';
import type { RecommendSlotsInput, CandidateSlot } from '@repo/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type AgentMessage = { role: 'user' | 'assistant' | 'system'; content: string };

export interface AgentContext {
  businessId: string;
  channel: 'phone' | 'web' | 'sms';
  messages: AgentMessage[];
  customerPhone?: string;
}

export async function buildSystemPrompt(businessId: string): Promise<string> {
  const skillsFile = await prisma.skillsFile.findFirst({
    where: { businessId, status: 'published' },
    orderBy: { version: 'desc' },
  });

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { services: { where: { active: true } }, policies: true },
  });

  if (!business) throw new Error('Business not found');

  const skills = skillsFile?.content as Record<string, unknown> | null;

  return `You are a ${business.tonePreset} spa front desk AI for ${business.name}.

CORE RULES:
- Be warm, concise, and professional
- Ask ONE question at a time
- NEVER confirm appointments — only create pending booking requests
- NEVER invent prices or availability — use only data from the skills file
- NEVER provide medical advice
- NEVER offer unapproved discounts
- Hand off to human for: complaints, refunds, medical questions, discounts, explicit human requests

SERVICES (${business.services.length} active):
${business.services.map((s) => `- ${s.name}: ${s.durationMinutes}min, $${s.price}${s.bestFor ? ` | Best for: ${s.bestFor}` : ''}`).join('\n')}

${skills?.handoffRules ? `HANDOFF RULES:\n${JSON.stringify(skills.handoffRules)}` : ''}
${skills?.doNotSayRules ? `DO NOT SAY:\n${JSON.stringify(skills.doNotSayRules)}` : ''}
${business.policies?.cancellationPolicy ? `CANCELLATION POLICY: ${business.policies.cancellationPolicy}` : ''}

RECOMMENDATION STYLE: Acknowledge → Recommend → Explain briefly → Ask preference
Example: "For shoulder tension, I'd recommend deep tissue if you like stronger pressure. Would you prefer stronger pressure or something more relaxing?"

BOOKING RESPONSE: "I can request [time] for you. The spa will confirm shortly."`;
}

export async function chat(ctx: AgentContext, userMessage: string): Promise<string> {
  const systemPrompt = await buildSystemPrompt(ctx.businessId);

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...ctx.messages.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: ctx.channel === 'phone' ? 150 : 400,
    temperature: 0.4,
  });

  return response.choices[0]?.message?.content ?? "I'm sorry, I couldn't process that. Let me connect you with our team.";
}

export async function recommendSlotsForAgent(input: RecommendSlotsInput): Promise<CandidateSlot[]> {
  return recommendSlots(input);
}

export function formatSlotsForCustomer(slots: CandidateSlot[]): string {
  if (slots.length === 0) return "I don't see any availability for that time. Could you try a different day or time?";
  const options = slots.map((s) => {
    const time = new Date(s.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${time} with ${s.therapistName}`;
  });
  return `I can request ${options.join(', or ')} for you. Which would you prefer?`;
}
