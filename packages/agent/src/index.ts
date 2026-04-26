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

export interface BookingIntent {
  customerName: string;
  requestedDate: string;
  preferredSlot?: string;
  serviceId?: string;
  notes?: string;
}

export interface ChatResult {
  message: string;
  bookingIntent?: BookingIntent;
  handoff?: boolean;
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
${business.services.map((s) => `- ${s.name} (id:${s.id}): ${s.durationMinutes}min, $${s.price}${s.bestFor ? ` | Best for: ${s.bestFor}` : ''}`).join('\n')}

${skills?.handoffRules ? `HANDOFF RULES:\n${JSON.stringify(skills.handoffRules)}` : ''}
${skills?.doNotSayRules ? `DO NOT SAY:\n${JSON.stringify(skills.doNotSayRules)}` : ''}
${business.policies?.cancellationPolicy ? `CANCELLATION POLICY: ${business.policies.cancellationPolicy}` : ''}

BOOKING FLOW:
1. Understand what service the customer wants
2. Ask for their name
3. Ask for preferred date and time
4. Call create_booking_request once you have: name + date (service and time are optional)
5. Tell them the spa will confirm shortly — never guarantee a slot

RECOMMENDATION STYLE: Acknowledge → Recommend → Explain briefly → Ask preference`;
}

const BOOKING_TOOL: OpenAI.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'create_booking_request',
    description: 'Submit a booking request once you have the customer name and requested date. Call this as soon as you have the minimum required info — do not ask for more than needed.',
    parameters: {
      type: 'object',
      properties: {
        customerName: { type: 'string', description: "Customer's full name" },
        requestedDate: { type: 'string', description: 'Date in YYYY-MM-DD format' },
        preferredSlot: { type: 'string', description: 'Preferred time, e.g. "14:00" or "afternoon"' },
        serviceId: { type: 'string', description: 'Service ID from the services list' },
        notes: { type: 'string', description: 'Any special requests' },
      },
      required: ['customerName', 'requestedDate'],
    },
  },
};

export async function chatWithTools(ctx: AgentContext, userMessage: string): Promise<ChatResult> {
  const systemPrompt = await buildSystemPrompt(ctx.businessId);

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...ctx.messages.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    tools: [BOOKING_TOOL],
    tool_choice: 'auto',
    max_tokens: ctx.channel === 'phone' ? 120 : 400,
    temperature: 0.4,
  });

  const choice = response.choices[0];

  if (choice?.message.tool_calls?.[0]) {
    const toolCall = choice.message.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments) as BookingIntent;

    // Get a natural confirmation message after the tool call
    const followUp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        ...messages,
        choice.message,
        { role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify({ success: true }) },
      ],
      max_tokens: 120,
      temperature: 0.4,
    });

    return {
      message: followUp.choices[0]?.message?.content ?? "I've sent your booking request. The spa will confirm shortly.",
      bookingIntent: args,
    };
  }

  const text = choice?.message?.content ?? "I'm sorry, I couldn't process that. Let me connect you with our team.";
  const lowerText = text.toLowerCase();
  const handoff =
    lowerText.includes('transfer') ||
    lowerText.includes('connect you with') ||
    lowerText.includes('colleague') ||
    lowerText.includes('call us back');

  return { message: text, handoff };
}

// Simple text-only chat (used by web widget)
export async function chat(ctx: AgentContext, userMessage: string): Promise<string> {
  const result = await chatWithTools(ctx, userMessage);
  return result.message;
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
