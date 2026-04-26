import { InternalAdapter } from './internal';
import { GoogleCalendarAdapter } from './google-calendar';
import { FreshaAdapter } from './fresha';
import type { IBookingSystem } from './types';

export function getBookingSystem(business: {
  bookingSystem: string;
  bookingSystemConfig: unknown;
}): IBookingSystem {
  switch (business.bookingSystem) {
    case 'google_calendar':
      return new GoogleCalendarAdapter(business.bookingSystemConfig);
    case 'fresha':
      return new FreshaAdapter();
    default:
      return new InternalAdapter();
  }
}
