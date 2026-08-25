import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  UserProfile, 
  Habit, 
  WeeklyTask, 
  TaskItem, 
  GoalItem, 
  BudgetConfig, 
  TransactionItem 
} from '../types';

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
  addHabit: (title: string, category: Habit['category']) => void;
  deleteHabit: (habitId: string) => void;
  
  toggleWeeklyTask: (taskId: string) => void;
  addWeeklyTask: (dayIndex: number, title: string, priority: WeeklyTask['priority'], category: WeeklyTask['category']) => void;
  deleteWeeklyTask: (taskId: string) => void;
  
  toggleTaskStatus: (taskId: string) => void;
  addTask: (task: Omit<TaskItem, 'id'>) => void;
  deleteTask: (taskId: string) => void;
  
  toggleGoalStatus: (goalId: string) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;
  
  setBudgetConfig: React.Dispatch<React.SetStateAction<BudgetConfig>>;
  addTransaction: (tx: Omit<TransactionItem, 'id'>) => void;
  deleteTransaction: (txId: string) => void;
  
  // Level up modal state
  levelUpModal: { isOpen: boolean; newLevel: number };
  closeLevelUpModal: () => void;
  
  // Toast notification for EXP / Points
  expToast: { visible: boolean; message: string; exp: number } | null;
  resetAllData: () => void;

  // Theme Mode
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const STORAGE_KEY = 'mplt_zero_state_v1';

const INITIAL_PROFILE: UserProfile = {
  level: 14,
  currentExp: 1420,
  nextLevelExp: 2000,
  totalPoints: 1240,
  streakDays: 28,
};

// Initial 31-day habit logs generation
const generateInitialHabitLogs = (fillRate: number) => {
  const logs: Record<number, boolean> = {};
  for (let day = 1; day <= 31; day++) {
    // Generate deterministic pattern based on day and fillRate
    const pseudoRandom = ((day * 9301 + 49297) % 233280) / 233280;
    logs[day] = pseudoRandom < fillRate;
  }
  return logs;
};

const INITIAL_HABITS: Habit[] = [
  {
    id: 'h-1',
    title: 'Morning Run 5km',
    category: 'Health',
    ptsReward: 10,
    expReward: 25,
    logs: generateInitialHabitLogs(0.74),
  },
  {
    id: 'h-2',
    title: 'Deep Work 90m',
    category: 'Work',
    ptsReward: 15,
    expReward: 35,
    logs: generateInitialHabitLogs(0.81),
  },
  {
    id: 'h-3',
    title: 'Read 20 Pages',
    category: 'Personal Growth',
    ptsReward: 10,
    expReward: 20,
    logs: generateInitialHabitLogs(0.68),
  },
  {
    id: 'h-4',
    title: 'Zero Sugar & Whole Foods',
    category: 'Health',
    ptsReward: 10,
    expReward: 25,
    logs: generateInitialHabitLogs(0.65),
  },
  {
    id: 'h-5',
    title: 'Review Finances & Ledger',
    category: 'Money',
    ptsReward: 10,
    expReward: 25,
    logs: generateInitialHabitLogs(0.71),
  },
  {
    id: 'h-6',
    title: 'Evening Reflection & Quran',
    category: 'Spirituality',
    ptsReward: 10,
    expReward: 20,
    logs: generateInitialHabitLogs(0.61),
  },
];

