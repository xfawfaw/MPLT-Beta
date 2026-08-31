/**
 * MPLT ZERO — Unified Date Synchronization & Telemetry Engine
 * Provides synchronized dates, active sprint days, and calendar mathematics
 * across all operational workstations.
 */

export interface DayConfig {
  index: number; // 0 = Monday, 6 = Sunday
  name: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  short: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  dateStr: string; // e.g. "23.02.2026"
  isToday: boolean;
  dayNum: number;
}

export interface TodayInfo {
  date: Date;
  year: number;
  monthIndex: number; // 0-11
  monthName: string; // e.g. "FEBRUARY 2026"
  monthShort: string; // e.g. "Feb"
  dayOfMonth: number; // 1-31
  dayOfWeekIndex: number; // 0 = Mon, 6 = Sun
  dayName: string; // e.g. "Thursday"
  todayISO: string; // e.g. "2026-02-26"
  formattedDisplay: string; // e.g. "Thursday, 26 February 2026"
  daysInMonth: number;
  remainingDaysInMonth: number;
  daysRemainingInYear: number;
  currentWeekNumber: number; // 1-52
  sprintWeekRangeStr: string; // e.g. "23 FEB — 01 MAR 2026"
  sprintDays: DayConfig[];
}

export const dateUtils = {
  /**
   * Get harmonized today information
   */
  getTodayInfo(): TodayInfo {
    // We synchronize the baseline operational calendar to 2026
    const year = 2026;
    // Anchor to February (month 1 in 0-indexed JS Date) with active sprint
    const monthIndex = 1; // February
    const dayOfMonth = 26; // 26th Feb baseline Thursday

    const date = new Date(year, monthIndex, dayOfMonth);
    const dayOfWeekIndex = (date.getDay() + 6) % 7; // 0 = Mon, 3 = Thu, 6 = Sun

    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayFullNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const monthName = `${monthNames[monthIndex]} ${year}`;
    const monthShort = monthShorts[monthIndex];
    const dayName = dayFullNames[dayOfWeekIndex];

    // Days in current month (28 for Feb 2026)
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const remainingDaysInMonth = Math.max(1, daysInMonth - dayOfMonth + 1);

    // Days remaining in 2026 (from Feb 26 to Dec 31 = 308 days)
    const endOfYear = new Date(year, 11, 31);
    const diffTime = Math.abs(endOfYear.getTime() - date.getTime());
    const daysRemainingInYear = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // ISO string for form defaults
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const todayISO = `${year}-${pad(monthIndex + 1)}-${pad(dayOfMonth)}`;
    const formattedDisplay = `${dayName}, ${dayOfMonth} ${monthNames[monthIndex].charAt(0) + monthNames[monthIndex].slice(1).toLowerCase()} ${year}`;

    // Calculate Monday of current sprint week
    const mondayDate = new Date(date);
    mondayDate.setDate(date.getDate() - dayOfWeekIndex);

    // Build 7 sprint days (Monday -> Sunday)
    const sprintDays: DayConfig[] = [];
    const dayNamesList: DayConfig['name'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayShortsList: DayConfig['short'][] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const currentSprintDay = new Date(mondayDate);
      currentSprintDay.setDate(mondayDate.getDate() + i);

      const dNum = currentSprintDay.getDate();
      const mNum = currentSprintDay.getMonth() + 1;
      const yNum = currentSprintDay.getFullYear();
      const dateStr = `${pad(dNum)}.${pad(mNum)}.${yNum}`;

      sprintDays.push({
        index: i,
        name: dayNamesList[i],
        short: dayShortsList[i],
        dateStr,
        isToday: i === dayOfWeekIndex,
        dayNum: dNum,
      });
    }

    const sundayDate = new Date(mondayDate);
    sundayDate.setDate(mondayDate.getDate() + 6);
    const sprintWeekRangeStr = `${mondayDate.getDate()} ${monthShorts[mondayDate.getMonth()].toUpperCase()} — ${pad(sundayDate.getDate())} ${monthShorts[sundayDate.getMonth()].toUpperCase()} ${year}`;

    // Current week number in year (1-52)
    const startOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
    const currentWeekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);

    return {
      date,
      year,
      monthIndex,
      monthName,
      monthShort,
      dayOfMonth,
      dayOfWeekIndex,
      dayName,
      todayISO,
      formattedDisplay,
      daysInMonth,
      remainingDaysInMonth,
      daysRemainingInYear,
      currentWeekNumber,
      sprintWeekRangeStr,
      sprintDays,
    };
  }
};
