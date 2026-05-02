import OpenAI from 'openai';
import { prisma } from '@repo/db';
import { recommendSlots } from '@repo/scheduler';
import type { RecommendSlotsInput, CandidateSlot } from '@repo/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const promptCache = new Map<string, { prompt: string; expiresAt: number }>();

async function getCachedSystemPrompt(businessId: string): Promise<string> {
  const cached = promptCache.get(businessId);
  if (cached && cached.expiresAt > Date.now()) return cached.prompt;
  const prompt = await buildSystemPrompt(businessId);
  promptCache.set(businessId, { prompt, expiresAt: Date.now() + 5 * 60 * 1000 });
  return prompt;
}

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

INTENT DETECTION — decide which path to take before anything else:
- Customer names a specific service ("deep tissue", "60-minute massage", "facial") → go directly to BOOKING FLOW
- Customer is vague ("I want a massage", "something relaxing", "not sure") → go to RECOMMENDATION FLOW first

RECOMMENDATION FLOW (vague intent):
1. Ask ONE clarifying question — pressure preference, concern, or occasion (e.g. "Are you looking for something relaxing or more therapeutic?")
2. Based on their answer, recommend ONE service from the list above with a brief reason using its bestFor info
3. Confirm they want it ("Does that sound good?")
4. Once confirmed, continue to BOOKING FLOW

BOOKING FLOW (specific intent or after recommendation):
1. Ask for their name
2. Ask for preferred date and time
3. Call get_available_slots with the serviceId and date
4. Present the slots: "I can request [time] with [therapist], or [time] with [therapist]. Which works for you?"
5. Once the customer picks (or if no slots returned), call create_booking_request
6. Tell them the spa will confirm shortly — NEVER say "you are booked"

DATE HANDLING:
- Accept any natural language date: "next Monday", "Tuesday after 5", "sometime this week", "tomorrow afternoon"
- When the customer gives a date range ("Monday or Tuesday"), pick the first option
- NEVER ask for a date again if the customer already gave you a day, time preference, or range — convert it yourself
- Use today's date as reference: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
}

const GET_SLOTS_TOOL: OpenAI.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'get_available_slots',
    description: 'Get 2-3 real available time slots for a service on a given date. Always call this BEFORE create_booking_request when you have the service and date.',
    parameters: {
      type: 'object',
      properties: {
        serviceId: { type: 'string', description: 'Service ID from the services list' },
        date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
        preferredWindow: {
          type: 'object',
          description: 'Optional preferred time window',
          properties: {
            label: { type: 'string', enum: ['morning', 'afternoon', 'evening'] },
            start: { type: 'string', description: 'Start time HH:MM' },
            end: { type: 'string', description: 'End time HH:MM' },
          },
        },
      },
      required: ['date'],
    },
  },
};

const BOOKING_TOOL: OpenAI.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'create_booking_request',
    description: 'Submit a booking request. Call this AFTER presenting slots from get_available_slots and the customer has chosen one. If no slots were available, call it with the customer\'s stated preference.',
    parameters: {
      type: 'object',
      properties: {
        customerName: { type: 'string', description: "Customer's full name" },
        requestedDate: { type: 'string', description: 'Date in YYYY-MM-DD format' },
        preferredSlot: { type: 'string', description: 'The specific slot chosen by the customer, e.g. "14:00" or "3:00pm with Sarah"' },
        serviceId: { type: 'string', description: 'Service ID from the services list' },
        notes: { type: 'string', description: 'Any special requests or slot flexibility notes' },
      },
      required: ['customerName', 'requestedDate'],
    },
  },
};

export async function chatWithTools(ctx: AgentContext, userMessage: string): Promise<ChatResult> {
  const systemPrompt = await getCachedSystemPrompt(ctx.businessId);

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...ctx.messages.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  // Allow up to 2 tool calls per turn (get_available_slots → create_booking_request or text response)
  for (let i = 0; i < 3; i++) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools: [GET_SLOTS_TOOL, BOOKING_TOOL],
      tool_choice: 'auto',
      max_tokens: ctx.channel === 'phone' ? 120 : 400,
      temperature: 0.4,
    });

    const choice = response.choices[0];

    if (!choice?.message.tool_calls?.[0]) {
      const text = choice?.message?.content ?? "I'm sorry, I couldn't process that. Let me connect you with our team.";
      const lowerText = text.toLowerCase();
      const handoff =
        lowerText.includes('transfer') ||
        lowerText.includes('connect you with') ||
        lowerText.includes('colleague') ||
        lowerText.includes('call us back');
      return { message: text, handoff };
    }

    const toolCall = choice.message.tool_calls[0];

    if (toolCall.function.name === 'create_booking_request') {
      const args = JSON.parse(toolCall.function.arguments) as BookingIntent;
      return {
        message: `Perfect! I've sent your booking request to the spa. They'll reach out to confirm your appointment soon.`,
        bookingIntent: args,
      };
    }

    if (toolCall.function.name === 'get_available_slots') {
      const args = JSON.parse(toolCall.function.arguments) as {
        serviceId?: string;
        date: string;
        preferredWindow?: { label?: string; start?: string; end?: string };
      };

      const pw = args.preferredWindow;
      const slots = await recommendSlots({
        businessId: ctx.businessId,
        serviceId: args.serviceId ?? '',
        date: args.date,
        preferredWindow: pw
          ? {
              label: (['morning', 'afternoon', 'evening'] as const).find((l) => l === pw.label),
              start: pw.start,
              end: pw.end,
            }
          : undefined,
        partySize: 1,
      });

      const slotText = formatSlotsForCustomer(slots);

      messages.push(choice.message);
      messages.push({ role: 'tool', tool_call_id: toolCall.id, content: slotText });
      continue;
    }

    break;
  }

  return { message: "I'm sorry, I couldn't process that. Let me connect you with our team.", handoff: true };
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
  if (slots.length === 0) return "I don't see specific availability on file for that time — the spa will check and confirm. Go ahead and tell me your preference and I'll request it.";
  const options = slots.map((s) => {
    const time = new Date(s.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${time} with ${s.therapistName}`;
  });
  return `I can request ${options.join(', or ')} for you. Which would you prefer?`;
}
