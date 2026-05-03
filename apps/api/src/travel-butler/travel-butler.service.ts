import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { prisma } from '@repo/db';

const VALID_CATEGORIES = [
  'driver','restaurant_expert','errand_helper','local_guide',
  'photographer','private_chef','cleaner','florist','family_helper','party_helper',
] as const;

const ALL_CATEGORIES = VALID_CATEGORIES.join(', ');

const SERVICE_CATEGORY_MAP: Record<string, string> = {
  hotel:       'errand_helper',
  restaurant:  'restaurant_expert',
  sightseeing: 'local_guide',
  transport:   'driver',
  bar:         'local_guide',
  nightclub:   'errand_helper',
  errand:      'errand_helper',
  photography: 'photographer',
  local_guide: 'local_guide',
  family:      'family_helper',
  business:    'errand_helper',
  emergency:   'errand_helper',
};

// Used by the legacy chat-based flow (mid-trip butler)
const buildChatSystemPrompt = (context: string) => `You are a Local Experience Butler.

${context}

Your job in this conversation: collect city, dates, name, and phone in ONE message. Once you have all four, immediately output the JSON plan below — do not ask any other questions.

When you have all four fields, respond with a warm 1-sentence confirmation and then output the JSON plan.

IMPORTANT RULES FOR THE PLAN:
1. Count the exact number of days from the dates given (e.g. May 29–June 3 = 6 days: May 29, 30, 31, June 1, 2, 3).
2. Generate an agenda entry AND at least one task for EVERY single day of the trip — no days skipped.
3. Use real calendar dates in the day labels (e.g. "Day 1 — Thu May 29", "Day 2 — Fri May 30").
4. STRICT: Only create tasks for the categories listed in the context. Do NOT add any other service or category.
5. Spread the allowed services across all days.

Output format:

\`\`\`json
{
  "complete": true,
  "customerName": "...",
  "customerPhone": "...",
  "city": "...",
  "dates": "...",
  "planSummary": "2-3 sentence overview of what will be coordinated across the full trip",
  "agenda": [
    { "day": "Day 1 — Thu May 29", "items": ["Arrive, driver meets at airport", "Dinner at local izakaya"] }
  ],
  "tasks": [
    { "title": "Airport pickup", "description": "Ground transport from airport on arrival", "category": "driver", "day": "Day 1 — Thu May 29", "time": "arrival" }
  ]
}
\`\`\``;

// Used by the new form-based intake flow
const buildPlanSystemPrompt = (context: string) => `You are a Local Experience Butler planning assistant.

${context}

You will receive structured trip information. Immediately generate a complete day-by-day plan. Output ONLY the JSON block below — no other text.

RULES:
1. Count the exact number of days from startDate to endDate INCLUSIVE (e.g. Jun 1 to Jun 5 = 5 days).
2. Generate an agenda entry AND at least one task for EVERY single day — no days skipped.
3. Use real calendar dates in day labels (e.g. "Day 1 — Mon Jun 1", "Day 2 — Tue Jun 2").
4. STRICT: Only create tasks for the categories listed in the context. Do NOT invent tasks for other categories.
5. Spread allowed services across all days naturally.

\`\`\`json
{
  "planSummary": "2-3 sentence overview of what will be coordinated across the full trip",
  "agenda": [
    { "day": "Day 1 — Mon Jun 1", "items": ["Arrive, driver meets at airport", "Welcome dinner in the city"] }
  ],
  "tasks": [
    { "title": "Airport pickup", "description": "Arrange ground transport from airport on arrival", "category": "driver", "day": "Day 1 — Mon Jun 1", "time": "arrival" },
    { "title": "Welcome dinner reservation", "description": "Book dinner at a well-regarded local restaurant", "category": "restaurant_expert", "day": "Day 1 — Mon Jun 1", "time": "dinner" }
  ]
}
\`\`\``;

export interface IntakeDto {
  intakeMode: 'full_delegation' | 'specific_services';
  destination: string;
  startDate: string;
  endDate: string;
  numPeople: number;
  budget?: string;
  selectedServices?: string[];
  name: string;
  phone: string;
  clerkUserId?: string;
}

