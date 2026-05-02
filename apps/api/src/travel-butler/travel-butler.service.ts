import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { prisma } from '@repo/db';

const VALID_CATEGORIES = [
  'driver','restaurant_expert','errand_helper','local_guide',
  'photographer','private_chef','cleaner','florist','family_helper','party_helper',
  'appliance_repair','event_booking','parenting_logistics',
] as const;

const SYSTEM_PROMPT = `You are a Local Experience Butler — a warm, efficient AI concierge.

The user has already told you what they need (via a checklist or by choosing automated planning). Your only job now is to collect 4 things — nothing more:
1. City they are visiting
2. Travel dates (arrival and departure)
3. Their name
4. Their phone number

Ask for all four in ONE message if you don't have them yet (e.g. "What city are you visiting, and when? Also your name and best phone number so we can reach you."). Once you have all four, immediately output the JSON block below. Do NOT ask about budget, hotel, number of travelers, preferences, or anything else — that will be handled by our team.

When you have city, dates, name, and phone — output:

\`\`\`json
{
  "complete": true,
  "customerName": "...",
  "customerPhone": "...",
  "city": "...",
  "dates": "...",
  "tasks": []
}
\`\`\`

Keep every response to 1–2 sentences. Be warm but brief.`;

@Injectable()
export class TravelButlerService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async chat(
    messages: { role: string; content: string }[],
    message: string,
    context?: string,
  ): Promise<{ message: string; intakeBrief?: any }> {
    const systemWithContext = context
      ? `${SYSTEM_PROMPT}\n\nContext from the user's checklist: ${context}`
      : SYSTEM_PROMPT;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemWithContext },
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
            "Perfect, I have everything I need. I'll put together your local experience plan and reach out shortly.";
          return { message: clean, intakeBrief: parsed };
        }
      } catch {}
    }
    return { message: reply };
  }

  async createExperience(brief: any): Promise<{ id: string }> {
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
          occasion: brief.reason,
          travelers: typeof brief.travelers === 'number' ? brief.travelers : 1,
          vibe: brief.preference,
          budget: brief.budget,
          hotelBase: brief.hotelBase,
          aiBrief: brief,
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
              intakeBrief: { description: t.description, deadline: t.deadline },
              status: 'new',
            },
          });
        }
      }

      return experience;
    });
  }
}
