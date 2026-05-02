import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { prisma } from '@repo/db';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Message = { role: 'user' | 'assistant' | 'system'; content: string };

const APPLIANCE_SYSTEM_PROMPT = `You are a warm, helpful intake butler for Local Butler Network. Your job is to understand what help the customer needs and collect the right details — then hand off to a local expert.

CATEGORY: Appliance Repair

INTAKE GOAL: Collect enough information so a local technician can assess the job before showing up.

COLLECT (ask one question at a time, conversationally):
1. What appliance is having the issue? (fridge, dishwasher, washer, dryer, oven, etc.)
2. Brand and model number, if they know it
3. Approximate age of the appliance
4. What symptoms are they seeing? (not cooling, leaking, making noise, won't turn on, error code, etc.)
5. Any error codes displayed?
6. How urgent is this? (today, within a few days, flexible)
7. Their address (city/neighborhood at minimum)
8. Their name and best contact number

STYLE:
- Warm, concise — like a knowledgeable friend helping out
- Never ask more than one thing at a time
- Don't list all questions upfront
- If they volunteer info, don't re-ask for it

WHEN DONE: Once you have appliance type + symptoms + urgency + address + name, say:
"Perfect, I've got everything I need. I'm finding trusted local technicians in your area now. You'll hear back shortly with a match and diagnostic fee estimate."
Then output a JSON block (invisible to user) with the structured intake:

\`\`\`json
{"complete": true, "applianceType": "...", "brand": "...", "modelNumber": "...", "ageYears": ..., "symptoms": "...", "errorCodes": "...", "urgency": "...", "address": "...", "customerName": "...", "customerPhone": "..."}
\`\`\``;

@Injectable()
export class ButlerService {
  async chat(sessionMessages: Message[], userMessage: string, category: string): Promise<{ message: string; intakeBrief?: Record<string, any> }> {
    const systemPrompt = this.getSystemPrompt(category);

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...sessionMessages,
      { role: 'user', content: userMessage },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 300,
      temperature: 0.4,
    });

    const text = response.choices[0]?.message?.content ?? "I'm having trouble right now. Please try again.";

    // Extract JSON block if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        const brief = JSON.parse(jsonMatch[1]);
        if (brief.complete) {
          const cleanMessage = text.replace(/```json[\s\S]*?```/, '').trim();
          return { message: cleanMessage, intakeBrief: brief };
        }
      } catch {}
    }

    return { message: text };
  }

  private getSystemPrompt(category: string): string {
    switch (category) {
      case 'appliance_repair':
        return APPLIANCE_SYSTEM_PROMPT;
      default:
        return APPLIANCE_SYSTEM_PROMPT;
    }
  }

  async createTaskFromBrief(brief: Record<string, any>, category: string) {
    const lead = await prisma.lead.create({
      data: {
        name: brief.customerName,
        phone: brief.customerPhone,
        email: brief.customerEmail,
      },
    });

    return prisma.task.create({
      data: {
        leadId: lead.id,
        category: category as any,
        intakeBrief: brief,
        address: brief.address,
        urgency: brief.urgency,
        source: 'web',
      },
    });
  }
}
