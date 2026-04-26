import type { CandidateSlot, RecommendSlotsInput } from '@repo/types';

export interface ConfirmBookingParams {
  businessId: string;
  therapistId: string;
  serviceId: string;
  serviceName: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  customerName: string;
  customerPhone: string;
  notes?: string;
}

export interface IBookingSystem {
  getAvailableSlots(input: RecommendSlotsInput): Promise<CandidateSlot[]>;
  confirmBooking(params: ConfirmBookingParams): Promise<string | null>; // returns external ref / appointmentId
}
