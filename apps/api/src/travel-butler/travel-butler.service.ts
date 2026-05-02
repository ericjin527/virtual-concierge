import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { prisma } from '@repo/db';

const VALID_CATEGORIES = [
  'driver','restaurant_expert','errand_helper','local_guide',
  'photographer','private_chef','cleaner','florist','family_helper','party_helper',
] as const;

const buildSystemPrompt = (context: string) => `You are a Local Experience Butler.

${context}

Your job in this conversation: collect city, dates, name, and phone in ONE message. Once you have all four, immediately output the JSON plan below — do not ask any other questions.

When you have all four fields, respond with a warm 1-sentence confirmation and then output:

\`\`\`json
{
  "complete": true,
  "customerName": "...",
  "customerPhone": "...",
  "city": "...",
  "dates": "...",
  "planSummary": "2-3 sentence overview of what will be coordinated for this trip",
  "agenda": [
    {
      "day": "Day 1 — Mon May 12",
      "items": ["Arrive SFO, driver meets you at arrivals", "Dinner at local restaurant in the Mission"]
    },
    {
      "day": "Day 2 — Tue May 13",
      "items": ["Morning city tour with local guide", "Afternoon free / sightseeing", "Bar hopping in Castro"]
    }
  ],
  "tasks": [
    {
      "title": "Airport pickup",
      "description": "Arrange ground transport from SFO on arrival day",
      "category": "driver",
      "day": "Day 1",
      "time": "arrival"
    },
    {
      "title": "Restaurant reservation",
      "description": "Book dinner for the group at a local restaurant",
      "category": "restaurant_expert",
      "day": "Day 1",
      "time": "dinner"
    }
  ]
}
\`\`\`

Generate tasks ONLY for the services the user selected. Each selected service should become 1–2 tasks. Use realistic day/time values based on the dates provided. Task category must be one of: driver, restaurant_expert, errand_helper, local_guide, photographer, private_chef, cleaner, florist, family_helper, party_helper.`;

@Injectable()
export class TravelButlerService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async chat(
    messages: { role: string; content: string }[],
    message: string,
    context?: string,
  ): Promise<{ message: string; intakeBrief?: any }> {
    const systemPrompt = buildSystemPrompt(context ?? 'The user wants help planning their local visit.');

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
              intakeBrief: {
                title: t.title,
                description: t.description,
                day: t.day,
                time: t.time,
              },
              status: 'new',
            },
          });
        }
      }

      return experience;
    });
  }
}
