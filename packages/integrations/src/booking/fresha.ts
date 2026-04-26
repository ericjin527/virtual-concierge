import type { CandidateSlot, RecommendSlotsInput } from '@repo/types';
import type { ConfirmBookingParams, IBookingSystem } from './types';

// Fresha uses a private GraphQL partner API. Partner approval required at partners.fresha.com
// This stub is ready to implement once credentials are obtained.
export class FreshaAdapter implements IBookingSystem {
  async getAvailableSlots(_input: RecommendSlotsInput): Promise<CandidateSlot[]> {
    throw new Error('Fresha integration pending partner approval. Use internal or google_calendar booking system.');
  }

  async confirmBooking(_params: ConfirmBookingParams): Promise<string | null> {
    throw new Error('Fresha integration pending partner approval.');
  }
}
