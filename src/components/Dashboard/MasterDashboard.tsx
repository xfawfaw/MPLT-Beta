import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
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
  Award,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { AreaOfLife } from '../../types';
import { dateUtils } from '../../utils/date';

export const MasterDashboard: React.FC = () => {
  const { 
    profile,
    habits, 
    toggleHabitLog, 
    weeklyTasks, 
    toggleWeeklyTask, 
    tasks,
    toggleTaskStatus,
    goals,
    budget, 
    transactions,
    setCurrentTab
  } = useApp();

  const [today, setToday] = useState(() => dateUtils.getTodayInfo());

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
    : 87;

  // 4. Financial Calculations for 50/30/20
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) || budget.incomeGoal;
  const needsSpent = transactions.filter(t => t.type === 'expense' && t.bucket === 'Needs').reduce((acc, t) => acc + t.amount, 0);
  const wantsSpent = transactions.filter(t => t.type === 'expense' && t.bucket === 'Wants').reduce((acc, t) => acc + t.amount, 0);
  const savingsActual = transactions.filter(t => t.type === 'expense' && t.bucket === 'Savings').reduce((acc, t) => acc + t.amount, 0);

  const totalSpent = needsSpent + wantsSpent;
  const spentPercent = totalIncome > 0 ? Math.round((totalSpent / totalIncome) * 100) : 32;
  const isUnderBudget = spentPercent <= (budget.needsRatio + budget.wantsRatio);
  const remainingDaysInMonth = today.remainingDaysInMonth;
  const safeDailyBurn = remainingDaysInMonth > 0 
    ? Math.max(0, Math.round(((totalIncome * (budget.wantsRatio / 100)) - wantsSpent) / remainingDaysInMonth))
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

  // 6. 6-Domain Life Balance & Harmony Scores (Multi-source integration)
  const domainLifeBalance = useMemo(() => {
    const domains: AreaOfLife[] = ['Health', 'Work', 'Money', 'Family', 'Personal Growth', 'Spirituality'];
    return domains.map(domain => {
      // Habit score in domain (for current day)
      const domainHabits = habits.filter(h => h.category === domain);
      const habitsCompleted = domainHabits.filter(h => !!h.logs[currentDayNum]).length;
      const habitScore = domainHabits.length > 0 ? (habitsCompleted / domainHabits.length) * 100 : 75;

      // Weekly tasks score in domain
      const domainWeeklyTasks = weeklyTasks.filter(t => t.category === domain);
      const weeklyTasksCompleted = domainWeeklyTasks.filter(t => t.isCompleted).length;
      const weeklyScore = domainWeeklyTasks.length > 0 ? (weeklyTasksCompleted / domainWeeklyTasks.length) * 100 : 80;

      // General tasks score in domain
      const domainTasks = tasks.filter(t => t.category === domain);
      const tasksCompleted = domainTasks.filter(t => t.status === 'Completed').length;
      const taskScore = domainTasks.length > 0 ? (tasksCompleted / domainTasks.length) * 100 : 70;

      // Goals score in domain
      const domainGoals = goals.filter(g => g.areaOfLife === domain);
      const goalsAvgProgress = domainGoals.length > 0 
        ? Math.round(domainGoals.reduce((acc, g) => acc + g.progressPercent, 0) / domainGoals.length)
        : 60;

      const overallHealth = Math.round(
        (habitScore * 0.35) + 
        (weeklyScore * 0.35) + 
        (taskScore * 0.15) + 
        (goalsAvgProgress * 0.15)
      );

      const statusText = overallHealth >= 80 ? 'Optimal' : overallHealth >= 60 ? 'Stable' : 'Needs Focus';
      const statusColor = overallHealth >= 80 ? 'text-[#10B981] bg-[#10B981]/10' : overallHealth >= 60 ? 'text-amber-700 bg-amber-50' : 'text-[#E11D48] bg-rose-50';

      return {
        domain,
        score: overallHealth,
        statusText,
        statusColor,
      };
    });
  }, [habits, weeklyTasks, tasks, goals, currentDayNum]);

  // Dynamic Category EXP Distribution based on live completed work
  const categoryExpData = useMemo(() => {
    const domainColors: Record<AreaOfLife, string> = {
      'Work': '#18181B',
      'Health': '#10B981',
      'Personal Growth': '#71717A',
      'Money': '#94A3B8',
      'Spirituality': '#CBD5E1',
      'Family': '#E2E8F0',
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

      const totalVal = Math.max(30, habitsExp + weeklyExp + tasksExp + goalsExp);

      return {
        name: domain,
        value: totalVal,
        color: domainColors[domain],
      };
    });
  }, [habits, weeklyTasks, tasks, goals]);

  const totalCategoryExp = categoryExpData.reduce((acc, c) => acc + c.value, 0);

  // Dynamic Weekly 7-day groups from sprint days & weekly tasks
  const days = useMemo(() => {
    return today.sprintDays.map(d => {
      const dayTasks = weeklyTasks.filter(t => t.dayIndex === d.index || t.dateStr === d.dateStr);
      const done = dayTasks.filter(t => t.isCompleted).length;
      const pct = dayTasks.length > 0 ? Math.round((done / dayTasks.length) * 100) : 0;
      const isBonus = d.index === 0 && pct === 100;
      return {
        index: d.index,
        name: d.name,
        date: d.dateStr.split('.').slice(0, 2).join('.'),
        expected: isBonus ? '120%' : `${pct}%`,
        pct,
        done,
        total: dayTasks.length,
        isToday: d.isToday,
      };
    });
  }, [today, weeklyTasks]);

  const formatIDR = (val: number) => {
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const expToNextLevel = profile.nextLevelExp - profile.currentExp;

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
          MIDDLE SECTION: 6-DOMAIN LIFE BALANCE & HARMONY MATRIX
          ======================================================== */}
      <section className="mplt-card p-5 bg-[#FFFFFF] border border-[#E2E8F0]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[5px] bg-[#18181B] text-white flex items-center justify-center">
              <Award size={13} />
            </div>
            <h3 className="text-[13px] font-bold text-[#18181B] font-ui uppercase tracking-wider">
              6-Domain Life Balance & Harmony Matrix
            </h3>
          </div>
          <span className="text-[10.5px] text-[#71717A] font-ui">
            Real-time holistic discipline telemetry
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {domainLifeBalance.map((item) => {
            return (
              <div key={item.domain} className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-ui font-bold text-[#18181B] truncate">{item.domain}</span>
                  <span className={`text-[9.5px] font-num font-bold px-1.5 py-0.2 rounded ${item.statusColor}`}>
                    {item.score}%
                  </span>
                </div>

                <div className="w-full bg-[#E2E8F0] h-[5px] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.score >= 80 ? 'bg-[#10B981]' : item.score >= 60 ? 'bg-[#18181B]' : 'bg-[#E11D48]'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#71717A] font-ui">
                  <span>Pace:</span>
                  <span className="font-semibold text-[#18181B]">{item.statusText}</span>
                </div>
              </div>
            );
          })}
        </div>
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

          {/* SECONDARY PANEL: WEEKLY DISTRIBUTION (7 DAY CARDS) */}
          <div className="mplt-card p-5 bg-[#FFFFFF] border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[6px] bg-[#18181B] text-white flex items-center justify-center">
                  <Clock size={15} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#18181B] font-ui">
                    Weekly Distribution & Daily Progress
                  </h3>
                  <p className="text-[11px] text-[#71717A] -mt-0.5">
                    Week of {today.formattedWeekRange}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCurrentTab('weekly')}
                className="flex items-center gap-1 text-[11px] font-medium text-[#18181B] hover:text-[#10B981] transition-colors"
              >
                <span>Full Board</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Horizontal Row of 7 Day Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {days.map((d) => {
                const dayTasks = weeklyTasks.filter(t => t.dayIndex === d.index);
                const dayCompleted = dayTasks.filter(t => t.isCompleted).length;
                const percent = dayTasks.length > 0
                  ? Math.round((dayCompleted / dayTasks.length) * 100)
                  : 0;
                
                const radius = 22;
                const circ = 2 * Math.PI * radius;
                const offset = circ - (Math.min(100, percent) / 100) * circ;

                return (
                  <div
                    key={d.index}
                    className={`border rounded-[8px] p-2.5 bg-[#FFFFFF] flex flex-col items-center text-center transition-all ${
                      d.isToday ? 'border-[#18181B] ring-1 ring-[#18181B] shadow-xs' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                    }`}
                  >
                    {/* Header */}
                    <div className={`w-full py-1 px-1.5 rounded-[4px] mb-2.5 ${
                      d.isToday ? 'bg-[#18181B] text-white' : 'bg-[#F9FAFB] text-[#18181B] border border-[#E2E8F0]'
                    }`}>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider block leading-none">
                          {d.name.substring(0, 3)}
                        </span>
                        {d.isToday && (
                          <span className="text-[8px] font-bold px-1 rounded bg-[#10B981] text-white">TODAY</span>
                        )}
                      </div>
                      <span className={`text-[9px] font-num block leading-tight ${
                        d.isToday ? 'text-[#94A3B8]' : 'text-[#71717A]'
                      }`}>
                        {d.date}
                      </span>
                    </div>

                    {/* Central Circular Progress Ring */}
                    <div className="relative w-[56px] h-[56px] flex items-center justify-center my-1">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                        <circle
                          cx="28"
                          cy="28"
                          r={radius}
                          stroke="#E2E8F0"
                          strokeWidth="3.5"
                          fill="none"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r={radius}
                          stroke="#18181B"
                          strokeWidth="3.5"
                          strokeDasharray={circ}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          fill="none"
                          className="transition-all duration-300"
                        />
                      </svg>
                      <span className="absolute text-[11px] font-num font-bold text-[#18181B]">
                        {d.expected}
                      </span>
                    </div>

                    {/* 3 Compact Task Items */}
                    <div className="w-full mt-2 space-y-1 text-left">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          onClick={() => toggleWeeklyTask(task.id)}
                          className="flex items-center gap-1.5 text-[10px] p-1 rounded hover:bg-[#F4F4F5] cursor-pointer group"
                        >
                          <div className={`w-3 h-3 rounded-[2px] border flex items-center justify-center ${
                            task.isCompleted ? 'bg-[#18181B] border-[#18181B] text-white' : 'border-[#A1A1AA]'
                          }`}>
                            {task.isCompleted && <Check size={8} className="stroke-[3]" />}
                          </div>
                          <span className={`truncate leading-none ${
                            task.isCompleted ? 'line-through text-[#A1A1AA]' : 'text-[#18181B]'
                          }`}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-[9px] font-num text-[#71717A] block text-center mt-1">
                          +{dayTasks.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
                LVL {profile.level}
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
                {(() => {
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
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] uppercase font-ui tracking-wider text-[#71717A]">Domain Focus</span>
                <span className="text-[15px] font-bold font-num text-[#18181B]">Work 30%</span>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="space-y-1.5 mt-4 text-[11px]">
              {categoryExpData.map((item) => {
                const percent = Math.round((item.value / totalCategoryExp) * 100);
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
                    {formatIDR(needsSpent)} / {formatIDR(totalIncome * (budget.needsRatio / 100))}
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-[7px] rounded-full overflow-hidden">
                  <div 
                    className="bg-[#18181B] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (needsSpent / (totalIncome * (budget.needsRatio / 100))) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Wants Bucket */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-[#18181B]">Wants ({budget.wantsRatio}%)</span>
                  <span className="font-num text-[#71717A]">
                    {formatIDR(wantsSpent)} / {formatIDR(totalIncome * (budget.wantsRatio / 100))}
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-[7px] rounded-full overflow-hidden">
                  <div 
                    className="bg-[#71717A] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (wantsSpent / (totalIncome * (budget.wantsRatio / 100))) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Savings Bucket */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-[#18181B]">Savings ({budget.savingsRatio}%)</span>
                  <span className="font-num text-[#10B981] font-semibold">
                    {formatIDR(savingsActual)} / {formatIDR(totalIncome * (budget.savingsRatio / 100))}
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-[7px] rounded-full overflow-hidden">
                  <div 
                    className="bg-[#10B981] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (savingsActual / (totalIncome * (budget.savingsRatio / 100))) * 100)}%` }}
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

    </div>
  );
};
