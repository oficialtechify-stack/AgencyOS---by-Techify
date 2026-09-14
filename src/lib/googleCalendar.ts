// Google Calendar API Client
// Direct client-side REST calls using OAuth2 access token with in-memory caching
import { AgendaEvent } from '../types';

export interface GoogleCalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  htmlLink?: string;
  hangoutLink?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
  status?: string;
}

export interface GoogleCalendarListResponse {
  items: GoogleCalendarEventItem[];
  summary?: string;
  timeZone?: string;
}

/**
 * Fetch calendar events from primary Google Calendar
 */
export async function listGoogleCalendarEvents(
  accessToken: string,
  timeMin?: string
): Promise<GoogleCalendarEventItem[]> {
  const minTime = timeMin || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
    minTime
  )}&singleEvents=true&orderBy=startTime&maxResults=50`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Google Calendar list error:', response.status, errorBody);
    throw new Error(`Erro ${response.status} ao carregar eventos do Google Calendar: ${errorBody}`);
  }

  const data: GoogleCalendarListResponse = await response.json();
  return data.items || [];
}

/**
 * Create a new event on user's primary Google Calendar
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  event: {
    title: string;
    description?: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    client?: string;
    meetUrl?: string;
  }
): Promise<GoogleCalendarEventItem> {
  const startDateTime = `${event.date}T${event.time}:00`;
  // calculate default 1h end time
  const [hours, minutes] = event.time.split(':').map(Number);
  const endHour = (hours + 1) % 24;
  const endHourStr = String(endHour).padStart(2, '0');
  const endDateTime = `${event.date}T${endHourStr}:${String(minutes).padStart(2, '0')}:00`;

  const eventPayload: any = {
    summary: event.title,
    description: `Cliente: ${event.client || 'Geral'}\n${event.description || ''}\nOrganizado via AgencyOS\nLink Reunião: ${event.meetUrl || ''}`,
    start: {
      dateTime: new Date(startDateTime).toISOString(),
    },
    end: {
      dateTime: new Date(endDateTime).toISOString(),
    },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Google Calendar create event error:', response.status, errorBody);
    throw new Error(`Erro ao criar evento no Google Calendar: ${errorBody}`);
  }

  return await response.json();
}

/**
 * Delete an event from user's primary Google Calendar
 * Note: Must be preceded by explicit user confirmation dialog
 */
export async function deleteGoogleCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<boolean> {
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const errorBody = await response.text();
    console.error('Google Calendar delete error:', response.status, errorBody);
    throw new Error(`Erro ao remover evento do Google Calendar: ${errorBody}`);
  }

  return true;
}

/**
 * Helper to convert Google Calendar Event Item into AgendaEvent
 */
export function convertGoogleEventToAgendaEvent(gEvent: GoogleCalendarEventItem): AgendaEvent {
  const rawStart = gEvent.start?.dateTime || gEvent.start?.date || '';
  let dateStr = new Date().toISOString().split('T')[0];
  let timeStr = '10:00';

  if (rawStart) {
    try {
      const d = new Date(rawStart);
      dateStr = d.toISOString().split('T')[0];
      timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      // fallback
    }
  }

  return {
    id: `gcal-${gEvent.id}`,
    googleEventId: gEvent.id,
    title: gEvent.summary || 'Reunião Google Calendar',
    client: 'Google Calendar Sync',
    date: dateStr,
    time: timeStr,
    type: 'Reunião',
    meetUrl: gEvent.hangoutLink || 'https://meet.google.com/new',
    status: 'Sincronizado',
    htmlLink: gEvent.htmlLink,
    description: gEvent.description,
    syncWithGoogle: true,
  };
}
