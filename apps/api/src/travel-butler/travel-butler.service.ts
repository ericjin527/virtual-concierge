import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { prisma } from '@repo/db';

// These are the expert category names the AI uses in its JSON output.
// They match GlamExpertCategory enum values.
const VALID_CATEGORIES = [
  'photographer', 'makeup_artist', 'hair_stylist', 'wardrobe_stylist',
  'cultural_outfit_partner', 'creative_director', 'photo_editor',
  'video_creator', 'local_coordinator', 'driver',
] as const;

const ALL_CATEGORIES = VALID_CATEGORIES.join(', ');

// Maps intake service IDs → AI category names
const SERVICE_CATEGORY_MAP: Record<string, string> = {
  photography:        'photographer',
  makeup:             'makeup_artist',
  hair:               'hair_stylist',
  wardrobe_styling:   'wardrobe_stylist',
  cultural_outfit:    'cultural_outfit_partner',
  creative_direction: 'creative_director',
  photo_editing:      'photo_editor',
  video_reel:         'video_creator',
  location_scouting:  'local_coordinator',
  transport:          'driver',
};

// Task.category is the old ExpertCategory DB enum — must use a valid value.
// Task.glamCategory stores the real glam category.
const GLAM_TO_LEGACY_CATEGORY: Record<string, string> = {
  photographer:            'photographer',
  makeup_artist:           'errand_helper',
  hair_stylist:            'errand_helper',
  wardrobe_stylist:        'errand_helper',
  cultural_outfit_partner: 'errand_helper',
  creative_director:       'errand_helper',
  photo_editor:            'errand_helper',
  video_creator:           'errand_helper',
  local_coordinator:       'local_guide',
  driver:                  'driver',
};

// Maps AI expert category names → GlamTaskCategory enum values
const GLAM_EXPERT_TO_TASK_CATEGORY: Record<string, string> = {
  photographer:            'photography',
  makeup_artist:           'makeup',
  hair_stylist:            'hair',
  wardrobe_stylist:        'styling',
  cultural_outfit_partner: 'cultural_outfit',
  creative_director:       'creative_direction',
  photo_editor:            'photo_editing',
  video_creator:           'video_reel',
  local_coordinator:       'location_scouting',
  driver:                  'transport',
};

// Used by the legacy chat-based flow (mid-trip butler)
const buildChatSystemPrompt = (context: string) => `You are a Destination Glam + Shoot Butler — a creative director and coordinator who plans magazine-style editorial photoshoots for travelers.

${context}

Your job: collect city, dates, occasion/vibe, name, and phone in ONE message. Once you have all five, output the JSON plan below.

PLAN RULES:
1. Count exact days from the dates (e.g. May 29–June 3 = 6 days).
2. Focus tasks on the shoot day(s) — not every day needs a task, but every shoot day must have glam + photo tasks together.
3. Use real calendar dates in day labels (e.g. "Day 1 — Thu May 29").
4. STRICT: Only create tasks for the categories listed in the context. No restaurants, no generic tourism.
5. Think like a creative director: group glam + photo tasks on the same day, suggest neighborhoods and shoot timing.

\`\`\`json
{
  "complete": true,
  "customerName": "...",
  "customerPhone": "...",
  "city": "...",
  "dates": "...",
  "planSummary": "2-3 sentence creative overview: shoot concept, glam direction, neighborhood, vibe",
  "agenda": [
    { "day": "Day 1 — Thu May 29", "items": ["Glam session at hotel, 2 hours before shoot", "Golden hour street editorial in Shibuya"] }
  ],
  "tasks": [
    { "title": "Makeup + Hair", "description": "Soft glam for street editorial — natural base, defined eyes", "category": "makeup_artist", "day": "Day 1 — Thu May 29", "time": "14:00" },
    { "title": "Street Editorial Shoot", "description": "2-hour editorial session in Shibuya at golden hour", "category": "photographer", "day": "Day 1 — Thu May 29", "time": "16:30" }
  ]
}
\`\`\``;

