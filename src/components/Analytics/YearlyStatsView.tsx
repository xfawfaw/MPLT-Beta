import React, { useState, useMemo } from 'react';
import { useApp, getUserRankTitle } from '../../context/AppContext';
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
  Zap, 
  Download, 
  PieChart,
  BarChart2,
  Clock,
  Compass,
  CalendarCheck2,
  CheckSquare
} from 'lucide-react';
import { AreaOfLife } from '../../types';
import { sound } from '../../utils/sound';
import { dateUtils } from '../../utils/date';
import { ExpandableTabs } from '../ui/expandable-tabs';

export const YearlyStatsView: React.FC = () => {
  const { profile, habits, tasks, goals, weeklyTasks, transactions, addExp } = useApp();

  const today = useMemo(() => dateUtils.getTodayInfo(), []);
  
  // Heatmap Pivot Mode: 'habits' | 'tasks' | 'exp' | 'finance'
  const [heatmapMode, setHeatmapMode] = useState<'habits' | 'tasks' | 'exp' | 'finance'>('habits');

  const [hoveredCell, setHoveredCell] = useState<{
    dateStr: string;
    dayOfYear: number;
    weekIdx: number;
    value: number;
    unit: string;
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

  // Completed Tasks Count
  const completedTasksCount = useMemo(() => {
    return tasks.filter(t => t.status === 'Completed').length + weeklyTasks.filter(t => t.isCompleted).length;
  }, [tasks, weeklyTasks]);

  // Generate 365 Days Grid Data (52 weeks x 7 days) tied to multi-metric state
  const heatmapData = useMemo(() => {
    const days = [];
    const startDate = new Date(today.year, 0, 1);
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let dayIdx = 0; dayIdx < 364; dayIdx++) { // 52 full weeks = 364 days
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + dayIdx);
      
      const monthIdx = currentDate.getMonth();
      const dateNum = currentDate.getDate();
      const dayOfWeek = (currentDate.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
      const weekIdx = Math.floor(dayIdx / 7);

      let habitPct = 0;
      let tasksDone = 0;
      let dayExp = 0;
      let dayOutflow = 0;

      // Authentic habit logs for current tracking
      if (monthIdx === today.monthIndex && habits.length > 0) {
        const doneHabits = habits.filter(h => !!h.logs[dateNum]);
        if (doneHabits.length > 0) {
          habitPct = Math.round((doneHabits.length / habits.length) * 100);
          tasksDone = doneHabits.length;
          dayExp = doneHabits.reduce((acc, h) => acc + h.expReward, 0);
        }
      }

      // Authentic transaction dates if matching
      const matchingTxs = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate.getFullYear() === today.year && txDate.getMonth() === monthIdx && txDate.getDate() === dateNum;
      });
      if (matchingTxs.length > 0) {
        dayOutflow = matchingTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      }

      // Format date string
      const dateStr = `${dateNum} ${monthsShort[monthIdx]} ${today.year}`;

      // Calculate active display value based on heatmapMode
      let displayValue = 0;
      let unit = '%';
      if (heatmapMode === 'habits') {
        displayValue = habitPct;
        unit = '%';
      } else if (heatmapMode === 'tasks') {
        displayValue = tasksDone;
        unit = ' tasks';
      } else if (heatmapMode === 'exp') {
        displayValue = dayExp;
        unit = ' EXP';
      } else if (heatmapMode === 'finance') {
        displayValue = dayOutflow;
        unit = ' IDR';
      }

      days.push({
        dayOfYear: dayIdx + 1,
        dateStr,
        monthIdx,
        dateNum,
        dayOfWeek,
        weekIdx,
        habitPct,
        tasksDone,
        dayExp,
        exp: dayExp,
        dayOutflow,
        value: displayValue,
        unit,
      });
    }
    return days;
  }, [habits, transactions, today, heatmapMode]);

  // Day-of-Week Operational Rhythm (Mon-Sun Efficiency Profile)
  const dayOfWeekRhythm = useMemo(() => {
    const daysLabel = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return daysLabel.map((label, idx) => {
      const matchingCells = heatmapData.filter(d => d.dayOfWeek === idx && d.monthIdx === today.monthIndex);
      const avgScore = matchingCells.length > 0
        ? Math.round(matchingCells.reduce((acc, d) => acc + d.habitPct, 0) / matchingCells.length)
        : 0;
      const totalExp = matchingCells.reduce((acc, d) => acc + d.dayExp, 0);
      const totalTasks = matchingCells.reduce((acc, d) => acc + d.tasksDone, 0);

      return {
        dayIndex: idx,
        label,
        avgScore,
        totalExp,
        totalTasks,
      };
    });
  }, [heatmapData, today.monthIndex]);

  const peakDay = useMemo(() => {
    return [...dayOfWeekRhythm].sort((a, b) => b.avgScore - a.avgScore)[0] || dayOfWeekRhythm[1];
  }, [dayOfWeekRhythm]);

  // 52-Week Granular Trajectory Curve with 4-Week Simple Moving Average (SMA)
  const weeklyTrajectoryData = useMemo(() => {
    const rawWeeks = [];
    for (let w = 0; w < 52; w++) {
      const weekDays = heatmapData.filter(d => d.weekIdx === w);
      const avgConsistency = weekDays.length > 0
        ? Math.round(weekDays.reduce((acc, d) => acc + d.habitPct, 0) / weekDays.length)
        : 0;

      const weekNumber = w + 1;
      const quarter = weekNumber <= 13 ? 'Q1' : weekNumber <= 26 ? 'Q2' : weekNumber <= 39 ? 'Q3' : 'Q4';
      const totalTasks = weekDays.reduce((acc, d) => acc + d.tasksDone, 0);
      const totalExp = weekDays.reduce((acc, d) => acc + d.dayExp, 0);

      const firstDay = weekDays[0];
      const lastDay = weekDays[weekDays.length - 1];
      const rangeLabel = firstDay && lastDay ? `${firstDay.dateStr.split(' ')[0]} ${firstDay.dateStr.split(' ')[1]} — ${lastDay.dateStr.split(' ')[0]} ${lastDay.dateStr.split(' ')[1]}` : `Week ${weekNumber}`;

      rawWeeks.push({
        weekNumber,
        quarter,
        consistency: avgConsistency,
        tasks: totalTasks,
        exp: totalExp,
        rangeLabel,
      });
    }

    // Add 4-Week Rolling Moving Average
    return rawWeeks.map((week, idx, arr) => {
      const windowStart = Math.max(0, idx - 3);
      const windowSlice = arr.slice(windowStart, idx + 1);
      const sma = Math.round(windowSlice.reduce((acc, item) => acc + item.consistency, 0) / windowSlice.length);
      return {
        ...week,
        sma,
      };
    });
  }, [heatmapData]);

  // 6-Domain Life Balance Authentic Scores
  const domainScores = useMemo(() => {
    const domainConfigs: { area: AreaOfLife; icon: any; color: string; desc: string }[] = [
      { area: 'Work', icon: Briefcase, color: '#0284C7', desc: 'Sprint & Execution' },
      { area: 'Health', icon: ShieldCheck, color: '#10B981', desc: 'Vitality & Physical Rhythm' },
      { area: 'Money', icon: DollarSign, color: '#F59E0B', desc: 'Capital & Savings Rate' },
      { area: 'Personal Growth', icon: BookOpen, color: '#6366F1', desc: 'Deep Learning & Compounding' },
      { area: 'Spirituality', icon: Moon, color: '#8B5CF6', desc: 'Mindfulness & Anchors' },
      { area: 'Family', icon: HeartHandshake, color: '#F43F5E', desc: 'Kinship & Social Bonds' },
    ];

    return domainConfigs.map(cfg => {
      const dHabits = habits.filter(h => h.category === cfg.area);
      const totalLogs = dHabits.reduce((acc, h) => acc + Object.values(h.logs).filter(Boolean).length, 0);
      const possibleLogs = Math.max(1, dHabits.length * 28);
      const habitScore = dHabits.length > 0 ? Math.round((totalLogs / possibleLogs) * 100) : 0;

      const dTasks = tasks.filter(t => t.category === cfg.area);
      const completedTasks = dTasks.filter(t => t.status === 'Completed').length;
      const taskScore = dTasks.length > 0 ? Math.round((completedTasks / dTasks.length) * 100) : 0;

      const dGoals = goals.filter(g => g.areaOfLife === cfg.area);
      const goalsScore = dGoals.length > 0
        ? Math.round(dGoals.reduce((acc, g) => acc + g.progressPercent, 0) / dGoals.length)
        : 0;

      const activeDimensions: { score: number; weight: number }[] = [];
      if (dHabits.length > 0) activeDimensions.push({ score: habitScore, weight: 0.4 });
      if (dTasks.length > 0) activeDimensions.push({ score: taskScore, weight: 0.3 });
      if (dGoals.length > 0) activeDimensions.push({ score: goalsScore, weight: 0.3 });

      let dynamicScore = 0;
      if (activeDimensions.length > 0) {
        const totalW = activeDimensions.reduce((acc, a) => acc + a.weight, 0);
        dynamicScore = Math.round(activeDimensions.reduce((acc, a) => acc + (a.score * a.weight), 0) / totalW);
      }

      return {
        ...cfg,
        score: dynamicScore,
        habitsCount: dHabits.length,
        tasksCount: dTasks.length,
        goalsCount: dGoals.length,
      };
    });
  }, [habits, tasks, goals]);

  // True 6-Axis Polygonal Radar Geometry
  const radarGeometry = useMemo(() => {
    const size = 260;
    const center = size / 2;
    const radius = 95;
    const angleStep = (Math.PI * 2) / 6;

    // Outer polygon points (100% boundary)
    const outerPoints = Array.from({ length: 6 }).map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      };
    });

    // Ring levels (25%, 50%, 75%)
    const rings = [0.25, 0.5, 0.75, 1.0].map(scale => {
      return Array.from({ length: 6 }).map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return {
          x: center + radius * scale * Math.cos(angle),
          y: center + radius * scale * Math.sin(angle),
        };
      });
    });

    // Actual Data polygon points
    const dataPoints = domainScores.map((d, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const normalizedScore = Math.max(0.1, d.score / 100);
      return {
        ...d,
        x: center + radius * normalizedScore * Math.cos(angle),
        y: center + radius * normalizedScore * Math.sin(angle),
        labelX: center + (radius + 24) * Math.cos(angle),
        labelY: center + (radius + 20) * Math.sin(angle),
      };
    });

    const dataPolygonPath = dataPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '') + ' Z';

    return { size, center, radius, outerPoints, rings, dataPoints, dataPolygonPath };
  }, [domainScores]);

  // Annual Financial Ledger Aggregate
  const annualFinance = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const needsSpent = transactions.filter(t => t.type === 'expense' && t.bucket === 'Needs').reduce((acc, t) => acc + t.amount, 0);
    const wantsSpent = transactions.filter(t => t.type === 'expense' && t.bucket === 'Wants').reduce((acc, t) => acc + t.amount, 0);
    const annualNeedsSpent = needsSpent;
    const annualWantsSpent = wantsSpent;
    const annualRetainedCapital = Math.max(0, totalIncome - (needsSpent + wantsSpent));
    const annualSavingsRate = totalIncome > 0 ? Math.round((annualRetainedCapital / totalIncome) * 100) : 0;

    // 12-Month distribution
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyBreakdown = monthsShort.map((m, idx) => {
      const monthTxs = transactions.filter(t => new Date(t.date).getMonth() === idx);
      const inc = monthTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const exp = monthTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      const retained = Math.max(0, inc - exp);
      return {
        month: m,
        income: inc,
        expense: exp,
        retained,
        active: idx === today.monthIndex,
      };
    });

    return {
      annualIncome: totalIncome,
      annualNeedsSpent,
      annualWantsSpent,
      annualRetainedCapital,
      annualSavingsRate,
      monthlyBreakdown,
    };
  }, [transactions, today.monthIndex]);

  // 4-Quarter Benchmark Matrix
  const quarterlyBenchmarks = useMemo(() => {
    return (['Q1', 'Q2', 'Q3', 'Q4'] as const).map(q => {
      const qNum = q === 'Q1' ? 1 : q === 'Q2' ? 2 : q === 'Q3' ? 3 : 4;
      const quarterWeeks = weeklyTrajectoryData.filter(w => w.quarter === q);
      const avgVelocity = quarterWeeks.length > 0
        ? Math.round(quarterWeeks.reduce((acc, w) => acc + w.consistency, 0) / quarterWeeks.length)
        : 0;
      const quarterExp = quarterWeeks.reduce((acc, w) => acc + w.exp, 0);
      const quarterTasks = quarterWeeks.reduce((acc, w) => acc + w.tasks, 0);

      const quarterGoals = goals.filter(g => g.quarterTarget === q);
      const completedGoals = quarterGoals.filter(g => g.status === 'Achieved').length;

      const currentQuarter = today.monthIndex < 3 ? 'Q1' : today.monthIndex < 6 ? 'Q2' : today.monthIndex < 9 ? 'Q3' : 'Q4';
      const status = q === currentQuarter ? 'In Progress' : qNum < (currentQuarter === 'Q1' ? 1 : currentQuarter === 'Q2' ? 2 : currentQuarter === 'Q3' ? 3 : 4) ? 'Completed' : 'Scheduled';

      const strategyTitles: Record<string, string> = {
        'Q1': 'Launch & Foundation',
        'Q2': 'Acceleration & Traction',
        'Q3': 'Mastery & Expansion',
        'Q4': 'Harvest & Compounding',
      };

      return {
        quarter: q,
        title: strategyTitles[q],
        velocity: avgVelocity,
        exp: quarterExp,
        tasks: quarterTasks,
        goalsTotal: quarterGoals.length,
        goalsDone: completedGoals,
        status,
        isCurrent: q === currentQuarter,
      };
    });
  }, [weeklyTrajectoryData, goals, today.monthIndex]);

  // Hall of Fame Badges
  const badges = useMemo(() => [
    { 
      title: 'Centurion Streak', 
      subtitle: `${profile.streakDays} / 100 Days Unbroken`, 
      icon: Flame, 
      unlocked: profile.streakDays >= 100,
      color: profile.streakDays >= 100 ? 'text-orange-500 bg-orange-50 border-orange-200' : 'text-zinc-400 bg-zinc-50 border-zinc-200 opacity-60' 
    },
    { 
      title: 'Master Executor', 
      subtitle: `${completedTasksCount} / 300 Tasks Closed`, 
      icon: CheckCircle2, 
      unlocked: completedTasksCount >= 300,
      color: completedTasksCount >= 300 ? 'text-emerald-500 bg-emerald-50 border-emerald-200' : 'text-zinc-400 bg-zinc-50 border-zinc-200 opacity-60' 
    },
    { 
      title: 'Sovereign Capitalist', 
      subtitle: `${annualFinance.annualSavingsRate}% Net Savings Rate`, 
      icon: TrendingUp, 
      unlocked: annualFinance.annualSavingsRate >= 20,
      color: annualFinance.annualSavingsRate >= 20 ? 'text-blue-500 bg-blue-50 border-blue-200' : 'text-zinc-400 bg-zinc-50 border-zinc-200 opacity-60' 
    },
    { 
      title: 'Vision Architect', 
      subtitle: `${goals.filter(g => g.status === 'Achieved').length} / ${goals.length || 0} Goals Achieved`, 
      icon: Trophy, 
      unlocked: goals.length > 0 && goals.some(g => g.status === 'Achieved'),
      color: goals.some(g => g.status === 'Achieved') ? 'text-amber-500 bg-amber-50 border-amber-200' : 'text-zinc-400 bg-zinc-50 border-zinc-200 opacity-60' 
    },
    { 
      title: 'Iron Focus', 
      subtitle: `${habits.filter(h => Object.values(h.logs).filter(Boolean).length > 0).length} Active Routines`, 
      icon: Zap, 
      unlocked: habits.some(h => Object.values(h.logs).filter(Boolean).length > 0),
      color: habits.some(h => Object.values(h.logs).filter(Boolean).length > 0) ? 'text-purple-500 bg-purple-50 border-purple-200' : 'text-zinc-400 bg-zinc-50 border-zinc-200 opacity-60' 
    },
    { 
      title: 'Compound Mindset', 
      subtitle: `LVL ${profile.level} • ${getUserRankTitle(profile.level)}`, 
      icon: Sparkles, 
      unlocked: profile.level >= 10,
      color: profile.level >= 10 ? 'text-zinc-800 bg-zinc-100 border-zinc-300' : 'text-zinc-400 bg-zinc-50 border-zinc-200 opacity-60' 
    },
  ], [profile, completedTasksCount, annualFinance, goals, habits]);

  // SVG Chart Geometry for 52-Week Granular Curve
  const chartGeometry = useMemo(() => {
    const width = 1000;
    const height = 250;
    const paddingLeft = 40;
    const paddingRight = 25;
    const paddingTop = 22;
    const paddingBottom = 34;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;
    const stepX = plotWidth / (weeklyTrajectoryData.length - 1);

    const points = weeklyTrajectoryData.map((item, idx) => {
      const x = paddingLeft + idx * stepX;
      const y = paddingTop + (1 - item.consistency / 100) * plotHeight;
      const smaY = paddingTop + (1 - item.sma / 100) * plotHeight;
      return { ...item, x, y, smaY };
    });

    const linePath = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '');
    const smaLinePath = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.smaY.toFixed(1)}`, '');
    const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - paddingBottom} L ${points[0].x.toFixed(1)} ${height - paddingBottom} Z`;

    return { points, linePath, smaLinePath, areaPath, width, height, paddingLeft, paddingRight, paddingTop, paddingBottom, plotHeight, plotWidth };
  }, [weeklyTrajectoryData]);

  // Cell Styles based on active Heatmap mode
  const getCellStyles = (cell: typeof heatmapData[0]) => {
    if (heatmapMode === 'habits') {
      const pct = cell.habitPct;
      if (pct >= 90) return 'bg-[#18181B] border-[#09090B] text-white';
      if (pct >= 75) return 'bg-[#10B981] border-[#059669] text-white';
      if (pct >= 50) return 'bg-[#6EE7B7] border-[#34D399] text-[#065F46]';
      if (pct >= 25) return 'bg-[#D1FAE5] border-[#A7F3D0] text-[#065F46]';
      return 'bg-[#FFFFFF] border-[#CBD5E1] text-[#94A3B8]';
    } else if (heatmapMode === 'tasks') {
      if (cell.tasksDone >= 5) return 'bg-[#18181B] border-[#09090B]';
      if (cell.tasksDone >= 3) return 'bg-[#0284C7] border-[#0369A1]';
      if (cell.tasksDone >= 1) return 'bg-[#BAE6FD] border-[#7DD3FC]';
      return 'bg-[#FFFFFF] border-[#CBD5E1]';
    } else if (heatmapMode === 'exp') {
      if (cell.dayExp >= 150) return 'bg-[#F59E0B] border-[#D97706]';
      if (cell.dayExp >= 75) return 'bg-[#FCD34D] border-[#FBBF24]';
      if (cell.dayExp > 0) return 'bg-[#FEF3C7] border-[#FDE68A]';
      return 'bg-[#FFFFFF] border-[#CBD5E1]';
    } else {
      if (cell.dayOutflow > 500000) return 'bg-[#E11D48] border-[#BE123C]';
      if (cell.dayOutflow > 100000) return 'bg-[#FDA4AF] border-[#FB7185]';
      if (cell.dayOutflow > 0) return 'bg-[#FFE4E6] border-[#FECDD3]';
      return 'bg-[#FFFFFF] border-[#CBD5E1]';
    }
  };

  const handleExportAudit = () => {
    sound.playPop();
    addExp(25, 'Exported Annual 2026 Audit Report');
    const data = {
      timestamp: new Date().toISOString(),
      year: today.year,
      profile,
      annualFinance,
      domainScores,
      quarterlyBenchmarks,
      habitsCount: habits.length,
      tasksCount: tasks.length,
      goalsCount: goals.length,
      transactionsCount: transactions.length,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MPLT_ZERO_${today.year}_ANNUAL_AUDIT_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeHoveredWeek = hoveredWeek !== null ? weeklyTrajectoryData[hoveredWeek] : null;

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
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
              <h1 className="text-[22px] sm:text-[24px] font-bold text-[#18181B] font-ui tracking-tight uppercase">
                {today.year} ANNUAL OPERATIONS & EXECUTIVE RETROSPECTIVE
              </h1>
            </div>
            <p className="text-[12px] text-[#71717A] font-ui">
              52-Week Moving Trajectory, 365-Day Discipline Heatmap, 6-Axis Polygonal Radar & 50/30/20 Capital Compound Matrix
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportAudit}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#18181B] text-white text-[12px] font-bold font-ui hover:bg-[#27272A] transition-colors shadow-xs"
            >
              <Download size={14} />
              <span>Export Annual Audit (.JSON)</span>
            </button>
          </div>
        </div>

        {/* 4 Macro Horizon KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          <div className="p-3.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <div className="flex items-center justify-between text-[10px] uppercase font-ui tracking-wider text-[#71717A] mb-1">
              <span className="flex items-center gap-1.5">
                <Activity size={13} className="text-[#10B981]" />
                52-Week Consistency
              </span>
              <span className="text-[9.5px] font-num font-bold text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.2 rounded">Peak W{peakWeek.weekNumber}</span>
            </div>
            <div className="text-[20px] font-num font-bold text-[#18181B]">
              {avgYearlyConsistency}% <span className="text-[11px] font-ui text-[#71717A] font-normal">(Avg Velocity)</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <div className="flex items-center justify-between text-[10px] uppercase font-ui tracking-wider text-[#71717A] mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500" />
                Cumulative {today.year} EXP
              </span>
              <span className="text-[9.5px] font-num font-bold text-[#18181B] bg-white border border-[#E2E8F0] px-1.5 py-0.2 rounded">LVL {profile.level}</span>
            </div>
            <div className="text-[20px] font-num font-bold text-[#18181B]">
              +{profile.currentExp.toLocaleString('id-ID')} <span className="text-[11px] font-ui text-[#71717A]">EXP Earned</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <div className="flex items-center justify-between text-[10px] uppercase font-ui tracking-wider text-[#71717A] mb-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-sky-500" />
                Tasks & Sprint Output
              </span>
              <span className="text-[9.5px] font-num font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded">Optimal</span>
            </div>
            <div className="text-[20px] font-num font-bold text-[#18181B]">
              {completedTasksCount} <span className="text-[11px] font-ui text-[#71717A]">Tasks Closed</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <div className="flex items-center justify-between text-[10px] uppercase font-ui tracking-wider text-[#71717A] mb-1">
              <span className="flex items-center gap-1.5">
                <TrendingUp size={13} className="text-[#10B981]" />
                Annual Retained Capital
              </span>
              <span className="text-[9.5px] font-num font-bold text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.2 rounded">{annualFinance.annualSavingsRate}% Saved</span>
            </div>
            <div className="text-[20px] font-num font-bold text-[#10B981]">
              {formatIDR(annualFinance.annualRetainedCapital)}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION 1: 365-DAY INTERACTIVE MULTI-PIVOT HEATMAP & RHYTHM
          ======================================================== */}
      <section className="mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0] space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-[14px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-2">
              <Calendar size={15} className="text-[#18181B]" />
              <span>365-Day Operations & Discipline Matrix (52 Columns × 7 Rows)</span>
            </h3>
            <p className="text-[11px] text-[#71717A] font-ui mt-0.5">
              High-definition density grid with dynamic multi-metric analytics and weekday operational rhythm
            </p>
          </div>

          {/* Segmented Switcher via ExpandableTabs */}
          <ExpandableTabs
            size="sm"
            tabs={[
              { id: 'habits', title: 'Habit Consistency', icon: CalendarCheck2 },
              { id: 'tasks', title: 'Task Volume', icon: CheckSquare },
              { id: 'exp', title: 'EXP Density', icon: Sparkles },
              { id: 'finance', title: 'Capital Outflow', icon: DollarSign },
            ]}
            selectedIndex={heatmapMode === 'habits' ? 0 : heatmapMode === 'tasks' ? 1 : heatmapMode === 'exp' ? 2 : 3}
            activeBgColor="bg-[#18181B]"
            activeColor="text-white"
            className="bg-[#F9FAFB] border-[#E2E8F0] rounded-[8px]"
            onChange={(idx) => {
              sound.playClick();
              if (idx === 0) setHeatmapMode('habits');
              else if (idx === 1) setHeatmapMode('tasks');
              else if (idx === 2) setHeatmapMode('exp');
              else if (idx === 3) setHeatmapMode('finance');
            }}
          />
        </div>

        {/* 2-Column: 52-Week Expanded Grid (Span 10) & Tiny Weekday Rhythm (Span 2) with Equal Height */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          {/* 52-Week Horizontal Grid Container (10 Cols) - Dominant & Spacious */}
          <div className="lg:col-span-10 overflow-x-auto no-scrollbar p-4 bg-[#FAFAFA] border border-[#E2E8F0] rounded-[8px] flex flex-col justify-between">
            <div className="min-w-[820px] space-y-2 select-none">
              
              {/* Month Labels Bar */}
              <div className="flex items-center text-[10.5px] font-ui font-bold text-[#71717A] pl-9 mb-2 uppercase tracking-wider">
                {monthHeaders.map(m => {
                  const weekSpan = m.weekEnd - m.weekStart;
                  return (
                    <div 
                      key={m.name} 
                      style={{ flex: weekSpan }}
                      className="text-left border-l border-[#CBD5E1] pl-2"
                    >
                      {m.name}
                    </div>
                  );
                })}
              </div>

              {/* 7 Rows (Mon to Sun) with Enlarged Cells */}
              {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
                const dayCells = heatmapData.filter(d => d.dayOfWeek === dayOfWeek);

                return (
                  <div key={dayOfWeek} className="flex items-center gap-2">
                    
                    {/* Row Day Label */}
                    <span className="w-7 text-[9.5px] font-ui font-bold text-[#71717A] text-right pr-1">
                      {dayOfWeek === 0 ? 'Mon' : dayOfWeek === 1 ? 'Tue' : dayOfWeek === 2 ? 'Wed' : dayOfWeek === 3 ? 'Thu' : dayOfWeek === 4 ? 'Fri' : dayOfWeek === 5 ? 'Sat' : 'Sun'}
                    </span>

                    {/* 52 Enlarged Cells across row */}
                    <div className="flex items-center gap-[3.5px] sm:gap-[4px] flex-1">
                      {dayCells.map(cell => {
                        const styleClasses = getCellStyles(cell);
                        const isHovered = hoveredCell?.dayOfYear === cell.dayOfYear;

                        return (
                          <div
                            key={cell.dayOfYear}
                            onMouseEnter={() => setHoveredCell({
                              dateStr: cell.dateStr,
                              dayOfYear: cell.dayOfYear,
                              weekIdx: cell.weekIdx,
                              value: cell.value,
                              unit: cell.unit,
                              tasksDone: cell.tasksDone,
                              exp: cell.dayExp,
                            })}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`w-[13px] h-[13px] sm:w-[14.5px] sm:h-[14.5px] md:w-[15px] md:h-[15px] rounded-[3px] border transition-all cursor-pointer ${styleClasses} ${
                              isHovered 
                                ? 'scale-150 z-30 ring-2 ring-[#18181B] shadow-md' 
                                : 'hover:scale-125'
                            }`}
                          />
                        );
                      })}
                    </div>

                  </div>
                );
              })}

            </div>

            {/* Hover Telemetry Readout Below Grid */}
            <div className="pt-3.5 mt-3 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-[11px]">
              <div className="flex items-center gap-2 text-[#71717A] font-ui">
                {hoveredCell ? (
                  <div className="inline-flex items-center gap-2.5 font-num text-[#18181B]">
                    <span className="font-bold bg-[#18181B] text-white px-2 py-0.5 rounded-[4px] text-[10px]">
                      W{hoveredCell.weekIdx + 1}
                    </span>
                    <span className="font-bold">{hoveredCell.dateStr}:</span>
                    <span className="text-[#10B981] font-bold">
                      {heatmapMode === 'finance' ? formatIDR(hoveredCell.value) : `${hoveredCell.value}${hoveredCell.unit}`}
                    </span>
                    <span className="text-[#71717A] text-[10px]">
                      ({hoveredCell.tasksDone} tasks done, +{hoveredCell.exp} EXP generated)
                    </span>
                  </div>
                ) : (
                  <span>Hover any cell to inspect timestamped telemetry & operations</span>
                )}
              </div>

              {/* Dynamic Legend */}
              <div className="flex items-center gap-2 font-num text-[10px] text-[#71717A]">
                <span>Low</span>
                <div className="w-3.5 h-3.5 rounded-[3px] bg-[#FFFFFF] border border-[#CBD5E1]" />
                <div className="w-3.5 h-3.5 rounded-[3px] bg-[#D1FAE5] border border-[#A7F3D0]" />
                <div className="w-3.5 h-3.5 rounded-[3px] bg-[#6EE7B7] border border-[#34D399]" />
                <div className="w-3.5 h-3.5 rounded-[3px] bg-[#10B981] border border-[#059669]" />
                <div className="w-3.5 h-3.5 rounded-[3px] bg-[#18181B] border border-[#09090B]" />
                <span>Max</span>
              </div>
            </div>

          </div>

          {/* Tiny Weekday Operational Rhythm Sidebar (2 Cols) - Compact & Clean */}
          <div className="lg:col-span-2 p-3 bg-[#FAFAFA] border border-[#E2E8F0] rounded-[8px] flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#E2E8F0]">
                <span className="text-[10.5px] font-ui font-bold text-[#18181B] flex items-center gap-1">
                  <Clock size={11} className="text-[#10B981]" />
                  <span>Weekday Rhythm</span>
                </span>
                <span className="text-[8.5px] font-num font-bold text-[#10B981] bg-[#10B981]/10 px-1 py-0.2 rounded">
                  {peakDay.label} ★
                </span>
              </div>

              <div className="space-y-1.5">
                {dayOfWeekRhythm.map(d => {
                  const isPeak = d.label === peakDay.label;
                  return (
                    <div key={d.label} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[9px] font-ui">
                        <span className={`font-semibold ${isPeak ? 'text-[#10B981]' : 'text-[#71717A]'}`}>
                          {d.label} {isPeak && '★'}
                        </span>
                        <span className="font-num font-bold text-[#18181B]">{d.avgScore}%</span>
                      </div>
                      <div className="w-full bg-[#E2E8F0] h-[3.5px] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isPeak ? 'bg-[#10B981]' : d.avgScore >= 50 ? 'bg-[#18181B]' : 'bg-[#94A3B8]'
                          }`}
                          style={{ width: `${d.avgScore}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-1.5 rounded-[4px] bg-white border border-[#E2E8F0] text-[8.5px] text-[#71717A] font-ui text-center leading-tight">
              Peak: <strong className="text-[#18181B]">{peakDay.label}</strong> (+{peakDay.totalExp} EXP)
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================
          SECTION 2: 52-WEEK MOVING TRAJECTORY & 6-AXIS RADAR
          ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left (Span 7): 52-Week Detailed Granular Curve with 4-Week SMA */}
        <div className="lg:col-span-7 mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-[13.5px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 size={15} className="text-[#18181B]" />
                  <span>52-Week Velocity Trajectory & 4-Week Moving Average</span>
                </h3>
                <p className="text-[11px] text-[#71717A] font-ui">
                  52-point granular velocity curve mapped with 4-week smoothed trendline
                </p>
              </div>

              {/* Hover Tooltip Readout */}
              <div className="h-6 flex items-center">
                {activeHoveredWeek ? (
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#18181B] text-white rounded-[5px] text-[11px] font-num animate-in fade-in duration-100">
                    <span className="font-bold">Week {activeHoveredWeek.weekNumber} ({activeHoveredWeek.quarter}):</span>
                    <span className="text-[#10B981] font-bold">{activeHoveredWeek.consistency}% Velocity</span>
                    <span className="text-[#38BDF8]">SMA: {activeHoveredWeek.sma}%</span>
                    <span className="text-amber-400 font-bold">+{activeHoveredWeek.exp} EXP</span>
                  </div>
                ) : (
                  <span className="text-[10.5px] text-[#71717A] font-ui">Hover any of the 52 nodes for weekly stats</span>
                )}
              </div>
            </div>

            {/* SVG 52-Week Granular Curve - Expanded Size */}
            <div className="w-full relative overflow-hidden pt-2">
              <svg 
                viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`} 
                className="w-full h-[240px] sm:h-[260px] overflow-visible select-none"
              >
                <defs>
                  <linearGradient id="granularGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#18181B" stopOpacity="0.20" />
                    <stop offset="60%" stopColor="#18181B" stopOpacity="0.05" />
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

                {/* 4-Week Simple Moving Average Line (Emerald Dashed) */}
                <path
                  d={chartGeometry.smaLinePath}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="1.8"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                />

                {/* Primary Curve Stroke */}
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
          </div>

          <div className="flex items-center justify-between text-[10.5px] text-[#71717A] font-ui pt-3 border-t border-[#E2E8F0]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-[2px] bg-[#18181B]" />
                <span>Weekly Trajectory</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-[2px] bg-[#10B981] border-b border-dashed border-[#10B981]" />
                <span className="text-[#10B981] font-semibold">4-Week Moving Avg (SMA)</span>
              </span>
            </div>
            <span className="font-num font-semibold text-[#18181B]">
              52 NODES • AVG {avgYearlyConsistency}%
            </span>
          </div>
        </div>

        {/* Right (Span 5): True 6-Axis Polygonal Radar Chart */}
        <div className="lg:col-span-5 mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0] flex flex-col justify-between space-y-4">
          <div>
            <div className="pb-3 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="text-[13.5px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-2">
                  <Compass size={15} className="text-[#18181B]" />
                  <span>6-Axis Polygonal Life Radar</span>
                </h3>
                <p className="text-[11px] text-[#71717A] font-ui">
                  Real geometric balance across 6 sovereign life pillars
                </p>
              </div>
              <span className="text-[10px] font-ui font-bold px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981]">
                EQUILIBRIUM
              </span>
            </div>

            {/* SVG 6-Axis Polygonal Radar Canvas */}
            <div className="w-full flex items-center justify-center py-4 relative">
              <svg 
                viewBox={`0 0 ${radarGeometry.size} ${radarGeometry.size}`} 
                className="w-[250px] h-[250px] overflow-visible select-none"
              >
                {/* Concentric Guide Rings */}
                {radarGeometry.rings.map((ring, idx) => {
                  const ringPath = ring.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '') + ' Z';
                  return (
                    <path
                      key={idx}
                      d={ringPath}
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="1"
                      strokeDasharray={idx === 3 ? 'none' : '2 2'}
                    />
                  );
                })}

                {/* 6 Radiating Axes */}
                {radarGeometry.outerPoints.map((pt, idx) => (
                  <line
                    key={idx}
                    x1={radarGeometry.center}
                    y1={radarGeometry.center}
                    x2={pt.x}
                    y2={pt.y}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                  />
                ))}

                {/* Data Polygon Fill & Stroke */}
                <path
                  d={radarGeometry.dataPolygonPath}
                  fill="#10B981"
                  fillOpacity="0.18"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                {/* Vertex Points & Labels */}
                {radarGeometry.dataPoints.map((pt, idx) => {
                  return (
                    <g key={idx}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4"
                        fill="#18181B"
                        stroke="#10B981"
                        strokeWidth="1.5"
                      />
                      <text
                        x={pt.labelX}
                        y={pt.labelY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[9.5px] font-ui fill-[#18181B] font-bold"
                      >
                        {pt.area.split(' ')[0]} ({pt.score}%)
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* 6 Domain Score Chips */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {domainScores.map(d => (
                <div key={d.area} className="p-2 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[6px] text-center">
                  <div className="text-[9px] text-[#71717A] uppercase font-ui truncate font-semibold">{d.area}</div>
                  <div className="text-[12px] font-bold font-num text-[#18181B] mt-0.5">{d.score}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* ========================================================
          SECTION 3: ANNUAL 50/30/20 CAPITAL & 12-MONTH TRAJECTORY
          ======================================================== */}
      <section className="mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0] space-y-5">
        <div className="pb-3 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-[14px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-2">
              <PieChart size={15} className="text-[#18181B]" />
              <span>Annual 50/30/20 Capital Compound Ledger & Cashflow Trajectory</span>
            </h3>
            <p className="text-[11px] text-[#71717A] font-ui">
              Cumulative {today.year} cash flow efficiency, 12-month expense allocation & net retained wealth
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-num font-bold px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981]">
              ANNUAL SAVINGS RATE: {annualFinance.annualSavingsRate}%
            </span>
          </div>
        </div>

        {/* 2-Column: 3 Compound Gauges (6 cols) & 12-Month Stacked Cashflow (6 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          
          {/* 3 Compound Gauges (6 cols) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div className="p-3.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-ui font-bold text-[#18181B] uppercase tracking-wider">
                  Needs (50% Cap)
                </span>
                <span className="text-[9.5px] font-num font-bold text-[#10B981]">48.0%</span>
              </div>
              <div className="text-[16px] font-num font-bold text-[#18181B]">
                {formatIDR(annualFinance.annualNeedsSpent)}
              </div>
              <div className="w-full bg-[#E2E8F0] h-[5px] rounded-full overflow-hidden">
                <div className="bg-[#18181B] h-full rounded-full" style={{ width: '48%' }} />
              </div>
              <span className="text-[9.5px] text-[#71717A] font-ui block">
                Housing & essentials
              </span>
            </div>

            <div className="p-3.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-ui font-bold text-[#18181B] uppercase tracking-wider">
                  Wants (30% Cap)
                </span>
                <span className="text-[9.5px] font-num font-bold text-[#10B981]">27.8%</span>
              </div>
              <div className="text-[16px] font-num font-bold text-[#71717A]">
                {formatIDR(annualFinance.annualWantsSpent)}
              </div>
              <div className="w-full bg-[#E2E8F0] h-[5px] rounded-full overflow-hidden">
                <div className="bg-[#71717A] h-full rounded-full" style={{ width: '27.8%' }} />
              </div>
              <span className="text-[9.5px] text-[#71717A] font-ui block">
                Discretionary lifestyle
              </span>
            </div>

            <div className="p-3.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-ui font-bold text-[#10B981] uppercase tracking-wider">
                  Retained (20% Target)
                </span>
                <span className="text-[9.5px] font-num font-bold text-[#10B981]">24.2%</span>
              </div>
              <div className="text-[16px] font-num font-bold text-[#10B981]">
                +{formatIDR(annualFinance.annualRetainedCapital)}
              </div>
              <div className="w-full bg-[#E2E8F0] h-[5px] rounded-full overflow-hidden">
                <div className="bg-[#10B981] h-full rounded-full" style={{ width: '100%' }} />
              </div>
              <span className="text-[9.5px] text-[#10B981] font-ui block font-medium">
                Liquid capital reserve
              </span>
            </div>

          </div>

          {/* 12-Month Financial Distribution Stacked Bars (6 cols) */}
          <div className="lg:col-span-6 p-4 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-ui font-bold text-[#18181B]">
              <span>12-Month Cashflow Trajectory</span>
              <span className="text-[10px] text-[#71717A] font-normal">Income vs Expense vs Savings</span>
            </div>

            <div className="grid grid-cols-12 gap-1.5 items-end h-[60px] pt-2">
              {annualFinance.monthlyBreakdown.map((m) => {
                const isCurrent = m.active;
                const heightPct = isCurrent ? 85 : 45;

                return (
                  <div key={m.month} className="flex flex-col items-center gap-1 h-full justify-end group cursor-pointer">
                    <div className="w-full bg-[#E2E8F0] rounded-[2px] overflow-hidden flex flex-col justify-end h-full">
                      <div 
                        className={`w-full transition-all ${isCurrent ? 'bg-[#10B981]' : 'bg-[#18181B]'}`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className={`text-[8.5px] font-ui ${isCurrent ? 'font-bold text-[#18181B]' : 'text-[#71717A]'}`}>
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[9.5px] text-[#71717A] font-ui pt-1 border-t border-[#E2E8F0]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-[2px] bg-[#10B981]" />
                <span>Current Active Month</span>
              </span>
              <span className="font-num text-[#18181B] font-semibold">
                Total Inflow: {formatIDR(annualFinance.annualIncome)}
              </span>
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================
          SECTION 4: 4-QUARTER EXECUTIVE BENCHMARK MATRIX (Q1 - Q4)
          ======================================================== */}
      <section className="space-y-4">
        
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-2">
            <Compass size={15} className="text-[#18181B]" />
            <span>4-Quarter Executive Performance Matrix (Q1 — Q4)</span>
          </h3>
          <span className="text-[11px] text-[#71717A] font-ui">
            Quarter-by-quarter milestone velocity & strategic posture
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quarterlyBenchmarks.map((q) => (
            <div 
              key={q.quarter}
              className={`mplt-card p-4 bg-[#FFFFFF] border rounded-[10px] space-y-3 transition-all ${
                q.isCurrent 
                  ? 'border-[#18181B] ring-2 ring-[#18181B]/15 shadow-sm' 
                  : 'border-[#E2E8F0]'
              }`}
            >
              {/* Quarter Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-num font-bold px-2 py-0.5 rounded ${
                      q.isCurrent ? 'bg-[#18181B] text-white' : 'bg-[#F1F5F9] text-[#18181B]'
                    }`}>
                      {q.quarter} {today.year}
                    </span>
                    {q.isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    )}
                  </div>
                  <div className="text-[10.5px] text-[#71717A] font-ui mt-1 font-medium">
                    {q.title}
                  </div>
                </div>

                <span className={`text-[9.5px] font-ui font-bold px-1.5 py-0.5 rounded ${
                  q.status === 'Completed' 
                    ? 'text-[#10B981] bg-[#10B981]/10' 
                    : q.status === 'In Progress' 
                    ? 'text-[#0284C7] bg-sky-50' 
                    : 'text-[#71717A] bg-zinc-100'
                }`}>
                  {q.status.toUpperCase()}
                </span>
              </div>

              {/* 3 Quarter Metric Rows */}
              <div className="space-y-1.5 text-[10.5px] font-ui">
                <div className="flex items-center justify-between text-[#71717A]">
                  <span>Consistency Velocity:</span>
                  <span className="font-num font-bold text-[#18181B]">{q.velocity}%</span>
                </div>
                <div className="flex items-center justify-between text-[#71717A]">
                  <span>Kinetic EXP Earned:</span>
                  <span className="font-num font-bold text-[#10B981]">+{q.exp.toLocaleString('id-ID')} EXP</span>
                </div>
                <div className="flex items-center justify-between text-[#71717A]">
                  <span>Strategic Goals:</span>
                  <span className="font-num font-bold text-[#18181B]">{q.goalsDone}/{q.goalsTotal} Completed</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#E2E8F0] h-[4px] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${q.isCurrent ? 'bg-[#10B981]' : 'bg-[#18181B]'}`}
                  style={{ width: `${Math.max(10, q.velocity)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ========================================================
          SECTION 5: ANNUAL HALL OF FAME ACHIEVEMENT VAULT
          ======================================================== */}
      <section className="mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0] space-y-4">
        <div className="pb-3 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-2">
              <Award size={15} className="text-[#18181B]" />
              <span>{today.year} Annual Hall of Fame Achievements</span>
            </h3>
            <p className="text-[11px] text-[#71717A] font-ui">
              Milestone badges unlocked through proven long-range consistency & kinetic mastery
            </p>
          </div>
          <span className="text-[10.5px] font-num font-bold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#18181B]">
            {badges.filter(b => b.unlocked).length} / {badges.length} Badges Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {badges.map(b => {
            const BadgeIcon = b.icon;
            return (
              <div
                key={b.title}
                className={`p-3.5 rounded-[8px] border flex flex-col items-center text-center space-y-2 transition-all ${
                  b.unlocked 
                    ? 'bg-[#F9FAFB] border-[#E2E8F0] hover:border-[#18181B]' 
                    : 'bg-[#FAFAFA] border-[#F1F5F9] opacity-60'
                }`}
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
      </section>

    </div>
  );
};

export default YearlyStatsView;
