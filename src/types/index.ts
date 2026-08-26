export type AreaOfLife = 
  | 'Health' 
  | 'Work' 
  | 'Money' 
  | 'Family' 
  | 'Personal Growth' 
  | 'Spirituality';

export interface UserProfile {
  level: number;
  currentExp: number;
  nextLevelExp: number;
  totalPoints: number;
  streakDays: number;
}

export interface HabitMilestoneTier {
  tierName: 'Novice' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum Legend';
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