// Used by the new form-based intake flow
const buildPlanSystemPrompt = (context: string) => `You are a Destination Glam + Shoot Butler — a creative director and coordinator who plans magazine-style editorial photoshoots for travelers.

${context}

You will receive structured trip information. Immediately generate a complete shoot plan. Output ONLY the JSON block below — no other text.

RULES:
1. Count exact days from startDate to endDate INCLUSIVE.
2. Focus on shoot day(s) — group glam + photography tasks on the same day(s). Not every day needs a task.
3. Use real calendar dates in day labels (e.g. "Day 1 — Mon Jun 1").
4. STRICT: Only create tasks for the categories listed in the context. No restaurants, no generic tourism.
5. Think like a creative director: suggest shoot concept, glam direction, best neighborhood for the vibe, and time of day.
6. For full delegation, suggest 1–2 shoot days spread across the trip with appropriate glam + photo + optional styling tasks.

\`\`\`json
{
  "planSummary": "2-3 sentence creative overview: shoot concept, glam direction, neighborhood, vibe, deliverables",
  "agenda": [
    { "day": "Day 2 — Tue Jun 2", "items": ["Glam session: soft editorial makeup + hair", "Street editorial shoot in Harajuku at golden hour"] }
  ],
  "tasks": [
    { "title": "Makeup + Hair", "description": "Soft glam — natural base, defined eyes, loose waves", "category": "makeup_artist", "day": "Day 2 — Tue Jun 2", "time": "15:00" },
    { "title": "Editorial Street Shoot", "description": "2-hour shoot in Harajuku, street and boutique backdrops", "category": "photographer", "day": "Day 2 — Tue Jun 2", "time": "17:00" }
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
          const expertCat: string = VALID_CATEGORIES.find(c => c === t.category) ?? 'errand_helper';
          const legacyCat = GLAM_TO_LEGACY_CATEGORY[expertCat] ?? 'errand_helper';
          const glamCat = GLAM_EXPERT_TO_TASK_CATEGORY[expertCat] ?? undefined;
          await tx.task.create({
            data: {
              experienceId: experience.id,
              leadId: lead.id,
              category: legacyCat as any,
              glamCategory: glamCat as any ?? undefined,
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
      ? `This is a FULL DELEGATION glam + shoot request. Design 1–2 shoot days with glam, photography, and relevant styling/creative tasks. Available expert categories: ${allowedCategories}.`
      : `User selected ONLY these services: ${selectedServiceIds.join(', ')}. STRICT: only create tasks with these categories: ${allowedCategories}. Do NOT add tasks for any other category.`;

    const numDays = this.countDays(experience.startDate ?? '', experience.endDate ?? '');
    const userMessage = `Plan a destination glam + shoot experience for ${experience.travelers} ${experience.travelers === 1 ? 'person' : 'people'} visiting ${experience.city} from ${experience.startDate} to ${experience.endDate} (${numDays} days)${experience.budget ? `. Budget tier: ${experience.budget}` : ''}.`;

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
    const systemPrompt = `You are a Destination Glam + Shoot Butler helping a traveler refine their shoot plan. Think like a creative director.

Current plan (JSON):
${JSON.stringify(currentPlan, null, 2)}

Valid task categories: photographer, makeup_artist, hair_stylist, wardrobe_stylist, cultural_outfit_partner, creative_director, photo_editor, video_creator, local_coordinator, driver.

When the traveler asks to add, remove, or change tasks or agenda items, output a revised plan as a \`\`\`json block using the EXACT same structure as above.
When answering questions, respond conversationally — no JSON needed.
Always acknowledge the change in 1–2 sentences before or after the JSON block.
Do NOT add restaurant, hotel, sightseeing, or generic tourism tasks.`;

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
          const expertCat: string = VALID_CATEGORIES.find(c => c === t.category) ?? 'errand_helper';
          const legacyCat = GLAM_TO_LEGACY_CATEGORY[expertCat] ?? 'errand_helper';
          const glamCat = GLAM_EXPERT_TO_TASK_CATEGORY[expertCat] ?? undefined;
          await tx.task.create({
            data: {
              experienceId,
              leadId: experience.leadId,
              category: legacyCat as any,
              glamCategory: glamCat as any ?? undefined,
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
