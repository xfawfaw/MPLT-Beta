import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  Habit, 
  WeeklyTask, 
  TaskItem, 
  GoalItem, 
  GoalMilestone,
  BudgetConfig, 
  TransactionItem 
} from '../types';
import { sound } from '../utils/sound';
import { dateUtils } from '../utils/date';

interface AppContextType {
  profile: UserProfile;
  habits: Habit[];
  weeklyTasks: WeeklyTask[];
  tasks: TaskItem[];
  goals: GoalItem[];
  budget: BudgetConfig;
  transactions: TransactionItem[];
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedMonth: { month: number; year: number };
  setSelectedMonth: React.Dispatch<React.SetStateAction<{ month: number; year: number }>>;
  
  // Gamification Actions
  addExp: (amount: number, reason?: string) => void;
  addPoints: (amount: number) => void;
  
  // Feature Actions
  toggleHabitLog: (habitId: string, day: number) => void;
  addHabit: (title: string, category: Habit['category'], timeOfDay?: Habit['timeOfDay']) => void;
  deleteHabit: (habitId: string) => void;
  
  toggleWeeklyTask: (taskId: string) => void;
  addWeeklyTask: (dayIndex: number, title: string, priority: WeeklyTask['priority'], category: WeeklyTask['category'], dateStr?: string, timeEstimate?: string) => void;
  deleteWeeklyTask: (taskId: string) => void;
  
  toggleTaskStatus: (taskId: string) => void;
  addTask: (task: Omit<TaskItem, 'id'>) => void;
  deleteTask: (taskId: string) => void;
  
  toggleGoalStatus: (goalId: string) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;
  toggleGoalMilestone: (goalId: string, milestoneId: string) => void;
  addGoal: (goal: Omit<GoalItem, 'id'>) => void;
  deleteGoal: (goalId: string) => void;
  addGoalMilestone: (goalId: string, milestone: Omit<GoalMilestone, 'id'>) => void;
  deleteGoalMilestone: (goalId: string, milestoneId: string) => void;
  
  setBudgetConfig: React.Dispatch<React.SetStateAction<BudgetConfig>>;
  addTransaction: (tx: Omit<TransactionItem, 'id'>) => void;
  deleteTransaction: (txId: string) => void;
  
  // Level up modal state
  levelUpModal: { isOpen: boolean; newLevel: number };
  closeLevelUpModal: () => void;
  
  // Toast notification for EXP / Points
  expToast: { visible: boolean; message: string; exp: number } | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
  loadDemoData: () => void;
  resetAllData: () => void;
}

export const STORAGE_KEY = 'mplt_zero_state_v3';

export const getUserRankTitle = (level: number): string => {
  if (level <= 1) return 'Novice Initiate';
  if (level < 5) return 'Apprentice';
  if (level < 10) return 'Consistent Operator';
  if (level < 15) return 'Discipline Specialist';
  if (level < 20) return 'Master Strategist';
  return 'Apex Achiever';
};

// Clean slate starting profile for first-time visitors (Level 1 Novice Initiate)
export const CLEAN_PROFILE: UserProfile = {
  callsign: 'Sovereign Operator',
  bio: 'Building unwavering discipline through quantified daily execution.',
  avatarSeed: 'operator-1',
  level: 1,
  currentExp: 0,
  nextLevelExp: 100,
  totalPoints: 0,
  streakDays: 0,
  joinedDate: '2026.09.01',
  notificationsEnabled: true,
  routineAlarmTimes: {
    morning: '06:00',
    deepWork: '09:00',
    evening: '21:00',
  },
};

// High-level demo profile for test drivers
export const DEMO_PROFILE: UserProfile = {
  callsign: 'Apex Strategist',
  bio: 'Compounding habits, deep work blocks, and 50/30/20 capital flow daily.',
  avatarSeed: 'operator-apex',
  level: 14,
  currentExp: 1420,
  nextLevelExp: 2000,
  totalPoints: 1240,
  streakDays: 28,
  joinedDate: '2026.08.01',
  notificationsEnabled: true,
  routineAlarmTimes: {
    morning: '06:00',
    deepWork: '09:00',
    evening: '21:00',
  },
};

// Initial 31-day habit logs generation for demo data
const generateInitialHabitLogs = (fillRate: number) => {
  const logs: Record<number, boolean> = {};
  for (let day = 1; day <= 31; day++) {
    const pseudoRandom = ((day * 9301 + 49297) % 233280) / 233280;
    logs[day] = pseudoRandom < fillRate;
  }
  return logs;
};

export const DEMO_HABITS: Habit[] = [
  {
    id: 'h-1',
    title: 'Morning Run 5km',
    category: 'Health',
    ptsReward: 10,
    expReward: 25,
    timeOfDay: 'Morning',
    targetFrequency: 'Daily',
    logs: generateInitialHabitLogs(0.74),
  },
  {
    id: 'h-4',
    title: 'Zero Sugar & Whole Foods',
    category: 'Health',
    ptsReward: 10,
    expReward: 25,
    timeOfDay: 'Morning',
    targetFrequency: 'Daily',
    logs: generateInitialHabitLogs(0.65),
  },
  {
    id: 'h-2',
    title: 'Deep Work 90m',
    category: 'Work',
    ptsReward: 15,
    expReward: 35,
    timeOfDay: 'Deep Work',
    targetFrequency: 'Mon-Fri',
    logs: generateInitialHabitLogs(0.81),
  },
  {
    id: 'h-3',
    title: 'Read 20 Pages',
    category: 'Personal Growth',
    ptsReward: 10,
    expReward: 20,
    timeOfDay: 'Deep Work',
    targetFrequency: 'Daily',
    logs: generateInitialHabitLogs(0.68),
  },
  {
    id: 'h-5',
    title: 'Review Finances & Ledger',
    category: 'Money',
    ptsReward: 10,
    expReward: 25,
    timeOfDay: 'Evening',
    targetFrequency: 'Daily',
    logs: generateInitialHabitLogs(0.71),
  },
  {
    id: 'h-6',
    title: 'Evening Reflection & Quran',
    category: 'Spirituality',
    ptsReward: 10,
    expReward: 20,
    timeOfDay: 'Evening',
    targetFrequency: 'Daily',
    logs: generateInitialHabitLogs(0.61),
  },
];

