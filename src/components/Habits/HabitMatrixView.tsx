import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Check, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Flame,
  Award,
  Zap,
  Activity,
  BarChart2,
  Sparkles,
  Sun,
  Laptop,
  Moon,
  List,
  Layers,
  CalendarPlus,
  Calendar,
  X
} from 'lucide-react';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import { AreaOfLife, Habit } from '../../types';
import { sound } from '../../utils/sound';
import { dateUtils } from '../../utils/date';
import { syncRoutineToGoogleCalendar, exportUniversalICS } from '../../utils/calendar';

export const HabitMatrixView: React.FC = () => {
  const { profile, habits, toggleHabitLog, addHabit, deleteHabit } = useApp();
  
  const today = useMemo(() => dateUtils.getTodayInfo(), []);
  const selectedMonth = today.monthName;
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<AreaOfLife>('Health');
  const [newTimeOfDay, setNewTimeOfDay] = useState<Habit['timeOfDay']>('Morning');
  
  // View mode: 'table' (monthly ledger) | 'stack' (routine blocks)
  const [viewMode, setViewMode] = useState<'table' | 'stack'>('table');

  // Interactive chart state
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [activeVelocityFilter, setActiveVelocityFilter] = useState<'all' | AreaOfLife>('all');

  // Days in month
  const totalDays = today.daysInMonth;
  const daysArray = useMemo(() => Array.from({ length: totalDays }, (_, i) => i + 1), [totalDays]);

  // Weeks grouping
  const weekGroups = useMemo(() => {
    const groups = [
      { name: 'WEEK 1', start: 1, end: 7 },
      { name: 'WEEK 2', start: 8, end: 14 },
      { name: 'WEEK 3', start: 15, end: 21 },
      { name: 'WEEK 4', start: 22, end: 28 },
    ];
    if (totalDays > 28) {
      groups.push({ name: 'WEEK 5', start: 29, end: totalDays });
    }
    return groups;
  }, [totalDays]);

  // Filtered habits for velocity analysis
  const filteredHabits = useMemo(() => {
    if (activeVelocityFilter === 'all') return habits;
    return habits.filter(h => h.category === activeVelocityFilter);
  }, [habits, activeVelocityFilter]);

  // Calculate stats
  const totalPossibleLogs = habits.length * totalDays;
  let totalCompletedLogs = 0;

  habits.forEach(h => {
    daysArray.forEach(d => {
      if (h.logs[d]) totalCompletedLogs++;
    });
  });

  const monthCompletionRate = totalPossibleLogs > 0 
    ? ((totalCompletedLogs / totalPossibleLogs) * 100).toFixed(1)
    : '0.0';

  // Detailed Day-by-day telemetry calculation
  const dailyTelemetry = useMemo(() => {
    return daysArray.map(day => {
      const activeList = filteredHabits.length > 0 ? filteredHabits : habits;
      const doneList = activeList.filter(h => !!h.logs[day]);
      const doneCount = doneList.length;
      const totalCount = activeList.length;
      const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
      const expEarned = doneList.reduce((acc, h) => acc + h.expReward, 0);

      return {
        day,
        doneCount,
        totalCount,
        pct,
        expEarned,
        isPerfect: pct === 100,
      };
    });
  }, [habits, filteredHabits, daysArray]);

  // Overall column percentages for summary footer
  const dailyPercentages = useMemo(() => {
    return daysArray.map(day => {
      if (habits.length === 0) return 0;
      const doneForDay = habits.filter(h => !!h.logs[day]).length;
      return Math.round((doneForDay / habits.length) * 100);
    });
  }, [habits, daysArray]);

  // Velocity statistics
  const peakDay = useMemo(() => {
    return [...dailyTelemetry].sort((a, b) => b.pct - a.pct)[0] || { day: 1, pct: 0 };
  }, [dailyTelemetry]);

  const totalExpThisMonth = useMemo(() => {
    return dailyTelemetry.reduce((acc, d) => acc + d.expEarned, 0);
  }, [dailyTelemetry]);

  const perfectDaysCount = useMemo(() => {
    return dailyTelemetry.filter(d => d.pct === 100).length;
  }, [dailyTelemetry]);

  // Habit Mastery Tier calculation helper
  const getHabitMastery = (completedDays: number) => {
    if (completedDays >= 31) return { tier: '31-Day Streak', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (completedDays >= 25) return { tier: 'Platinum', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    if (completedDays >= 20) return { tier: 'Gold', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    if (completedDays >= 14) return { tier: 'Silver', color: 'bg-sky-100 text-sky-800 border-sky-300' };
    if (completedDays >= 7) return { tier: 'Bronze', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    return { tier: 'Novice', color: 'bg-zinc-100 text-zinc-700 border-zinc-300' };
  };

  // Routine blocks grouping
  const routineBlocks = [
    { id: 'Morning', label: 'Morning Launch Protocol', icon: Sun, color: 'text-amber-500', desc: 'Prime energy, whole nutrition, physical velocity' },
    { id: 'Deep Work', label: 'Deep Work Focus Block', icon: Laptop, color: 'text-sky-500', desc: 'Unbroken leverage, high cognitive output' },
    { id: 'Evening', label: 'Evening Shutdown & Reflection', icon: Moon, color: 'text-indigo-500', desc: 'Financial audit, mental recovery, spiritual ground' },
  ];

  // Large SVG Chart coordinate geometry
  const chartGeometry = useMemo(() => {
    const width = 1000;
    const height = 150;
    const paddingLeft = 35;
    const paddingRight = 20;
    const paddingTop = 15;
    const paddingBottom = 25;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;
    const stepX = plotWidth / (dailyTelemetry.length - 1);

    const points = dailyTelemetry.map((item, idx) => {
      const x = paddingLeft + idx * stepX;
      const y = paddingTop + (1 - item.pct / 100) * plotHeight;
      return { ...item, x, y };
    });

    const linePath = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '');
    const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - paddingBottom} L ${points[0].x.toFixed(1)} ${height - paddingBottom} Z`;

    return { points, linePath, areaPath, width, height, paddingLeft, paddingRight, paddingTop, paddingBottom, plotHeight, plotWidth };
  }, [dailyTelemetry]);

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    sound.playPop();
    addHabit(newTitle.trim(), newCategory, newTimeOfDay);
    setNewTitle('');
    setShowAddModal(false);
  };

  const activeHoveredData = hoveredDay !== null 
    ? dailyTelemetry.find(d => d.day === hoveredDay) 
    : null;

  return (
    <div className="max-w-[1440px] mx-auto p-6 space-y-6">
      
      {/* ========================================================
          TOP SECTION: EXPANDED HIGH-DENSITY VELOCITY ANALYTICS
          ======================================================== */}
      <section className="mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0] space-y-5">
        
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#18181B]" />
              <h1 className="text-[24px] font-bold text-[#18181B] font-ui tracking-tight">
                HABIT BUILDER — {selectedMonth}
              </h1>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap mt-1 text-[12px]">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[#71717A] font-ui font-medium">
                  Month Completion:
                </span>
                <span className="font-num font-bold text-[#18181B]">
                  {totalCompletedLogs} / {totalPossibleLogs} Logs ({monthCompletionRate}%)
                </span>
              </div>

              <div className="h-3.5 w-[1px] bg-[#E2E8F0] hidden sm:block" />

              <div className="flex items-center gap-1 font-num font-semibold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-[4px]">
                <Flame size={12} className="text-orange-500 fill-orange-500" />
                <span>Current Streak: {profile.streakDays} Days</span>
              </div>
            </div>
          </div>

          {/* Right Action & View Mode Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Domain Filter Expandable Tabs */}
            <ExpandableTabs
              size="sm"
              tabs={[
                { id: 'all', title: 'All Domains', icon: Sparkles },
                { id: 'Health', title: 'Health', icon: Activity },
                { id: 'Work', title: 'Work', icon: Laptop },
                { id: 'Money', title: 'Money', icon: TrendingUp },
                { id: 'Personal Growth', title: 'Growth', icon: Award },
              ]}
              selectedIndex={
                activeVelocityFilter === 'all'
                  ? 0
                  : activeVelocityFilter === 'Health'
                  ? 1
                  : activeVelocityFilter === 'Work'
                  ? 2
                  : activeVelocityFilter === 'Money'
                  ? 3
                  : 4
              }
              activeBgColor="bg-[#18181B]"
              activeColor="text-white"
              className="bg-[#F9FAFB] border-[#E2E8F0] rounded-[8px]"
              onChange={(idx) => {
                sound.playClick();
                const mapping: ('all' | AreaOfLife)[] = ['all', 'Health', 'Work', 'Money', 'Personal Growth'];
                if (idx !== null && mapping[idx]) {
                  setActiveVelocityFilter(mapping[idx]);
                }
              }}
            />

            {/* View Mode Expandable Tabs: 31-Day Ledger vs Routine Stacking */}
            <ExpandableTabs
              size="sm"
              tabs={[
                { id: 'table', title: '31-Day Ledger', icon: List },
                { id: 'stack', title: 'Routine Stacking', icon: Layers },
              ]}
              selectedIndex={viewMode === 'table' ? 0 : 1}
              activeBgColor="bg-[#18181B]"
              activeColor="text-white"
              className="bg-[#F9FAFB] border-[#E2E8F0] rounded-[8px]"
              onChange={(idx) => {
                sound.playClick();
                if (idx === 0) setViewMode('table');
                else if (idx === 1) setViewMode('stack');
              }}
            />

            {/* Add Habit Button */}
            <button
              onClick={() => {
                setShowAddModal(true);
                sound.playClick();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#18181B] text-white hover:bg-[#27272A] text-[12px] font-bold transition-all whitespace-nowrap"
            >
              <Plus size={14} />
              <span>Add Habit</span>
            </button>
          </div>
        </div>

        {/* 4 Telemetry Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
          
          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <div className="text-[#71717A] font-ui uppercase tracking-wider flex items-center justify-between">
              <span>Velocity Average</span>
              <Activity size={13} className="text-[#10B981]" />
            </div>
            <div className="text-[20px] font-num font-bold text-[#18181B] mt-0.5">
              {monthCompletionRate}%
            </div>
            <span className="text-[10px] text-[#71717A] font-ui block mt-0.5">
              Consistent daily momentum
            </span>
          </div>

          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <div className="text-[#71717A] font-ui uppercase tracking-wider flex items-center justify-between">
              <span>Perfect 100% Days</span>
              <Sparkles size={13} className="text-[#10B981]" />
            </div>
            <div className="text-[20px] font-num font-bold text-[#10B981] mt-0.5">
              {perfectDaysCount} Days
            </div>
            <span className="text-[10px] text-[#71717A] font-ui block mt-0.5">
              Flawless routine execution
            </span>
          </div>

          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <div className="text-[#71717A] font-ui uppercase tracking-wider flex items-center justify-between">
              <span>Peak Day Velocity</span>
              <Zap size={13} className="text-[#18181B]" />
            </div>
            <div className="text-[20px] font-num font-bold text-[#18181B] mt-0.5">
              Day {peakDay.day} ({peakDay.pct}%)
            </div>
            <span className="text-[10px] text-[#71717A] font-ui block mt-0.5">
              Highest output volume
            </span>
          </div>

          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <div className="text-[#71717A] font-ui uppercase tracking-wider flex items-center justify-between">
              <span>Habit EXP Generated</span>
              <TrendingUp size={13} className="text-[#10B981]" />
            </div>
            <div className="text-[20px] font-num font-bold text-[#18181B] mt-0.5">
              +{totalExpThisMonth.toLocaleString()} EXP
            </div>
            <span className="text-[10px] text-[#71717A] font-ui block mt-0.5">
              Converted to profile level
            </span>
          </div>

        </div>

        {/* LARGE HIGH-RESOLUTION VELOCITY TREND DIAGRAM */}
        <div className="border border-[#E2E8F0] rounded-[10px] bg-[#FFFFFF] p-4 relative">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-2 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <BarChart2 size={15} className="text-[#18181B]" />
              <h3 className="text-[13px] font-bold text-[#18181B] font-ui uppercase tracking-wider">
                31-Day Granular Velocity Curve & Progression Telemetry
              </h3>
            </div>

            <div className="h-6 flex items-center">
              {activeHoveredData ? (
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#18181B] text-white rounded-[5px] text-[11px] font-num animate-in fade-in duration-150">
                  <span className="font-bold">Day {activeHoveredData.day < 10 ? `0${activeHoveredData.day}` : activeHoveredData.day}:</span>
                  <span className="text-[#10B981] font-bold">{activeHoveredData.pct}% Completion</span>
                  <span className="text-[#94A3B8]">({activeHoveredData.doneCount}/{activeHoveredData.totalCount} Habits)</span>
                  <span className="text-[#38BDF8] font-bold">+{activeHoveredData.expEarned} EXP</span>
                </div>
              ) : (
                <span className="text-[11px] text-[#71717A] font-ui">
                  Hover points along curve for day-by-day logs & EXP statistics
                </span>
              )}
            </div>
          </div>

          {/* SVG Diagram */}
          <div className="w-full relative overflow-hidden pt-2">
            <svg 
              viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`} 
              className="w-full h-[180px] sm:h-[210px] overflow-visible select-none"
            >
              <defs>
                <linearGradient id="largeVelocityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#18181B" stopOpacity="0.22" />
                  <stop offset="60%" stopColor="#18181B" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#18181B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[100, 75, 50, 25, 0].map((level) => {
                const y = chartGeometry.paddingTop + (1 - level / 100) * chartGeometry.plotHeight;
                return (
                  <g key={level}>
                    <line
                      x1={chartGeometry.paddingLeft}
                      y1={y}
                      x2={chartGeometry.width - chartGeometry.paddingRight}
                      y2={y}
                      stroke={level === 100 ? '#CBD5E1' : level === 50 ? '#E2E8F0' : '#F1F5F9'}
                      strokeWidth={level === 100 ? '1.5' : '1'}
                      strokeDasharray={level === 100 || level === 0 ? 'none' : '4 4'}
                    />
                    <text
                      x={chartGeometry.paddingLeft - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      className="text-[9.5px] font-num fill-[#71717A] font-medium"
                    >
                      {level}%
                    </text>
                  </g>
                );
              })}

              {/* Week Guides */}
              {weekGroups.map((wg, idx) => {
                const pt = chartGeometry.points.find(p => p.day === wg.start);
                if (!pt || idx === 0) return null;
                return (
                  <g key={wg.name}>
                    <line
                      x1={pt.x}
                      y1={chartGeometry.paddingTop}
                      x2={pt.x}
                      y2={chartGeometry.height - chartGeometry.paddingBottom}
                      stroke="#E2E8F0"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={pt.x + 4}
                      y={chartGeometry.paddingTop + 10}
                      className="text-[8.5px] font-ui fill-[#A1A1AA] uppercase tracking-wider font-semibold"
                    >
                      {wg.name}
                    </text>
                  </g>
                );
              })}

              <path d={chartGeometry.areaPath} fill="url(#largeVelocityGrad)" />
              <path
                d={chartGeometry.linePath}
                fill="none"
                stroke="#18181B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {chartGeometry.points.map((pt) => {
                const isHovered = hoveredDay === pt.day;
                const isPeak = pt.pct === 100;

                return (
                  <g
                    key={pt.day}
                    onMouseEnter={() => setHoveredDay(pt.day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="cursor-pointer transition-all"
                  >
                    <rect
                      x={pt.x - 12}
                      y={chartGeometry.paddingTop}
                      width="24"
                      height={chartGeometry.plotHeight + 20}
                      fill="transparent"
                    />

                    {isHovered && (
                      <line
                        x1={pt.x}
                        y1={chartGeometry.paddingTop}
                        x2={pt.x}
                        y2={chartGeometry.height - chartGeometry.paddingBottom}
                        stroke="#18181B"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}

                    {isHovered && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="8"
                        fill="#18181B"
                        fillOpacity="0.15"
                      />
                    )}

                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 4.5 : isPeak ? 3.5 : 2.5}
                      fill={isHovered ? '#18181B' : isPeak ? '#10B981' : '#FFFFFF'}
                      stroke={isPeak ? '#10B981' : '#18181B'}
                      strokeWidth={isHovered ? '2' : '1.5'}
                    />

                    <text
                      x={pt.x}
                      y={chartGeometry.height - 8}
                      textAnchor="middle"
                      className={`text-[9px] font-num ${
                        isHovered 
                          ? 'fill-[#18181B] font-bold text-[10px]' 
                          : pt.day % 5 === 0 || pt.day === 1 || pt.day === 31
                          ? 'fill-[#71717A] font-semibold'
                          : 'fill-[#CBD5E1]'
                      }`}
                    >
                      {pt.day < 10 ? `0${pt.day}` : pt.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

      </section>

      {/* ========================================================
          CENTER SECTION: VIEW 1 — FULL 31-DAY TABLE LEDGER
          ======================================================== */}
      {viewMode === 'table' ? (
        <section className="mplt-card bg-[#FFFFFF] border border-[#E2E8F0] overflow-hidden">
          
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full border-collapse text-left select-none">
              
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F9FAFB]">
                  <th className="sticky left-0 z-20 bg-[#F9FAFB] w-[260px] min-w-[260px] p-3 text-[11px] font-bold text-[#18181B] font-ui uppercase tracking-wider border-r border-[#E2E8F0]">
                    Routine / Habit Item
                  </th>
                  
                  {weekGroups.map((wg, idx) => {
                    const daysInGroup = wg.end - wg.start + 1;
                    return (
                      <th
                        key={wg.name}
                        colSpan={daysInGroup}
                        className={`text-center p-2 text-[10px] font-bold font-ui text-[#71717A] tracking-wider uppercase border-r border-[#E2E8F0] ${
                          idx % 2 === 0 ? 'bg-[#F9FAFB]' : 'bg-[#FFFFFF]'
                        }`}
                      >
                        {wg.name}
                      </th>
                    );
                  })}

                  <th className="w-[120px] min-w-[120px] p-2 text-center text-[10px] font-bold text-[#18181B] font-ui uppercase tracking-wider">
                    Mastery Tier
                  </th>
                  <th className="w-[48px] min-w-[48px] p-2 text-center text-[10px] font-bold text-[#71717A] font-ui uppercase tracking-wider">
                    Act
                  </th>
                </tr>

                <tr className="border-b border-[#E2E8F0] bg-[#FFFFFF]">
                  <th className="sticky left-0 z-20 bg-[#FFFFFF] p-2.5 text-[11px] font-medium text-[#71717A] border-r border-[#E2E8F0]">
                    <span className="font-ui text-[10px] uppercase tracking-wider">Daily Matrix (31 Days)</span>
                  </th>
                  
                  {daysArray.map((day) => {
                    const isWeekend = day % 7 === 6 || day % 7 === 0;
                    const isHovered = hoveredDay === day;

                    return (
                      <th
                        key={day}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`p-0 text-center w-[30px] min-w-[30px] border-r border-[#F1F5F9] transition-colors cursor-pointer ${
                          isHovered ? 'bg-[#18181B] text-white' : isWeekend ? 'bg-[#FAFAFA]' : 'bg-[#FFFFFF]'
                        }`}
                      >
                        <span className={`text-[10px] font-num font-semibold block py-1.5 ${
                          isHovered ? 'text-white' : 'text-[#18181B]'
                        }`}>
                          {day < 10 ? `0${day}` : day}
                        </span>
                      </th>
                    );
                  })}

                  <th className="text-center p-2 text-[10px] font-num text-[#71717A] border-r border-[#E2E8F0]">
                    Rank & Rate
                  </th>
                  <th className="text-center p-2 text-[10px] font-num text-[#71717A]">
                    -
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E2E8F0]">
                {habits.map((habit, habitIndex) => {
                  const completedDaysCount = daysArray.filter(d => habit.logs[d]).length;
                  const habitSuccessRate = Math.round((completedDaysCount / totalDays) * 100);
                  const mastery = getHabitMastery(completedDaysCount);

                  return (
                    <tr key={habit.id} className="hover:bg-[#FBFBFC] transition-colors group">
                      
                      <td className="sticky left-0 z-10 bg-[#FFFFFF] group-hover:bg-[#FBFBFC] p-3 border-r border-[#E2E8F0]">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-[#18181B] font-ui leading-tight truncate max-w-[170px]">
                              {habitIndex + 1}. {habit.title}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[9.5px] uppercase font-ui tracking-wider px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#71717A]">
                                {habit.category}
                              </span>
                              {habit.timeOfDay && (
                                <span className="text-[9px] font-ui text-[#71717A]">
                                  • {habit.timeOfDay}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <span className="text-[10px] font-num font-bold text-[#18181B] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                            +{habit.expReward} EXP
                          </span>
                        </div>
                      </td>

                      {daysArray.map((day) => {
                        const isChecked = !!habit.logs[day];
                        const isHoveredCol = hoveredDay === day;

                        return (
                          <td
                            key={day}
                            onMouseEnter={() => setHoveredDay(day)}
                            onMouseLeave={() => setHoveredDay(null)}
                            className={`p-1 text-center w-[30px] min-w-[30px] border-r border-[#F1F5F9] transition-colors ${
                              isHoveredCol ? 'bg-[#F4F4F5]' : ''
                            }`}
                          >
                            <div className="flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => toggleHabitLog(habit.id, day)}
                                title={`Day ${day}: ${habit.title} (${isChecked ? 'Completed' : 'Pending'})`}
                                className={`w-[24px] h-[24px] rounded-[4px] flex items-center justify-center transition-all ${
                                  isChecked
                                    ? 'bg-[#18181B] border border-[#18181B] text-white'
                                    : 'bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#A1A1AA] hover:bg-[#F4F4F5]'
                                }`}
                              >
                                {isChecked && <Check size={13} className="stroke-[3]" />}
                              </button>
                            </div>
                          </td>
                        );
                      })}

                      <td className="p-2 text-center border-r border-[#E2E8F0]">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`text-[9px] font-ui font-bold px-1.5 py-0.5 rounded border ${mastery.color}`}>
                            {mastery.tier}
                          </span>
                          <span className="text-[10px] font-num font-semibold text-[#18181B]">
                            {habitSuccessRate}% ({completedDaysCount}d)
                          </span>
                        </div>
                      </td>

                      <td className="p-2 text-center">
                        <button
                          onClick={() => {
                            deleteHabit(habit.id);
                            sound.playClick();
                          }}
                          className="p-1 rounded text-[#A1A1AA] hover:text-[#E11D48] hover:bg-rose-50 transition-colors"
                          title="Delete Habit"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

              <tfoot>
                <tr className="bg-[#18181B] text-white font-ui font-semibold text-[11px]">
                  <td className="sticky left-0 z-20 bg-[#18181B] p-3 border-r border-[#3F3F46]">
                    <div className="flex items-center justify-between">
                      <span className="tracking-wider uppercase text-[10.5px]">DAILY COMPLETION</span>
                      <span className="text-[10px] font-num text-[#10B981] font-bold">AVG: {monthCompletionRate}%</span>
                    </div>
                  </td>

                  {dailyPercentages.map((pct, idx) => {
                    const isHoveredCol = hoveredDay === idx + 1;
                    return (
                      <td
                        key={idx}
                        onMouseEnter={() => setHoveredDay(idx + 1)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`p-1 text-center w-[30px] min-w-[30px] border-r border-[#3F3F46]/50 transition-colors ${
                          isHoveredCol ? 'bg-[#27272A]' : ''
                        }`}
                      >
                        <span 
                          className={`text-[9.5px] font-num font-bold block ${
                            pct >= 80 ? 'text-[#10B981]' : pct >= 50 ? 'text-white' : 'text-[#94A3B8]'
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                    );
                  })}

                  <td className="text-center p-2 text-[11px] font-num text-[#10B981] font-bold border-r border-[#3F3F46]">
                    {monthCompletionRate}%
                  </td>
                  <td className="text-center p-2">
                    <Award size={13} className="text-[#10B981] mx-auto" />
                  </td>
                </tr>
              </tfoot>

            </table>
          </div>

        </section>
      ) : (
        /* ========================================================
            CENTER SECTION: VIEW 2 — DAILY ROUTINE STACKING BLOCKS
            ======================================================== */
        <section className="space-y-4">
          {/* Calendar Sync Action Bar */}
          <div className="p-3.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[6px] bg-[#18181B] text-white flex items-center justify-center">
                <Calendar size={14} className="text-[#10B981]" />
              </div>
              <div>
                <h4 className="text-[12.5px] font-bold text-[#18181B] font-ui">
                  CALENDAR & ROUTINE SYNCHRONIZATION
                </h4>
                <p className="text-[11px] text-[#71717A] font-ui">
                  Sync daily execution blocks to Google Calendar, Apple Calendar, or mobile device alarms
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                exportUniversalICS(profile, habits);
                sound.playPop();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#18181B] hover:bg-[#27272A] text-white text-[11.5px] font-bold font-ui active:scale-[0.98] transition-all shadow-sm flex-shrink-0"
            >
              <CalendarPlus size={13} className="text-[#10B981]" />
              <span>Export Schedule (.ICS)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {routineBlocks.map((block) => {
              const BlockIcon = block.icon;
              const blockHabits = habits.filter(h => (h.timeOfDay || 'Morning') === block.id);

              return (
                <div key={block.id} className="mplt-card p-5 bg-white border border-[#E2E8F0] rounded-[12px] space-y-4">
                  <div className="pb-3 border-b border-[#E2E8F0] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BlockIcon size={18} className={block.color} />
                      <div>
                        <h3 className="text-[14px] font-bold text-[#18181B] font-ui">
                          {block.label}
                        </h3>
                        <p className="text-[10.5px] text-[#71717A] font-ui">
                          {block.desc}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const routineKey = block.id === 'Morning' ? 'morning' : block.id === 'Deep Work' ? 'deepWork' : 'evening';
                          const timeVal = block.id === 'Morning' ? '06:00' : block.id === 'Deep Work' ? '09:00' : '21:00';
                          syncRoutineToGoogleCalendar(routineKey, timeVal);
                          sound.playClick();
                        }}
                        title="Sync this routine block to Google Calendar"
                        className="flex items-center gap-1 px-2 py-1 rounded-[6px] bg-[#F9FAFB] hover:bg-white border border-[#E2E8F0] hover:border-[#18181B] text-[10.5px] font-bold font-ui text-[#71717A] hover:text-[#18181B] transition-all shadow-2xs cursor-pointer"
                      >
                        <CalendarPlus size={11} className="text-[#10B981]" />
                        <span>GCal</span>
                      </button>
                      <span className="text-[10.5px] font-num font-bold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#18181B]">
                        {blockHabits.length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {blockHabits.map((habit) => {
                      const isTodayChecked = !!habit.logs[26];
                      const totalDone = daysArray.filter(d => habit.logs[d]).length;
                      const mastery = getHabitMastery(totalDone);

                      return (
                        <div
                          key={habit.id}
                          className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] flex items-center justify-between gap-3 hover:border-[#18181B] transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              onClick={() => toggleHabitLog(habit.id, 26)}
                              className={`w-6 h-6 rounded-[4px] flex items-center justify-center flex-shrink-0 transition-all ${
                                isTodayChecked 
                                  ? 'bg-[#18181B] text-white border border-[#18181B]' 
                                  : 'bg-white border border-[#CBD5E1] hover:border-[#18181B]'
                              }`}
                            >
                              {isTodayChecked && <Check size={14} className="stroke-[3]" />}
                            </button>

                            <div className="flex flex-col min-w-0">
                              <span className={`text-[12.5px] font-ui font-semibold truncate ${
                                isTodayChecked ? 'line-through text-[#71717A]' : 'text-[#18181B]'
                              }`}>
                                {habit.title}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[8.5px] font-ui font-bold px-1.5 py-0.2 rounded border ${mastery.color}`}>
                                  {mastery.tier}
                                </span>
                                <span className="text-[9.5px] font-num text-[#71717A]">
                                  {totalDone}/31 Days Done
                                </span>
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] font-num font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded flex-shrink-0">
                            +{habit.expReward} EXP
                          </span>
                        </div>
                      );
                    })}

                    {blockHabits.length === 0 && (
                      <div className="py-6 text-center text-[11px] text-[#71717A] font-ui">
                        No habits assigned to this routine block yet.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] max-w-md w-full p-6 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
              <h3 className="text-[16px] font-bold text-[#18181B] font-ui">
                Add New Routine Habit
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-[#71717A] hover:text-[#18181B]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                  Habit Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Read 30m, 10k Steps, Cold Shower"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                    Area of Life
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as AreaOfLife)}
                    className="w-full px-3 py-2 text-[12px] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B] bg-white"
                  >
                    <option value="Health">Health & Fitness</option>
                    <option value="Work">Work & Deep Focus</option>
                    <option value="Money">Money & Finances</option>
                    <option value="Personal Growth">Personal Growth</option>
                    <option value="Family">Family & Relationships</option>
                    <option value="Spirituality">Spirituality & Mindfulness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                    Routine Protocol
                  </label>
                  <select
                    value={newTimeOfDay}
                    onChange={(e) => setNewTimeOfDay(e.target.value as Habit['timeOfDay'])}
                    className="w-full px-3 py-2 text-[12px] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B] bg-white"
                  >
                    <option value="Morning">🌅 Morning Protocol</option>
                    <option value="Deep Work">💻 Deep Work Block</option>
                    <option value="Evening">🌙 Evening Protocol</option>
                    <option value="Anytime">⚡ Flexible Anytime</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[12px] font-medium border border-[#E2E8F0] rounded-[6px] hover:bg-[#F4F4F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-[12px] font-bold bg-[#18181B] text-white rounded-[6px] hover:bg-[#27272A]"
                >
                  Create Habit (+20 EXP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HabitMatrixView;