@Injectable()
export class TravelButlerService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // ── Legacy chat-based flow (mid-trip butler) ─────────────────────────────────

  async chat(
    messages: { role: string; content: string }[],
    message: string,
    context?: string,
  ): Promise<{ message: string; intakeBrief?: any }> {
    const systemPrompt = buildChatSystemPrompt(context ?? 'The user wants help planning their local visit.');

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: message },
      ],
    });

    const reply = completion.choices[0].message.content ?? '';
    const jsonMatch = reply.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.complete) {
          const clean = reply.replace(/```json[\s\S]*?```/, '').trim() ||
            "Your plan is ready — I'll reach out shortly to confirm everything.";
          return { message: clean, intakeBrief: parsed };
        }
      } catch {}
    }
    return { message: reply };
  }

  async createExperience(brief: any, selectedServices: string[]): Promise<{ id: string }> {
    return prisma.$transaction(async (tx: any) => {
      const lead = await tx.lead.create({
        data: { name: brief.customerName, phone: brief.customerPhone },
      });

      const experience = await tx.experience.create({
        data: {
          type: 'local_visit',
          leadId: lead.id,
          city: brief.city,
          dates: brief.dates,
          aiBrief: { ...brief, selectedServices },
          status: 'plan_ready',
        },
      });

      if (Array.isArray(brief.tasks)) {
        for (const t of brief.tasks) {
          const cat = VALID_CATEGORIES.find(c => c === t.category) ?? 'errand_helper';
          await tx.task.create({
            data: {
              experienceId: experience.id,
              leadId: lead.id,
              category: cat,
              intakeBrief: { title: t.title, description: t.description, day: t.day, time: t.time },
              status: 'new',
            },
          });
        }
      }

      return experience;
    });
  }

  // ── New form-based intake flow ────────────────────────────────────────────────

  async createIntake(dto: IntakeDto): Promise<{ experienceId: string }> {
    const lead = await prisma.lead.create({
      data: { name: dto.name, phone: dto.phone, ...(dto.clerkUserId ? { clerkUserId: dto.clerkUserId } : {}) },
    });

    const experience = await prisma.experience.create({
      data: {
        type: 'local_visit',
        leadId: lead.id,
        intakeMode: dto.intakeMode as any,
        city: dto.destination,
        startDate: dto.startDate,
        endDate: dto.endDate,
        dates: `${dto.startDate} to ${dto.endDate}`,
        travelers: dto.numPeople,
        budget: dto.budget,
        selectedServices: dto.selectedServices ?? [],
        intakePayload: dto as any,
        status: 'intake',
      },
    });

    // Fire-and-forget plan generation; client polls for status === 'plan_ready'
    this.generatePlan(experience.id).catch(err =>
      console.error(`[TravelButler] generatePlan failed for ${experience.id}:`, err),
    );

    return { experienceId: experience.id };
  }

  async generatePlan(experienceId: string): Promise<void> {
    const experience = await prisma.experience.findUniqueOrThrow({
      where: { id: experienceId },
      include: { lead: true },
    });

    const isFullDelegation = experience.intakeMode === 'full_delegation';
    const selectedServiceIds = (experience.selectedServices as string[]) ?? [];

    const allowedCategories = isFullDelegation
      ? ALL_CATEGORIES
      : [...new Set(
          selectedServiceIds.map(s => SERVICE_CATEGORY_MAP[s]).filter(Boolean),
        )].join(', ') || ALL_CATEGORIES;

    const context = isFullDelegation
      ? `This is a FULL DELEGATION request. Generate a comprehensive, well-rounded travel plan. Use any relevant categories from: ${allowedCategories}.`
      : `User selected ONLY these services: ${selectedServiceIds.join(', ')}. STRICT: only create tasks with these categories: ${allowedCategories}. Do NOT add tasks for any other category.`;

    const numDays = this.countDays(experience.startDate ?? '', experience.endDate ?? '');
    const userMessage = `Plan a ${numDays}-day trip for ${experience.travelers} ${experience.travelers === 1 ? 'person' : 'people'} to ${experience.city} from ${experience.startDate} to ${experience.endDate}${experience.budget ? `, budget level: ${experience.budget}` : ''}.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildPlanSystemPrompt(context) },
        { role: 'user', content: userMessage },
      ],
    });

    const reply = completion.choices[0].message.content ?? '';
    const jsonMatch = reply.match(/```json\s*([\s\S]*?)```/);
    if (!jsonMatch) {
      console.error('[TravelButler] No JSON in plan response:', reply);
      return;
    }

    const plan = JSON.parse(jsonMatch[1]);
    await prisma.experience.update({
      where: { id: experienceId },
      data: {
        planDraft: plan,
        aiBrief: plan,
        status: 'plan_ready',
      },
    });
  }

  async revisePlan(
    messages: { role: string; content: string }[],
    message: string,
    currentPlan: any,
  ): Promise<{ reply: string; revisedPlan?: any }> {
    const systemPrompt = `You are a Local Experience Butler helping a traveler refine their trip plan.

Current plan (JSON):
${JSON.stringify(currentPlan, null, 2)}

When the traveler asks to add, remove, or change tasks or agenda items, output a revised plan as a \`\`\`json block using the EXACT same structure as above.
When answering a question or asking for clarification, respond conversationally — no JSON needed.
Always acknowledge the change in 1–2 sentences before or after the JSON block.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: message },
      ],
    });

    const reply = completion.choices[0].message.content ?? '';
    const jsonMatch = reply.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        const revisedPlan = JSON.parse(jsonMatch[1]);
        const cleanReply = reply.replace(/```json[\s\S]*?```/, '').trim();
        return { reply: cleanReply || 'Done — plan updated!', revisedPlan };
      } catch {}
    }
    return { reply };
  }

  async confirmPlan(experienceId: string, planOverride?: any): Promise<void> {
    const experience = await prisma.experience.findUniqueOrThrow({
      where: { id: experienceId },
    });

    if (!experience.planDraft && !planOverride) throw new Error('No plan draft to confirm');
    if (experience.status !== 'plan_ready') throw new Error('Plan already confirmed or not ready');

    const plan = planOverride ?? (experience.planDraft as any);

    await prisma.$transaction(async (tx: any) => {
      if (Array.isArray(plan.tasks)) {
        for (const t of plan.tasks) {
          const cat = VALID_CATEGORIES.find(c => c === t.category) ?? 'errand_helper';
          await tx.task.create({
            data: {
              experienceId,
              leadId: experience.leadId,
              category: cat,
              intakeBrief: { title: t.title, description: t.description, day: t.day, time: t.time },
              status: 'new',
            },
          });
        }
      }

      await tx.experience.update({
        where: { id: experienceId },
        data: { confirmedAt: new Date(), status: 'in_coordination' },
      });
    });
  }

  private countDays(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 3;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff + 1, 1);
  }
}
