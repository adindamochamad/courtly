import { Alert, Platform } from 'react-native';
import * as Calendar from 'expo-calendar';

import type { Booking } from '@/api/schemas';
import { parseApiDate } from './format';

/**
 * Add a booking to the device calendar.
 *
 * Android needs a writable local calendar source; on iOS the
 * default calendar is used directly.
 */
export async function addBookingToCalendar(booking: Booking): Promise<void> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Calendar permission needed',
      'Allow calendar access to save this booking as an event.',
    );
    return;
  }

  let calendarId: string | null = null;
  if (Platform.OS === 'ios') {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    calendarId = defaultCalendar.id;
  } else {
    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT,
    );
    const writable = calendars.find(
      (c) => c.allowsModifications && c.source.name !== 'Birthdays',
    );
    calendarId = writable?.id ?? null;
  }

  if (!calendarId) {
    Alert.alert('No writable calendar found on this device.');
    return;
  }

  const [startH, startM] = booking.startTime.split(':').map(Number);
  const [endH, endM] = booking.endTime.split(':').map(Number);
  const startDate = parseApiDate(booking.date);
  startDate.setHours(startH, startM, 0, 0);
  const endDate = parseApiDate(booking.date);
  endDate.setHours(endH, endM, 0, 0);

  await Calendar.createEventAsync(calendarId, {
    title: `${booking.facility.name} — ${booking.court.name}`,
    startDate,
    endDate,
    notes: `Courtly booking ${booking.bookingReference}`,
  });

  Alert.alert('Added to calendar', 'See you on the court! 🎾');
}
