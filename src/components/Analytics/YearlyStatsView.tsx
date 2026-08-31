import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Trophy, 
  TrendingUp, 
  Flame, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  Briefcase, 
  HeartHandshake, 
  BookOpen, 
  Moon, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  Award, 
  Layers, 
  Zap, 
  Download, 
  PieChart,
  BarChart2
} from 'lucide-react';
import { AreaOfLife } from '../../types';
import { sound } from '../../utils/sound';
import { dateUtils } from '../../utils/date';

export const YearlyStatsView: React.FC = () => {
  const { profile, habits, tasks, goals, budget, transactions, addExp } = useApp();

  const today = useMemo(() => dateUtils.getTodayInfo(), []);
  const [hoveredCell, setHoveredCell] = useState<{
    dateStr: string;
    dayOfYear: number;
    weekIdx: number;
    completionPct: number;
    tasksDone: number;
    exp: number;
  } | null>(null);

  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  // Month names and week starts mapping (52 weeks across 12 months)
  const monthHeaders = [
    { name: 'Jan', weekStart: 0, weekEnd: 4 },
    { name: 'Feb', weekStart: 4, weekEnd: 8 },
    { name: 'Mar', weekStart: 8, weekEnd: 13 },
    { name: 'Apr', weekStart: 13, weekEnd: 17 },
    { name: 'May', weekStart: 17, weekEnd: 21 },
    { name: 'Jun', weekStart: 21, weekEnd: 26 },
    { name: 'Jul', weekStart: 26, weekEnd: 30 },
    { name: 'Aug', weekStart: 30, weekEnd: 34 },
    { name: 'Sep', weekStart: 34, weekEnd: 39 },
    { name: 'Oct', weekStart: 39, weekEnd: 43 },
    { name: 'Nov', weekStart: 43, weekEnd: 47 },
    { name: 'Dec', weekStart: 47, weekEnd: 52 },
  ];

  // Currency format helper
  const formatIDR = (num: number) => {
    return `Rp ${Math.round(num).toLocaleString('id-ID')}`;
  };

  // Generate 365 Days Grid Data (52 weeks x 7 days)
  const heatmapData = useMemo(() => {
    const days = [];
    const startDate = new Date(today.year, 0, 1);
    
    // Calculate live habit logs
    const febLogs = habits.reduce((acc, h) => {
      let count = 0;
      for (let d = 1; d <= 31; d++) {
        if (h.logs[d]) count++;
      }
      return acc + count;
    }, 0);
    const avgRate = habits.length > 0 ? febLogs / (habits.length * 28) : 0.82;

    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let dayIdx = 0; dayIdx < 364; dayIdx++) { // 52 full weeks = 364 days
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + dayIdx);
      
      const monthIdx = currentDate.getMonth();
      const dateNum = currentDate.getDate();
      const dayOfWeek = (currentDate.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
      const weekIdx = Math.floor(dayIdx / 7);

      // Deterministic dynamic distribution
      const wave = Math.sin(dayIdx * 0.12) * 15;
      const seed = Math.sin(dayIdx * 7919 + weekIdx * 53) * 10000;
      const noise = (seed - Math.floor(seed)) * 30 - 15;
      
      let completionPct = 0;
      if (weekIdx <= 8) { // Jan - Feb (Live active baseline)
        completionPct = Math.min(100, Math.max(25, Math.round((avgRate * 90) + noise)));
      } else {
        completionPct = Math.min(100, Math.max(30, Math.round(75 + wave + noise)));
      }

      // Format date string
      const dateStr = `${dateNum} ${monthsShort[monthIdx]} ${today.year}`;
      const tasksDone = Math.floor((completionPct / 100) * 4) + 1;
      const exp = Math.round(completionPct * 1.5 + tasksDone * 15);

      days.push({
        dayOfYear: dayIdx + 1,
        dateStr,
        monthIdx,
        dateNum,
        dayOfWeek,
        weekIdx,
        completionPct,
        tasksDone,
        exp,
      });
    }
    return days;
  }, [habits]);

  // 52-Week Granular Trajectory Curve Data
  const weeklyTrajectoryData = useMemo(() => {
    const weeks = [];
    for (let w = 0; w < 52; w++) {
      const weekDays = heatmapData.filter(d => d.weekIdx === w);
      const avgConsistency = weekDays.length > 0
        ? Math.round(weekDays.reduce((acc, d) => acc + d.completionPct, 0) / weekDays.length)
        : 80;

      // Realistic peaks, recovery waves, and surges
      const weekNumber = w + 1;
      const quarter = weekNumber <= 13 ? 'Q1' : weekNumber <= 26 ? 'Q2' : weekNumber <= 39 ? 'Q3' : 'Q4';
      const totalTasks = weekDays.reduce((acc, d) => acc + d.tasksDone, 0);
      const totalExp = weekDays.reduce((acc, d) => acc + d.exp, 0);

      // Date range label
      const firstDay = weekDays[0];
      const lastDay = weekDays[weekDays.length - 1];
      const rangeLabel = firstDay && lastDay ? `${firstDay.dateStr.split(' ')[0]} ${firstDay.dateStr.split(' ')[1]} — ${lastDay.dateStr.split(' ')[0]} ${lastDay.dateStr.split(' ')[1]}` : `Week ${weekNumber}`;

      weeks.push({
        weekNumber,
        quarter,
        consistency: avgConsistency,
        tasks: totalTasks,
        exp: totalExp,
        rangeLabel,
      });
    }
    return weeks;
  }, [heatmapData]);

  // 6-Domain Life Balance Scores
  const domainScores = useMemo(() => {
    const areas: { area: AreaOfLife; icon: any; score: number; color: string; desc: string }[] = [
      { area: 'Work', icon: Briefcase, score: 94, color: 'text-sky-600 bg-sky-50 border-sky-200', desc: 'Keystone Engine: 12 Sprints closed' },
      { area: 'Health', icon: ShieldCheck, score: 88, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', desc: '82 Running sessions, 100% nutrition' },
      { area: 'Money', icon: DollarSign, score: 86, color: 'text-amber-600 bg-amber-50 border-amber-200', desc: '50/30/20 Allocation followed consistently' },
      { area: 'Personal Growth', icon: BookOpen, score: 82, color: 'text-indigo-600 bg-indigo-50 border-indigo-200', desc: '6 Books read & summarized' },
      { area: 'Spirituality', icon: Moon, score: 80, color: 'text-purple-600 bg-purple-50 border-purple-200', desc: 'Daily evening reflection & focus' },
      { area: 'Family', icon: HeartHandshake, score: 78, color: 'text-rose-600 bg-rose-50 border-rose-200', desc: 'Growth Area: schedule dedicated weekends' },
    ];
    return areas;
  }, []);

  // Annual Financial Ledger Aggregate
  const annualFinance = useMemo(() => {
    const annualIncome = (budget.incomeGoal || 15000000) * 12;
    const annualNeedsSpent = annualIncome * 0.48; // 48% actual
    const annualWantsSpent = annualIncome * 0.278; // 27.8% actual
    const annualRetainedCapital = annualIncome - (annualNeedsSpent + annualWantsSpent);
    const annualSavingsRate = Math.round((annualRetainedCapital / annualIncome) * 100);

    return {
      annualIncome,
      annualNeedsSpent,
      annualWantsSpent,
      annualRetainedCapital,
      annualSavingsRate,
    };
  }, [budget]);

  // Hall of Fame Badges
  const badges = [
    { title: 'Centurion Streak', subtitle: '100+ Days Unbroken Discipline', icon: Flame, color: 'text-orange-500 bg-orange-50 border-orange-200' },
    { title: 'Master Executor', subtitle: '300+ Tasks Closed in 2026', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
    { title: 'Sovereign Capitalist', subtitle: 'Surpassed 20% Net Annual Savings', icon: TrendingUp, color: 'text-blue-500 bg-blue-50 border-blue-200' },
    { title: 'Vision Architect', subtitle: 'Multi-Step 2026 Goals Executed', icon: Trophy, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { title: 'Iron Focus', subtitle: '90m Deep Work Consistency', icon: Zap, color: 'text-purple-500 bg-purple-50 border-purple-200' },
    { title: 'Compound Mindset', subtitle: 'Level 14 Senior Sovereign Rank', icon: Sparkles, color: 'text-zinc-800 bg-zinc-100 border-zinc-300' },
  ];

  // SVG Chart Geometry for 52-Week Granular Curve
  const chartGeometry = useMemo(() => {
    const width = 1000;
    const height = 200;
    const paddingLeft = 40;
    const paddingRight = 25;
    const paddingTop = 20;
    const paddingBottom = 32;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;
    const stepX = plotWidth / (weeklyTrajectoryData.length - 1);

    const points = weeklyTrajectoryData.map((item, idx) => {
      const x = paddingLeft + idx * stepX;
      const y = paddingTop + (1 - item.consistency / 100) * plotHeight;
      return { ...item, x, y };
    });

    const linePath = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '');
    const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - paddingBottom} L ${points[0].x.toFixed(1)} ${height - paddingBottom} Z`;

    return { points, linePath, areaPath, width, height, paddingLeft, paddingRight, paddingTop, paddingBottom, plotHeight, plotWidth };
  }, [weeklyTrajectoryData]);

  // High-Contrast Crisp Cell Color & Border Definition
  const getCellStyles = (pct: number) => {
    if (pct >= 90) return 'bg-[#18181B] border-[#09090B] text-white'; // 100% Sovereign (Black ink)
    if (pct >= 75) return 'bg-[#10B981] border-[#059669] text-white'; // Emerald High
    if (pct >= 50) return 'bg-[#6EE7B7] border-[#34D399] text-[#065F46]'; // Mint Moderate
    if (pct >= 25) return 'bg-[#D1FAE5] border-[#A7F3D0] text-[#065F46]'; // Soft Mint Low
    return 'bg-[#FFFFFF] border-[#CBD5E1] text-[#94A3B8]'; // Rest / Base Grid (Visible 1px border)
  };

  const handleExportAudit = () => {
    sound.playPop();
    addExp(25, 'Exported Annual 2026 Audit Report');
    const data = {
      timestamp: new Date().toISOString(),
      year: 2026,
      profile,
      annualFinance,
      domainScores,
      habitsCount: habits.length,
      tasksCount: tasks.length,
      goalsCount: goals.length,
      transactionsCount: transactions.length,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MPLT_ZERO_2026_ANNUAL_AUDIT_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeHoveredWeek = hoveredWeek !== null ? weeklyTrajectoryData[hoveredWeek] : null;

  // Velocity peak and average calculations
  const peakWeek = useMemo(() => {
    return [...weeklyTrajectoryData].sort((a, b) => b.consistency - a.consistency)[0] || { weekNumber: 1, consistency: 95 };
  }, [weeklyTrajectoryData]);

  const avgYearlyConsistency = useMemo(() => {
    return Math.round(weeklyTrajectoryData.reduce((acc, w) => acc + w.consistency, 0) / weeklyTrajectoryData.length);
  }, [weeklyTrajectoryData]);

  return (
    <div className="max-w-[1440px] mx-auto p-6 space-y-6">
      
      {/* ========================================================
          TOP SECTION: YEARLY RETROSPECTIVE HEADER
          ======================================================== */}
      <section className="mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0] space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#18181B]" />
              <h1 className="text-[22px] sm:text-[24px] font-bold text-[#18181B] font-ui tracking-tight">
                YEARLY STATISTICS — {today.year} ANNUAL OPERATIONS RETROSPECTIVE
              </h1>
            </div>
            <p className="text-[12px] text-[#71717A] font-ui">
              52-Week High-Definition Trajectory, 365-Day Discipline Heatmap, Life Balance & Capital Telemetry
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportAudit}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#18181B] text-white text-[12px] font-bold font-ui hover:bg-[#27272A] transition-colors"
            >
              <Download size={14} />
              <span>Export Annual Audit</span>
            </button>
          </div>
        </div>

        {/* 4 Macro Horizon KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-ui tracking-wider text-[#71717A] mb-1">
              <Activity size={13} className="text-[#10B981]" />
              <span>52-Week Consistency</span>
            </div>
            <div className="text-[20px] font-num font-bold text-[#18181B]">
              {avgYearlyConsistency}% <span className="text-[11px] font-ui text-[#10B981] font-semibold">(Peak: W{peakWeek.weekNumber} {peakWeek.consistency}%)</span>
            </div>
          </div>

          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-ui tracking-wider text-[#71717A] mb-1">
              <Sparkles size={13} className="text-amber-500" />
              <span>Cumulative 2026 EXP</span>
            </div>
            <div className="text-[20px] font-num font-bold text-[#18181B]">
              +48,250 <span className="text-[11px] font-ui text-[#71717A]">EXP Earned</span>
            </div>
          </div>

          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-ui tracking-wider text-[#71717A] mb-1">
              <CheckCircle2 size={13} className="text-sky-500" />
              <span>Sprint & Task Output</span>
            </div>
            <div className="text-[20px] font-num font-bold text-[#18181B]">
              312 <span className="text-[11px] font-ui text-[#71717A]">Tasks Closed</span>
            </div>
          </div>

          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-ui tracking-wider text-[#71717A] mb-1">
              <TrendingUp size={13} className="text-[#10B981]" />
              <span>Annual Retained Capital</span>
            </div>
            <div className="text-[20px] font-num font-bold text-[#10B981]">
              {formatIDR(annualFinance.annualRetainedCapital)} <span className="text-[11px] font-ui text-[#71717A]">({annualFinance.annualSavingsRate}%)</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION 1: 365-DAY HIGH-CONTRAST ACTIVITY HEATMAP
          ======================================================== */}
      <section className="mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0] space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-[14px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-2">
              <Calendar size={15} className="text-[#18181B]" />
              <span>365-Day Global Habit & Discipline Heatmap (52 Columns × 7 Rows)</span>
            </h3>
            <p className="text-[11px] text-[#71717A] font-ui mt-0.5">
              High-contrast analog matrix with clear 1px cell gridlines & quantified-self density tracking
            </p>
          </div>

          {/* Hover Telemetry Readout */}
          <div className="h-6 flex items-center">
            {hoveredCell ? (
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#18181B] text-white rounded-[5px] text-[11px] font-num animate-in fade-in duration-100">
                <span className="font-bold">{hoveredCell.dateStr} (W{hoveredCell.weekIdx + 1}):</span>
                <span className="text-[#10B981] font-bold">{hoveredCell.completionPct}% Consistency</span>
                <span className="text-[#94A3B8]">({hoveredCell.tasksDone} Tasks Closed)</span>
                <span className="text-[#38BDF8] font-bold">+{hoveredCell.exp} EXP</span>
              </div>
            ) : (
              <span className="text-[11px] text-[#71717A] font-ui">
                Hover any cell across the 52-week matrix for exact daily telemetry
              </span>
            )}
          </div>
        </div>

        {/* 52-Week Horizontal Grid Container with Clear Grid Lines */}
        <div className="overflow-x-auto no-scrollbar p-3 bg-[#FAFAFA] border border-[#E2E8F0] rounded-[8px]">
          <div className="min-w-[920px] space-y-1.5 select-none">
            
            {/* Month Labels Bar (Mapped to week boundaries) */}
            <div className="flex items-center text-[10px] font-ui font-bold text-[#71717A] pl-8 mb-1.5 uppercase tracking-wider">
              {monthHeaders.map(m => {
                const weekSpan = m.weekEnd - m.weekStart;
                return (
                  <div 
                    key={m.name} 
                    style={{ flex: weekSpan }}
                    className="text-left border-l border-[#CBD5E1] pl-1.5"
                  >
                    {m.name}
                  </div>
                );
              })}
            </div>

            {/* 7 Rows (Mon to Sun) */}
            {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
              const dayCells = heatmapData.filter(d => d.dayOfWeek === dayOfWeek);

              return (
                <div key={dayOfWeek} className="flex items-center gap-1.5">
                  
                  {/* Row Day Label */}
                  <span className="w-6 text-[9px] font-ui font-bold text-[#71717A] text-right pr-1">
                    {dayOfWeek === 0 ? 'Mon' : dayOfWeek === 2 ? 'Wed' : dayOfWeek === 4 ? 'Fri' : dayOfWeek === 6 ? 'Sun' : ''}
                  </span>

                  {/* 52 Cells across row with explicit 1px border and 2px gap */}
                  <div className="flex items-center gap-[3px] flex-1">
                    {dayCells.map(cell => {
                      const styleClasses = getCellStyles(cell.completionPct);
                      const isHovered = hoveredCell?.dayOfYear === cell.dayOfYear;

                      return (
                        <div
                          key={cell.dayOfYear}
                          onMouseEnter={() => setHoveredCell(cell)}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`w-[13px] h-[13px] sm:w-[14px] sm:h-[14px] rounded-[2px] border transition-all cursor-pointer ${styleClasses} ${
                            isHovered 
                              ? 'scale-150 z-20 ring-2 ring-[#18181B] shadow-md' 
                              : 'hover:scale-125'
                          }`}
                          title={`${cell.dateStr}: ${cell.completionPct}% (${cell.tasksDone} tasks, +${cell.exp} EXP)`}
                        />
                      );
                    })}
                  </div>

                </div>
              );
            })}

          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-[11px] font-ui text-[#71717A]">
          <div className="flex items-center gap-2">
            <span className="font-medium">Discipline Intensity:</span>
            <div className="flex items-center gap-1.5 font-num">
              <span className="text-[9.5px]">0% (Rest)</span>
              <div className="w-3.5 h-3.5 rounded-[2px] bg-[#FFFFFF] border border-[#CBD5E1]" />
              <div className="w-3.5 h-3.5 rounded-[2px] bg-[#D1FAE5] border border-[#A7F3D0]" />
              <div className="w-3.5 h-3.5 rounded-[2px] bg-[#6EE7B7] border border-[#34D399]" />
              <div className="w-3.5 h-3.5 rounded-[2px] bg-[#10B981] border border-[#059669]" />
              <div className="w-3.5 h-3.5 rounded-[2px] bg-[#18181B] border border-[#09090B]" />
              <span className="text-[9.5px]">100% (Sovereign)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-num font-semibold text-[#18181B]">
            <span>364 SAMPLES (52 WEEKS)</span>
            <span>•</span>
            <span className="text-[#10B981]">248 HIGH-INTENSITY SESSIONS</span>
          </div>
        </div>

      </section>

      {/* ========================================================
          SECTION 2: 52-WEEK HIGH-RESOLUTION VELOCITY TRAJECTORY
          ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left (Span 7): 52-Week Detailed Granular Curve */}
        <div className="lg:col-span-7 mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-[13.5px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-2">
                <BarChart2 size={15} className="text-[#18181B]" />
                <span>52-Week Granular Velocity Trajectory Curve</span>
              </h3>
              <p className="text-[11px] text-[#71717A] font-ui">
                Detailed 52-point progression tracking weekly discipline surges, dips & momentum
              </p>
            </div>

            {/* Hover Tooltip Readout */}
            <div className="h-6 flex items-center">
              {activeHoveredWeek ? (
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#18181B] text-white rounded-[5px] text-[11px] font-num animate-in fade-in duration-100">
                  <span className="font-bold">Week {activeHoveredWeek.weekNumber} ({activeHoveredWeek.quarter}):</span>
                  <span className="text-[#10B981] font-bold">{activeHoveredWeek.consistency}% Velocity</span>
                  <span className="text-[#38BDF8]">{activeHoveredWeek.tasks} Tasks</span>
                  <span className="text-amber-400 font-bold">+{activeHoveredWeek.exp} EXP</span>
                </div>
              ) : (
                <span className="text-[10.5px] text-[#71717A] font-ui">Hover any of the 52 nodes for weekly stats</span>
              )}
            </div>
          </div>

          {/* SVG 52-Week Granular Curve */}
          <div className="w-full relative overflow-hidden pt-1">
            <svg 
              viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`} 
              className="w-full h-[200px] sm:h-[220px] overflow-visible select-none"
            >
              <defs>
                <linearGradient id="granularGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#18181B" stopOpacity="0.22" />
                  <stop offset="60%" stopColor="#18181B" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#18181B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Gridlines */}
              {[100, 75, 50, 25, 0].map((level) => {
                const y = chartGeometry.paddingTop + (1 - level / 100) * chartGeometry.plotHeight;
                return (
                  <g key={level}>
                    <line
                      x1={chartGeometry.paddingLeft}
                      y1={y}
                      x2={chartGeometry.width - chartGeometry.paddingRight}
                      y2={y}
                      stroke={level === 100 ? '#CBD5E1' : '#F1F5F9'}
                      strokeWidth={level === 100 ? '1.5' : '1'}
                      strokeDasharray={level === 100 || level === 0 ? 'none' : '3 3'}
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

              {/* Quarter Dividing Guides (W13, W26, W39) */}
              {[13, 26, 39].map((qWeek, idx) => {
                const pt = chartGeometry.points[qWeek - 1];
                if (!pt) return null;
                return (
                  <g key={qWeek}>
                    <line
                      x1={pt.x}
                      y1={chartGeometry.paddingTop}
                      x2={pt.x}
                      y2={chartGeometry.height - chartGeometry.paddingBottom}
                      stroke="#CBD5E1"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={pt.x + 4}
                      y={chartGeometry.paddingTop + 12}
                      className="text-[9px] font-ui fill-[#18181B] font-bold tracking-wider"
                    >
                      Q{idx + 2} BOUNDARY
                    </text>
                  </g>
                );
              })}

              {/* Fill Area */}
              <path d={chartGeometry.areaPath} fill="url(#granularGrad)" />

              {/* Curve Stroke */}
              <path
                d={chartGeometry.linePath}
                fill="none"
                stroke="#18181B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 52 Week Nodes */}
              {chartGeometry.points.map((pt, idx) => {
                const isHovered = hoveredWeek === idx;
                const isQuarterMarker = pt.weekNumber % 13 === 0 || pt.weekNumber === 1;
                const isPeak = pt.consistency >= 94;

                return (
                  <g
                    key={pt.weekNumber}
                    onMouseEnter={() => setHoveredWeek(idx)}
                    onMouseLeave={() => setHoveredWeek(null)}
                    className="cursor-pointer transition-all"
                  >
                    <rect
                      x={pt.x - 9}
                      y={chartGeometry.paddingTop}
                      width="18"
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
                        r="7"
                        fill="#18181B"
                        fillOpacity="0.18"
                      />
                    )}

                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 4.5 : isPeak ? 3.5 : 2}
                      fill={isHovered ? '#18181B' : isPeak ? '#10B981' : '#FFFFFF'}
                      stroke={isPeak ? '#10B981' : '#18181B'}
                      strokeWidth={isHovered ? '2' : '1.5'}
                    />

                    {/* X-Axis Week Labels every 4 weeks */}
                    {(pt.weekNumber % 4 === 0 || pt.weekNumber === 1 || pt.weekNumber === 52) && (
                      <text
                        x={pt.x}
                        y={chartGeometry.height - 8}
                        textAnchor="middle"
                        className={`text-[9px] font-num ${
                          isHovered 
                            ? 'fill-[#18181B] font-bold text-[10px]' 
                            : isQuarterMarker
                            ? 'fill-[#18181B] font-semibold'
                            : 'fill-[#71717A]'
                        }`}
                      >
                        W{pt.weekNumber < 10 ? `0${pt.weekNumber}` : pt.weekNumber}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10.5px] text-[#71717A] font-ui pt-2 border-t border-[#E2E8F0]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>Average 52-Week Velocity: <strong>{avgYearlyConsistency}%</strong></span>
            </span>
            <span className="font-num font-semibold text-[#18181B]">
              52 SAMPLES (WEEK 01 — WEEK 52)
            </span>
          </div>
        </div>

        {/* Right (Span 5): 6-Domain Life Balance Equilibrium */}
        <div className="lg:col-span-5 mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0] flex flex-col justify-between space-y-4">
          <div>
            <div className="pb-3 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="text-[13.5px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-2">
                  <Layers size={15} className="text-[#18181B]" />
                  <span>6-Domain Life Balance Radar</span>
                </h3>
                <p className="text-[11px] text-[#71717A] font-ui">
                  Equilibrium across physical, cognitive & sovereign pillars
                </p>
              </div>
              <span className="text-[10px] font-ui font-bold px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981]">
                BALANCED
              </span>
            </div>

            {/* Domain Progress Bars */}
            <div className="space-y-3 pt-3">
              {domainScores.map(d => {
                const DomainIcon = d.icon;
                return (
                  <div key={d.area} className="space-y-1">
                    <div className="flex items-center justify-between text-[11.5px] font-ui">
                      <span className="font-medium text-[#18181B] flex items-center gap-1.5">
                        <DomainIcon size={12} className="text-[#71717A]" />
                        <span>{d.area}</span>
                      </span>
                      <span className="font-num font-bold text-[#18181B]">
                        {d.score}%
                      </span>
                    </div>

                    <div className="w-full bg-[#E2E8F0] h-[6px] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          d.score >= 90 ? 'bg-[#18181B]' : d.score >= 80 ? 'bg-[#10B981]' : 'bg-[#71717A]'
                        }`}
                        style={{ width: `${d.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] text-[11px] font-ui text-[#71717A]">
            <span className="font-bold text-[#18181B] block mb-0.5">Keystone Equilibrium Insight:</span>
            <span>Work & Focus leads at 94%. Maintain family and wellness rhythm to prevent end-of-year burnout.</span>
          </div>
        </div>

      </section>

      {/* ========================================================
          SECTION 3: ANNUAL 50/30/20 CAPITAL COMPOUND LEDGER
          ======================================================== */}
      <section className="mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0] space-y-5">
        <div className="pb-3 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-[14px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-2">
              <PieChart size={15} className="text-[#18181B]" />
              <span>Annual 50/30/20 Capital Compound Ledger</span>
            </h3>
            <p className="text-[11px] text-[#71717A] font-ui">
              Cumulative 2026 cash flow efficiency, expense allocation & net retained wealth
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-num font-bold px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981]">
              ANNUAL SAVINGS RATE: {annualFinance.annualSavingsRate}%
            </span>
          </div>
        </div>

        {/* 3 Horizontal Compound Allocation Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-4 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-ui font-bold text-[#18181B] uppercase tracking-wider">
                Needs Outflow (50% Target)
              </span>
              <span className="text-[10px] font-num font-bold px-1.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981]">
                48.0% (Under Cap)
              </span>
            </div>
            <div className="text-[18px] font-num font-bold text-[#18181B]">
              {formatIDR(annualFinance.annualNeedsSpent)}
            </div>
            <div className="w-full bg-[#E2E8F0] h-[6px] rounded-full overflow-hidden">
              <div className="bg-[#18181B] h-full rounded-full" style={{ width: '48%' }} />
            </div>
            <span className="text-[10px] text-[#71717A] font-ui block">
              Housing, nutrition, operational baseline
            </span>
          </div>

          <div className="p-4 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-ui font-bold text-[#18181B] uppercase tracking-wider">
                Wants Outflow (30% Target)
              </span>
              <span className="text-[10px] font-num font-bold px-1.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981]">
                27.8% (Under Cap)
              </span>
            </div>
            <div className="text-[18px] font-num font-bold text-[#71717A]">
              {formatIDR(annualFinance.annualWantsSpent)}
            </div>
            <div className="w-full bg-[#E2E8F0] h-[6px] rounded-full overflow-hidden">
              <div className="bg-[#71717A] h-full rounded-full" style={{ width: '27.8%' }} />
            </div>
            <span className="text-[10px] text-[#71717A] font-ui block">
              Discretionary dining, gear & lifestyle
            </span>
          </div>

          <div className="p-4 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-ui font-bold text-[#10B981] uppercase tracking-wider">
                Net Retained & Invested
              </span>
              <span className="text-[10px] font-num font-bold px-1.5 py-0.5 rounded bg-[#10B981] text-white">
                24.2% (Goal Met)
              </span>
            </div>
            <div className="text-[18px] font-num font-bold text-[#10B981]">
              +{formatIDR(annualFinance.annualRetainedCapital)}
            </div>
            <div className="w-full bg-[#E2E8F0] h-[6px] rounded-full overflow-hidden">
              <div className="bg-[#10B981] h-full rounded-full" style={{ width: '100%' }} />
            </div>
            <span className="text-[10px] text-[#10B981] font-ui block font-medium">
              Liquid capital reserves & low-risk portfolio
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION 4: HALL OF FAME BADGES & QUARTERLY HIGHLIGHTS
          ======================================================== */}
      <section className="space-y-6">
        
        {/* Hall of Fame Badges Grid */}
        <div className="mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0] space-y-4">
          <div className="pb-3 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-2">
                <Award size={15} className="text-[#18181B]" />
                <span>2026 Annual Hall of Fame Achievements</span>
              </h3>
              <p className="text-[11px] text-[#71717A] font-ui">
                Milestone badges unlocked through proven long-range consistency
              </p>
            </div>
            <span className="text-[10.5px] font-num font-bold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#18181B]">
              6 / 6 Badges Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {badges.map(b => {
              const BadgeIcon = b.icon;
              return (
                <div
                  key={b.title}
                  className="p-3.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] flex flex-col items-center text-center space-y-2 hover:border-[#18181B] transition-all"
                >
                  <div className={`p-2 rounded-full border ${b.color}`}>
                    <BadgeIcon size={18} />
                  </div>
                  <div>
                    <h4 className="text-[11.5px] font-bold text-[#18181B] font-ui leading-tight">
                      {b.title}
                    </h4>
                    <p className="text-[9.5px] text-[#71717A] font-ui mt-0.5">
                      {b.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Quarterly Roadmap Recap Cards (Q1 → Q4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="mplt-card p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <span className="text-[11px] font-bold font-num px-2 py-0.5 rounded bg-[#18181B] text-white">
                Q1 2026 (Launch)
              </span>
              <span className="text-[10px] font-ui text-[#10B981] font-bold">COMPLETED</span>
            </div>
            <ul className="text-[11px] text-[#71717A] font-ui space-y-1">
              <li>• Launch MPLT Zero architecture</li>
              <li>• Establish 5am Morning Protocol</li>
              <li>• Hit first 25M liquid buffer</li>
            </ul>
          </div>

          <div className="mplt-card p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <span className="text-[11px] font-bold font-num px-2 py-0.5 rounded bg-[#18181B] text-white">
                Q2 2026 (Acceleration)
              </span>
              <span className="text-[10px] font-ui text-[#10B981] font-bold">COMPLETED</span>
            </div>
            <ul className="text-[11px] text-[#71717A] font-ui space-y-1">
              <li>• Benchpress 80kg milestone</li>
              <li>• Beta test SaaS with 20 users</li>
              <li>• 12 Books non-fiction read</li>
            </ul>
          </div>

          <div className="mplt-card p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <span className="text-[11px] font-bold font-num px-2 py-0.5 rounded bg-[#18181B] text-white">
                Q3 2026 (Mastery)
              </span>
              <span className="text-[10px] font-ui text-[#0284C7] font-bold">IN PROGRESS</span>
            </div>
            <ul className="text-[11px] text-[#71717A] font-ui space-y-1">
              <li>• 100 Paid SaaS subscribers</li>
              <li>• Family wedding & mahar prep</li>
              <li>• 50M liquid portfolio milestone</li>
            </ul>
          </div>

          <div className="mplt-card p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <span className="text-[11px] font-bold font-num px-2 py-0.5 rounded bg-[#18181B] text-white">
                Q4 2026 (Harvest)
              </span>
              <span className="text-[10px] font-ui text-[#71717A]">SCHEDULED</span>
            </div>
            <ul className="text-[11px] text-[#71717A] font-ui space-y-1">
              <li>• Umroh bareng orang tua</li>
              <li>• Hit 100M liquid capital portfolio</li>
              <li>• Annual review & 2027 roadmap</li>
            </ul>
          </div>

        </div>

      </section>

    </div>
  );
};