const INITIAL_WEEKLY_TASKS: WeeklyTask[] = [
  // Monday (23.02.2026) - 5 of 5 done (100% / 120% bonus)
  { id: 'wt-1', dayIndex: 0, dayName: 'Monday', dateStr: '23.02.2026', title: 'Buat plan pengembangan Q1', priority: 'High', category: 'Work', isCompleted: true, expReward: 30 },
  { id: 'wt-2', dayIndex: 0, dayName: 'Monday', dateStr: '23.02.2026', title: 'Tulis script reels & content', priority: 'Med', category: 'Personal Growth', isCompleted: true, expReward: 25 },
  { id: 'wt-3', dayIndex: 0, dayName: 'Monday', dateStr: '23.02.2026', title: 'Analisis dashboard iklan', priority: 'High', category: 'Work', isCompleted: true, expReward: 30 },
  { id: 'wt-4', dayIndex: 0, dayName: 'Monday', dateStr: '23.02.2026', title: 'Selesaikan project Pak Hasan', priority: 'High', category: 'Work', isCompleted: true, expReward: 35 },
  { id: 'wt-5', dayIndex: 0, dayName: 'Monday', dateStr: '23.02.2026', title: 'Set up landing page', priority: 'Med', category: 'Work', isCompleted: true, expReward: 25 },
  { id: 'wt-6', dayIndex: 0, dayName: 'Monday', dateStr: '23.02.2026', title: 'Bonus: Sprint Retrospective', priority: 'Low', category: 'Personal Growth', isCompleted: true, expReward: 20 },

  // Tuesday (24.02.2026) - 6 of 7 done (86%)
  { id: 'wt-7', dayIndex: 1, dayName: 'Tuesday', dateStr: '24.02.2026', title: 'Gym push session 60m', priority: 'High', category: 'Health', isCompleted: true, expReward: 30 },
  { id: 'wt-8', dayIndex: 1, dayName: 'Tuesday', dateStr: '24.02.2026', title: 'Review PR & Code Merge', priority: 'Med', category: 'Work', isCompleted: true, expReward: 25 },
  { id: 'wt-9', dayIndex: 1, dayName: 'Tuesday', dateStr: '24.02.2026', title: 'Update spreadsheet catatan keuangan', priority: 'Med', category: 'Money', isCompleted: true, expReward: 25 },
  { id: 'wt-10', dayIndex: 1, dayName: 'Tuesday', dateStr: '24.02.2026', title: 'Persiapan materi meeting sponsor', priority: 'High', category: 'Work', isCompleted: true, expReward: 30 },
  { id: 'wt-11', dayIndex: 1, dayName: 'Tuesday', dateStr: '24.02.2026', title: 'Baca 1 chapter Atomic Habits', priority: 'Low', category: 'Personal Growth', isCompleted: true, expReward: 20 },
  { id: 'wt-12', dayIndex: 1, dayName: 'Tuesday', dateStr: '24.02.2026', title: 'Pembersihan database staging', priority: 'Med', category: 'Work', isCompleted: true, expReward: 25 },
  { id: 'wt-13', dayIndex: 1, dayName: 'Tuesday', dateStr: '24.02.2026', title: 'Draft proposal klien baru', priority: 'High', category: 'Work', isCompleted: false, expReward: 35 },

  // Wednesday (25.02.2026) - 5 of 5 done (100%)
  { id: 'wt-14', dayIndex: 2, dayName: 'Wednesday', dateStr: '25.02.2026', title: 'Refactor auth service & tokens', priority: 'High', category: 'Work', isCompleted: true, expReward: 35 },
  { id: 'wt-15', dayIndex: 2, dayName: 'Wednesday', dateStr: '25.02.2026', title: 'Transfer tabungan investasi 20%', priority: 'High', category: 'Money', isCompleted: true, expReward: 30 },
  { id: 'wt-16', dayIndex: 2, dayName: 'Wednesday', dateStr: '25.02.2026', title: 'Family dinner & quality time', priority: 'Med', category: 'Family', isCompleted: true, expReward: 25 },
  { id: 'wt-17', dayIndex: 2, dayName: 'Wednesday', dateStr: '25.02.2026', title: 'Running 6km sub-35min', priority: 'Med', category: 'Health', isCompleted: true, expReward: 25 },
  { id: 'wt-18', dayIndex: 2, dayName: 'Wednesday', dateStr: '25.02.2026', title: 'Sedekah subuh & duha', priority: 'Low', category: 'Spirituality', isCompleted: true, expReward: 20 },

  // Thursday (26.02.2026) - 4 of 5 done (80%)
  { id: 'wt-19', dayIndex: 3, dayName: 'Thursday', dateStr: '26.02.2026', title: 'Design audit Figma to Code', priority: 'High', category: 'Work', isCompleted: true, expReward: 30 },
  { id: 'wt-20', dayIndex: 3, dayName: 'Thursday', dateStr: '26.02.2026', title: 'Selesaikan API docs Swagger', priority: 'Med', category: 'Work', isCompleted: true, expReward: 25 },
  { id: 'wt-21', dayIndex: 3, dayName: 'Thursday', dateStr: '26.02.2026', title: 'Beli suplemen vitamin & whey', priority: 'Low', category: 'Health', isCompleted: true, expReward: 20 },
  { id: 'wt-22', dayIndex: 3, dayName: 'Thursday', dateStr: '26.02.2026', title: 'Review budget mingguan', priority: 'Med', category: 'Money', isCompleted: true, expReward: 25 },
  { id: 'wt-23', dayIndex: 3, dayName: 'Thursday', dateStr: '26.02.2026', title: 'Audit server monitoring logs', priority: 'Low', category: 'Work', isCompleted: false, expReward: 20 },

  // Friday (27.02.2026) - 5 of 6 done (83%)
  { id: 'wt-24', dayIndex: 4, dayName: 'Friday', dateStr: '27.02.2026', title: 'Solat Jumat berjamaah tepat waktu', priority: 'High', category: 'Spirituality', isCompleted: true, expReward: 30 },
  { id: 'wt-25', dayIndex: 4, dayName: 'Friday', dateStr: '27.02.2026', title: 'Deploy release v2.4 production', priority: 'High', category: 'Work', isCompleted: true, expReward: 35 },
  { id: 'wt-26', dayIndex: 4, dayName: 'Friday', dateStr: '27.02.2026', title: 'Review feedback pengguna mingguan', priority: 'Med', category: 'Work', isCompleted: true, expReward: 25 },
  { id: 'wt-27', dayIndex: 4, dayName: 'Friday', dateStr: '27.02.2026', title: 'Telepon orang tua & kabar keluarga', priority: 'High', category: 'Family', isCompleted: true, expReward: 30 },
  { id: 'wt-28', dayIndex: 4, dayName: 'Friday', dateStr: '27.02.2026', title: 'Clean desk & organize workspace', priority: 'Low', category: 'Personal Growth', isCompleted: true, expReward: 20 },
  { id: 'wt-29', dayIndex: 4, dayName: 'Friday', dateStr: '27.02.2026', title: 'Sync weekly metrics ke Notion', priority: 'Low', category: 'Work', isCompleted: false, expReward: 20 },

  // Saturday (28.02.2026) - 4 of 4 done (100%)
  { id: 'wt-30', dayIndex: 5, dayName: 'Saturday', dateStr: '28.02.2026', title: 'Long run outdoor 10km', priority: 'High', category: 'Health', isCompleted: true, expReward: 40 },
  { id: 'wt-31', dayIndex: 5, dayName: 'Saturday', dateStr: '28.02.2026', title: 'Grocery shopping mingguan sehat', priority: 'Med', category: 'Family', isCompleted: true, expReward: 25 },
  { id: 'wt-32', dayIndex: 5, dayName: 'Saturday', dateStr: '28.02.2026', title: 'Eksperimen project AI side hustle', priority: 'Med', category: 'Personal Growth', isCompleted: true, expReward: 30 },
  { id: 'wt-33', dayIndex: 5, dayName: 'Saturday', dateStr: '28.02.2026', title: 'Podcast listening & notes', priority: 'Low', category: 'Personal Growth', isCompleted: true, expReward: 20 },

  // Sunday (01.03.2026) - 2 of 5 done (40%)
  { id: 'wt-34', dayIndex: 6, dayName: 'Sunday', dateStr: '01.03.2026', title: 'Weekly Review & Habit Audit', priority: 'High', category: 'Personal Growth', isCompleted: true, expReward: 35 },
  { id: 'wt-35', dayIndex: 6, dayName: 'Sunday', dateStr: '01.03.2026', title: 'Perencanaan agenda minggu depan', priority: 'High', category: 'Work', isCompleted: true, expReward: 30 },
  { id: 'wt-36', dayIndex: 6, dayName: 'Sunday', dateStr: '01.03.2026', title: 'Deep stretch & foam rolling 30m', priority: 'Med', category: 'Health', isCompleted: false, expReward: 25 },
  { id: 'wt-37', dayIndex: 6, dayName: 'Sunday', dateStr: '01.03.2026', title: 'Kajian spiritual online', priority: 'Med', category: 'Spirituality', isCompleted: false, expReward: 25 },
  { id: 'wt-38', dayIndex: 6, dayName: 'Sunday', dateStr: '01.03.2026', title: 'Meal prep untuk Senin-Rabu', priority: 'Low', category: 'Health', isCompleted: false, expReward: 20 },
];