// Clean slate starter habits with empty logs for new users
export const CLEAN_HABITS: Habit[] = DEMO_HABITS.map(h => ({
  ...h,
  logs: {},
}));

// Real-time synchronized demo sprint week tasks
export const getDemoSprintWeekTasks = (): WeeklyTask[] => {
  const currentSprint = dateUtils.getSprintWeekInfo(0);
  const days = currentSprint.sprintDays;

  return [
    // Monday (Day 0)
    { id: 'wt-1', dayIndex: 0, dayName: 'Monday', dateStr: days[0]?.dateStr || '31.08.2026', title: 'Buat plan pengembangan Q1 & milestone focus', priority: 'High', category: 'Work', isCompleted: true, expReward: 30, timeEstimate: '90m' },
    { id: 'wt-1', dayIndex: 0, dayName: 'Monday', dateStr: days[0]?.dateStr || '31.08.2026', title: 'Sprint Kickoff & Weekly Horizon Mapping', priority: 'High', category: 'Work', isCompleted: true, expReward: 35, timeEstimate: '45m' },
    { id: 'wt-2', dayIndex: 0, dayName: 'Monday', dateStr: days[0]?.dateStr || '31.08.2026', title: 'Deep Work: Core system component refactoring', priority: 'High', category: 'Work', isCompleted: true, expReward: 40, timeEstimate: '90m' },
    { id: 'wt-3', dayIndex: 0, dayName: 'Monday', dateStr: days[0]?.dateStr || '31.08.2026', title: 'Lower body gym session (Heavy Squats)', priority: 'Med', category: 'Health', isCompleted: true, expReward: 30, timeEstimate: '60m' },
    { id: 'wt-4', dayIndex: 0, dayName: 'Monday', dateStr: days[0]?.dateStr || '31.08.2026', title: 'Review budget allocations & fixed needs', priority: 'Low', category: 'Money', isCompleted: true, expReward: 20, timeEstimate: '20m' },
    { id: 'wt-5', dayIndex: 0, dayName: 'Monday', dateStr: days[0]?.dateStr || '31.08.2026', title: 'Tadabbur 5 ayat Al-Quran setelah Subuh', priority: 'Med', category: 'Spirituality', isCompleted: true, expReward: 25, timeEstimate: '25m' },

    { id: 'wt-6', dayIndex: 1, dayName: 'Tuesday', dateStr: days[1]?.dateStr || '01.09.2026', title: 'Design high-converting landing page Figma', priority: 'High', category: 'Work', isCompleted: true, expReward: 40, timeEstimate: '90m' },
    { id: 'wt-7', dayIndex: 1, dayName: 'Tuesday', dateStr: days[1]?.dateStr || '01.09.2026', title: 'Cardio interval training 5km pacing', priority: 'Med', category: 'Health', isCompleted: true, expReward: 25, timeEstimate: '35m' },
    { id: 'wt-8', dayIndex: 1, dayName: 'Tuesday', dateStr: days[1]?.dateStr || '01.09.2026', title: 'Write & publish 1 technical breakdown article', priority: 'Med', category: 'Personal Growth', isCompleted: false, expReward: 30, timeEstimate: '60m' },
    { id: 'wt-9', dayIndex: 1, dayName: 'Tuesday', dateStr: days[1]?.dateStr || '01.09.2026', title: 'Update portfolio investment spreadsheet', priority: 'Low', category: 'Money', isCompleted: true, expReward: 20, timeEstimate: '20m' },
    { id: 'wt-10', dayIndex: 1, dayName: 'Tuesday', dateStr: days[1]?.dateStr || '01.09.2026', title: 'Quality dinner & deep talk with family', priority: 'High', category: 'Family', isCompleted: false, expReward: 35, timeEstimate: '90m' },
    { id: 'wt-11', dayIndex: 1, dayName: 'Tuesday', dateStr: days[1]?.dateStr || '01.09.2026', title: 'Read 25 pages Marcus Aurelius Meditations', priority: 'Low', category: 'Personal Growth', isCompleted: false, expReward: 20, timeEstimate: '30m' },

    { id: 'wt-12', dayIndex: 2, dayName: 'Wednesday', dateStr: days[2]?.dateStr || '02.09.2026', title: 'Implement database schema for user telemetry', priority: 'High', category: 'Work', isCompleted: false, expReward: 40, timeEstimate: '90m' },
    { id: 'wt-13', dayIndex: 2, dayName: 'Wednesday', dateStr: days[2]?.dateStr || '02.09.2026', title: 'Push Day: Incline bench & lateral raises', priority: 'Med', category: 'Health', isCompleted: false, expReward: 30, timeEstimate: '60m' },
    { id: 'wt-14', dayIndex: 2, dayName: 'Wednesday', dateStr: days[2]?.dateStr || '02.09.2026', title: 'Audit weekly grocery receipts & dining out', priority: 'Low', category: 'Money', isCompleted: false, expReward: 20, timeEstimate: '20m' },
    { id: 'wt-15', dayIndex: 2, dayName: 'Wednesday', dateStr: days[2]?.dateStr || '02.09.2026', title: 'Belanja stok makanan bergizi mingguan', priority: 'Low', category: 'Health', isCompleted: false, expReward: 20, timeEstimate: '45m' },
    { id: 'wt-16', dayIndex: 2, dayName: 'Wednesday', dateStr: days[2]?.dateStr || '02.09.2026', title: 'Dzikir pagi & petang konsisten', priority: 'Med', category: 'Spirituality', isCompleted: false, expReward: 20, timeEstimate: '20m' },

    { id: 'wt-17', dayIndex: 3, dayName: 'Thursday', dateStr: days[3]?.dateStr || '03.09.2026', title: 'Client demo presentation & milestone review', priority: 'High', category: 'Work', isCompleted: false, expReward: 45, timeEstimate: '60m' },
    { id: 'wt-18', dayIndex: 3, dayName: 'Thursday', dateStr: days[3]?.dateStr || '03.09.2026', title: 'Zone 2 low-heart-rate cycling 45 mins', priority: 'Med', category: 'Health', isCompleted: false, expReward: 25, timeEstimate: '45m' },
    { id: 'wt-19', dayIndex: 3, dayName: 'Thursday', dateStr: days[3]?.dateStr || '03.09.2026', title: 'Review SaaS growth metrics & churn rates', priority: 'Med', category: 'Work', isCompleted: false, expReward: 30, timeEstimate: '30m' },
    { id: 'wt-20', dayIndex: 3, dayName: 'Thursday', dateStr: days[3]?.dateStr || '03.09.2026', title: 'Bantu adik persiapan tugas kuliah', priority: 'Med', category: 'Family', isCompleted: false, expReward: 25, timeEstimate: '60m' },
    { id: 'wt-21', dayIndex: 3, dayName: 'Thursday', dateStr: days[3]?.dateStr || '03.09.2026', title: 'Sleep hygiene: Zero blue light 1h before bed', priority: 'Low', category: 'Health', isCompleted: false, expReward: 20, timeEstimate: '15m' },

    { id: 'wt-22', dayIndex: 4, dayName: 'Friday', dateStr: days[4]?.dateStr || '04.09.2026', title: 'Deploy production release v0.9.4 to servers', priority: 'High', category: 'Work', isCompleted: false, expReward: 50, timeEstimate: '75m' },
    { id: 'wt-23', dayIndex: 4, dayName: 'Friday', dateStr: days[4]?.dateStr || '04.09.2026', title: 'Sholat Jumat di saf terdepan & sedekah Jumat', priority: 'High', category: 'Spirituality', isCompleted: false, expReward: 35, timeEstimate: '90m' },
    { id: 'wt-24', dayIndex: 4, dayName: 'Friday', dateStr: days[4]?.dateStr || '04.09.2026', title: 'Transfer tabungan umroh & reksa dana', priority: 'Med', category: 'Money', isCompleted: false, expReward: 25, timeEstimate: '15m' },
    { id: 'wt-25', dayIndex: 4, dayName: 'Friday', dateStr: days[4]?.dateStr || '04.09.2026', title: 'Pull Day: Deadlift & weighted pull-ups', priority: 'Med', category: 'Health', isCompleted: false, expReward: 30, timeEstimate: '60m' },
    { id: 'wt-26', dayIndex: 4, dayName: 'Friday', dateStr: days[4]?.dateStr || '04.09.2026', title: 'Weekly inbox zero & desktop clean-up', priority: 'Low', category: 'Work', isCompleted: false, expReward: 20, timeEstimate: '30m' },
    { id: 'wt-27', dayIndex: 4, dayName: 'Friday', dateStr: days[4]?.dateStr || '04.09.2026', title: 'Baca surat Al-Kahfi lengkap', priority: 'Med', category: 'Spirituality', isCompleted: false, expReward: 30, timeEstimate: '40m' },

    { id: 'wt-28', dayIndex: 5, dayName: 'Saturday', dateStr: days[5]?.dateStr || '05.09.2026', title: 'Long endurance run 10km pagi hari', priority: 'High', category: 'Health', isCompleted: false, expReward: 40, timeEstimate: '75m' },
    { id: 'wt-29', dayIndex: 5, dayName: 'Saturday', dateStr: days[5]?.dateStr || '05.09.2026', title: 'Quality time bareng pasangan & orang tua', priority: 'High', category: 'Family', isCompleted: false, expReward: 40, timeEstimate: '180m' },
    { id: 'wt-30', dayIndex: 5, dayName: 'Saturday', dateStr: days[5]?.dateStr || '05.09.2026', title: 'Belajar arsitektur AI agent & LLM tooling', priority: 'Med', category: 'Personal Growth', isCompleted: false, expReward: 30, timeEstimate: '90m' },
    { id: 'wt-31', dayIndex: 5, dayName: 'Saturday', dateStr: days[5]?.dateStr || '05.09.2026', title: 'Deep sauna recovery & hydration protocol', priority: 'Low', category: 'Health', isCompleted: false, expReward: 20, timeEstimate: '45m' },
    { id: 'wt-32', dayIndex: 5, dayName: 'Saturday', dateStr: days[5]?.dateStr || '05.09.2026', title: 'Silaturahmi ke rumah saudara', priority: 'Med', category: 'Family', isCompleted: false, expReward: 30, timeEstimate: '120m' },
    { id: 'wt-33', dayIndex: 5, dayName: 'Saturday', dateStr: days[5]?.dateStr || '05.09.2026', title: 'Podcast episode: Macro economy breakdown', priority: 'Low', category: 'Personal Growth', isCompleted: false, expReward: 20, timeEstimate: '45m' },

    { id: 'wt-34', dayIndex: 6, dayName: 'Sunday', dateStr: days[6]?.dateStr || '06.09.2026', title: 'Weekly Retrospective & Horizon Alignment', priority: 'High', category: 'Work', isCompleted: false, expReward: 45, timeEstimate: '60m' },
    { id: 'wt-35', dayIndex: 6, dayName: 'Sunday', dateStr: days[6]?.dateStr || '06.09.2026', title: 'Financial weekly reconciliation & ledger audit', priority: 'High', category: 'Money', isCompleted: false, expReward: 35, timeEstimate: '30m' },
    { id: 'wt-36', dayIndex: 6, dayName: 'Sunday', dateStr: days[6]?.dateStr || '06.09.2026', title: 'Mobility flow & deep tissue stretching', priority: 'Med', category: 'Health', isCompleted: false, expReward: 20, timeEstimate: '30m' },
    { id: 'wt-37', dayIndex: 6, dayName: 'Sunday', dateStr: days[6]?.dateStr || '06.09.2026', title: 'Kajian spiritual online & self-reflection', priority: 'Med', category: 'Spirituality', isCompleted: false, expReward: 25, timeEstimate: '45m' },
    { id: 'wt-38', dayIndex: 6, dayName: 'Sunday', dateStr: days[6]?.dateStr || '06.09.2026', title: 'Meal prep bernutrisi untuk hari Senin-Rabu', priority: 'Low', category: 'Health', isCompleted: false, expReward: 20, timeEstimate: '60m' },
  ];
};

