export type AreaOfLife = 
  | 'Health' 
  | 'Work' 
  | 'Money' 
  | 'Family' 
  | 'Personal Growth' 
  | 'Spirituality';

export type OperatorId = 'dev' | 'user-1' | 'user-2' | 'user-3' | 'user-4';

export interface OperatorMeta {
  id: OperatorId;
  label: string;
  role: string;
  defaultCallsign: string;
  badge: string;
  isDev?: boolean;
  defaultPin: string;
  validPins: string[];
}

export const OPERATOR_LIST: OperatorMeta[] = [
  { 
    id: 'dev', 
    label: 'Developer Mode', 
    role: 'System Architect & God Access', 
    defaultCallsign: 'Dev Architect', 
    badge: 'DEV', 
    isDev: true,
    defaultPin: '777777',
    validPins: ['777777']
  },
  { 
    id: 'user-1', 
    label: 'User 1', 
    role: 'Primary Sovereign Operator', 
    defaultCallsign: 'Operator 01', 
    badge: 'U1',
    defaultPin: '439182',
    validPins: ['439182']
  },
  { 
    id: 'user-2', 
    label: 'User 2', 
    role: 'Tactical Operator 02', 
    defaultCallsign: 'Operator 02', 
    badge: 'U2',
    defaultPin: '581047',
    validPins: ['581047']
  },
  { 
    id: 'user-3', 
    label: 'User 3', 
    role: 'Tactical Operator 03', 
    defaultCallsign: 'Operator 03', 
    badge: 'U3',
    defaultPin: '726394',
    validPins: ['726394']
  },
  { 
    id: 'user-4', 
    label: 'User 4', 
    role: 'Tactical Operator 04', 
    defaultCallsign: 'Operator 04', 
    badge: 'U4',
    defaultPin: '903258',
    validPins: ['903258']
  },
];

export const verifyOperatorPin = (opId: OperatorId, enteredPin: string): boolean => {
  const clean = enteredPin.trim().toLowerCase();
  const customPin = localStorage.getItem(`mplt_pin_${opId}`);
  if (customPin && customPin.toLowerCase() === clean) return true;
  const op = OPERATOR_LIST.find(o => o.id === opId);
  if (!op) return false;
  return op.validPins.map(p => p.toLowerCase()).includes(clean) || op.defaultPin.toLowerCase() === clean;
};

export const findOperatorByPin = (enteredPin: string): OperatorMeta | null => {
  const clean = enteredPin.trim().toLowerCase();
  for (const op of OPERATOR_LIST) {
    const customPin = localStorage.getItem(`mplt_pin_${op.id}`);
    if (customPin && customPin.toLowerCase() === clean) return op;
    if (op.validPins.map(p => p.toLowerCase()).includes(clean) || op.defaultPin.toLowerCase() === clean) {
      return op;
    }
  }
  return null;
};

export interface UserProfile {
  operatorId?: OperatorId;
  callsign?: string;
  bio?: string;
  avatarSeed?: string;
  avatarUrl?: string; // Custom uploaded image as base64 data URL
  level: number;
  currentExp: number;
  nextLevelExp: number;
  totalPoints: number;
  streakDays: number;
  joinedDate?: string;
}

export interface HabitMilestoneTier {
  tierName: 'Novice' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | '31-Day Streak';
  minCompletions: number;
  badgeColor: string;
}

export interface Habit {
  id: string;
  title: string;
  category: AreaOfLife;
  ptsReward: number;
  expReward: number;
  timeOfDay?: 'Morning' | 'Deep Work' | 'Evening' | 'Anytime';
  targetFrequency?: string; // e.g. "Daily", "5x / Week"
  // Logs keyed by Day number (1-31)
  logs: Record<number, boolean>;
}

export interface WeeklyTask {
  id: string;
  dayIndex: number; // 0 = Monday, 6 = Sunday
  dayName: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  dateStr: string; // e.g. "23.02.2026"
  title: string;
  priority: 'High' | 'Med' | 'Low';
  category: AreaOfLife;
  isCompleted: boolean;
  expReward: number;
  timeEstimate?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  category: AreaOfLife;
  priority: 'High' | 'Med' | 'Low';
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  expReward: number;
  note?: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  isCompleted: boolean;
  expReward: number;
}

export interface GoalItem {
  id: string;
  areaOfLife: AreaOfLife;
  title: string;
  targetMetric: string;
  reward: string;
  deadline: string;
  status: 'Not Started' | 'In Progress' | 'Achieved';
  progressPercent: number;
  imageUrl?: string;
  quarterTarget?: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Year-End';
  milestones?: GoalMilestone[];
  whyStatement?: string;
}

export interface BudgetConfig {
  mode: '50/30/20' | '60/20/20' | '80/20' | 'custom';
  needsRatio: number;
  wantsRatio: number;
  savingsRatio: number;
  incomeGoal: number;
  startBalance: number;
}

export interface TransactionItem {
  id: string;
  date: string;
  description: string;
  bucket: 'Needs' | 'Wants' | 'Savings';
  amount: number;
  type: 'expense' | 'income';
  categoryTag?: string; // e.g. "Groceries", "Rent", "Investments", "Subscriptions"
}
