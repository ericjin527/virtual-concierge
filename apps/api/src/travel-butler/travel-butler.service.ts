import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { prisma } from '@repo/db';

const VALID_CATEGORIES = [
  'driver','restaurant_expert','errand_helper','local_guide',
  'photographer','private_chef','cleaner','florist','family_helper','party_helper',
  'appliance_repair','event_booking','parenting_logistics',
] as const;

const SYSTEM_PROMPT = `You are a Local Experience Butler — an AI concierge helping visitors get trusted local support during their stay.

Your job: warm conversational intake to collect these details:
- customerName: their name
- customerPhone: their phone number
- city: which city/neighborhood they're visiting
- dates: arrival and departure dates (e.g. "May 10–14")
- reason: purpose of visit (business, family, celebration, conference, leisure)
- travelers: number of people including kids or elderly
- hotelBase: hotel or Airbnb address/name
- budget: budget range or level (e.g. "reasonable", "$500 total", "premium")
- practicalNeeds: transport, errands, dry cleaning, printing, meeting support
- experienceNeeds: restaurants, activities, guides, photographers, local gems
- preference: convenience | premium | local_authenticity | family_friendly | business_polish

Ask 1–2 questions at a time. Be warm, concise (2–4 sentences), like a knowledgeable local friend.

When you have collected: city, dates, reason, travelers, hotelBase, budget, at least one need, customerName, customerPhone — output a JSON block:

\`\`\`json
{
  "complete": true,
  "customerName": "...",
  "customerPhone": "...",
  "city": "...",
  "dates": "...",
  "reason": "...",
  "travelers": 2,
  "hotelBase": "...",
  "budget": "...",
  "practicalNeeds": "...",
  "experienceNeeds": "...",
  "preference": "...",
  "tasks": [
    { "description": "Airport pickup from SFO", "category": "driver", "deadline": "arrival day" },
    { "description": "Business dinner for 6 in SoMa", "category": "restaurant_expert", "deadline": "Day 1" }
  ]
}
\`\`\`

Only output this block when ALL required fields are collected. Never output partial JSON.`;

@Injectable()
export class TravelButlerService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async chat(
    messages: { role: string; content: string }[],
    message: string,
  ): Promise<{ message: string; intakeBrief?: any }> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
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