// Clean slate: empty sprint tasks for new visitors (user plans their own week)
export const getCleanSprintWeekTasks = (): WeeklyTask[] => [];

// Real-time synchronized demo general task items
export const getDemoTasks = (): TaskItem[] => {
  const now = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const formatOffsetDate = (offsetDays: number) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  return [
    { id: 't-1', title: 'Rapikan catatan keuangan & alokasi bulanan', category: 'Money', priority: 'High', dueDate: formatOffsetDate(0), status: 'In Progress', expReward: 30, note: 'Sesuaikan dengan rasio 50/30/20' },
    { id: 't-2', title: 'Tulis 10 ide konten carousel Instagram', category: 'Work', priority: 'High', dueDate: formatOffsetDate(0), status: 'In Progress', expReward: 35, note: 'Tema: Gamified productivity system' },
    { id: 't-3', title: 'Bersih-bersih area kerja & setup workstation', category: 'Personal Growth', priority: 'Low', dueDate: formatOffsetDate(-1), status: 'Completed', expReward: 20 },
    { id: 't-4', title: 'Meeting dengan Pak Hasan (Sponsor Demo)', category: 'Work', priority: 'High', dueDate: formatOffsetDate(2), status: 'Not Started', expReward: 40, note: 'Siapkan slide deck dan demo' },
    { id: 't-5', title: 'Persiapan campaign iklan produk digital', category: 'Work', priority: 'Med', dueDate: formatOffsetDate(15), status: 'Not Started', expReward: 30 },
    { id: 't-6', title: 'Telepon umi & transfer uang bulanan keluarga', category: 'Family', priority: 'High', dueDate: formatOffsetDate(1), status: 'Completed', expReward: 30 },
    { id: 't-7', title: 'Gym push day & leg day 4x seminggu', category: 'Health', priority: 'Med', dueDate: formatOffsetDate(3), status: 'In Progress', expReward: 30 },
    { id: 't-8', title: 'Upgrade web deployment ke Vercel Pro', category: 'Work', priority: 'Low', dueDate: formatOffsetDate(5), status: 'Not Started', expReward: 20 },
    { id: 't-9', title: 'Khatam 1 juz tafsir Al-Quran', category: 'Spirituality', priority: 'Med', dueDate: formatOffsetDate(2), status: 'In Progress', expReward: 25 },
  ];
};