const INITIAL_TASKS: TaskItem[] = [
  { id: 't-1', title: 'Rapikan catatan keuangan bulanan', category: 'Money', priority: 'High', dueDate: '2026-02-26', status: 'In Progress', expReward: 30, note: 'Sesuaikan dengan rasio 50/30/20' },
  { id: 't-2', title: 'Tulis 10 ide konten carousel Instagram', category: 'Work', priority: 'High', dueDate: '2026-02-26', status: 'In Progress', expReward: 35, note: 'Tema: Gamified productivity system' },
  { id: 't-3', title: 'Bersih-bersih area kerja & setup monitor', category: 'Personal Growth', priority: 'Low', dueDate: '2026-02-26', status: 'Completed', expReward: 20 },
  { id: 't-4', title: 'Meeting dengan Pak Hasan (Sponsor)', category: 'Work', priority: 'High', dueDate: '2026-02-28', status: 'Not Started', expReward: 40, note: 'Siapkan slide deck dan demo' },
  { id: 't-5', title: 'Persiapan campaign iklan produk digital', category: 'Work', priority: 'Med', dueDate: '2026-03-15', status: 'Not Started', expReward: 30 },
  { id: 't-6', title: 'Telepon umi & transfer uang bulanan', category: 'Family', priority: 'High', dueDate: '2026-04-18', status: 'Completed', expReward: 30 },
  { id: 't-7', title: 'Gym push day & leg day 4x seminggu', category: 'Health', priority: 'Med', dueDate: '2026-03-01', status: 'In Progress', expReward: 30 },
  { id: 't-8', title: 'Upgrade web deployment ke Vercel Pro', category: 'Work', priority: 'Low', dueDate: '2026-03-05', status: 'Not Started', expReward: 20 },
  { id: 't-9', title: 'Khatam 1 juz tafsir Al-Quran', category: 'Spirituality', priority: 'Med', dueDate: '2026-03-02', status: 'In Progress', expReward: 25 },
];

