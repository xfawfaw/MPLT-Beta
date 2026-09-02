// MPLT ZERO Calendar & Routine Sync Engine
import { UserProfile, Habit } from '../types';

export interface CalendarEventParams {
  title: string;
  description: string;
  location?: string;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  isDailyRecurring?: boolean;
}

/**
 * Generates direct Google Calendar Web Intent URL
 */
export const createGoogleCalendarUrl = (params: CalendarEventParams): string => {
  const now = new Date();
  
  // Format Date to YYYYMMDD
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());

  const startH = pad(params.startHour);
  const startM = pad(params.startMinute);
  
  // Calculate End Time
  const endTotalMinutes = params.startHour * 60 + params.startMinute + params.durationMinutes;
  const endH = pad(Math.floor(endTotalMinutes / 60) % 24);
  const endM = pad(endTotalMinutes % 60);

  const startIso = `${year}${month}${day}T${startH}${startM}00`;
  const endIso = `${year}${month}${day}T${endH}${endM}00`;

  let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(params.title)}&dates=${startIso}/${endIso}&details=${encodeURIComponent(params.description)}`;

  if (params.location) {
    url += `&location=${encodeURIComponent(params.location)}`;
  }

  if (params.isDailyRecurring) {
    url += `&recur=${encodeURIComponent('RRULE:FREQ=DAILY')}`;
  }

  return url;
};

/**
 * 1-Click Sync of a specific routine window to Google Calendar
 */
export const syncRoutineToGoogleCalendar = (
  routineType: 'morning' | 'deepWork' | 'evening',
  timeStr: string = '06:00'
) => {
  const [hStr, mStr] = timeStr.split(':');
  const hour = parseInt(hStr, 10) || 6;
  const minute = parseInt(mStr, 10) || 0;

  let event: CalendarEventParams;

  if (routineType === 'morning') {
    event = {
      title: '⚡ MPLT ZERO: Morning Launch & Movement',
      description: 'Morning movement, whole foods hydration, and daily operational planning.',
      startHour: hour,
      startMinute: minute,
      durationMinutes: 60,
      isDailyRecurring: true,
    };
  } else if (routineType === 'deepWork') {
    event = {
      title: '🎯 MPLT ZERO: Unbroken Deep Work Block',
      description: 'Zero distractions cognitive sprint. High-priority mission execution.',
      startHour: hour,
      startMinute: minute,
      durationMinutes: 90,
      isDailyRecurring: true,
    };
  } else {
    event = {
      title: '🌙 MPLT ZERO: Evening Review & Finance Ledger',
      description: 'Log daily habits, review 50/30/20 burn rate, and prepare next sprint.',
      startHour: hour,
      startMinute: minute,
      durationMinutes: 30,
      isDailyRecurring: true,
    };
  }

  const url = createGoogleCalendarUrl(event);
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Generates universal .ICS file for Apple Calendar, Google Calendar, & Outlook
 */
export const exportUniversalICS = (_profile: UserProfile, habits: Habit[]) => {
  const morningTime = '06:00';
  const deepWorkTime = '09:00';
  const eveningTime = '21:00';

  const formatICSDate = (timeStr: string, durationMin: number) => {
    const now = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());

    const [h, min] = timeStr.split(':').map(Number);
    const endMinutes = h * 60 + min + durationMin;
    const endH = pad(Math.floor(endMinutes / 60) % 24);
    const endM = pad(endMinutes % 60);

    return {
      start: `${y}${m}${d}T${pad(h)}${pad(min)}00`,
      end: `${y}${m}${d}T${endH}${endM}00`,
    };
  };

  const morningDates = formatICSDate(morningTime, 60);
  const deepWorkDates = formatICSDate(deepWorkTime, 90);
  const eveningDates = formatICSDate(eveningTime, 30);

  const habitSummary = habits.map(h => `- ${h.title} (${h.category})`).join('\\n');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MPLT ZERO//Sovereign Operations//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:MPLT ZERO Routines',
    
    // 1. Morning Routine
    'BEGIN:VEVENT',
    `UID:mplt-morning-${Date.now()}@mpltzero.app`,
    `DTSTAMP:${morningDates.start}Z`,
    `DTSTART:${morningDates.start}`,
    `DTEND:${morningDates.end}`,
    'RRULE:FREQ=DAILY',
    'SUMMARY:⚡ MPLT ZERO: Morning Launch',
    `DESCRIPTION:Morning movement and habit execution.\\n\\nActive Habits:\\n${habitSummary}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',

    // 2. Deep Work Routine
    'BEGIN:VEVENT',
    `UID:mplt-deepwork-${Date.now()}@mpltzero.app`,
    `DTSTAMP:${deepWorkDates.start}Z`,
    `DTSTART:${deepWorkDates.start}`,
    `DTEND:${deepWorkDates.end}`,
    'RRULE:FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR',
    'SUMMARY:🎯 MPLT ZERO: Deep Work Sprint',
    'DESCRIPTION:90m Unbroken focus block for high-leverage mission execution.',
    'STATUS:CONFIRMED',
    'END:VEVENT',

    // 3. Evening Routine
    'BEGIN:VEVENT',
    `UID:mplt-evening-${Date.now()}@mpltzero.app`,
    `DTSTAMP:${eveningDates.start}Z`,
    `DTSTART:${eveningDates.start}`,
    `DTEND:${eveningDates.end}`,
    'RRULE:FREQ=DAILY',
    'SUMMARY:🌙 MPLT ZERO: Evening Review & Ledger',
    'DESCRIPTION:Log daily habits, review 50/30/20 expenses, and shutdown workstation.',
    'STATUS:CONFIRMED',
    'END:VEVENT',

    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'mplt-zero-routine-schedule.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