// Clean slate: empty tasks for new visitors (user adds their own tasks)
export const getCleanTasks = (): TaskItem[] => [];

export const DEMO_GOALS: GoalItem[] = [
  {
    id: 'g-1',
    areaOfLife: 'Money',
    title: '100 Juta Pertama (Liquid Portfolio)',
    targetMetric: 'Rp 100.000.000',
    reward: 'Upgrade Macbook M3 Max Pro',
    deadline: '31 Des 2026',
    status: 'In Progress',
    progressPercent: 60,
    quarterTarget: 'Q4',
    whyStatement: 'Financial cushion and freedom to take sovereign creative risks.',
    milestones: [
      { id: 'm-1-1', title: 'Buka akun sekuritas & RDN aktif', isCompleted: true, expReward: 30 },
      { id: 'm-1-2', title: 'Capai 25 Juta pertama di instrumen low-risk', isCompleted: true, expReward: 35 },
      { id: 'm-1-3', title: 'Capai 50 Juta & diversifikasi SBN / Index Fund', isCompleted: true, expReward: 40 },
      { id: 'm-1-4', title: 'Investasi konsisten Rp 5.000.000 / bulan', isCompleted: false, expReward: 35 },
      { id: 'm-1-5', title: 'Hit Rp 100.000.000 liquid capital', isCompleted: false, expReward: 50 },
    ]
  },
  {
    id: 'g-2',
    areaOfLife: 'Family',
    title: 'Menikah & Rumah Tangga Berkah',
    targetMetric: 'Tabungan Resepsi & Mahar',
    reward: 'Honeymoon ke Swiss / Turki',
    deadline: '15 Okt 2026',
    status: 'In Progress',
    progressPercent: 80,
    quarterTarget: 'Q3',
    whyStatement: 'Membangun peradaban dan keluarga sakinah mawaddah warahmah.',
    milestones: [
      { id: 'm-2-1', title: 'Khitbah & kesepakatan keluarga besar', isCompleted: true, expReward: 30 },
      { id: 'm-2-2', title: 'Booking venue & vendor katering', isCompleted: true, expReward: 35 },
      { id: 'm-2-3', title: 'Beli mahar & seserahan', isCompleted: true, expReward: 35 },
      { id: 'm-2-4', title: 'Fitting busana & cetak undangan', isCompleted: true, expReward: 30 },
      { id: 'm-2-5', title: 'Akad nikah & walimah berkah', isCompleted: false, expReward: 60 },
    ]
  },
  {
    id: 'g-3',
    areaOfLife: 'Health',
    title: 'Bentuk Badan Ideal 65kg & 12% Body Fat',
    targetMetric: '65 kg & Benchpress 80kg',
    reward: 'Belanja Outfit & Gym Gear Baru',
    deadline: '30 Jun 2026',
    status: 'In Progress',
    progressPercent: 60,
    quarterTarget: 'Q2',
    whyStatement: 'Peak energy, high testosterone, and razor-sharp focus for daily execution.',
    milestones: [
      { id: 'm-3-1', title: 'Hit gym konsisten 4x/minggu selama 3 bulan', isCompleted: true, expReward: 30 },
      { id: 'm-3-2', title: 'Bench press tembus 60kg & Pull-up 10 reps', isCompleted: true, expReward: 35 },
      { id: 'm-3-3', title: 'Body fat turun ke 15%', isCompleted: true, expReward: 35 },
      { id: 'm-3-4', title: 'Bench press 80kg & Squat 100kg', isCompleted: false, expReward: 40 },
      { id: 'm-3-5', title: 'Berat stabil 65kg dengan 12% body fat', isCompleted: false, expReward: 50 },
    ]
  },
  {
    id: 'g-4',
    areaOfLife: 'Work',
    title: 'Launch SaaS MPLT Zero & 100 Paid Users',
    targetMetric: '100 Active Pro Subscriptions',
    reward: 'Solo Trip Bali 1 Minggu',
    deadline: '31 Agu 2026',
    status: 'In Progress',
    progressPercent: 40,
    quarterTarget: 'Q3',
    whyStatement: 'Building scalable cashflow from sovereign digital assets.',
    milestones: [
      { id: 'm-4-1', title: 'Design architecture & frontend v1.0', isCompleted: true, expReward: 35 },
      { id: 'm-4-2', title: 'Beta testing dengan 20 user pertama', isCompleted: true, expReward: 35 },
      { id: 'm-4-3', title: 'Setup payment gateway & subscription engine', isCompleted: false, expReward: 40 },
      { id: 'm-4-4', title: 'Launch di Product Hunt & Twitter/X', isCompleted: false, expReward: 45 },
      { id: 'm-4-5', title: '100 Active Paying Pro Customers', isCompleted: false, expReward: 60 },
    ]
  },
  {
    id: 'g-5',
    areaOfLife: 'Personal Growth',
    title: 'Baca 24 Buku Non-Fiksi Berkualitas',
    targetMetric: '24 Books & Reading Notes',
    reward: 'Kindle Scribe Premium',
    deadline: '31 Des 2026',
    status: 'In Progress',
    progressPercent: 50,
    quarterTarget: 'Q4',
    whyStatement: 'Compound mental models from the greatest minds in history.',
    milestones: [
      { id: 'm-5-1', title: 'Selesaikan 6 buku Q1 & buat ringkasan Notion', isCompleted: true, expReward: 30 },
      { id: 'm-5-2', title: 'Selesaikan 12 buku Q2', isCompleted: true, expReward: 35 },
      { id: 'm-5-3', title: 'Selesaikan 18 buku Q3', isCompleted: false, expReward: 35 },
      { id: 'm-5-4', title: 'Selesaikan 24 buku & rilis artikel takeaways', isCompleted: false, expReward: 50 },
    ]
  },
  {
    id: 'g-6',
    areaOfLife: 'Spirituality',
    title: 'Umroh Bareng Orang Tua',
    targetMetric: 'Dana Umroh 2 Pax Terkumpul',
    reward: 'Pencapaian Spiritual Tertinggi',
    deadline: '30 Nov 2026',
    status: 'In Progress',
    progressPercent: 40,
    quarterTarget: 'Q4',
    whyStatement: 'Bakti tertinggi kepada orang tua dan mendekatkan diri kepada Sang Pencipta.',
    milestones: [
      { id: 'm-6-1', title: 'Tabungan tiket & paket travel khusus lansia', isCompleted: true, expReward: 35 },
      { id: 'm-6-2', title: 'Pembuatan paspor & vaksinasi lengkap', isCompleted: true, expReward: 30 },
      { id: 'm-6-3', title: 'Manasik umrah intensif & hafalan doa', isCompleted: false, expReward: 35 },
      { id: 'm-6-4', title: 'Pelaksanaan ibadah di Masjidil Haram & Nabawi', isCompleted: false, expReward: 50 },
      { id: 'm-6-5', title: 'Khatam Quran di depan Ka\'bah', isCompleted: false, expReward: 60 },
    ]
  },
];

