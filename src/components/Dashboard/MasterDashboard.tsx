import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Check, 
  CheckCircle2, 
  ArrowUpRight, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  PieChart as PieIcon
} from 'lucide-react';
import { AreaOfLife } from '../../types';

export const MasterDashboard: React.FC = () => {
  const { 
    habits, 
    toggleHabitLog, 
    weeklyTasks, 
    toggleWeeklyTask, 
    budget, 
    transactions,
    setCurrentTab
  } = useApp();

  // 1. Calculate Today Habit Completion (e.g. for day 26 or current active habits)
  const currentDayNum = 26; // Simulated 26th Feb / current day in period
  const habitsDoneCount = habits.filter(h => !!h.logs[currentDayNum]).length;
  const habitCompletionRate = habits.length > 0 
    ? ((habitsDoneCount / habits.length) * 100).toFixed(1) 
    : '0.0';

  // 2. Pending Tasks calculation
  const pendingTasksCount = weeklyTasks.filter(t => !t.isCompleted).length;

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

  // Category EXP Distribution
  const categoryExpData: { name: AreaOfLife; value: number; color: string }[] = [
    { name: 'Work', value: 450, color: '#18181B' },
    { name: 'Health', value: 320, color: '#10B981' },
    { name: 'Personal Growth', value: 280, color: '#71717A' },
    { name: 'Money', value: 190, color: '#94A3B8' },
    { name: 'Spirituality', value: 140, color: '#CBD5E1' },
    { name: 'Family', value: 110, color: '#E2E8F0' },
  ];
  const totalCategoryExp = categoryExpData.reduce((acc, c) => acc + c.value, 0);

  // Weekly 7-day groups
  const days = [
    { index: 0, name: 'Monday', date: '23.02', expected: '120%' },
    { index: 1, name: 'Tuesday', date: '24.02', expected: '86%' },
    { index: 2, name: 'Wednesday', date: '25.02', expected: '100%' },
    { index: 3, name: 'Thursday', date: '26.02', expected: '80%' },
    { index: 4, name: 'Friday', date: '27.02', expected: '83%' },
    { index: 5, name: 'Saturday', date: '28.02', expected: '100%' },
    { index: 6, name: 'Sunday', date: '01.03', expected: '40%' },
  ];

  const formatIDR = (val: number) => {
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  return (
    <div className="max-w-[1440px] mx-auto p-6 space-y-6">
      
      {/* ========================================================
          TOP ROW (SPAN 12): DAILY VELOCITY BAR
          ======================================================== */}
      <section className="mplt-card p-4 bg-[#FFFFFF] border border-[#E2E8F0]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <h2 className="text-[12px] font-bold tracking-wider uppercase text-[#18181B] font-ui">
              DAILY VELOCITY & TELEMETRY
            </h2>
          </div>
          <span className="text-[11px] text-[#71717A] font-num">
            SYNCED: 26.02.2026 / 08:30 WIB
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
                This Week
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
              <span className="text-[13px] font-normal text-[#71717A] ml-1.5">
                ({spentPercent}% Spent)
              </span>
            </div>
          </div>

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
                    Week of Feb 23, 2026 — Mar 01, 2026
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
                
                // SVG circular ring parameter
                const radius = 22;
                const circ = 2 * Math.PI * radius;
                const offset = circ - (Math.min(100, percent) / 100) * circ;

                return (
                  <div
                    key={d.index}
                    className="border border-[#E2E8F0] rounded-[8px] p-2.5 bg-[#FFFFFF] flex flex-col items-center text-center hover:border-[#CBD5E1] transition-colors"
                  >
                    {/* Header */}
                    <div className="w-full bg-[#18181B] text-white py-1 px-1.5 rounded-[4px] mb-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider block leading-none">
                        {d.name.substring(0, 3)}
                      </span>
                      <span className="text-[9px] font-num text-[#94A3B8] block leading-tight">
                        {d.date}
                      </span>
                    </div>

                    {/* Central Circular Progress Ring (High contrast wireframe) */}
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
                        {d.index === 0 ? '120%' : `${percent}%`}
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

        </div>

        {/* ======================================================
            RIGHT COLUMN (SPAN 4)
            ====================================================== */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* PANEL A: CATEGORY EXP DISTRIBUTION (1PX WIREFRAME DONUT) */}
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

          {/* PANEL B: CASH FLOW QUICK-VIEW (50/30/20 RATIO INDICATOR) */}
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
            <div className="space-y-3.5">
              
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

            {/* Quick status summary chip */}
            <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[11px]">
              <span className="text-[#71717A]">Remaining Net Cap</span>
              <span className="font-num font-bold text-[#10B981]">
                +{formatIDR(totalIncome - totalSpent)}
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