const INITIAL_GOALS: GoalItem[] = [
  {
    id: 'g-1',
    areaOfLife: 'Money',
    title: '100 Juta Pertama (Liquid Portfolio)',
    targetMetric: 'Rp 100.000.000',
    reward: 'Upgrade Macbook M3 Max Pro',
    deadline: '31 Des 2026',
    status: 'In Progress',
    progressPercent: 68,
  },
  {
    id: 'g-2',
    areaOfLife: 'Family',
    title: 'Menikah & Rumah Tangga Berkah',
    targetMetric: 'Tabungan Resepsi & Mahar',
    reward: 'Honeymoon ke Swiss / Turki',
    deadline: '15 Okt 2026',
    status: 'In Progress',
    progressPercent: 75,
  },
  {
    id: 'g-3',
    areaOfLife: 'Health',
    title: 'Bentuk Badan Ideal 65kg & 12% Body Fat',
    targetMetric: '65 kg & Benchpress 80kg',
    reward: 'Belanja Outfit & Gym Gear Baru',
    deadline: '30 Jun 2026',
    status: 'In Progress',
    progressPercent: 82,
  },
  {
    id: 'g-4',
    areaOfLife: 'Work',
    title: 'Launch SaaS MPLT Zero & 100 Paid Users',
    targetMetric: '100 Active Pro Subscriptions',
    reward: 'Solo Trip Bali 1 Minggu',
    deadline: '31 Agu 2026',
    status: 'In Progress',
    progressPercent: 55,
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
  },
];