// Clean slate: empty strategic goals for new visitors (user sets their own goals)
export const CLEAN_GOALS: GoalItem[] = [];

// Real-time synchronized demo financial transactions ledger
export const getDemoTransactions = (): TransactionItem[] => {
  const now = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const formatOffsetDate = (offsetDays: number) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  return [
    { id: 'tx-1', date: formatOffsetDate(-6), description: 'Gaji Pokok & Freelance Revenue', bucket: 'Savings', amount: 15000000, type: 'income', categoryTag: 'Income' },
    { id: 'tx-2', date: formatOffsetDate(-5), description: 'Sewa Kost / Apartemen & Listrik', bucket: 'Needs', amount: 2500000, type: 'expense', categoryTag: 'Housing' },
    { id: 'tx-3', date: formatOffsetDate(-4), description: 'Belanja Supermarket & Protein Sehat', bucket: 'Needs', amount: 1250000, type: 'expense', categoryTag: 'Groceries' },
    { id: 'tx-4', date: formatOffsetDate(-3), description: 'Wifi Fiber & Paket Data Internet', bucket: 'Needs', amount: 450000, type: 'expense', categoryTag: 'Utilities' },
    { id: 'tx-5', date: formatOffsetDate(-2), description: 'Dinner Cafe & Coffee Specialty', bucket: 'Wants', amount: 650000, type: 'expense', categoryTag: 'Dining' },
    { id: 'tx-6', date: formatOffsetDate(-1), description: 'Langganan Software & Spotify/iCloud', bucket: 'Wants', amount: 450000, type: 'expense', categoryTag: 'Subscriptions' },
    { id: 'tx-7', date: formatOffsetDate(0), description: 'Top-up Reksa Dana Indeks & Saham SBN', bucket: 'Savings', amount: 2000000, type: 'expense', categoryTag: 'Investments' },
    { id: 'tx-8', date: formatOffsetDate(0), description: 'Baju Gym & Sepatu Running Gear', bucket: 'Wants', amount: 1000000, type: 'expense', categoryTag: 'Lifestyle' },
  ];
};

