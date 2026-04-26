import { prisma } from '@repo/db';
import type { CandidateSlot, RecommendSlotsInput } from '@repo/types';
import type { ConfirmBookingParams, IBookingSystem } from './types';

interface GoogleCalendarConfig {
  serviceAccountKey: string; // JSON string
}

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m ?? 0);
}

function formatTime(mins: number): string {
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
}

export class GoogleCalendarAdapter implements IBookingSystem {
  private config: GoogleCalendarConfig;

  constructor(config: unknown) {
    this.config = config as GoogleCalendarConfig;
  }

  private async getCalendarClient() {
    const { google } = await import('googleapis');
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(this.config.serviceAccountKey),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    return google.calendar({ version: 'v3', auth });
  }

  async getAvailableSlots(input: RecommendSlotsInput): Promise<CandidateSlot[]> {
    const { businessId, serviceId, date, preferredWindow } = input;

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return [];

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    const therapists = await prisma.therapist.findMany({
      where: { businessId, active: true, skills: { some: { serviceId } }, googleCalendarId: { not: null } },
      include: { shifts: { where: { OR: [{ dayOfWeek }, { date: targetDate }] } } },
    });

    if (therapists.length === 0) return [];

    const dayStart = new Date(`${date}T00:00:00Z`);
    const dayEnd = new Date(`${date}T23:59:59Z`);

    const calendar = await this.getCalendarClient();
    const freeBusyRes = await calendar.freebusy.query({
      requestBody: {
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        items: therapists.map((t) => ({ id: t.googleCalendarId! })),
        timeZone: 'UTC',
      },
    });

    const busyMap = freeBusyRes.data.calendars ?? {};

    const windowStart = preferredWindow?.start ? parseTime(preferredWindow.start) : 8 * 60;
    const windowEnd = preferredWindow?.end ? parseTime(preferredWindow.end) : 21 * 60;
    const preferredMid = (windowStart + windowEnd) / 2;
    const duration = service.durationMinutes;
    const candidates: Array<CandidateSlot & { score: number }> = [];

    for (const therapist of therapists) {
      const calId = therapist.googleCalendarId!;
      const busySlots = (busyMap[calId]?.busy ?? []).map((b) => ({
        start: new Date(b.start!).getHours() * 60 + new Date(b.start!).getMinutes(),
        end: new Date(b.end!).getHours() * 60 + new Date(b.end!).getMinutes(),
      }));

      const shiftStart = therapist.shifts[0] ? parseTime(therapist.shifts[0].startTime) : 9 * 60;
      const shiftEnd = therapist.shifts[0] ? parseTime(therapist.shifts[0].endTime) : 17 * 60;

      let slotStart = Math.max(shiftStart, windowStart);
      while (slotStart + duration <= Math.min(shiftEnd, windowEnd)) {
        const slotEnd = slotStart + duration;
        const blocked = busySlots.some((b) => slotStart < b.end && slotEnd > b.start);
        if (!blocked) {
          candidates.push({
            startTime: `${date}T${formatTime(slotStart)}:00`,
            endTime: `${date}T${formatTime(slotEnd)}:00`,
            therapistId: therapist.id,
            therapistName: therapist.name,
            confidence: 'high',
            explanation: `Available on ${therapist.name}'s Google Calendar.`,
            score: Math.abs(slotStart - preferredMid),
          });
        }
        slotStart += 15;
      }
    }

    candidates.sort((a, b) => a.score - b.score);
    return candidates.slice(0, 3).map(({ score: _s, ...slot }) => slot);
  }

  async confirmBooking(params: ConfirmBookingParams): Promise<string | null> {
    const therapist = await prisma.therapist.findUnique({ where: { id: params.therapistId } });
    if (!therapist?.googleCalendarId) return null;

    const calendar = await this.getCalendarClient();
    const event = await calendar.events.insert({
      calendarId: therapist.googleCalendarId,
      requestBody: {
        summary: `${params.customerName} — ${params.serviceName}`,
        description: `Phone: ${params.customerPhone}${params.notes ? `\nNotes: ${params.notes}` : ''}`,
        start: { dateTime: params.startTime },
        end: { dateTime: params.endTime },
      },
    });

    return event.data.id ?? null;
  }
}
