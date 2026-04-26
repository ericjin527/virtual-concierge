import { prisma } from '@repo/db';
import type { CandidateSlot, RecommendSlotsInput } from '@repo/types';

const SLOT_INCREMENT_MINUTES = 15;

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m ?? 0);
}

function formatTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function windowToMinutes(label: string): { start: number; end: number } {
  switch (label) {
    case 'morning':
      return { start: 8 * 60, end: 12 * 60 };
    case 'afternoon':
      return { start: 12 * 60, end: 17 * 60 };
    case 'evening':
      return { start: 17 * 60, end: 21 * 60 };
    default:
      return { start: 8 * 60, end: 21 * 60 };
  }
}

export async function recommendSlots(input: RecommendSlotsInput): Promise<CandidateSlot[]> {
  const { businessId, serviceId, date, preferredWindow, therapistPreference, genderPreference, languagePreference } = input;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return [];

  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getDay();

  // Find qualified therapists
  const qualifiedTherapists = await prisma.therapist.findMany({
    where: {
      businessId,
      active: true,
      skills: { some: { serviceId } },
      ...(genderPreference ? { gender: genderPreference } : {}),
      ...(languagePreference ? { languages: { has: languagePreference } } : {}),
    },
    include: {
      shifts: { where: { OR: [{ dayOfWeek }, { date: targetDate }] } },
      skills: true,
    },
  });

  if (therapistPreference) {
    const preferred = qualifiedTherapists.find((t) => t.id === therapistPreference || t.name === therapistPreference);
    if (preferred) qualifiedTherapists.splice(0, qualifiedTherapists.length, preferred);
  }

  // Load existing appointments for the day
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      therapist: { businessId },
      startTime: { gte: dayStart, lte: dayEnd },
      cancelled: false,
    },
  });

  // Preferred window
  let windowStart: number;
  let windowEnd: number;

  if (preferredWindow?.label) {
    ({ start: windowStart, end: windowEnd } = windowToMinutes(preferredWindow.label));
  } else if (preferredWindow?.start && preferredWindow?.end) {
    windowStart = parseTime(preferredWindow.start);
    windowEnd = parseTime(preferredWindow.end);
  } else {
    windowStart = 8 * 60;
    windowEnd = 21 * 60;
  }

  const preferredMidpoint = (windowStart + windowEnd) / 2;
  const duration = service.durationMinutes;
  const candidates: Array<CandidateSlot & { score: number }> = [];

  for (const therapist of qualifiedTherapists) {
    const shifts = therapist.shifts;

    if (shifts.length === 0) {
      // No shift data — return low-confidence slot based on preferred window
      const startMin = windowStart;
      candidates.push({
        startTime: `${date}T${formatTime(startMin)}:00`,
        endTime: `${date}T${formatTime(startMin + duration)}:00`,
        therapistId: therapist.id,
        therapistName: therapist.name,
        confidence: 'low',
        explanation: 'No shift schedule configured; slot is estimated from business hours.',
        score: Math.abs(startMin - preferredMidpoint),
      });
      continue;
    }

    for (const shift of shifts) {
      const shiftStart = parseTime(shift.startTime);
      const shiftEnd = parseTime(shift.endTime);
      const breaks: Array<{ start: number; end: number }> = Array.isArray(shift.breaks)
        ? (shift.breaks as Array<{ start: string; end: string }>).map((b) => ({
            start: parseTime(b.start),
            end: parseTime(b.end),
          }))
        : [];

      const therapistAppts = existingAppointments.filter((a) => a.therapistId === therapist.id);

      // Generate 15-min increment candidates
      let slotStart = Math.max(shiftStart, windowStart);
      while (slotStart + duration <= Math.min(shiftEnd, windowEnd)) {
        const slotEnd = slotStart + duration;

        // Check break conflicts
        const inBreak = breaks.some((b) => slotStart < b.end && slotEnd > b.start);
        if (inBreak) {
          slotStart += SLOT_INCREMENT_MINUTES;
          continue;
        }

        // Check appointment conflicts
        const inAppt = therapistAppts.some((a) => {
          const aStart = a.startTime.getHours() * 60 + a.startTime.getMinutes();
          const aEnd = a.endTime.getHours() * 60 + a.endTime.getMinutes();
          return slotStart < aEnd && slotEnd > aStart;
        });
        if (inAppt) {
          slotStart += SLOT_INCREMENT_MINUTES;
          continue;
        }

        const score = Math.abs(slotStart - preferredMidpoint);
        candidates.push({
          startTime: `${date}T${formatTime(slotStart)}:00`,
          endTime: `${date}T${formatTime(slotEnd)}:00`,
          therapistId: therapist.id,
          therapistName: therapist.name,
          confidence: 'high',
          explanation: `Available within ${therapist.name}'s scheduled shift.`,
          score,
        });

        slotStart += SLOT_INCREMENT_MINUTES;
      }
    }
  }

  // Rank by proximity to preferred time and return top 3
  candidates.sort((a, b) => a.score - b.score);
  return candidates.slice(0, 3).map(({ score: _score, ...slot }) => slot);
}

export type { RecommendSlotsInput, CandidateSlot };