const INITIAL_BUDGET: BudgetConfig = {
  mode: '50/30/20',
  needsRatio: 50,
  wantsRatio: 30,
  savingsRatio: 20,
  incomeGoal: 15000000,
  startBalance: 11250000,
};

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  { id: 'tx-1', date: '2026-02-24', description: 'Gaji Pokok & Freelance Revenue', bucket: 'Savings', amount: 15000000, type: 'income' },
  { id: 'tx-2', date: '2026-02-24', description: 'Sewa Kost / Apartemen & Listrik', bucket: 'Needs', amount: 2500000, type: 'expense' },
  { id: 'tx-3', date: '2026-02-25', description: 'Belanja Supermarket & Protein', bucket: 'Needs', amount: 1250000, type: 'expense' },
  { id: 'tx-4', date: '2026-02-25', description: 'Wifi Fiber & Paket Data', bucket: 'Needs', amount: 450000, type: 'expense' },
  { id: 'tx-5', date: '2026-02-26', description: 'Dinner Cafe & Coffee Specialty', bucket: 'Wants', amount: 650000, type: 'expense' },
  { id: 'tx-6', date: '2026-02-26', description: 'Langganan Software & Spotify/iCloud', bucket: 'Wants', amount: 450000, type: 'expense' },
  { id: 'tx-7', date: '2026-02-26', description: 'Top-up Reksa Dana Indeks & Saham', bucket: 'Savings', amount: 2000000, type: 'expense' },
  { id: 'tx-8', date: '2026-02-27', description: 'Baju Gym & Sepatu Running', bucket: 'Wants', amount: 1000000, type: 'expense' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_habits`);
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTask[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_weeklyTasks`);
    return saved ? JSON.parse(saved) : INITIAL_WEEKLY_TASKS;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tasks`);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [goals, setGoals] = useState<GoalItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_goals`);
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [budget, setBudget] = useState<BudgetConfig>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_budget`);
    return saved ? JSON.parse(saved) : INITIAL_BUDGET;
  });

  const [transactions, setTransactions] = useState<TransactionItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('mplt_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState({ month: 0, year: 2026 }); // 0 = Jan 2026

  const [levelUpModal, setLevelUpModal] = useState<{ isOpen: boolean; newLevel: number }>({
    isOpen: false,
    newLevel: 14,
  });

  const [expToast, setExpToast] = useState<{ visible: boolean; message: string; exp: number } | null>(null);

  // Sync theme to document class and localStorage
  useEffect(() => {
    localStorage.setItem('mplt_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

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

  // Gamification: Add EXP & Level Calculation
  const addExp = (amount: number, reason: string = 'Completed Action') => {
    setExpToast({ visible: true, message: reason, exp: amount });
    setTimeout(() => {
      setExpToast(null);
    }, 2800);

    setProfile(prev => {
      let nextExp = prev.currentExp + amount;
      let nextLevel = prev.level;
      let nextLevelThreshold = prev.nextLevelExp;

      if (nextExp >= nextLevelThreshold) {
        nextLevel += 1;
        nextExp = nextExp - nextLevelThreshold;
        nextLevelThreshold = Math.round(nextLevelThreshold * 1.25);

        // Trigger confetti!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10B981', '#18181B', '#E11D48', '#CBD5E1'],
          });
        } catch {
          // ignore
        }

        setLevelUpModal({ isOpen: true, newLevel: nextLevel });
      }

      return {
        ...prev,
        level: nextLevel,
        currentExp: nextExp,
        nextLevelExp: nextLevelThreshold,
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
    setHabits(prevHabits => {
      return prevHabits.map(habit => {
        if (habit.id === habitId) {
          const currentlyCompleted = !!habit.logs[day];
          const newLogs = { ...habit.logs, [day]: !currentlyCompleted };

          if (!currentlyCompleted) {
            // Earned points and EXP
            addExp(habit.expReward, `Habit: ${habit.title}`);
            addPoints(habit.ptsReward);
          }

          return { ...habit, logs: newLogs };
        }
        return habit;
      });
    });
  };

  const addHabit = (title: string, category: Habit['category']) => {
    const newHabit: Habit = {
      id: `h-${Date.now()}`,
      title,
      category,
      ptsReward: 10,
      expReward: 25,
      logs: {},
    };
    setHabits(prev => [...prev, newHabit]);
    addExp(15, `Created New Habit`);
  };

  const deleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  // Weekly Task Actions
  const toggleWeeklyTask = (taskId: string) => {
    setWeeklyTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const nextCompleted = !task.isCompleted;
          if (nextCompleted) {
            addExp(task.expReward, `Task: ${task.title}`);
          }
          return { ...task, isCompleted: nextCompleted };
        }
        return task;
      })
    );
  };

  const addWeeklyTask = (dayIndex: number, title: string, priority: WeeklyTask['priority'], category: WeeklyTask['category']) => {
    const days: WeeklyTask['dayName'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dateStrs = ['23.02.2026', '24.02.2026', '25.02.2026', '26.02.2026', '27.02.2026', '28.02.2026', '01.03.2026'];
    
    const newTask: WeeklyTask = {
      id: `wt-${Date.now()}`,
      dayIndex,
      dayName: days[dayIndex] || 'Monday',
      dateStr: dateStrs[dayIndex] || '23.02.2026',
      title,
      priority,
      category,
      isCompleted: false,
      expReward: priority === 'High' ? 35 : priority === 'Med' ? 25 : 20,
    };
    setWeeklyTasks(prev => [...prev, newTask]);
    addExp(10, 'Scheduled Weekly Task');
  };

  const deleteWeeklyTask = (taskId: string) => {
    setWeeklyTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Task Manager Actions
  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'Completed' ? 'In Progress' : 'Completed';
          if (nextStatus === 'Completed') {
            addExp(t.expReward, `Completed: ${t.title}`);
          }
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const addTask = (task: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...task,
      id: `t-${Date.now()}`,
    };
    setTasks(prev => [newTask, ...prev]);
    addExp(10, 'Created Task');
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Goal Actions
  const toggleGoalStatus = (goalId: string) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const nextStatus = g.status === 'Achieved' ? 'In Progress' : 'Achieved';
          if (nextStatus === 'Achieved') {
            addExp(100, `Achieved Goal: ${g.title}`);
            addPoints(50);
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

  const resetAllData = () => {
    localStorage.clear();
    setProfile(INITIAL_PROFILE);
    setHabits(INITIAL_HABITS);
    setWeeklyTasks(INITIAL_WEEKLY_TASKS);
    setTasks(INITIAL_TASKS);
    setGoals(INITIAL_GOALS);
    setBudget(INITIAL_BUDGET);
    setTransactions(INITIAL_TRANSACTIONS);
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
        setBudgetConfig: setBudget,
        addTransaction,
        deleteTransaction,
        levelUpModal,
        closeLevelUpModal,
        expToast,
        resetAllData,
        theme,
        toggleTheme,
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
