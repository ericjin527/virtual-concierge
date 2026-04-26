import { z } from 'zod';

// ─── Scheduler ────────────────────────────────────────────────────────────────

export const RecommendSlotsInputSchema = z.object({
  businessId: z.string(),
  serviceId: z.string(),
  date: z.string(), // "YYYY-MM-DD"
  preferredWindow: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
      label: z.enum(['morning', 'afternoon', 'evening']).optional(),
    })
    .optional(),
  partySize: z.number().int().positive().default(1),
  therapistPreference: z.string().optional(),
  languagePreference: z.string().optional(),
  genderPreference: z.string().optional(),
});

export type RecommendSlotsInput = z.infer<typeof RecommendSlotsInputSchema>;

export const CandidateSlotSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  therapistId: z.string(),
  therapistName: z.string(),
  roomId: z.string().optional(),
  confidence: z.enum(['high', 'medium', 'low']),
  explanation: z.string(),
});

export type CandidateSlot = z.infer<typeof CandidateSlotSchema>;

// ─── Skills File ──────────────────────────────────────────────────────────────

export const SkillsFileContentSchema = z.object({
  businessProfile: z.record(z.unknown()),
  services: z.array(z.record(z.unknown())),
  recommendationRules: z.array(z.string()),
  upsellRules: z.array(z.string()),
  bookingRules: z.array(z.string()),
  handoffRules: z.array(z.string()),
  doNotSayRules: z.array(z.string()),
  testCases: z.array(
    z.object({
      scenario: z.string(),
      input: z.string(),
      expectedBehavior: z.string(),
    }),
  ),
});

export type SkillsFileContent = z.infer<typeof SkillsFileContentSchema>;

// ─── Widget ───────────────────────────────────────────────────────────────────

export const WidgetMessageSchema = z.object({
  sessionId: z.string(),
  message: z.string(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});

export type WidgetMessage = z.infer<typeof WidgetMessageSchema>;

// ─── Booking Requests ─────────────────────────────────────────────────────────

export const CreateBookingRequestSchema = z.object({
  businessId: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  serviceId: z.string().optional(),
  requestedDate: z.string(),
  preferredSlot: z.string().optional(),
  recommendedSlotsJson: z.unknown().optional(),
  notes: z.string().optional(),
  source: z.enum(['phone', 'web', 'sms', 'admin']).default('web'),
});

export type CreateBookingRequest = z.infer<typeof CreateBookingRequestSchema>;

export const UpdateBookingRequestStatusSchema = z.object({
  status: z.enum([
    'pending_owner_confirmation',
    'confirmed',
    'declined',
    'needs_callback',
    'cancelled',
  ]),
  notes: z.string().optional(),
});

export type UpdateBookingRequestStatus = z.infer<typeof UpdateBookingRequestStatusSchema>;
