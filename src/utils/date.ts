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

export interface SprintWeekInfo {
  weekOffset: number;
  isCurrentWeek: boolean;
  relativeWeekLabel: string;
  sprintWeekRangeStr: string;
  currentWeekNumber: number;
  weekTag: string;
  year: number;
  mondayDate: Date;
  sundayDate: Date;
  sprintDays: DayConfig[];
}

export interface TodayInfo {
  date: Date;
  year: number;
  monthIndex: number; // 0-11
  monthName: string; // e.g. "AUGUST 2026"
  monthShort: string; // e.g. "Aug"
  dayOfMonth: number; // 1-31
  dayOfWeekIndex: number; // 0 = Mon, 6 = Sun
  dayName: string; // e.g. "Monday"
  todayISO: string; // e.g. "2026-08-31"
  formattedDisplay: string; // e.g. "Monday, 31 August 2026"
  daysInMonth: number;
  remainingDaysInMonth: number;
  daysRemainingInYear: number;
  currentWeekNumber: number; // 1-52
  weekTag: string; // e.g. "W36"
  dayOfYear: number; // 1-366
  sprintWeekRangeStr: string; // e.g. "31 AUG — 06 SEP 2026"
  sprintDays: DayConfig[];
}

export const dateUtils = {
  /**
   * Get dynamic sprint week details based on offset
   */
  getSprintWeekInfo(weekOffset: number = 0): SprintWeekInfo {
    const now = new Date();
    const todayDayOfWeekIndex = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const todayStr = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`;

    // Base Monday of current real-time week
    const currentMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - todayDayOfWeekIndex);
    // Target Monday based on weekOffset
    const mondayDate = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() + (weekOffset * 7));
    const sundayDate = new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + 6);

    const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNamesList: DayConfig['name'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayShortsList: DayConfig['short'][] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const sprintDays: DayConfig[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + i);
      const dNum = d.getDate();
      const mNum = d.getMonth() + 1;
      const yNum = d.getFullYear();
      const dateStr = `${pad(dNum)}.${pad(mNum)}.${yNum}`;

      sprintDays.push({
        index: i,
        name: dayNamesList[i],
        short: dayShortsList[i],
        dateStr,
        isToday: dateStr === todayStr,
        dayNum: dNum,
      });
    }

    const startMonYear = mondayDate.getFullYear();
    const endSunYear = sundayDate.getFullYear();
    const startMonMonth = mondayDate.getMonth();
    const endSunMonth = sundayDate.getMonth();

    let sprintWeekRangeStr = '';
    if (startMonYear === endSunYear) {
      if (startMonMonth === endSunMonth) {
        sprintWeekRangeStr = `${pad(mondayDate.getDate())} — ${pad(sundayDate.getDate())} ${monthShorts[startMonMonth].toUpperCase()} ${startMonYear}`;
      } else {
        sprintWeekRangeStr = `${pad(mondayDate.getDate())} ${monthShorts[startMonMonth].toUpperCase()} — ${pad(sundayDate.getDate())} ${monthShorts[endSunMonth].toUpperCase()} ${startMonYear}`;
      }
    } else {
      sprintWeekRangeStr = `${pad(mondayDate.getDate())} ${monthShorts[startMonMonth].toUpperCase()} ${startMonYear} — ${pad(sundayDate.getDate())} ${monthShorts[endSunMonth].toUpperCase()} ${endSunYear}`;
    }

    // Week number calculation
    const startOfYear = new Date(mondayDate.getFullYear(), 0, 1);
    const pastDaysOfYear = (mondayDate.getTime() - startOfYear.getTime()) / 86400000;
    const currentWeekNumber = Math.max(1, Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7));
    const weekTag = `W${pad(currentWeekNumber)}`;

    let relativeWeekLabel = 'Current Week';
    if (weekOffset === -1) relativeWeekLabel = 'Last Week';
    else if (weekOffset === 1) relativeWeekLabel = 'Next Week';
    else if (weekOffset < -1) relativeWeekLabel = `${Math.abs(weekOffset)}w Ago`;
    else if (weekOffset > 1) relativeWeekLabel = `+${weekOffset}w Ahead`;

    return {
      weekOffset,
      isCurrentWeek: weekOffset === 0,
      relativeWeekLabel,
      sprintWeekRangeStr,
      currentWeekNumber,
      weekTag,
      year: mondayDate.getFullYear(),
      mondayDate,
      sundayDate,
      sprintDays,
    };
  },

  /**
   * Get harmonized today information
   */
  getTodayInfo(): TodayInfo {
    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth(); // 0-11
    const dayOfMonth = now.getDate(); // 1-31
    const date = now;
    const dayOfWeekIndex = (date.getDay() + 6) % 7; // 0 = Mon, 6 = Sun

    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayFullNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const monthName = `${monthNames[monthIndex]} ${year}`;
    const monthShort = monthShorts[monthIndex];
    const dayName = dayFullNames[dayOfWeekIndex];

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const remainingDaysInMonth = Math.max(1, daysInMonth - dayOfMonth + 1);

    const endOfYear = new Date(year, 11, 31);
    const diffTime = Math.abs(endOfYear.getTime() - date.getTime());
    const daysRemainingInYear = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const todayISO = `${year}-${pad(monthIndex + 1)}-${pad(dayOfMonth)}`;
    const formattedDisplay = `${dayName}, ${dayOfMonth} ${monthNames[monthIndex].charAt(0) + monthNames[monthIndex].slice(1).toLowerCase()} ${year}`;

    const currentSprint = this.getSprintWeekInfo(0);
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + 1;

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
      currentWeekNumber: currentSprint.currentWeekNumber,
      weekTag: currentSprint.weekTag,
      dayOfYear,
      sprintWeekRangeStr: currentSprint.sprintWeekRangeStr,
      sprintDays: currentSprint.sprintDays,
    };
  },

  /**
   * Calculate humanized relative days left for a due date
   */
  getDaysLeft(dueDate: string, isCompleted: boolean) {
    if (isCompleted) {
      return { text: 'Resolved', color: 'text-[#10B981] bg-[#10B981]/10', isOverdue: false, isDueToday: false };
    }
    const now = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const todayISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    
    if (dueDate === todayISO) {
      return { text: 'Due today', color: 'text-amber-700 bg-amber-50 border border-amber-200', isOverdue: false, isDueToday: true };
    }
    
    const parts = dueDate.split('-').map(Number);
    const targetDate = new Date(parts[0] || now.getFullYear(), (parts[1] || 1) - 1, parts[2] || 1);
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = targetDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      return { text: `Overdue ${overdueDays}d`, color: 'text-[#E11D48] bg-rose-50 border border-rose-200', isOverdue: true, isDueToday: false };
    }
    if (diffDays === 1) {
      return { text: 'Tomorrow', color: 'text-amber-700 bg-amber-50', isOverdue: false, isDueToday: false };
    }
    return { text: `${diffDays} days left`, color: 'text-[#71717A] bg-[#F9FAFB]', isOverdue: false, isDueToday: false };
  }
};