export const DEMO_BUDGET: BudgetConfig = {
  mode: '50/30/20',
  needsRatio: 50,
  wantsRatio: 30,
  savingsRatio: 20,
  incomeGoal: 15000000,
  startBalance: 11250000,
};

export const CLEAN_BUDGET: BudgetConfig = {
  mode: '50/30/20',
  needsRatio: 50,
  wantsRatio: 30,
  savingsRatio: 20,
  incomeGoal: 10000000,
  startBalance: 0,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
    return saved ? JSON.parse(saved) : CLEAN_PROFILE;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_habits`);
    if (!saved) return CLEAN_HABITS;
    try {
      const parsed: Habit[] = JSON.parse(saved);
      return parsed.map(h => {
        const match = CLEAN_HABITS.find(ih => ih.id === h.id);
        return {
          ...h,
          timeOfDay: h.timeOfDay || match?.timeOfDay || 'Morning',
        };
      });
    } catch {
      return CLEAN_HABITS;
    }
  });

  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTask[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_weeklyTasks`);
    if (!saved) return getCleanSprintWeekTasks();
    try {
      const parsed: WeeklyTask[] = JSON.parse(saved);
      const currentSprint = dateUtils.getSprintWeekInfo(0);
      return parsed.map(t => {
        const matchingDay = currentSprint.sprintDays[t.dayIndex];
        return {
          ...t,
          dateStr: t.dateStr || matchingDay?.dateStr || currentSprint.sprintDays[0].dateStr,
        };
      });
    } catch {
      return getCleanSprintWeekTasks();
    }
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tasks`);
    return saved ? JSON.parse(saved) : getCleanTasks();
  });

  const [goals, setGoals] = useState<GoalItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_goals`);
    if (!saved) return CLEAN_GOALS;
    try {
      const parsed: GoalItem[] = JSON.parse(saved);
      return parsed.map(g => {
        const match = CLEAN_GOALS.find(ig => ig.id === g.id);
        return {
          ...g,
          quarterTarget: g.quarterTarget || match?.quarterTarget || 'Q4',
          whyStatement: g.whyStatement || match?.whyStatement || '',
          milestones: (g.milestones && g.milestones.length > 0) ? g.milestones : match?.milestones || [],
        };
      });
    } catch {
      return CLEAN_GOALS;
    }
  });

  const [budget, setBudget] = useState<BudgetConfig>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_budget`);
    return saved ? JSON.parse(saved) : CLEAN_BUDGET;
  });

  const [transactions, setTransactions] = useState<TransactionItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : [];
  });

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  });

  const [levelUpModal, setLevelUpModal] = useState<{ isOpen: boolean; newLevel: number }>({
    isOpen: false,
    newLevel: 14,
  });

  const [expToast, setExpToast] = useState<{ visible: boolean; message: string; exp: number } | null>(null);

  // Guarantee clean Light Mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('mplt_theme');
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_habits`, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_weeklyTasks`, JSON.stringify(weeklyTasks));
  }, [weeklyTasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_goals`, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_budget`, JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);

  // Gamification Engine
  const addExp = (amount: number, reason: string = 'Action Completed') => {
    setProfile(prev => {
      let newExp = prev.currentExp + amount;
      let newLevel = prev.level;
      let newNextExp = prev.nextLevelExp;
      let didLevelUp = false;

      while (newExp >= newNextExp) {
        newExp -= newNextExp;
        newLevel += 1;
        newNextExp = Math.round(newNextExp * 1.25);
        didLevelUp = true;
      }

      if (didLevelUp) {
        setLevelUpModal({ isOpen: true, newLevel });
        sound.playLevelUp();
      }

      setExpToast({ visible: true, message: reason, exp: amount });
      setTimeout(() => {
        setExpToast(null);
      }, 3200);

      return {
        ...prev,
        level: newLevel,
        currentExp: newExp,
        nextLevelExp: newNextExp,
        totalPoints: prev.totalPoints + Math.round(amount * 0.5),
      };
    });
  };

  const addPoints = (amount: number) => {
    setProfile(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + amount,
    }));
  };

  const closeLevelUpModal = () => {
    setLevelUpModal(prev => ({ ...prev, isOpen: false }));
  };

  // Habit Actions
  const toggleHabitLog = (habitId: string, day: number) => {
    setHabits(prev =>
      prev.map(h => {
        if (h.id === habitId) {
          const currentVal = !!h.logs[day];
          const nextVal = !currentVal;
          if (nextVal) {
            addExp(h.expReward, `Habit Check: ${h.title}`);
            addPoints(h.ptsReward);
            sound.playPop();
          } else {
            sound.playClick();
          }
          return {
            ...h,
            logs: {
              ...h.logs,
              [day]: nextVal,
            },
          };
        }
        return h;
      })
    );
  };

  const addHabit = (title: string, category: Habit['category'], timeOfDay: Habit['timeOfDay'] = 'Morning') => {
    const newHabit: Habit = {
      id: `h-${Date.now()}`,
      title,
      category,
      ptsReward: 10,
      expReward: 25,
      timeOfDay,
      targetFrequency: 'Daily',
      logs: {},
    };
    setHabits(prev => [...prev, newHabit]);
    addExp(20, 'New Habit Formed');
  };

  const deleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  // Weekly Task Actions
  const toggleWeeklyTask = (taskId: string) => {
    setWeeklyTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const nextCompleted = !t.isCompleted;
          if (nextCompleted) {
            addExp(t.expReward, `Weekly Task: ${t.title}`);
            sound.playPop();
          } else {
            sound.playClick();
          }
          return { ...t, isCompleted: nextCompleted };
        }
        return t;
      })
    );
  };

  const addWeeklyTask = (
    dayIndex: number, 
    title: string, 
    priority: WeeklyTask['priority'], 
    category: WeeklyTask['category'],
    dateStr?: string,
    timeEstimate?: string
  ) => {
    const currentSprint = dateUtils.getSprintWeekInfo(0);
    const dayNames: WeeklyTask['dayName'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const resolvedDate = dateStr || currentSprint.sprintDays[dayIndex]?.dateStr || currentSprint.sprintDays[0].dateStr;
    const newTask: WeeklyTask = {
      id: `wt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      dayIndex,
      dayName: dayNames[dayIndex] || 'Monday',
      dateStr: resolvedDate,
      title,
      priority,
      category,
      isCompleted: false,
      expReward: priority === 'High' ? 35 : priority === 'Med' ? 25 : 20,
      timeEstimate: timeEstimate || '45m',
    };
    setWeeklyTasks(prev => [...prev, newTask]);
    addExp(15, 'Sprint Task Scheduled');
  };

  const deleteWeeklyTask = (taskId: string) => {
    setWeeklyTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // General Task Manager Actions
  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          let nextStatus: TaskItem['status'] = 'Not Started';
          if (t.status === 'Not Started') nextStatus = 'In Progress';
          else if (t.status === 'In Progress') {
            nextStatus = 'Completed';
            addExp(t.expReward, `Task Completed: ${t.title}`);
            sound.playPop();
          } else {
            nextStatus = 'Not Started';
            sound.playClick();
          }
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const addTask = (taskData: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `t-${Date.now()}`,
    };
    setTasks(prev => [newTask, ...prev]);
    addExp(20, 'Task Logged');
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Goal Actions & Milestones
  const toggleGoalStatus = (goalId: string) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const nextStatus = g.status === 'Achieved' ? 'In Progress' : 'Achieved';
          if (nextStatus === 'Achieved') {
            addExp(150, `Goal Milestone Achieved: ${g.title}`);
            sound.playLevelUp();
          } else {
            sound.playClick();
          }
          return { ...g, status: nextStatus, progressPercent: nextStatus === 'Achieved' ? 100 : g.progressPercent };
        }
        return g;
      })
    );
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const isAchieved = progress >= 100;
          return {
            ...g,
            progressPercent: Math.min(100, Math.max(0, progress)),
            status: isAchieved ? 'Achieved' : 'In Progress',
          };
        }
        return g;
      })
    );
  };

  const toggleGoalMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId && g.milestones) {
          const updatedMilestones = g.milestones.map(m => {
            if (m.id === milestoneId) {
              const nextDone = !m.isCompleted;
              if (nextDone) {
                addExp(m.expReward, `Milestone: ${m.title}`);
                sound.playPop();
              } else {
                sound.playClick();
              }
              return { ...m, isCompleted: nextDone };
            }
            return m;
          });

          const completedCount = updatedMilestones.filter(m => m.isCompleted).length;
          const newPercent = Math.round((completedCount / updatedMilestones.length) * 100);
          const isAchieved = newPercent >= 100;

          if (isAchieved && g.status !== 'Achieved') {
            addExp(100, `Major Goal Completed: ${g.title}`);
            sound.playLevelUp();
          }

          return {
            ...g,
            milestones: updatedMilestones,
            progressPercent: newPercent,
            status: isAchieved ? 'Achieved' : 'In Progress',
          };
        }
        return g;
      })
    );
  };

  const addGoal = (goalData: Omit<GoalItem, 'id'>) => {
    const newGoal: GoalItem = {
      ...goalData,
      id: `g-${Date.now()}`,
      status: goalData.status || 'In Progress',
      progressPercent: goalData.progressPercent || 0,
      milestones: goalData.milestones || [],
    };
    setGoals(prev => [newGoal, ...prev]);
    addExp(50, `Created Strategic Goal: ${newGoal.title}`);
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const addGoalMilestone = (goalId: string, milestoneData: Omit<GoalMilestone, 'id'>) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const newMilestone: GoalMilestone = {
            ...milestoneData,
            id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          };
          const updated = [...(g.milestones || []), newMilestone];
          const completedCount = updated.filter(m => m.isCompleted).length;
          const newPercent = updated.length > 0 ? Math.round((completedCount / updated.length) * 100) : 0;
          return {
            ...g,
            milestones: updated,
            progressPercent: newPercent,
            status: newPercent >= 100 ? 'Achieved' : 'In Progress',
          };
        }
        return g;
      })
    );
    addExp(20, 'Goal Milestone Added');
  };

  const deleteGoalMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId && g.milestones) {
          const updated = g.milestones.filter(m => m.id !== milestoneId);
          const completedCount = updated.filter(m => m.isCompleted).length;
          const newPercent = updated.length > 0 ? Math.round((completedCount / updated.length) * 100) : 0;
          return {
            ...g,
            milestones: updated,
            progressPercent: newPercent,
            status: newPercent >= 100 ? 'Achieved' : 'In Progress',
          };
        }
        return g;
      })
    );
  };

  // Finance Actions
  const addTransaction = (tx: Omit<TransactionItem, 'id'>) => {
    const newTx: TransactionItem = {
      ...tx,
      id: `tx-${Date.now()}`,
    };
    setTransactions(prev => [newTx, ...prev]);
    addExp(15, 'Recorded Transaction');
  };

  const deleteTransaction = (txId: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== txId));
  };

  // Load full Level 14 demo environment for test drivers
  const loadDemoData = () => {
    const demoProfile = { ...DEMO_PROFILE };
    const demoHabits = [...DEMO_HABITS];
    const demoWeekly = getDemoSprintWeekTasks();
    const demoTasks = getDemoTasks();
    const demoGoals = [...DEMO_GOALS];
    const demoBudget = { ...DEMO_BUDGET };
    const demoTx = getDemoTransactions();

    localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(demoProfile));
    localStorage.setItem(`${STORAGE_KEY}_habits`, JSON.stringify(demoHabits));
    localStorage.setItem(`${STORAGE_KEY}_weeklyTasks`, JSON.stringify(demoWeekly));
    localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(demoTasks));
    localStorage.setItem(`${STORAGE_KEY}_goals`, JSON.stringify(demoGoals));
    localStorage.setItem(`${STORAGE_KEY}_budget`, JSON.stringify(demoBudget));
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(demoTx));

    setProfile(demoProfile);
    setHabits(demoHabits);
    setWeeklyTasks(demoWeekly);
    setTasks(demoTasks);
    setGoals(demoGoals);
    setBudget(demoBudget);
    setTransactions(demoTx);

    sound.playLevelUp();
    setExpToast({ visible: true, message: 'Loaded Level 14 Demo Environment', exp: 1420 });
    setTimeout(() => setExpToast(null), 3000);
  };

  // Update Profile details & routine times
  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(updated));
      return updated;
    });
    sound.playClick();
  };

  // Reset to clean slate Level 1 Novice Initiate
  const resetAllData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_profile`);
    localStorage.removeItem(`${STORAGE_KEY}_habits`);
    localStorage.removeItem(`${STORAGE_KEY}_weeklyTasks`);
    localStorage.removeItem(`${STORAGE_KEY}_tasks`);
    localStorage.removeItem(`${STORAGE_KEY}_goals`);
    localStorage.removeItem(`${STORAGE_KEY}_budget`);
    localStorage.removeItem(`${STORAGE_KEY}_transactions`);

    setProfile({ ...CLEAN_PROFILE });
    setHabits([...CLEAN_HABITS]);
    setWeeklyTasks(getCleanSprintWeekTasks());
    setTasks(getCleanTasks());
    setGoals([...CLEAN_GOALS]);
    setBudget({ ...CLEAN_BUDGET });
    setTransactions([]);

    sound.playPop();
    setExpToast({ visible: true, message: 'Reset to Clean Slate (Level 1 Novice)', exp: 0 });
    setTimeout(() => setExpToast(null), 3000);
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        habits,
        weeklyTasks,
        tasks,
        goals,
        budget,
        transactions,
        currentTab,
        setCurrentTab,
        selectedMonth,
        setSelectedMonth,
        addExp,
        addPoints,
        updateProfile,
        toggleHabitLog,
        addHabit,
        deleteHabit,
        toggleWeeklyTask,
        addWeeklyTask,
        deleteWeeklyTask,
        toggleTaskStatus,
        addTask,
        deleteTask,
        toggleGoalStatus,
        updateGoalProgress,
        toggleGoalMilestone,
        addGoal,
        deleteGoal,
        addGoalMilestone,
        deleteGoalMilestone,
        setBudgetConfig: setBudget,
        addTransaction,
        deleteTransaction,
        levelUpModal,
        closeLevelUpModal,
        expToast,
        loadDemoData,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
