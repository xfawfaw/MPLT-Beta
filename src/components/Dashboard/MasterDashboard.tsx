import React, { useState, useEffect, useMemo } from 'react';
import { useApp, getUserRankTitle } from '../../context/AppContext';
import { 
  Check, 
  CheckCircle2, 
  ArrowUpRight, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  PieChart as PieIcon,
  Zap,
  Target,
  Flame,
  Sparkles,
  DollarSign,
  Briefcase,
  HeartHandshake,
  BookOpen,
  Moon,
  Globe as GlobeIcon,
  Activity,
  Plus,
  X,
  CalendarCheck2,
  CheckSquare,
  ChevronLeft,
  ArrowRight,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Marker, Arc } from '@/components/ui/cobe-globe';
import { AreaOfLife } from '../../types';
import { sound } from '../../utils/sound';
import { dateUtils } from '../../utils/date';

export const MasterDashboard: React.FC = () => {
  const { 
    profile,
    habits, 
    toggleHabitLog, 
    weeklyTasks, 
    toggleWeeklyTask, 
    addWeeklyTask,
    tasks,
    toggleTaskStatus,
    goals,
    budget, 
    transactions,
    addTransaction,
    addExp,
    setCurrentTab
  } = useApp();

  const [today, setToday] = useState(() => dateUtils.getTodayInfo());
  
  // Quick Kinetic Capture Modal State (Option B)
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [quickCaptureTab, setQuickCaptureTab] = useState<'expense' | 'habit' | 'task'>('expense');

  // Quick form fields
  const [quickAmount, setQuickAmount] = useState('');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickCategory, setQuickCategory] = useState<AreaOfLife>('Work');
  const [quickBucket, setQuickBucket] = useState<'Needs' | 'Wants' | 'Savings'>('Needs');
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskPriority, setQuickTaskPriority] = useState<'High' | 'Med' | 'Low'>('High');
  const [quickTaskDay, setQuickTaskDay] = useState(today.dayOfWeekIndex);

  // Global hotkey 'C' for Quick Kinetic Capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if ((e.key === 'c' || e.key === 'C') && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
        e.preventDefault();
        setShowQuickCapture(prev => !prev);
        sound.playClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Keep date real-time synchronized
    const timer = setInterval(() => {
      setToday(dateUtils.getTodayInfo());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // 1. Calculate Today Habit Completion (e.g. for current active day of month)
  const currentDayNum = today.dayOfMonth;
  const habitsDoneCount = habits.filter(h => !!h.logs[currentDayNum]).length;
  const habitCompletionRate = habits.length > 0 
    ? ((habitsDoneCount / habits.length) * 100).toFixed(1) 
    : '0.0';

  // 2. Pending Tasks calculation
  const pendingWeeklyTasks = weeklyTasks.filter(t => !t.isCompleted);
  const pendingTasksCount = pendingWeeklyTasks.length;

  // 3. Weekly Consistency
  const totalWeekly = weeklyTasks.length;
  const completedWeekly = weeklyTasks.filter(t => t.isCompleted).length;
  const weeklyConsistency = totalWeekly > 0 
    ? Math.round((completedWeekly / totalWeekly) * 100) 
    : 0;

  // 4. Financial Calculations for 50/30/20
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const effectiveBase = totalIncome > 0 ? totalIncome : budget.incomeGoal;
  const needsSpent = transactions.filter(t => t.type === 'expense' && t.bucket === 'Needs').reduce((acc, t) => acc + t.amount, 0);
  const wantsSpent = transactions.filter(t => t.type === 'expense' && t.bucket === 'Wants').reduce((acc, t) => acc + t.amount, 0);
  const savingsActual = transactions.filter(t => t.type === 'expense' && t.bucket === 'Savings').reduce((acc, t) => acc + t.amount, 0);

  const needsLimit = effectiveBase * (budget.needsRatio / 100);
  const wantsLimit = effectiveBase * (budget.wantsRatio / 100);
  const savingsGoal = effectiveBase * (budget.savingsRatio / 100);

  const totalSpent = needsSpent + wantsSpent;
  const spentPercent = effectiveBase > 0 ? Math.round((totalSpent / effectiveBase) * 100) : 0;
  const isUnderBudget = spentPercent <= (budget.needsRatio + budget.wantsRatio);
  const remainingDaysInMonth = today.remainingDaysInMonth;
  const safeDailyBurn = (remainingDaysInMonth > 0 && wantsLimit > 0) 
    ? Math.max(0, Math.round((wantsLimit - wantsSpent) / remainingDaysInMonth))
    : 0;

  // 5. Next Primary Quest Directive (Finds top uncompleted high-priority task)
  const nextPrimaryQuest = useMemo(() => {
    const highWeekly = pendingWeeklyTasks.find(t => t.priority === 'High');
    if (highWeekly) return { source: 'weekly' as const, task: highWeekly };
    
    const uncompletedGeneral = tasks.find(t => t.status !== 'Completed' && t.priority === 'High');
    if (uncompletedGeneral) return { source: 'task' as const, task: uncompletedGeneral };

    const firstPending = pendingWeeklyTasks[0];
    if (firstPending) return { source: 'weekly' as const, task: firstPending };

    return null;
  }, [pendingWeeklyTasks, tasks]);

  // 6. 6-Domain Life Balance & Kinetic Harmony Matrix
  const domainLifeBalance = useMemo(() => {
    const domains: { 
      area: AreaOfLife; 
      cityName: string;
      coordinatesText: string;
      nodeCode: string;
      icon: any; 
      location: [number, number]; 
      markerId: string; 
      description: string; 
      targetTab: 'tasks' | 'habits' | 'goals' | 'finance' | 'weekly';
      targetTabLabel: string;
    }[] = [
      { area: 'Work', cityName: 'San Francisco, USA', coordinatesText: '37.8°N, 122.4°W', nodeCode: 'SF-WRK-01', icon: Briefcase, location: [37.7595, -122.4367], markerId: 'work', description: 'Career, Projects & Daily Execution', targetTab: 'tasks', targetTabLabel: 'Task Manager' },
      { area: 'Health', cityName: 'Tokyo, Japan', coordinatesText: '35.7°N, 139.7°E', nodeCode: 'TYO-HLT-02', icon: ShieldCheck, location: [35.6762, 139.6503], markerId: 'health', description: 'Vitality, Fitness & Recovery', targetTab: 'habits', targetTabLabel: 'Habit Matrix' },
      { area: 'Money', cityName: 'London, UK', coordinatesText: '51.5°N, 0.1°W', nodeCode: 'LDN-FIN-03', icon: DollarSign, location: [51.5074, -0.1278], markerId: 'money', description: 'Budget, Net Worth & Savings Rate', targetTab: 'finance', targetTabLabel: 'Money Tracker' },
      { area: 'Personal Growth', cityName: 'Paris, France', coordinatesText: '48.9°N, 2.4°E', nodeCode: 'PAR-GRW-04', icon: BookOpen, location: [48.8566, 2.3522], markerId: 'growth', description: 'Knowledge, Skills & Deep Learning', targetTab: 'goals', targetTabLabel: 'Goal Tracker' },
      { area: 'Spirituality', cityName: 'Mecca, Saudi Arabia', coordinatesText: '21.4°N, 39.8°E', nodeCode: 'MEC-SPR-05', icon: Moon, location: [21.4225, 39.8262], markerId: 'spirit', description: 'Mindfulness, Purpose & Inner Calm', targetTab: 'habits', targetTabLabel: 'Habit Matrix' },
      { area: 'Family', cityName: 'Jakarta, Indonesia', coordinatesText: '6.2°S, 106.8°E', nodeCode: 'JKT-FAM-06', icon: HeartHandshake, location: [-6.2088, 106.8456], markerId: 'family', description: 'Relationships, Kin & Social Bonds', targetTab: 'weekly', targetTabLabel: 'Weekly Planner' },
    ];

    return domains.map(d => {
      const domain = d.area;

      // Habit score in domain (for current day)
      const domainHabits = habits.filter(h => h.category === domain);
      const habitsCompleted = domainHabits.filter(h => !!h.logs[currentDayNum]).length;
      const hasHabits = domainHabits.length > 0;
      const habitScore = hasHabits ? (habitsCompleted / domainHabits.length) * 100 : 0;

      // Weekly tasks score in domain
      const domainWeeklyTasks = weeklyTasks.filter(t => t.category === domain);
      const weeklyTasksCompleted = domainWeeklyTasks.filter(t => t.isCompleted).length;
      const pendingWeekly = domainWeeklyTasks.filter(t => !t.isCompleted);
      const hasWeekly = domainWeeklyTasks.length > 0;
      const weeklyScore = hasWeekly ? (weeklyTasksCompleted / domainWeeklyTasks.length) * 100 : 0;

      // General tasks score in domain
      const domainTasks = tasks.filter(t => t.category === domain);
      const tasksCompleted = domainTasks.filter(t => t.status === 'Completed').length;
      const pendingGeneral = domainTasks.filter(t => t.status !== 'Completed');
      const hasTasks = domainTasks.length > 0;
      const taskScore = hasTasks ? (tasksCompleted / domainTasks.length) * 100 : 0;

      // Goals score in domain
      const domainGoals = goals.filter(g => g.areaOfLife === domain);
      const hasGoals = domainGoals.length > 0;
      const goalsAvgProgress = hasGoals 
        ? Math.round(domainGoals.reduce((acc, g) => acc + g.progressPercent, 0) / domainGoals.length)
        : 0;

      const milestones = domainGoals.flatMap(g => g.milestones || []);
      const milestonesCompleted = milestones.filter(m => m.isCompleted).length;

      // Next Action Directive in this domain
      const nextDirective = pendingWeekly.find(t => t.priority === 'High') 
        || pendingWeekly[0] 
        || pendingGeneral.find(t => t.priority === 'High') 
        || pendingGeneral[0] 
        || null;

      // Domain EXP
      const habitsExp = domainHabits.reduce((acc, h) => {
        const doneDays = Object.values(h.logs).filter(Boolean).length;
        return acc + (doneDays * h.expReward);
      }, 0);
      const weeklyExp = weeklyTasksCompleted * 25;
      const tasksExp = tasksCompleted * 35;
      const goalsExp = milestonesCompleted * 50;
      const totalDomainExp = habitsExp + weeklyExp + tasksExp + goalsExp;

      // Only weight dimensions that actually contain items created by the user
      const activeWeights: { score: number; weight: number }[] = [];
      if (hasHabits) activeWeights.push({ score: habitScore, weight: 0.35 });
      if (hasWeekly) activeWeights.push({ score: weeklyScore, weight: 0.35 });
      if (hasTasks) activeWeights.push({ score: taskScore, weight: 0.15 });
      if (hasGoals) activeWeights.push({ score: goalsAvgProgress, weight: 0.15 });

      let overallHealth = 0;
      if (activeWeights.length > 0) {
        const totalWeight = activeWeights.reduce((acc, w) => acc + w.weight, 0);
        overallHealth = Math.round(activeWeights.reduce((acc, w) => acc + (w.score * w.weight), 0) / totalWeight);
      }

      const statusText = activeWeights.length === 0 
        ? 'Unstarted' 
        : overallHealth >= 80 
        ? 'Optimal' 
        : overallHealth >= 50 
        ? 'Stable' 
        : 'Needs Focus';

      const statusColor = activeWeights.length === 0
        ? 'text-[#71717A] bg-[#F1F5F9]'
        : overallHealth >= 80 
        ? 'text-[#10B981] bg-[#10B981]/10' 
        : overallHealth >= 50 
        ? 'text-amber-700 bg-amber-50' 
        : 'text-[#E11D48] bg-rose-50';

      const totalItemsCount = domainHabits.length + domainWeeklyTasks.length + domainTasks.length + domainGoals.length;
      const completedItemsCount = habitsCompleted + weeklyTasksCompleted + tasksCompleted;
      const pendingTasksCount = pendingWeekly.length + pendingGeneral.length;

      // Dynamic marker size scaled from 0.022 to 0.055 based on domain balance health
      const markerSize = activeWeights.length === 0 
        ? 0.022 
        : Math.max(0.025, Math.min(0.055, 0.025 + (overallHealth / 100) * 0.03));

      return {
        domain,
        cityName: d.cityName,
        coordinatesText: d.coordinatesText,
        nodeCode: d.nodeCode,
        icon: d.icon,
        location: d.location,
        markerId: d.markerId,
        description: d.description,
        targetTab: d.targetTab,
        targetTabLabel: d.targetTabLabel,
        score: overallHealth,
        statusText,
        statusColor,
        totalItemsCount,
        completedItemsCount,
        pendingTasksCount,
        nextDirective,
        hasActivity: totalItemsCount > 0,
        domainExp: totalDomainExp,
        habitsCompleted,
        domainHabitsCount: domainHabits.length,
        weeklyTasksCompleted,
        domainWeeklyCount: domainWeeklyTasks.length,
        tasksCompleted,
        domainTasksCount: domainTasks.length,
        goalsAvgProgress,
        domainGoalsCount: domainGoals.length,
        milestonesCompleted,
        milestonesTotal: milestones.length,
        markerSize,
        domainHabitsList: domainHabits,
        pendingWeeklyList: pendingWeekly,
        pendingGeneralList: pendingGeneral,
        domainGoalsList: domainGoals,
      };
    });
  }, [habits, weeklyTasks, tasks, goals, currentDayNum]);

  // Overall system harmony index
  const systemHarmonyScore = useMemo(() => {
    const active = domainLifeBalance.filter(d => d.hasActivity);
    if (active.length === 0) return 0;
    return Math.round(active.reduce((acc, d) => acc + d.score, 0) / active.length);
  }, [domainLifeBalance]);

  // Dynamic Category EXP Distribution based on live completed work
  const categoryExpData = useMemo(() => {
    const domainColors: Record<AreaOfLife, string> = {
      'Work': '#18181B',
      'Health': '#10B981',
      'Personal Growth': '#6366F1',
      'Money': '#F59E0B',
      'Spirituality': '#8B5CF6',
      'Family': '#EC4899',
    };

    const domains: AreaOfLife[] = ['Work', 'Health', 'Personal Growth', 'Money', 'Spirituality', 'Family'];

    return domains.map(domain => {
      // Habits exp
      const habitsExp = habits
        .filter(h => h.category === domain)
        .reduce((acc, h) => {
          const doneDays = Object.values(h.logs).filter(Boolean).length;
          return acc + (doneDays * h.expReward);
        }, 0);

      // Weekly tasks exp
      const weeklyExp = weeklyTasks
        .filter(t => t.category === domain && t.isCompleted)
        .reduce((acc, t) => acc + t.expReward, 0);

      // General tasks exp
      const tasksExp = tasks
        .filter(t => t.category === domain && t.status === 'Completed')
        .reduce((acc, t) => acc + t.expReward, 0);

      // Goal milestones exp
      const goalsExp = goals
        .filter(g => g.areaOfLife === domain)
        .flatMap(g => g.milestones || [])
        .filter(m => m.isCompleted)
        .reduce((acc, m) => acc + m.expReward, 0);

      const totalVal = habitsExp + weeklyExp + tasksExp + goalsExp;

      return {
        name: domain,
        value: totalVal,
        color: domainColors[domain],
      };
    });
  }, [habits, weeklyTasks, tasks, goals]);

  const totalCategoryExp = categoryExpData.reduce((acc, c) => acc + c.value, 0);
  const topDomainExp = useMemo(() => {
    return [...categoryExpData].sort((a, b) => b.value - a.value)[0];
  }, [categoryExpData]);

  // Dynamic markers on Cobe Globe showing 6 domain statistics
  const globeMarkers: Marker[] = useMemo(() => {
    return domainLifeBalance.map(d => ({
      id: d.markerId,
      location: d.location,
      label: `${d.domain} • ${d.score}%`,
      size: d.markerSize,
    }));
  }, [domainLifeBalance]);

  // Inter-domain synergy balance arcs
  const globeArcs: Arc[] = useMemo(() => [
    { id: 'work-money', from: [37.7595, -122.4367], to: [51.5074, -0.1278], label: 'Work ↔ Capital' },
    { id: 'money-health', from: [51.5074, -0.1278], to: [35.6762, 139.6503], label: 'Capital ↔ Vitality' },
    { id: 'health-family', from: [35.6762, 139.6503], to: [-6.2088, 106.8456], label: 'Vitality ↔ Kinship' },
    { id: 'family-spirit', from: [-6.2088, 106.8456], to: [21.4225, 39.8262], label: 'Kinship ↔ Soul' },
    { id: 'spirit-growth', from: [21.4225, 39.8262], to: [48.8566, 2.3522], label: 'Soul ↔ Mastery' },
    { id: 'growth-work', from: [48.8566, 2.3522], to: [37.7595, -122.4367], label: 'Mastery ↔ Work' },
  ], []);

  const [selectedGlobeDomain, setSelectedGlobeDomain] = useState<string | null>(null);

  const activeSelectedDomain = useMemo(() => {
    if (!selectedGlobeDomain) return null;
    return domainLifeBalance.find(d => d.domain === selectedGlobeDomain || d.markerId === selectedGlobeDomain) || null;
  }, [selectedGlobeDomain, domainLifeBalance]);

  const globeFocusLocation = activeSelectedDomain ? activeSelectedDomain.location : null;

  const handleCycleDomain = (direction: 1 | -1) => {
    sound.playPop();
    const curIdx = domainLifeBalance.findIndex(d => d.domain === selectedGlobeDomain);
    const nextIdx = curIdx === -1 
      ? 0 
      : (curIdx + direction + domainLifeBalance.length) % domainLifeBalance.length;
    setSelectedGlobeDomain(domainLifeBalance[nextIdx].domain);
  };

  // Dynamic Weekly 7-day groups from sprint days & weekly tasks
  const days = useMemo(() => {
    return today.sprintDays.map(d => {
      const dayTasks = weeklyTasks.filter(t => t.dayIndex === d.index || t.dateStr === d.dateStr);
      const done = dayTasks.filter(t => t.isCompleted).length;
      const pct = dayTasks.length > 0 ? Math.round((done / dayTasks.length) * 100) : 0;
      return {
        index: d.index,
        name: d.name,
        date: d.dateStr.split('.').slice(0, 2).join('.'),
        dateStr: d.dateStr,
        expected: `${pct}%`,
        pct,
        done,
        total: dayTasks.length,
        isToday: d.isToday,
      };
    });
  }, [today, weeklyTasks]);

  // Weekly Section Interactive State & Telemetry
  const [activeWeeklyDayIndex, setActiveWeeklyDayIndex] = useState<number>(() => today.dayOfWeekIndex);
  const [weeklyViewMode, setWeeklyViewMode] = useState<'inspector' | 'grid'>('inspector');
  const [inlineWeeklyTaskTitle, setInlineWeeklyTaskTitle] = useState('');
  const [inlineWeeklyTaskPriority, setInlineWeeklyTaskPriority] = useState<'High' | 'Med' | 'Low'>('Med');
  const [inlineWeeklyTaskCategory, setInlineWeeklyTaskCategory] = useState<AreaOfLife>('Work');

  const activeDay = useMemo(() => {
    return days.find(d => d.index === activeWeeklyDayIndex) || days[today.dayOfWeekIndex] || days[0];
  }, [days, activeWeeklyDayIndex, today.dayOfWeekIndex]);

  const activeDayTasks = useMemo(() => {
    if (!activeDay) return [];
    return weeklyTasks.filter(t => t.dayIndex === activeDay.index || t.dateStr === today.sprintDays?.[activeDay.index]?.dateStr);
  }, [weeklyTasks, activeDay, today.sprintDays]);

  const totalWeeklyTasksCount = weeklyTasks.length;
  const completedWeeklyTasksCount = weeklyTasks.filter(t => t.isCompleted).length;
  const weeklyCompletionRate = totalWeeklyTasksCount > 0 
    ? Math.round((completedWeeklyTasksCount / totalWeeklyTasksCount) * 100) 
    : 0;
  const pendingWeeklyTasksCount = totalWeeklyTasksCount - completedWeeklyTasksCount;

  const weeklyCategoryDistribution = useMemo(() => {
    const categories: AreaOfLife[] = ['Work', 'Health', 'Money', 'Personal Growth', 'Spirituality', 'Family'];
    const categoryColorsMap: Record<AreaOfLife, { color: string; dot: string; bg: string; text: string; border: string }> = {
      'Work': { color: '#18181B', dot: 'bg-[#18181B]', bg: 'bg-[#F4F4F5]', text: 'text-[#18181B]', border: 'border-[#E2E8F0]' },
      'Health': { color: '#10B981', dot: 'bg-[#10B981]', bg: 'bg-[#F0FDF4]', text: 'text-[#10B981]', border: 'border-[#10B981]/30' },
      'Money': { color: '#F59E0B', dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
      'Personal Growth': { color: '#6366F1', dot: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
      'Spirituality': { color: '#8B5CF6', dot: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      'Family': { color: '#EC4899', dot: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    };

    return categories.map(cat => {
      const catTasks = weeklyTasks.filter(t => t.category === cat);
      const catDone = catTasks.filter(t => t.isCompleted).length;
      return {
        category: cat,
        count: catTasks.length,
        done: catDone,
        pct: catTasks.length > 0 ? Math.round((catDone / catTasks.length) * 100) : 0,
        ...categoryColorsMap[cat],
      };
    }).filter(c => c.count > 0);
  }, [weeklyTasks]);

  const handleAddInlineWeeklyTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineWeeklyTaskTitle.trim() || !activeDay) return;
    addWeeklyTask(
      activeDay.index,
      inlineWeeklyTaskTitle.trim(),
      inlineWeeklyTaskPriority,
      inlineWeeklyTaskCategory,
      today.sprintDays?.[activeDay.index]?.dateStr,
      '30m'
    );
    sound.playPop();
    setInlineWeeklyTaskTitle('');
  };

  const formatIDR = (val: number) => {
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const expToNextLevel = Math.max(0, profile.nextLevelExp - profile.currentExp);

  // Quick Action Handlers
  const handleQuickExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(quickAmount.replace(/[^0-9]/g, ''));
    if (!amountNum || isNaN(amountNum)) return;

    addTransaction({
      amount: amountNum,
      type: 'expense',
      categoryTag: quickCategory,
      description: quickDesc.trim() || `${quickCategory} Expense`,
      date: today.todayISO,
      bucket: quickBucket,
    });

    sound.playPop();
    addExp(15, `Logged ${formatIDR(amountNum)} Outflow`);
    setQuickAmount('');
    setQuickDesc('');
    setShowQuickCapture(false);
  };

  const handleQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    addWeeklyTask(
      quickTaskDay,
      quickTaskTitle.trim(),
      quickTaskPriority,
      quickCategory,
      today.sprintDays[quickTaskDay]?.dateStr,
      '45m'
    );

    sound.playPop();
    setQuickTaskTitle('');
    setShowQuickCapture(false);
  };

  return (
    <div className="max-w-[1440px] mx-auto p-6 space-y-6">
      
      {/* ========================================================
          TOP SECTION 1: MISSION CONTROL PRIMARY DIRECTIVE
          ======================================================== */}
      {nextPrimaryQuest && (
        <section className="mplt-card p-4 bg-white border border-[#E2E8F0] text-[#18181B] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[8px] bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] flex-shrink-0">
              <Zap size={20} className="fill-[#10B981]" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-[10.5px] font-ui uppercase tracking-widest text-[#71717A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>Primary Operational Quest</span>
                <span>•</span>
                <span className="text-[#10B981] font-semibold">{nextPrimaryQuest.task.category}</span>
              </div>
              <h2 className="text-[15px] font-bold font-ui text-[#18181B] mt-0.5">
                {nextPrimaryQuest.task.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <span className="font-num text-[12px] font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-[5px]">
              +{nextPrimaryQuest.task.expReward} EXP
            </span>

            <button
              onClick={() => {
                if (nextPrimaryQuest.source === 'weekly') {
                  toggleWeeklyTask(nextPrimaryQuest.task.id);
                } else {
                  toggleTaskStatus(nextPrimaryQuest.task.id);
                }
              }}
              className="px-4 py-2 rounded-[6px] bg-[#10B981] hover:bg-[#059669] text-white text-[12px] font-bold font-ui flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Check size={14} className="stroke-[3]" />
              <span>Complete Quest</span>
            </button>
          </div>
        </section>
      )}

      {/* ========================================================
          TOP SECTION 2: DAILY VELOCITY TELEMETRY
          ======================================================== */}
      <section className="mplt-card p-4 bg-[#FFFFFF] border border-[#E2E8F0]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <h2 className="text-[12px] font-bold tracking-wider uppercase text-[#18181B] font-ui">
              SYSTEM VELOCITY & TELEMETRY
            </h2>
          </div>
          <span className="text-[11px] text-[#71717A] font-num font-semibold">
            OPERATIONAL LOG • {today.formattedDisplay.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0]">
          
          {/* Metric 1: Today Habit */}
          <div className="pt-2 sm:pt-0 sm:px-3 first:pl-0">
            <div className="text-[11px] text-[#71717A] font-medium font-ui mb-1 flex items-center justify-between">
              <span>Today Habit Completion</span>
              <span className="text-[10px] font-num text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.2 rounded">
                {habitsDoneCount}/{habits.length} Logs
              </span>
            </div>
            <div className="text-[20px] font-bold text-[#18181B] font-num tracking-tight">
              {habitCompletionRate}%
            </div>
          </div>

          {/* Metric 2: Pending Tasks */}
          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="text-[11px] text-[#71717A] font-medium font-ui mb-1 flex items-center justify-between">
              <span>Pending Tasks</span>
              <span className="text-[10px] font-num text-[#71717A] bg-[#F1F5F9] px-1.5 py-0.2 rounded">
                Active Sprint
              </span>
            </div>
            <div className="text-[20px] font-bold text-[#18181B] font-num tracking-tight flex items-baseline gap-2">
              <span>{pendingTasksCount}</span>
              <span className="text-[12px] font-normal text-[#71717A]">items remaining</span>
            </div>
          </div>

          {/* Metric 3: Weekly Consistency */}
          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="text-[11px] text-[#71717A] font-medium font-ui mb-1 flex items-center justify-between">
              <span>Weekly Consistency</span>
              <span className="text-[10px] font-num text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.2 rounded">
                Optimal
              </span>
            </div>
            <div className="text-[20px] font-bold text-[#18181B] font-num tracking-tight flex items-center gap-2">
              <span>{weeklyConsistency}%</span>
              <TrendingUp size={16} className="text-[#10B981]" />
            </div>
          </div>

          {/* Metric 4: Budget Status */}
          <div className="pt-2 sm:pt-0 sm:px-3 last:pr-0">
            <div className="text-[11px] text-[#71717A] font-medium font-ui mb-1 flex items-center justify-between">
              <span>Budget Status</span>
              <span className={`text-[10px] font-num px-1.5 py-0.2 rounded font-semibold ${
                isUnderBudget ? 'text-[#10B981] bg-[#10B981]/10' : 'text-[#E11D48] bg-rose-50'
              }`}>
                {isUnderBudget ? 'UNDER BUDGET' : 'OVER BUDGET'}
              </span>
            </div>
            <div className="text-[20px] font-bold text-[#18181B] font-num tracking-tight">
              {isUnderBudget ? 'Under Budget' : 'Over Budget'}
              <span className="text-[12px] font-normal text-[#71717A] ml-1.5">
                ({spentPercent}% Spent)
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          GLOBAL 6-DOMAIN LIFE BALANCE: 3D TOPOGRAPHY & TELEMETRY
          ======================================================== */}
      <section className="mplt-card p-5 sm:p-6 bg-[#FFFFFF] border border-[#E2E8F0] space-y-6 overflow-hidden">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-[5px] bg-[#18181B] text-white flex items-center justify-center shadow-xs">
                <GlobeIcon size={14} className="text-[#10B981]" />
              </div>
              <h3 className="text-[14px] sm:text-[15px] font-bold text-[#18181B] font-ui uppercase tracking-wider">
                6-DOMAIN LIFE BALANCE — 3D TOPOGRAPHY & TELEMETRY
              </h3>
            </div>
            <p className="text-[11.5px] text-[#71717A] font-ui">
              Real-time multi-dimensional discipline matrix synchronized with active spherical balance nodes
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-[#F9FAFB] border border-[#E2E8F0] text-[11px] font-num">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="font-semibold text-[#18181B]">GLOBAL HARMONY:</span>
              <span className="font-bold text-[#10B981]">{systemHarmonyScore}%</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-[5px] bg-[#18181B] text-white text-[11px] font-num font-bold">
              <span>{totalCategoryExp.toLocaleString('id-ID')} TOTAL EXP</span>
            </div>
          </div>
        </div>

        {/* 6-Domain Orbital Quick Selector Dock */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar border-b border-[#E2E8F0]/80">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setSelectedGlobeDomain(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[11px] font-ui font-medium border transition-all whitespace-nowrap cursor-pointer ${
              selectedGlobeDomain === null
                ? 'bg-[#18181B] text-white border-[#18181B] shadow-xs'
                : 'bg-[#F9FAFB] text-[#71717A] border-[#E2E8F0] hover:border-[#CBD5E1] hover:text-[#18181B]'
            }`}
          >
            <GlobeIcon size={12} className={selectedGlobeDomain === null ? 'text-[#10B981]' : ''} />
            <span>All Domains</span>
            <span className="font-num text-[10px] opacity-75">({systemHarmonyScore}%)</span>
          </button>

          {domainLifeBalance.map((d) => {
            const DomainIcon = d.icon;
            const isSelected = selectedGlobeDomain === d.domain;
            return (
              <button
                key={d.domain}
                type="button"
                onClick={() => {
                  sound.playPop();
                  setSelectedGlobeDomain(isSelected ? null : d.domain);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[11px] font-ui font-medium border transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#18181B] text-white border-[#18181B] shadow-xs'
                    : 'bg-[#F9FAFB] text-[#71717A] border-[#E2E8F0] hover:border-[#CBD5E1] hover:text-[#18181B]'
                }`}
              >
                <DomainIcon size={12} className={isSelected ? 'text-[#10B981]' : ''} />
                <span>{d.domain}</span>
                <span className={`font-num text-[9.5px] px-1.5 py-0.2 rounded font-semibold ${
                  isSelected ? 'bg-white/20 text-white' : d.statusColor
                }`}>
                  {d.score}%
                </span>
              </button>
            );
          })}
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column (5 Cols): 3D Geodesic Interactive Globe */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-[10px] bg-[#FAFAFA] border border-[#E2E8F0] relative overflow-hidden group">
            
            {/* Subtle high-tech background texture */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none bg-cover bg-center"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80")'
              }}
            />

            {/* Top Minimal HUD Header */}
            <div className="w-full flex items-center justify-between text-[10px] font-num text-[#71717A] z-10 mb-2 px-1">
              <span className="flex items-center gap-1.5 font-semibold text-[#18181B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                3D SPHERICAL HARMONY MATRIX
              </span>
              <span className="font-num text-[10px] text-[#71717A]">
                {selectedGlobeDomain ? `NODE: ${selectedGlobeDomain.toUpperCase()}` : '6 DOMAINS LINKED'}
              </span>
            </div>

            {/* Globe Canvas Container */}
            <div className="w-full max-w-[290px] sm:max-w-[320px] aspect-square relative z-10 flex items-center justify-center">
              <Globe
                markers={globeMarkers}
                arcs={globeArcs}
                markerColor={[0.06, 0.72, 0.5]}
                baseColor={[0.96, 0.96, 0.96]}
                arcColor={[0.1, 0.1, 0.12]}
                glowColor={[0.92, 0.94, 0.95]}
                dark={0}
                mapBrightness={9}
                markerSize={0.032}
                markerElevation={0.015}
                arcWidth={0.6}
                arcHeight={0.28}
                speed={0.003}
                focusLocation={globeFocusLocation}
                onMarkerClick={(m) => {
                  sound.playPop();
                  const match = domainLifeBalance.find(d => d.markerId === m.id);
                  if (match) setSelectedGlobeDomain(match.domain);
                }}
                onGlobeClick={() => {
                  sound.playPop();
                  const curIdx = domainLifeBalance.findIndex(d => d.domain === selectedGlobeDomain);
                  const nextIdx = curIdx === -1 ? 0 : (curIdx + 1) % domainLifeBalance.length;
                  setSelectedGlobeDomain(domainLifeBalance[nextIdx].domain);
                }}
              />
            </div>

            {/* Clean bottom interaction hint */}
            <div className="w-full pt-2.5 mt-1 border-t border-[#E2E8F0] flex items-center justify-between text-[10px] font-ui text-[#71717A] z-10">
              <span className="truncate">
                {selectedGlobeDomain ? (
                  <span>Focused on <strong className="text-[#18181B]">{selectedGlobeDomain}</strong> • Click node or canvas to cycle</span>
                ) : (
                  <span>Click markers, tap canvas, or drag to orbit</span>
                )}
              </span>
              {selectedGlobeDomain ? (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedGlobeDomain(null);
                  }}
                  className="font-semibold text-[#18181B] hover:text-[#10B981] transition-colors flex-shrink-0 cursor-pointer"
                >
                  Reset Focus
                </button>
              ) : (
                <span className="text-[#10B981] font-semibold">6 Active Nodes</span>
              )}
            </div>

          </div>

          {/* Right Column (7 Cols): 6-Domain Life Balance & Kinetic EXP Breakdown */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Top Sub-section: 6 Domains Grid */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-[12px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={13} className="text-[#10B981]" />
                  <span>Domain Life Balance & Harmony Rates</span>
                </h4>
                <span className="text-[10px] text-[#71717A] font-ui">
                  Weighted by live habits, tasks & goals
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {domainLifeBalance.map((item) => {
                  const DomainIcon = item.icon;
                  const isSelected = selectedGlobeDomain === item.domain;
                  const expShare = totalCategoryExp > 0 ? Math.round((item.domainExp / totalCategoryExp) * 100) : 0;

                  return (
                    <div
                      key={item.domain}
                      onClick={() => {
                        setSelectedGlobeDomain(isSelected ? null : item.domain);
                      }}
                      className={`p-3 rounded-[8px] border transition-all cursor-pointer select-none ${
                        isSelected 
                          ? 'border-[#18181B] bg-white ring-2 ring-[#18181B]/15 shadow-sm' 
                          : 'border-[#E2E8F0] bg-[#F9FAFB] hover:border-[#CBD5E1] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <DomainIcon size={12} className="text-[#71717A] flex-shrink-0" />
                          <span className="font-ui font-bold text-[#18181B] truncate">{item.domain}</span>
                        </div>
                        <span className={`text-[9.5px] font-num font-bold px-1.5 py-0.2 rounded flex-shrink-0 ${item.statusColor}`}>
                          {item.score}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#E2E8F0] h-[4px] rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.score >= 80 ? 'bg-[#10B981]' : item.score >= 50 ? 'bg-[#18181B]' : 'bg-[#E11D48]'
                          }`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>

                      <div className="space-y-1 text-[9.5px]">
                        <div className="flex items-center justify-between text-[#71717A] font-ui">
                          <span className="font-num font-semibold text-[#18181B]">+{item.domainExp} EXP</span>
                          <span className="text-[9px] font-num text-[#71717A]">({expShare}% share)</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-[#71717A] font-ui border-t border-[#F1F5F9] pt-1">
                          <span>{item.habitsCompleted}/{item.domainHabitsCount} Habits</span>
                          <span>{item.completedItemsCount}/{item.totalItemsCount} Total</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Sub-section: Category EXP Distribution */}
            <div className="p-3.5 rounded-[8px] bg-[#F9FAFB] border border-[#E2E8F0] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" />
                  <h4 className="text-[12px] font-bold text-[#18181B] font-ui uppercase tracking-wider">
                    Kinetic EXP Breakdown Matrix
                  </h4>
                </div>
                <span className="text-[10.5px] font-num font-medium text-[#71717A]">
                  {topDomainExp && topDomainExp.value > 0 ? (
                    <span>Leading: <strong className="text-[#18181B]">{topDomainExp.name} ({Math.round((topDomainExp.value / totalCategoryExp) * 100)}%)</strong></span>
                  ) : (
                    <span>Awaiting initial operations</span>
                  )}
                </span>
              </div>

              {totalCategoryExp > 0 ? (
                <div className="space-y-2">
                  {/* Multi-segment stacked bar */}
                  <div className="h-2.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden flex">
                    {categoryExpData.map((cat) => {
                      const share = (cat.value / totalCategoryExp) * 100;
                      if (share === 0) return null;
                      return (
                        <div
                          key={cat.name}
                          style={{ width: `${share}%`, backgroundColor: cat.color }}
                          className="h-full transition-all"
                          title={`${cat.name}: ${cat.value} EXP (${Math.round(share)}%)`}
                        />
                      );
                    })}
                  </div>

                  {/* 6 Category pills */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1 text-[10.5px]">
                    {categoryExpData.map((cat) => {
                      const share = Math.round((cat.value / totalCategoryExp) * 100);
                      return (
                        <div key={cat.name} className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-[2px] flex-shrink-0" style={{ backgroundColor: cat.color }} />
                            <span className="text-[#71717A] truncate font-ui text-[10px]">{cat.name}</span>
                          </div>
                          <span className="font-num font-bold text-[#18181B] text-[11px] pl-3">
                            {cat.value} <span className="text-[9px] text-[#71717A] font-normal">({share}%)</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-2 px-3 rounded-[6px] bg-white border border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#71717A]">
                  <span>0 EXP logged. Check habits or complete tasks to route kinetic EXP across domains.</span>
                  <span className="font-num font-semibold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">Ready</span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Selected Domain Telemetry Inspector HUD */}
        <AnimatePresence mode="wait">
          {activeSelectedDomain ? (
            <motion.div
              key={activeSelectedDomain.domain}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-5 rounded-[10px] bg-[#FAFAFA] border border-[#18181B]/20 shadow-xs space-y-4"
            >
              {/* Telemetry Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[8px] bg-[#18181B] text-white flex items-center justify-center shadow-xs flex-shrink-0">
                    {React.createElement(activeSelectedDomain.icon, { size: 18, className: "text-[#10B981]" })}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-[14px] sm:text-[15px] font-bold text-[#18181B] font-ui tracking-tight">
                        {activeSelectedDomain.domain} Telemetry Node
                      </h4>
                      <span className={`text-[10px] font-num font-bold px-2 py-0.5 rounded ${activeSelectedDomain.statusColor}`}>
                        {activeSelectedDomain.score}% {activeSelectedDomain.statusText}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#71717A] font-ui mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-[#10B981]" />
                        <span>{activeSelectedDomain.cityName}</span>
                      </span>
                      <span>•</span>
                      <span className="font-num text-[10.5px]">{activeSelectedDomain.coordinatesText}</span>
                      <span>•</span>
                      <span className="font-num text-[10.5px] text-[#18181B] font-semibold">{activeSelectedDomain.nodeCode}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* Prev / Next Cycle Controls */}
                  <div className="flex items-center rounded-[6px] border border-[#E2E8F0] bg-white overflow-hidden shadow-xs">
                    <button
                      type="button"
                      onClick={() => handleCycleDomain(-1)}
                      title="Previous Domain"
                      className="p-1.5 hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#18181B] transition-colors border-r border-[#E2E8F0] cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCycleDomain(1)}
                      title="Next Domain"
                      className="p-1.5 hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Reset/Close Inspector */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedGlobeDomain(null);
                    }}
                    className="p-1.5 rounded-[6px] border border-[#E2E8F0] bg-white text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
                    title="Close Node Telemetry"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* 4 Simplified Telemetry Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* 1. Today's Habits */}
                <div className="p-3 rounded-[8px] bg-white border border-[#E2E8F0] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#71717A] font-ui">
                    <span>Today's Habits</span>
                    <CalendarCheck2 size={13} className="text-[#10B981]" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[18px] font-bold text-[#18181B] font-num">
                      {activeSelectedDomain.habitsCompleted}
                    </span>
                    <span className="text-[11px] text-[#71717A] font-num">
                      / {activeSelectedDomain.domainHabitsCount} Done
                    </span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-[3px] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#10B981] transition-all"
                      style={{ 
                        width: `${activeSelectedDomain.domainHabitsCount > 0 ? Math.round((activeSelectedDomain.habitsCompleted / activeSelectedDomain.domainHabitsCount) * 100) : 0}%` 
                      }}
                    />
                  </div>
                </div>

                {/* 2. Sprint & Weekly Tasks */}
                <div className="p-3 rounded-[8px] bg-white border border-[#E2E8F0] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#71717A] font-ui">
                    <span>Sprint Tasks</span>
                    <CheckSquare size={13} className="text-[#18181B]" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[18px] font-bold text-[#18181B] font-num">
                      {activeSelectedDomain.weeklyTasksCompleted}
                    </span>
                    <span className="text-[11px] text-[#71717A] font-num">
                      / {activeSelectedDomain.domainWeeklyCount} Done
                    </span>
                  </div>
                  <div className="text-[10px] text-[#71717A] font-ui truncate">
                    {activeSelectedDomain.pendingTasksCount} pending execution
                  </div>
                </div>

                {/* 3. Strategic Goals */}
                <div className="p-3 rounded-[8px] bg-white border border-[#E2E8F0] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#71717A] font-ui">
                    <span>Strategic Goals</span>
                    <Target size={13} className="text-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[18px] font-bold text-[#18181B] font-num">
                      {activeSelectedDomain.goalsAvgProgress}%
                    </span>
                    <span className="text-[11px] text-[#71717A] font-ui">
                      Avg Progress
                    </span>
                  </div>
                  <div className="text-[10px] text-[#71717A] font-ui truncate">
                    {activeSelectedDomain.milestonesCompleted} / {activeSelectedDomain.milestonesTotal} Milestones
                  </div>
                </div>

                {/* 4. Discipline EXP Yield */}
                <div className="p-3 rounded-[8px] bg-white border border-[#E2E8F0] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#71717A] font-ui">
                    <span>Discipline Yield</span>
                    <Sparkles size={13} className="text-violet-500" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[18px] font-bold text-[#10B981] font-num">
                      +{activeSelectedDomain.domainExp}
                    </span>
                    <span className="text-[11px] text-[#71717A] font-ui">
                      EXP
                    </span>
                  </div>
                  <div className="text-[10px] text-[#71717A] font-ui truncate">
                    {totalCategoryExp > 0 ? Math.round((activeSelectedDomain.domainExp / totalCategoryExp) * 100) : 0}% total matrix share
                  </div>
                </div>
              </div>

              {/* Functional Action Deck: Live Habit Checkoff & Next Directive */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
                {/* Left (7 Cols): Today's Habit Quick Checklist */}
                <div className="md:col-span-7 p-3.5 rounded-[8px] bg-white border border-[#E2E8F0] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-1.5">
                      <Zap size={13} className="text-[#10B981]" />
                      <span>Today's Domain Habits Checklist</span>
                    </span>
                    <span className="text-[10px] font-num text-[#71717A]">
                      Day {currentDayNum}
                    </span>
                  </div>

                  {activeSelectedDomain.domainHabitsList.length > 0 ? (
                    <div className="space-y-1.5">
                      {activeSelectedDomain.domainHabitsList.map((habit) => {
                        const isDone = !!habit.logs[currentDayNum];
                        return (
                          <div
                            key={habit.id}
                            onClick={() => {
                              sound.playPop();
                              toggleHabitLog(habit.id, currentDayNum);
                            }}
                            className={`flex items-center justify-between p-2 rounded-[6px] border transition-all cursor-pointer select-none ${
                              isDone
                                ? 'bg-[#F0FDF4] border-[#10B981]/30 text-[#18181B]'
                                : 'bg-[#FAFAFA] border-[#E2E8F0] hover:border-[#CBD5E1] text-[#3F3F46]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                                isDone
                                  ? 'bg-[#10B981] border-[#10B981] text-white'
                                  : 'border-[#CBD5E1] bg-white'
                              }`}>
                                {isDone && <Check size={11} strokeWidth={3} />}
                              </div>
                              <span className={`text-[11.5px] font-ui truncate ${isDone ? 'line-through text-[#71717A]' : 'font-medium'}`}>
                                {habit.title}
                              </span>
                            </div>

                            <span className="font-num text-[10.5px] font-semibold text-[#10B981] flex-shrink-0">
                              +{habit.expReward} EXP
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-[11px] text-[#71717A] bg-[#FAFAFA] rounded-[6px] border border-dashed border-[#E2E8F0]">
                      No active daily habits configured under {activeSelectedDomain.domain}.
                    </div>
                  )}
                </div>

                {/* Right (5 Cols): Next Action Directive & Direct Hub Portal */}
                <div className="md:col-span-5 p-3.5 rounded-[8px] bg-white border border-[#E2E8F0] flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11.5px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-1.5">
                        <Flame size={13} className="text-amber-500" />
                        <span>Next Directive</span>
                      </span>
                      <span className="text-[10px] font-num text-[#71717A]">
                        Priority Action
                      </span>
                    </div>

                    {activeSelectedDomain.nextDirective ? (
                      <div className="p-2.5 rounded-[6px] bg-[#FAFAFA] border border-[#E2E8F0] space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-[#18181B] font-ui uppercase">
                            {activeSelectedDomain.nextDirective.priority} PRIORITY
                          </span>
                          <span className="font-num font-bold text-[#10B981]">
                            +{activeSelectedDomain.nextDirective.expReward} EXP
                          </span>
                        </div>
                        <p className="text-[11.5px] font-semibold text-[#18181B] font-ui line-clamp-2">
                          {activeSelectedDomain.nextDirective.title}
                        </p>
                      </div>
                    ) : (
                      <div className="py-3 text-center text-[11px] text-[#71717A] bg-[#FAFAFA] rounded-[6px] border border-dashed border-[#E2E8F0]">
                        All current operational tasks in {activeSelectedDomain.domain} cleared.
                      </div>
                    )}
                  </div>

                  {/* Direct Hub Portal Button */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setCurrentTab(activeSelectedDomain.targetTab);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[6px] bg-[#18181B] hover:bg-[#27272A] text-white text-[11.5px] font-ui font-semibold transition-all shadow-xs cursor-pointer group"
                  >
                    <span>Open {activeSelectedDomain.targetTabLabel}</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform text-[#10B981]" />
                  </button>
                </div>
              </div>

            </motion.div>
          ) : (
            /* Neutral State Helper HUD */
            <div className="p-3.5 rounded-[8px] bg-[#FAFAFA] border border-dashed border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-[#71717A]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center flex-shrink-0">
                  <GlobeIcon size={14} />
                </div>
                <div className="text-[11.5px] font-ui">
                  <span className="font-semibold text-[#18181B]">Active Spherical Navigation:</span> Click any 3D node on the globe, domain tag, or selector pill to inspect live telemetry and check off daily actions.
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setSelectedGlobeDomain(domainLifeBalance[0].domain);
                  }}
                  className="px-2.5 py-1 rounded-[5px] bg-white border border-[#E2E8F0] text-[10.5px] font-ui font-semibold text-[#18181B] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
                >
                  Inspect Node 1 ({domainLifeBalance[0].domain}) →
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* ========================================================
          MAIN BENTO GRID (12 COLUMNS: 8 LEFT / 4 RIGHT)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================
            LEFT COLUMN (SPAN 8)
            ====================================================== */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* PRIMARY PANEL: TODAY FOCUS & HABIT MATRIX */}
          <div className="mplt-card p-5 bg-[#FFFFFF] border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[6px] bg-[#18181B] text-white flex items-center justify-center">
                  <CheckCircle2 size={15} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#18181B] font-ui">
                    Today Focus & Habit Matrix
                  </h3>
                  <p className="text-[11px] text-[#71717A] -mt-0.5">
                    Click checkboxes to record log, increment EXP, and preserve streak
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCurrentTab('habits')}
                className="flex items-center gap-1 text-[11px] font-medium text-[#18181B] hover:text-[#10B981] transition-colors"
              >
                <span>31-Day Grid</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Habit checklist with 18px square checkboxes & +25 EXP hover chip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {habits.map((habit) => {
                const isChecked = !!habit.logs[currentDayNum];
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabitLog(habit.id, currentDayNum)}
                    className={`group flex items-center justify-between p-3 rounded-[8px] border transition-all cursor-pointer select-none ${
                      isChecked
                        ? 'bg-[#F9FAFB] border-[#CBD5E1]'
                        : 'bg-white border-[#E2E8F0] hover:border-[#A1A1AA] hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Square checkbox 18px with 2px solid #18181B */}
                      <button
                        type="button"
                        className={`w-[18px] h-[18px] rounded-[3px] border-[2px] flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-[#18181B] border-[#18181B] text-white'
                            : 'bg-white border-[#18181B] group-hover:border-[#000000]'
                        }`}
                      >
                        {isChecked && <Check size={12} className="stroke-[3]" />}
                      </button>

                      <div className="flex flex-col">
                        <span className={`text-[13px] font-medium font-ui leading-tight ${
                          isChecked ? 'line-through text-[#71717A]' : 'text-[#18181B]'
                        }`}>
                          {habit.title}
                        </span>
                        <span className="text-[10px] text-[#71717A] uppercase tracking-wider mt-0.5">
                          {habit.category}
                        </span>
                      </div>
                    </div>

                    {/* +25 EXP badge */}
                    <div className={`px-2 py-0.5 rounded-[4px] text-[10px] font-num font-bold transition-all ${
                      isChecked 
                        ? 'bg-[#10B981]/15 text-[#10B981]' 
                        : 'bg-[#F1F5F9] text-[#71717A] group-hover:bg-[#10B981]/15 group-hover:text-[#10B981]'
                    }`}>
                      +{habit.expReward} EXP
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECONDARY PANEL: WEEKLY DISTRIBUTION & SPRINT WORKLOAD (REDESIGNED) */}
          <div className="mplt-card p-5 sm:p-6 bg-[#FFFFFF] border border-[#E2E8F0] space-y-5 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[7px] bg-[#18181B] text-white flex items-center justify-center shadow-xs">
                  <Clock size={16} className="text-[#10B981]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] sm:text-[15px] font-bold text-[#18181B] font-ui uppercase tracking-wider">
                      WEEKLY DISTRIBUTION & DAILY PROGRESS
                    </h3>
                    <span className="text-[10px] font-num font-semibold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-[4px]">
                      {weeklyCompletionRate}% COMPLETED
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#71717A] font-ui mt-0.5">
                    Sprint Week {today.weekTag} • {today.formattedWeekRange} • {totalWeeklyTasksCount} Active Operational Commitments
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                {/* View Mode Toggle: Day Inspector vs 7-Day Overview */}
                <div className="flex items-center p-0.5 rounded-[6px] bg-[#F4F4F5] border border-[#E2E8F0] text-[11px] font-ui font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setWeeklyViewMode('inspector');
                    }}
                    className={`px-2.5 py-1 rounded-[5px] transition-all cursor-pointer ${
                      weeklyViewMode === 'inspector'
                        ? 'bg-white text-[#18181B] font-semibold shadow-xs'
                        : 'text-[#71717A] hover:text-[#18181B]'
                    }`}
                  >
                    Day Inspector
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setWeeklyViewMode('grid');
                    }}
                    className={`px-2.5 py-1 rounded-[5px] transition-all cursor-pointer ${
                      weeklyViewMode === 'grid'
                        ? 'bg-white text-[#18181B] font-semibold shadow-xs'
                        : 'text-[#71717A] hover:text-[#18181B]'
                    }`}
                  >
                    7-Day Overview
                  </button>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    setCurrentTab('weekly');
                  }}
                  className="flex items-center gap-1 text-[11.5px] font-medium text-[#18181B] hover:text-[#10B981] px-2.5 py-1 rounded-[6px] border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all cursor-pointer"
                >
                  <span>Full Board</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* 7-DAY INTERACTIVE SPRINT RIBBON (RHYTHM BAR) */}
            <div className="grid grid-cols-7 gap-2 overflow-x-auto pb-1 no-scrollbar">
              {days.map((d) => {
                const isSelected = activeDay?.index === d.index;
                return (
                  <button
                    key={d.index}
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setActiveWeeklyDayIndex(d.index);
                    }}
                    className={`relative p-2.5 rounded-[8px] border text-left transition-all cursor-pointer select-none group flex flex-col justify-between min-w-[85px] ${
                      isSelected
                        ? 'bg-white border-[#18181B] ring-2 ring-[#18181B]/15 shadow-sm'
                        : d.isToday
                        ? 'bg-[#FAFAFA] border-[#18181B]/40 hover:border-[#18181B]'
                        : 'bg-[#F9FAFB] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-white'
                    }`}
                  >
                    {/* Day Label & Date */}
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider font-ui ${
                          isSelected ? 'text-[#18181B]' : d.isToday ? 'text-[#10B981]' : 'text-[#71717A]'
                        }`}>
                          {d.name.substring(0, 3)}
                        </span>
                        {d.isToday && (
                          <span className="text-[7.5px] font-bold font-num px-1 py-0.2 rounded bg-[#10B981] text-white">
                            TODAY
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] font-bold font-num text-[#18181B]">
                        {d.date}
                      </div>
                    </div>

                    {/* Progress Capsule & Task Count */}
                    <div className="mt-2.5 space-y-1">
                      <div className="w-full bg-[#E2E8F0] h-[3px] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            d.pct === 100 ? 'bg-[#10B981]' : d.pct > 0 ? 'bg-[#18181B]' : 'bg-transparent'
                          }`}
                          style={{ width: `${d.pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-num text-[#71717A]">
                        <span>{d.done}/{d.total}</span>
                        <span className={d.pct === 100 ? 'text-[#10B981] font-bold' : ''}>{d.pct}%</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* MAIN WORKLOAD BODY */}
            {weeklyViewMode === 'inspector' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
                {/* Left (7 Cols): Active Day Tactical Task Deck */}
                <div className="lg:col-span-7 rounded-[10px] bg-[#FAFAFA] border border-[#E2E8F0] p-4 sm:p-5 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Day Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-[14px] font-bold text-[#18181B] font-ui">
                            {activeDay.name}, {activeDay.date}
                          </h4>
                          {activeDay.isToday && (
                            <span className="text-[9px] font-bold font-num text-white bg-[#10B981] px-1.5 py-0.2 rounded-[3px]">
                              CURRENT FOCUS
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#71717A] font-ui mt-0.5">
                          {activeDayTasks.length} planned items • {activeDay.done} completed ({activeDay.pct}%)
                        </p>
                      </div>

                      {/* Quick Cycler */}
                      <div className="flex items-center gap-1 text-[11px] font-num">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playPop();
                            setActiveWeeklyDayIndex((activeDay.index + 6) % 7);
                          }}
                          className="p-1 rounded-[4px] border border-[#E2E8F0] bg-white text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
                          title="Previous Day"
                        >
                          <ChevronLeft size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playPop();
                            setActiveWeeklyDayIndex((activeDay.index + 1) % 7);
                          }}
                          className="p-1 rounded-[4px] border border-[#E2E8F0] bg-white text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
                          title="Next Day"
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Task Checklist for Active Day */}
                    <div className="mt-3.5 space-y-2 max-h-[310px] overflow-y-auto pr-1">
                      {activeDayTasks.length > 0 ? (
                        activeDayTasks.map((task) => {
                          const catItem = weeklyCategoryDistribution.find(c => c.category === task.category);
                          const dotClass = catItem?.dot || 'bg-[#18181B]';
                          const bgClass = catItem?.bg || 'bg-[#F4F4F5]';
                          const textClass = catItem?.text || 'text-[#18181B]';
                          const borderClass = catItem?.border || 'border-[#E2E8F0]';

                          return (
                            <div
                              key={task.id}
                              onClick={() => {
                                sound.playPop();
                                toggleWeeklyTask(task.id);
                              }}
                              className={`flex items-center justify-between p-2.5 rounded-[7px] border transition-all cursor-pointer select-none group ${
                                task.isCompleted
                                  ? 'bg-[#F0FDF4] border-[#10B981]/30 text-[#71717A]'
                                  : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] text-[#18181B] shadow-xs'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                                <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-colors ${
                                  task.isCompleted
                                    ? 'bg-[#10B981] border-[#10B981] text-white'
                                    : 'border-[#CBD5E1] bg-[#FAFAFA] group-hover:border-[#71717A]'
                                }`}>
                                  {task.isCompleted && <Check size={10} strokeWidth={3} />}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className={`text-[12px] font-ui leading-snug truncate ${
                                    task.isCompleted ? 'line-through text-[#A1A1AA]' : 'font-medium text-[#18181B]'
                                  }`}>
                                    {task.title}
                                  </p>
                                  
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {/* Domain Pill */}
                                    <span className={`inline-flex items-center gap-1 text-[9px] font-ui font-medium px-1.5 py-0.2 rounded border ${bgClass} ${textClass} ${borderClass}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                                      <span>{task.category}</span>
                                    </span>

                                    {/* Priority Badge */}
                                    <span className={`text-[9px] font-num font-semibold px-1.5 py-0.2 rounded ${
                                      task.priority === 'High' 
                                        ? 'bg-rose-50 text-[#E11D48]' 
                                        : task.priority === 'Med' 
                                        ? 'bg-amber-50 text-amber-700' 
                                        : 'bg-slate-50 text-slate-600'
                                    }`}>
                                      {task.priority}
                                    </span>

                                    {task.timeEstimate && (
                                      <span className="text-[9.5px] font-num text-[#71717A] flex items-center gap-0.5">
                                        <Clock size={10} />
                                        <span>{task.timeEstimate}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <span className="font-num text-[10.5px] font-semibold text-[#10B981] flex-shrink-0">
                                +{task.expReward} EXP
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center bg-white rounded-[8px] border border-dashed border-[#E2E8F0] space-y-1">
                          <p className="text-[12px] font-ui text-[#71717A]">
                            No operational commitments scheduled for {activeDay.name}.
                          </p>
                          <p className="text-[10px] text-[#A1A1AA] font-ui">
                            Use the quick dispatcher below to allocate tasks to this day.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inline Quick Add Task for Active Day */}
                  <form onSubmit={handleAddInlineWeeklyTask} className="pt-2.5 border-t border-[#E2E8F0] flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <input
                      type="text"
                      placeholder={`Add new task to ${activeDay.name}...`}
                      value={inlineWeeklyTaskTitle}
                      onChange={(e) => setInlineWeeklyTaskTitle(e.target.value)}
                      className="flex-1 min-w-[160px] bg-white border border-[#E2E8F0] rounded-[6px] px-3 py-1.5 text-[11.5px] font-ui text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#18181B] transition-colors"
                    />

                    <select
                      value={inlineWeeklyTaskCategory}
                      onChange={(e) => setInlineWeeklyTaskCategory(e.target.value as AreaOfLife)}
                      className="bg-white border border-[#E2E8F0] rounded-[6px] px-2 py-1.5 text-[10.5px] font-ui text-[#18181B] focus:outline-none focus:border-[#18181B] cursor-pointer"
                    >
                      <option value="Work">Work</option>
                      <option value="Health">Health</option>
                      <option value="Money">Money</option>
                      <option value="Personal Growth">Growth</option>
                      <option value="Spirituality">Spirit</option>
                      <option value="Family">Family</option>
                    </select>

                    <select
                      value={inlineWeeklyTaskPriority}
                      onChange={(e) => setInlineWeeklyTaskPriority(e.target.value as 'High' | 'Med' | 'Low')}
                      className="bg-white border border-[#E2E8F0] rounded-[6px] px-2 py-1.5 text-[10.5px] font-ui text-[#18181B] focus:outline-none focus:border-[#18181B] cursor-pointer"
                    >
                      <option value="High">High</option>
                      <option value="Med">Med</option>
                      <option value="Low">Low</option>
                    </select>

                    <button
                      type="submit"
                      disabled={!inlineWeeklyTaskTitle.trim()}
                      className="px-3 py-1.5 rounded-[6px] bg-[#18181B] hover:bg-[#27272A] disabled:opacity-40 text-white text-[11px] font-ui font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={12} />
                      <span>Add</span>
                    </button>
                  </form>
                </div>

                {/* Right (5 Cols): Workload Analytics & Distribution */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Weekly Density Sparkline / Bar Matrix */}
                  <div className="p-4 rounded-[10px] bg-[#FAFAFA] border border-[#E2E8F0] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-1.5">
                        <Activity size={13} className="text-[#10B981]" />
                        <span>7-Day Load Balancing</span>
                      </span>
                      <span className="text-[10px] font-num text-[#71717A]">
                        Peak: {Math.max(...days.map(d => d.total))} tasks
                      </span>
                    </div>

                    {/* Bar Chart Visualization */}
                    <div className="grid grid-cols-7 gap-2 items-end h-[75px] pt-2 px-1">
                      {days.map((d) => {
                        const maxCount = Math.max(1, ...days.map(x => x.total));
                        const heightPct = Math.max(16, Math.round((d.total / maxCount) * 100));
                        const isSelected = activeDay?.index === d.index;
                        const donePct = d.total > 0 ? (d.done / d.total) * 100 : 0;

                        return (
                          <div
                            key={d.index}
                            onClick={() => {
                              sound.playPop();
                              setActiveWeeklyDayIndex(d.index);
                            }}
                            className="flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
                          >
                            <div className="w-full flex items-end justify-center h-full">
                              <div
                                className={`w-full max-w-[24px] rounded-t-[4px] relative overflow-hidden transition-all duration-300 ${
                                  isSelected 
                                    ? 'ring-2 ring-[#18181B] ring-offset-1' 
                                    : 'group-hover:opacity-85'
                                }`}
                                style={{ height: `${heightPct}%`, backgroundColor: '#E2E8F0' }}
                              >
                                {/* Completed portion filled with green */}
                                <div
                                  className="w-full bg-[#10B981] absolute bottom-0 left-0 transition-all duration-300"
                                  style={{ height: `${donePct}%` }}
                                />
                              </div>
                            </div>

                            <span className={`text-[9px] font-num font-bold uppercase ${
                              isSelected ? 'text-[#18181B]' : 'text-[#71717A]'
                            }`}>
                              {d.name.substring(0, 3)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[9.5px] font-ui text-[#71717A] pt-1 border-t border-[#E2E8F0]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-[2px] bg-[#10B981]" />
                        <span>Done</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-[2px] bg-[#E2E8F0]" />
                        <span>Pending</span>
                      </span>
                      <span className="font-num font-semibold text-[#18181B]">
                        {pendingWeeklyTasksCount} remaining
                      </span>
                    </div>
                  </div>

                  {/* Domain Distribution Breakdown */}
                  <div className="p-4 rounded-[10px] bg-[#FAFAFA] border border-[#E2E8F0] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={13} className="text-amber-500" />
                        <span>Category Commitments</span>
                      </span>
                      <span className="text-[10px] font-num text-[#71717A]">
                        {weeklyCategoryDistribution.length} Active Domains
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {weeklyCategoryDistribution.map((item) => (
                        <div key={item.category} className="p-2 rounded-[6px] bg-white border border-[#E2E8F0] space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                              <span className="font-ui font-semibold text-[#18181B]">{item.category}</span>
                            </div>
                            <span className="font-num text-[10px] text-[#71717A]">
                              {item.done}/{item.count} Done ({item.pct}%)
                            </span>
                          </div>

                          <div className="w-full bg-[#E2E8F0] h-[3px] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{ 
                                width: `${item.pct}%`,
                                backgroundColor: item.color
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Mode 2: 7-Day Panoramic Overview (Un-cramped, modern cards) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5 pt-1">
                {days.map((d) => {
                  const dayTasks = weeklyTasks.filter(t => t.dayIndex === d.index || t.dateStr === d.dateStr);
                  const isSelected = activeDay?.index === d.index;
                  return (
                    <div
                      key={d.index}
                      className={`p-3 rounded-[8px] border transition-all flex flex-col justify-between bg-white ${
                        isSelected
                          ? 'border-[#18181B] ring-2 ring-[#18181B]/15 shadow-sm'
                          : d.isToday
                          ? 'border-[#18181B]/50'
                          : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F1F5F9]">
                          <div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider block leading-none font-ui ${
                              d.isToday ? 'text-[#10B981]' : 'text-[#18181B]'
                            }`}>
                              {d.name.substring(0, 3)}
                            </span>
                            <span className="text-[10px] font-num text-[#71717A] block mt-0.5">
                              {d.date}
                            </span>
                          </div>
                          <span className={`text-[9.5px] font-num font-bold px-1.5 py-0.2 rounded ${
                            d.pct === 100 ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F4F4F5] text-[#18181B]'
                          }`}>
                            {d.pct}%
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-[#E2E8F0] h-[3px] rounded-full overflow-hidden mb-2.5">
                          <div
                            className={`h-full transition-all duration-300 ${
                              d.pct === 100 ? 'bg-[#10B981]' : 'bg-[#18181B]'
                            }`}
                            style={{ width: `${d.pct}%` }}
                          />
                        </div>

                        {/* Task Items */}
                        <div className="space-y-1.5">
                          {dayTasks.slice(0, 4).map((t) => (
                            <div
                              key={t.id}
                              onClick={() => {
                                sound.playPop();
                                toggleWeeklyTask(t.id);
                              }}
                              className="flex items-center gap-1.5 text-[10.5px] p-1 rounded hover:bg-[#F4F4F5] cursor-pointer group"
                            >
                              <div className={`w-3 h-3 rounded-[2px] border flex items-center justify-center flex-shrink-0 ${
                                t.isCompleted ? 'bg-[#10B981] border-[#10B981] text-white' : 'border-[#A1A1AA] bg-white'
                              }`}>
                                {t.isCompleted && <Check size={8} strokeWidth={3} />}
                              </div>
                              <span className={`truncate leading-none ${
                                t.isCompleted ? 'line-through text-[#A1A1AA]' : 'text-[#18181B]'
                              }`}>
                                {t.title}
                              </span>
                            </div>
                          ))}
                          {dayTasks.length > 4 && (
                            <button
                              type="button"
                              onClick={() => {
                                sound.playPop();
                                setActiveWeeklyDayIndex(d.index);
                                setWeeklyViewMode('inspector');
                              }}
                              className="text-[9.5px] font-num text-[#10B981] hover:underline block text-center w-full pt-1 cursor-pointer"
                            >
                              +{dayTasks.length - 4} more in inspector
                            </button>
                          )}
                          {dayTasks.length === 0 && (
                            <div className="text-[10px] text-[#A1A1AA] font-ui text-center py-3">
                              No tasks
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          setActiveWeeklyDayIndex(d.index);
                          setWeeklyViewMode('inspector');
                        }}
                        className="mt-3 pt-2 border-t border-[#F1F5F9] w-full text-center text-[9.5px] font-ui font-semibold text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
                      >
                        Inspect Day →
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACTIVE YEARLY GOALS RADAR SPOTLIGHT */}
          <div className="mplt-card p-5 bg-[#FFFFFF] border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[6px] bg-[#18181B] text-white flex items-center justify-center">
                  <Target size={15} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#18181B] font-ui">
                    Yearly Strategic Goals Progress
                  </h3>
                  <p className="text-[11px] text-[#71717A] -mt-0.5">
                    Long-range milestone radar and vision tracking
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCurrentTab('goals')}
                className="flex items-center gap-1 text-[11px] font-medium text-[#18181B] hover:text-[#10B981] transition-colors"
              >
                <span>View All Goals</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {goals.slice(0, 3).map((goal) => {
                return (
                  <div key={goal.id} className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-1.5">
                        <span className="font-bold uppercase px-1.5 py-0.2 rounded bg-[#18181B] text-white">
                          {goal.areaOfLife}
                        </span>
                        <span className="font-num text-[#71717A]">{goal.deadline}</span>
                      </div>
                      <h4 className="text-[12.5px] font-bold font-ui text-[#18181B] leading-snug line-clamp-2">
                        {goal.title}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#E2E8F0]">
                      <div className="flex justify-between text-[10.5px] font-num mb-1">
                        <span className="text-[#71717A]">Progress</span>
                        <span className="font-bold text-[#18181B]">{goal.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-[#E2E8F0] h-[5px] rounded-full overflow-hidden">
                        <div
                          className="bg-[#10B981] h-full rounded-full transition-all"
                          style={{ width: `${goal.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ======================================================
            RIGHT COLUMN (SPAN 4)
            ====================================================== */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* PANEL A: GAMIFICATION LEVEL & EXP TELEMETRY */}
          <div className="mplt-card p-5 bg-[#FFFFFF] border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#10B981]" />
                <h3 className="text-[13px] font-bold text-[#18181B] font-ui">
                  Player Operations Telemetry
                </h3>
              </div>
              <span className="text-[10.5px] font-num font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
                LVL {profile.level} • {getUserRankTitle(profile.level)}
              </span>
            </div>

            <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] space-y-2 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-[#71717A] font-ui">EXP to Level {profile.level + 1}</span>
                <span className="font-num font-bold text-[#18181B]">{expToNextLevel.toLocaleString()} EXP</span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-[6px] rounded-full overflow-hidden">
                <div
                  className="bg-[#18181B] h-full rounded-full transition-all"
                  style={{ width: `${Math.round((profile.currentExp / profile.nextLevelExp) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#71717A] font-num pt-1">
                <span>Total Points: {profile.totalPoints} PTS</span>
                <span className="flex items-center gap-1 text-orange-600 font-bold">
                  <Flame size={11} className="fill-orange-500" />
                  {profile.streakDays} Day Streak
                </span>
              </div>
            </div>
          </div>

          {/* PANEL B: CATEGORY EXP DISTRIBUTION (1PX WIREFRAME DONUT) */}
          <div className="mplt-card p-5 bg-[#FFFFFF] border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-[5px] bg-[#18181B] text-white flex items-center justify-center">
                  <PieIcon size={13} />
                </div>
                <h3 className="text-[13px] font-bold text-[#18181B] font-ui">
                  Category EXP Breakdown
                </h3>
              </div>
              <span className="text-[10px] font-num font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-[4px]">
                {totalCategoryExp} Total EXP
              </span>
            </div>

            {/* Custom Monochromatic Wireframe Donut Chart */}
            <div className="flex items-center justify-center my-3 relative">
              <svg width="150" height="150" viewBox="0 0 150 150" className="transform -rotate-90">
                {totalCategoryExp === 0 ? (
                  <circle
                    cx="75"
                    cy="75"
                    r={55}
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="16"
                  />
                ) : (
                  (() => {
                    let accumulatedPercent = 0;
                    const radius = 55;
                    const circumference = 2 * Math.PI * radius;
                    
                    return categoryExpData.map((cat, i) => {
                      const slicePercent = (cat.value / totalCategoryExp);
                      const strokeDasharray = `${slicePercent * circumference} ${circumference}`;
                      const strokeDashoffset = -accumulatedPercent * circumference;
                      accumulatedPercent += slicePercent;

                      return (
                        <circle
                          key={i}
                          cx="75"
                          cy="75"
                          r={radius}
                          fill="transparent"
                          stroke={cat.color}
                          strokeWidth="16"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-300 hover:opacity-80"
                        />
                      );
                    });
                  })()
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                <span className="text-[9.5px] uppercase font-ui tracking-wider text-[#71717A]">
                  {topDomainExp && topDomainExp.value > 0 ? 'Top Vector' : 'Status'}
                </span>
                <span className="text-[13.5px] font-bold font-num text-[#18181B] truncate max-w-[90px]">
                  {topDomainExp && topDomainExp.value > 0 
                    ? `${topDomainExp.name} ${Math.round((topDomainExp.value / totalCategoryExp) * 100)}%` 
                    : 'Novice'}
                </span>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="space-y-1.5 mt-4 text-[11px]">
              {categoryExpData.map((item) => {
                const percent = totalCategoryExp > 0 ? Math.round((item.value / totalCategoryExp) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between py-1 border-b border-[#F1F5F9] last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: item.color }} />
                      <span className="text-[#18181B] font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-num">
                      <span className="text-[#71717A]">{item.value} EXP</span>
                      <span className="font-semibold text-[#18181B] w-8 text-right">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PANEL C: CASH FLOW QUICK-VIEW (50/30/20 RATIO & SAFE BURN) */}
          <div className="mplt-card p-5 bg-[#FFFFFF] border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#10B981]" />
                <h3 className="text-[13px] font-bold text-[#18181B] font-ui">
                  Cash Flow Quick-View
                </h3>
              </div>
              <button
                onClick={() => setCurrentTab('finance')}
                className="text-[11px] text-[#18181B] hover:text-[#10B981] font-medium flex items-center"
              >
                <span>Full Ledger</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            {/* 50/30/20 Ratio Bars */}
            <div className="space-y-3">
              
              {/* Needs Bucket */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-[#18181B]">Needs ({budget.needsRatio}%)</span>
                  <span className="font-num text-[#71717A]">
                    {formatIDR(needsSpent)} / {formatIDR(needsLimit)}
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-[7px] rounded-full overflow-hidden">
                  <div 
                    className="bg-[#18181B] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (needsSpent / (needsLimit || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Wants Bucket */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-[#18181B]">Wants ({budget.wantsRatio}%)</span>
                  <span className="font-num text-[#71717A]">
                    {formatIDR(wantsSpent)} / {formatIDR(wantsLimit)}
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-[7px] rounded-full overflow-hidden">
                  <div 
                    className="bg-[#71717A] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (wantsSpent / (wantsLimit || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Savings Bucket */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-[#18181B]">Savings ({budget.savingsRatio}%)</span>
                  <span className="font-num text-[#10B981] font-semibold">
                    {formatIDR(savingsActual)} / {formatIDR(savingsGoal)}
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-[7px] rounded-full overflow-hidden">
                  <div 
                    className="bg-[#10B981] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (savingsActual / (savingsGoal || 1)) * 100)}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Safe Daily Burn Chip */}
            <div className="mt-4 p-2.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[6px] flex items-center justify-between text-[11px]">
              <span className="text-[#71717A] font-ui flex items-center gap-1">
                <DollarSign size={12} className="text-[#10B981]" />
                <span>Safe Daily Burn Pace:</span>
              </span>
              <span className="font-num font-bold text-[#10B981]">
                {formatIDR(safeDailyBurn)}/day
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================
          QUICK KINETIC CAPTURE MODAL (OPTION B HUD)
          ======================================================== */}
      {showQuickCapture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E2E8F0] rounded-[14px] max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[6px] bg-[#18181B] text-white flex items-center justify-center">
                  <Zap size={15} className="text-amber-400 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#18181B] font-ui">
                    Quick Kinetic Capture
                  </h3>
                  <p className="text-[11px] text-[#71717A] font-ui">
                    Rapid one-click logging across capital, habits & sprint tasks
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowQuickCapture(false)}
                className="p-1 rounded-[6px] text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
              <button
                type="button"
                onClick={() => {
                  setQuickCaptureTab('expense');
                  sound.playClick();
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] text-[11.5px] font-bold font-ui transition-all cursor-pointer ${
                  quickCaptureTab === 'expense'
                    ? 'bg-[#18181B] text-white shadow-xs'
                    : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                <DollarSign size={13} />
                <span>Expense</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuickCaptureTab('habit');
                  sound.playClick();
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] text-[11.5px] font-bold font-ui transition-all cursor-pointer ${
                  quickCaptureTab === 'habit'
                    ? 'bg-[#18181B] text-white shadow-xs'
                    : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                <CalendarCheck2 size={13} />
                <span>Habits</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuickCaptureTab('task');
                  sound.playClick();
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] text-[11.5px] font-bold font-ui transition-all cursor-pointer ${
                  quickCaptureTab === 'task'
                    ? 'bg-[#18181B] text-white shadow-xs'
                    : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                <CheckSquare size={13} />
                <span>Sprint Task</span>
              </button>
            </div>

            {/* TAB 1: QUICK EXPENSE */}
            {quickCaptureTab === 'expense' && (
              <form onSubmit={handleQuickExpense} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                    Outflow Amount (IDR)
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. 75.000 or 150000"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    className="w-full px-3 py-2 text-[14px] font-num font-bold border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                    Description / Item
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Server hosting, Groceries, Coffee"
                    value={quickDesc}
                    onChange={(e) => setQuickDesc(e.target.value)}
                    className="w-full px-3 py-2 text-[12.5px] font-ui border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                      Category Domain
                    </label>
                    <select
                      value={quickCategory}
                      onChange={(e) => setQuickCategory(e.target.value as AreaOfLife)}
                      className="w-full px-3 py-2 text-[12.5px] font-ui border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B] bg-white"
                    >
                      <option value="Work">Work</option>
                      <option value="Health">Health</option>
                      <option value="Money">Money</option>
                      <option value="Personal Growth">Personal Growth</option>
                      <option value="Family">Family</option>
                      <option value="Spirituality">Spirituality</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                      50/30/20 Bucket
                    </label>
                    <select
                      value={quickBucket}
                      onChange={(e) => setQuickBucket(e.target.value as 'Needs' | 'Wants' | 'Savings')}
                      className="w-full px-3 py-2 text-[12.5px] font-ui border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B] bg-white"
                    >
                      <option value="Needs">Needs (50%)</option>
                      <option value="Wants">Wants (30%)</option>
                      <option value="Savings">Savings / Invest (20%)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowQuickCapture(false)}
                    className="px-4 py-2 text-[12px] font-medium text-[#71717A] hover:bg-[#F4F4F5] rounded-[6px] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-[12px] font-bold bg-[#18181B] hover:bg-[#27272A] text-white rounded-[6px] flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Record Outflow (+15 EXP)</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: QUICK HABITS */}
            {quickCaptureTab === 'habit' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-[#71717A] pb-1 border-b border-[#F1F5F9]">
                  <span>Today's Active Routines ({today.dayOfMonth} {today.monthShort})</span>
                  <span className="font-num text-[#10B981] font-bold">{habitsDoneCount}/{habits.length} Completed</span>
                </div>

                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {habits.map((h) => {
                    const isDone = !!h.logs[currentDayNum];
                    return (
                      <div
                        key={h.id}
                        onClick={() => {
                          toggleHabitLog(h.id, currentDayNum);
                          sound.playPop();
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-[8px] border transition-all cursor-pointer select-none ${
                          isDone 
                            ? 'bg-[#18181B] text-white border-[#18181B]' 
                            : 'bg-[#F9FAFB] hover:bg-[#F4F4F5] text-[#18181B] border-[#E2E8F0]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center ${
                            isDone ? 'bg-white text-[#18181B] border-white' : 'bg-white border-[#CBD5E1]'
                          }`}>
                            {isDone && <Check size={12} className="stroke-[3]" />}
                          </div>
                          <div>
                            <div className="text-[12.5px] font-bold font-ui">{h.title}</div>
                            <div className={`text-[10px] ${isDone ? 'text-zinc-400' : 'text-[#71717A]'}`}>
                              {h.category} • {Object.values(h.logs).filter(Boolean).length}d logged
                            </div>
                          </div>
                        </div>

                        <span className={`text-[11px] font-num font-bold px-2 py-0.5 rounded ${
                          isDone ? 'bg-white/20 text-white' : 'bg-emerald-50 text-[#10B981]'
                        }`}>
                          +{h.expReward} EXP
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowQuickCapture(false)}
                    className="px-4 py-2 text-[12px] font-bold bg-[#18181B] text-white rounded-[6px] hover:bg-[#27272A] cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: QUICK SPRINT TASK */}
            {quickCaptureTab === 'task' && (
              <form onSubmit={handleQuickTask} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                    Task Title / Objective
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Ship v2 deployment, 10km run, Read 30 pages"
                    value={quickTaskTitle}
                    onChange={(e) => setQuickTaskTitle(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] font-ui border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                      Sprint Day
                    </label>
                    <select
                      value={quickTaskDay}
                      onChange={(e) => setQuickTaskDay(parseInt(e.target.value))}
                      className="w-full px-3 py-2 text-[12.5px] font-ui border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B] bg-white"
                    >
                      {today.sprintDays.map((d) => (
                        <option key={d.index} value={d.index}>
                          {d.name} {d.isToday ? '(Today)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                      Priority Level
                    </label>
                    <select
                      value={quickTaskPriority}
                      onChange={(e) => setQuickTaskPriority(e.target.value as 'High' | 'Med' | 'Low')}
                      className="w-full px-3 py-2 text-[12.5px] font-ui border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B] bg-white"
                    >
                      <option value="High">High Priority (+35 EXP)</option>
                      <option value="Med">Medium Priority (+25 EXP)</option>
                      <option value="Low">Low Priority (+15 EXP)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                    Category Domain
                  </label>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value as AreaOfLife)}
                    className="w-full px-3 py-2 text-[12.5px] font-ui border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B] bg-white"
                  >
                    <option value="Work">Work</option>
                    <option value="Health">Health</option>
                    <option value="Money">Money</option>
                    <option value="Personal Growth">Personal Growth</option>
                    <option value="Family">Family</option>
                    <option value="Spirituality">Spirituality</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowQuickCapture(false)}
                    className="px-4 py-2 text-[12px] font-medium text-[#71717A] hover:bg-[#F4F4F5] rounded-[6px] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-[12px] font-bold bg-[#18181B] hover:bg-[#27272A] text-white rounded-[6px] flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Schedule Task</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default MasterDashboard;
