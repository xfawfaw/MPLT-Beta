import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Flame,
  Play,
  Pause,
  RotateCcw,
  Inbox,
  Timer,
  X
} from 'lucide-react';
import { AgentPlanning, PlanStep, PlanStepStatus } from '@/components/ui/ai-planning';
import { WeeklyTask, AreaOfLife } from '../../types';
import { sound } from '../../utils/sound';
import { dateUtils } from '../../utils/date';

const parseEstMinutes = (est?: string): number => {
  if (!est) return 45;
  if (est.includes('h')) {
    const parts = est.split('h');
    const hours = parseFloat(parts[0]) || 1;
    const mins = parts[1] ? parseFloat(parts[1].replace('m', '')) || 0 : 0;
    return Math.round(hours * 60 + mins);
  }
  return parseFloat(est.replace(/[^0-9]/g, '')) || 45;
};

export const WeeklyPlannerView: React.FC = () => {
  const { weeklyTasks, toggleWeeklyTask, addWeeklyTask, deleteWeeklyTask, tasks, addExp } = useApp();

  const [today, setToday] = useState(() => dateUtils.getTodayInfo());

  useEffect(() => {
    const timer = setInterval(() => {
      setToday(dateUtils.getTodayInfo());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const [weekOffset, setWeekOffset] = useState<number>(0);
  const sprintWeek = useMemo(() => dateUtils.getSprintWeekInfo(weekOffset), [weekOffset, today]);

  const [selectedSpotlightDay, setSelectedSpotlightDay] = useState<number>(today.dayOfWeekIndex); // Default to today
  const [activeDayModal, setActiveDayModal] = useState<number | null>(null);
  const [showBacklogModal, setShowBacklogModal] = useState(false);

  // Focus Flow Timer State
  const [focusSecondsLeft, setFocusSecondsLeft] = useState<number>(25 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState<boolean>(false);
  const [focusPreset, setFocusPreset] = useState<'25m' | '50m' | '15m'>('25m');

  // Focus timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isFocusRunning && focusSecondsLeft > 0) {
      interval = setInterval(() => {
        setFocusSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (isFocusRunning && focusSecondsLeft === 0) {
      setIsFocusRunning(false);
      sound.playLevelUp();
      addExp(35, `Completed ${focusPreset} Focus Flow Session`);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocusRunning, focusSecondsLeft, focusPreset, addExp]);

  const handleSetFocusPreset = (preset: '25m' | '50m' | '15m') => {
    setFocusPreset(preset);
    const secs = preset === '25m' ? 25 * 60 : preset === '50m' ? 50 * 60 : 15 * 60;
    setFocusSecondsLeft(secs);
    setIsFocusRunning(false);
    sound.playClick();
  };

  // Task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<WeeklyTask['priority']>('Med');
  const [newTaskCategory, setNewTaskCategory] = useState<AreaOfLife>('Work');
  const [newTaskTimeEst, setNewTaskTimeEst] = useState('45m');

  const daysConfig = useMemo(() => sprintWeek.sprintDays.map(d => ({
    index: d.index,
    name: d.name,
    date: d.dateStr,
    short: d.short,
    isToday: d.isToday
  })), [sprintWeek]);

  // Day-by-day statistics with capacity calculation
  const dayStats = useMemo(() => {
    return daysConfig.map(day => {
      const dayTasks = weeklyTasks.filter(t => 
        t.dateStr === day.date || (weekOffset === 0 && t.dayIndex === day.index)
      );
      const done = dayTasks.filter(t => t.isCompleted).length;
      const pct = dayTasks.length > 0 ? Math.round((done / dayTasks.length) * 100) : 0;
      const displayPct = `${pct}%`;
      const expEarned = dayTasks.filter(t => t.isCompleted).reduce((acc, t) => acc + t.expReward, 0);
      const totalExp = dayTasks.reduce((acc, t) => acc + t.expReward, 0);

      // Planned time capacity (6h = 360m target)
      const plannedMinutes = dayTasks.reduce((acc, t) => acc + parseEstMinutes(t.timeEstimate), 0);
      const capacityPct = Math.min(150, Math.round((plannedMinutes / 360) * 100));

      return {
        ...day,
        tasks: dayTasks,
        total: dayTasks.length,
        done,
        pct,
        displayPct,
        expEarned,
        totalExp,
        plannedMinutes,
        capacityPct,
      };
    });
  }, [weeklyTasks, daysConfig, weekOffset]);

  // Overall calculations for viewed sprint week
  const weekTasks = useMemo(() => dayStats.flatMap(d => d.tasks), [dayStats]);
  const totalTasks = weekTasks.length;
  const completedTasks = weekTasks.filter(t => t.isCompleted).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalWeeklyExp = weekTasks.filter(t => t.isCompleted).reduce((acc, t) => acc + t.expReward, 0);

  // Today spotlight tasks
  const spotlightDayData = dayStats.find(d => d.index === selectedSpotlightDay) || dayStats[today.dayOfWeekIndex] || dayStats[0];

  // Synthesize Day Spotlight Tasks into Agent Planning Steps
  const spotlightSteps: PlanStep[] = useMemo(() => {
    return spotlightDayData.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: (task.isCompleted ? 'success' : task.priority === 'High' ? 'active' : 'pending') as PlanStepStatus,
      duration: task.timeEstimate || '45m',
      priority: task.priority,
      category: task.category,
      expReward: task.expReward,
      onToggle: () => {
        toggleWeeklyTask(task.id);
        sound.playPop();
      },
      onDelete: () => {
        deleteWeeklyTask(task.id);
        sound.playClick();
      },
      defaultExpanded: !task.isCompleted && task.priority === 'High',
      content: (
        <div className="space-y-2.5 pt-1 text-[11px] font-ui">
          <div className="flex items-center justify-between gap-2 p-2.5 bg-[#F9FAFB] rounded-[8px] border border-[#E2E8F0] flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[#71717A] font-medium">Domain:</span>
              <span className="font-bold text-[#18181B]">{task.category}</span>
              <span className="text-[#E2E8F0]">|</span>
              <span className="text-[#71717A] font-medium">Priority:</span>
              <span className={`font-bold ${
                task.priority === 'High' ? 'text-[#E11D48]' : task.priority === 'Med' ? 'text-amber-600' : 'text-[#71717A]'
              }`}>{task.priority}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  toggleWeeklyTask(task.id);
                  sound.playPop();
                }}
                className={`px-2.5 py-1 rounded-[5px] text-[10.5px] font-bold border transition-colors cursor-pointer ${
                  task.isCompleted
                    ? 'bg-emerald-50 text-[#10B981] border-emerald-200 hover:bg-emerald-100'
                    : 'bg-[#18181B] text-white border-[#18181B] hover:bg-[#27272A]'
                }`}
              >
                {task.isCompleted ? '✓ Completed (Click to Reopen)' : 'Mark as Complete'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  deleteWeeklyTask(task.id);
                  sound.playClick();
                }}
                className="p-1 rounded-[5px] text-[#A1A1AA] hover:text-[#E11D48] hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                title="Delete task"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10.5px] font-num text-[#71717A]">
            <div className="p-2 rounded-[6px] bg-white border border-[#E2E8F0] flex items-center justify-between">
              <span>Time Window:</span>
              <strong className="text-[#18181B]">{task.timeEstimate || '45m'}</strong>
            </div>
            <div className="p-2 rounded-[6px] bg-white border border-[#E2E8F0] flex items-center justify-between">
              <span>Kinetics EXP:</span>
              <strong className="text-[#10B981]">+{task.expReward} EXP</strong>
            </div>
            <div className="p-2 rounded-[6px] bg-white border border-[#E2E8F0] flex items-center justify-between col-span-2 sm:col-span-1">
              <span>Status:</span>
              <strong className={task.isCompleted ? 'text-[#10B981]' : 'text-amber-600'}>
                {task.isCompleted ? 'Resolved' : 'In Queue'}
              </strong>
            </div>
          </div>
        </div>
      )
    }));
  }, [spotlightDayData, toggleWeeklyTask, deleteWeeklyTask]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeDayModal === null || !newTaskTitle.trim()) return;
    const targetDay = daysConfig[activeDayModal];
    addWeeklyTask(
      activeDayModal, 
      newTaskTitle.trim(), 
      newTaskPriority, 
      newTaskCategory, 
      targetDay ? targetDay.date : undefined, 
      newTaskTimeEst
    );
    setNewTaskTitle('');
    setActiveDayModal(null);
  };

  return (
    <div className="max-w-[1440px] mx-auto p-6 space-y-6">
      
      {/* ========================================================
          TOP SECTION 0: DEEP WORK FOCUS FLOW BAR (OPTION A)
          ======================================================== */}
      <section className="mplt-card p-4 bg-[#18181B] text-white border border-[#27272A] rounded-[10px] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center ${
              isFocusRunning ? 'bg-emerald-500 text-white animate-pulse' : 'bg-white/10 text-white'
            }`}>
              <Timer size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-ui">
                <span className="font-bold text-white uppercase tracking-wider">
                  Deep Work Flow State Timer
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 font-num text-emerald-400 font-semibold">
                  +35 EXP Bonus
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-ui">
                {isFocusRunning ? 'Focus block in active progress — stay in flow' : 'Select a focus block duration and enter flow state'}
              </p>
            </div>
          </div>

          {/* Timer Controls & Presets */}
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Presets */}
            <div className="flex items-center bg-white/5 p-0.5 rounded-[6px] border border-white/10">
              {(['25m', '50m', '15m'] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={isFocusRunning}
                  onClick={() => handleSetFocusPreset(preset)}
                  className={`px-2.5 py-1 text-[11px] font-ui rounded-[4px] transition-all cursor-pointer ${
                    focusPreset === preset
                      ? 'bg-white text-[#18181B] font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Countdown Display */}
            <div className="font-num text-[18px] sm:text-[20px] font-bold text-white px-3 py-1 bg-white/5 border border-white/10 rounded-[6px] tracking-wider min-w-[80px] text-center">
              {Math.floor(focusSecondsLeft / 60)}:{focusSecondsLeft % 60 < 10 ? `0${focusSecondsLeft % 60}` : focusSecondsLeft % 60}
            </div>

            {/* Start / Pause / Reset */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsFocusRunning(prev => !prev);
                  sound.playClick();
                }}
                className={`px-3.5 py-1.5 rounded-[6px] text-[12px] font-bold font-ui flex items-center gap-1.5 transition-all cursor-pointer ${
                  isFocusRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-[#10B981] hover:bg-[#059669] text-white'
                }`}
              >
                {isFocusRunning ? <Pause size={13} /> : <Play size={13} />}
                <span>{isFocusRunning ? 'Pause' : 'Start Flow'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsFocusRunning(false);
                  const secs = focusPreset === '25m' ? 25 * 60 : focusPreset === '50m' ? 50 * 60 : 15 * 60;
                  setFocusSecondsLeft(secs);
                  sound.playClick();
                }}
                className="p-1.5 rounded-[6px] bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw size={13} />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          TOP SECTION: WEEKLY VELOCITY & OVERALL PROGRESS TELEMETRY
          ======================================================== */}
      <section className="mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0] space-y-5">
        
        {/* Header Title & Date Range */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#18181B]" />
              <h1 className="text-[24px] font-bold text-[#18181B] font-ui tracking-tight">
                WEEKLY TO-DO&apos;S & TIME-BLOCKING
              </h1>
            </div>
            
            <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
              {/* Sprint Week Range Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[6px] text-[12px] font-medium font-ui text-[#18181B] shadow-xs">
                <Calendar size={13} className="text-[#71717A]" />
                <span>Sprint Week of {sprintWeek.sprintWeekRangeStr}</span>
                <span className="font-num text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#18181B] text-white">
                  {sprintWeek.weekTag}
                </span>
              </div>

              {/* Prev / Current / Next Controls */}
              <div className="flex items-center gap-1 bg-[#F9FAFB] p-0.5 border border-[#E2E8F0] rounded-[6px]">
                <button
                  onClick={() => {
                    setWeekOffset(prev => prev - 1);
                    sound.playClick();
                  }}
                  className="p-1 rounded-[4px] bg-white hover:bg-[#F4F4F5] text-[#18181B] border border-[#E2E8F0] shadow-xs hover:border-[#18181B] transition-all cursor-pointer"
                  title="Previous sprint week"
                >
                  <ChevronLeft size={13} />
                </button>

                {weekOffset !== 0 ? (
                  <button
                    onClick={() => {
                      setWeekOffset(0);
                      setSelectedSpotlightDay(today.dayOfWeekIndex);
                      sound.playClick();
                    }}
                    className="px-2.5 py-0.5 text-[11px] font-ui font-semibold bg-[#18181B] text-white rounded-[4px] hover:bg-[#27272A] transition-all cursor-pointer shadow-xs"
                    title="Jump to Current Week"
                  >
                    Current Week
                  </button>
                ) : (
                  <span className="px-2 py-0.5 text-[10.5px] font-ui font-medium text-[#71717A]">
                    Current Week
                  </span>
                )}

                <button
                  onClick={() => {
                    setWeekOffset(prev => prev + 1);
                    sound.playClick();
                  }}
                  className="p-1 rounded-[4px] bg-white hover:bg-[#F4F4F5] text-[#18181B] border border-[#E2E8F0] shadow-xs hover:border-[#18181B] transition-all cursor-pointer"
                  title="Next sprint week"
                >
                  <ChevronRight size={13} />
                </button>
              </div>

              {/* Relative Label Chip */}
              {weekOffset !== 0 && (
                <span className="px-2 py-1 rounded-[6px] text-[11px] font-ui font-medium bg-[#F1F5F9] text-[#71717A] border border-[#E2E8F0]">
                  {sprintWeek.relativeWeekLabel}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowBacklogModal(true);
                sound.playClick();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] bg-[#F9FAFB] hover:bg-[#F4F4F5] border border-[#E2E8F0] text-[#18181B] text-[12px] font-bold transition-all shadow-xs cursor-pointer"
            >
              <Inbox size={14} className="text-[#71717A]" />
              <span>Import Backlog</span>
            </button>

            <button
              onClick={() => setActiveDayModal(selectedSpotlightDay)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#18181B] text-white hover:bg-[#27272A] text-[12px] font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Schedule Task</span>
            </button>
          </div>
        </div>

        {/* Statistical Analytics Bar & Telemetry Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left (Span 7): 7-Day Consistency Histogram with Capacity Highlights */}
          <div className="lg:col-span-7 p-4 bg-white border border-[#E2E8F0] rounded-[8px]">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={13} className="text-[#18181B]" />
                <span className="text-[11px] font-bold text-[#18181B] font-ui uppercase tracking-wider">
                  Daily Velocity & Capacity Spectrum
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-ui text-[#71717A]">
                <span className="font-num font-medium text-[#18181B]">
                  Target: 85%+
                </span>
                <span className="text-[#CBD5E1]">•</span>
                <span className="font-num text-[#71717A]">
                  {completedTasks}/{totalTasks} Tasks
                </span>
              </div>
            </div>

            {/* 7-Day Minimalist Columns with Capacity Readout */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 items-end pt-1">
              {dayStats.map((d) => {
                const isSelected = selectedSpotlightDay === d.index;
                const is100 = d.pct >= 100;
                
                return (
                  <div
                    key={d.index}
                    onClick={() => {
                      setSelectedSpotlightDay(d.index);
                      sound.playClick();
                    }}
                    className={`flex flex-col items-center gap-1 cursor-pointer p-1.5 rounded-[6px] transition-all select-none ${
                      isSelected 
                        ? 'bg-[#F4F4F5] border border-[#18181B]' 
                        : 'hover:bg-[#F9FAFB] border border-transparent'
                    }`}
                  >
                    {/* Top Percentage */}
                    <span className={`text-[10.5px] font-num font-bold tabular-nums ${
                      isSelected ? 'text-[#18181B]' : 'text-[#71717A]'
                    }`}>
                      {d.displayPct}
                    </span>

                    {/* Minimalist Bar Container */}
                    <div className="w-full bg-[#F1F5F9] h-[52px] rounded-[3px] relative overflow-hidden flex items-end">
                      <div
                        className={`w-full rounded-[2px] transition-all duration-300 ${
                          is100 ? 'bg-[#10B981]' : isSelected ? 'bg-[#18181B]' : 'bg-[#CBD5E1]'
                        }`}
                        style={{ height: `${Math.max(8, d.pct)}%` }}
                      />
                    </div>

                    {/* Day Label & Capacity Minutes */}
                    <div className="flex flex-col items-center">
                      <span className={`text-[10.5px] font-ui font-semibold ${
                        d.isToday ? 'text-[#10B981] font-bold' : isSelected ? 'text-[#18181B]' : 'text-[#71717A]'
                      }`}>
                        {d.short}
                      </span>
                      <span className="text-[8px] font-num text-[#71717A] truncate">
                        {d.plannedMinutes}m
                      </span>
                    </div>

                    {d.isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right (Span 5): 4-Quadrant KPI Summary Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            
            <div className="p-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[8px]">
              <span className="text-[#71717A] font-ui uppercase tracking-wider block text-[10px]">
                Active Workload
              </span>
              <span className="text-[20px] font-num font-bold text-[#18181B] mt-0.5 block">
                {totalTasks} Tasks
              </span>
              <span className="text-[10px] text-[#71717A] font-ui mt-0.5 block">
                Across 7 sprint days
              </span>
            </div>

            <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-[8px]">
              <span className="text-[#10B981] font-ui uppercase tracking-wider block font-semibold text-[10px]">
                Completed Ratio
              </span>
              <span className="text-[20px] font-num font-bold text-[#10B981] mt-0.5 block">
                {completedTasks} ({completionPercentage}%)
              </span>
              <span className="text-[10px] text-[#10B981] font-ui mt-0.5 block">
                Target pace on track
              </span>
            </div>

            <div className="p-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[8px]">
              <span className="text-[#71717A] font-ui uppercase tracking-wider block text-[10px]">
                Weekly EXP Yield
              </span>
              <span className="text-[20px] font-num font-bold text-[#18181B] mt-0.5 block">
                +{totalWeeklyExp} EXP
              </span>
              <span className="text-[10px] text-[#71717A] font-ui mt-0.5 block">
                Earned from sprint tasks
              </span>
            </div>

            <div className="p-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[8px]">
              <span className="text-[#71717A] font-ui uppercase tracking-wider block text-[10px]">
                Focus Flow Block
              </span>
              <span className="text-[20px] font-num font-bold text-[#18181B] mt-0.5 block">
                {focusPreset}
              </span>
              <span className="text-[10px] text-[#10B981] font-ui font-semibold mt-0.5 flex items-center gap-1">
                <Flame size={11} className="text-orange-500 fill-orange-500" />
                <span>Timer Ready</span>
              </span>
            </div>

          </div>

        </div>

      </section>

      {/* ========================================================
          UNIFIED DAY EXECUTION & AGENT PLANNING WORKSTATION
          ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Span 4): Day Selector & Daily Progress Card with Capacity Bars */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Day Selector List */}
          <div className="mplt-card p-4 bg-[#FFFFFF] border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#E2E8F0]">
              <h3 className="text-[12px] font-bold text-[#18181B] font-ui uppercase tracking-wider">
                Sprint Days
              </h3>
              <span className="text-[10.5px] font-num text-[#71717A]">
                Capacity (Max 6h)
              </span>
            </div>

            <div className="space-y-1.5">
              {dayStats.map((d) => {
                const isSelected = selectedSpotlightDay === d.index;
                const isOverload = d.capacityPct > 100;
                return (
                  <button
                    key={d.index}
                    onClick={() => {
                      setSelectedSpotlightDay(d.index);
                      sound.playClick();
                    }}
                    className={`w-full flex flex-col p-2.5 rounded-[8px] text-left transition-all cursor-pointer select-none border ${
                      isSelected
                        ? 'bg-[#18181B] text-white shadow-sm font-bold border-[#18181B]'
                        : 'hover:bg-[#F4F4F5] text-[#18181B] bg-white border-[#E2E8F0]/60'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-ui">{d.name}</span>
                        {d.isToday && (
                          <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-[#18181B] text-white'
                          }`}>
                            TODAY
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 font-num">
                        <span className={`text-[10.5px] px-2 py-0.5 rounded font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#71717A]'
                        }`}>
                          {d.done}/{d.total}
                        </span>
                        <span className={`text-[12px] font-bold w-11 text-right ${
                          isSelected ? 'text-[#10B981]' : d.pct >= 100 ? 'text-[#10B981]' : 'text-[#18181B]'
                        }`}>
                          {d.displayPct}
                        </span>
                      </div>
                    </div>

                    {/* Workload Capacity Bar */}
                    <div className="w-full flex items-center justify-between mt-2 pt-1 border-t border-white/10 text-[9px] font-num">
                      <span className={isSelected ? 'text-zinc-300' : 'text-[#71717A]'}>
                        Workload: {d.plannedMinutes}m / 360m
                      </span>
                      <span className={isOverload ? 'text-[#E11D48] font-bold' : isSelected ? 'text-emerald-300 font-bold' : 'text-[#10B981] font-semibold'}>
                        {d.capacityPct}% Capacity
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Summary Card */}
          <div className="mplt-card p-5 bg-[#FFFFFF] border border-[#E2E8F0] text-center">
            <span className="text-[11px] font-ui uppercase tracking-wider text-[#71717A]">
              {spotlightDayData.name} Workload Capacity
            </span>
            <div className="text-[28px] font-num font-bold text-[#18181B] my-1">
              {spotlightDayData.plannedMinutes}m <span className="text-[14px] text-[#71717A] font-normal">/ 360m Focus</span>
            </div>
            <p className="text-[11px] text-[#71717A] font-ui">
              {spotlightDayData.done} completed out of {spotlightDayData.total} planned tasks
            </p>
          </div>

        </div>

        {/* Right Column (Span 8): Dedicated Spacious Task Workstation with AgentPlanning Timeline */}
        <div className="lg:col-span-8 space-y-4">
          <div className="mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0]">
            
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E8F0] flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <h2 className="text-[18px] font-bold text-[#18181B] font-ui tracking-tight">
                    {spotlightDayData.name} — Task Execution Timeline
                  </h2>
                </div>
                <p className="text-[12px] text-[#71717A] font-num mt-0.5">
                  Scheduled Date: {spotlightDayData.date} • {spotlightDayData.plannedMinutes}m planned • {spotlightDayData.done}/{spotlightDayData.total} Completed ({spotlightDayData.displayPct})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowBacklogModal(true);
                    sound.playClick();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#F9FAFB] hover:bg-[#F4F4F5] border border-[#E2E8F0] text-[#18181B] text-[12px] font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Inbox size={13} className="text-[#71717A]" />
                  <span>Pull Backlog</span>
                </button>

                <button
                  onClick={() => setActiveDayModal(spotlightDayData.index)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#18181B] text-white hover:bg-[#27272A] text-[12px] font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Task for Today</span>
                </button>
              </div>
            </div>

            {/* AgentPlanning Timeline Component */}
            {spotlightSteps.length > 0 ? (
              <AgentPlanning 
                title={`${spotlightDayData.name} Execution Architecture`}
                subtitle={`Target: ${spotlightDayData.total} items scheduled • ${spotlightDayData.done} resolved`}
                steps={spotlightSteps}
                isCollapsible={false}
                defaultExpanded={true}
                onAddStep={() => setActiveDayModal(spotlightDayData.index)}
              />
            ) : (
              <div className="py-12 text-center text-[#71717A] font-ui text-[13px] border border-dashed border-[#E2E8F0] rounded-[10px] bg-[#F9FAFB]/50">
                <Calendar size={20} className="text-[#CBD5E1] mx-auto mb-2" />
                <p className="font-medium text-[#18181B]">No tasks scheduled for {spotlightDayData.name}</p>
                <p className="text-[11px] text-[#71717A] mt-0.5">Click "Add Task for Today" to construct this day's execution timeline.</p>
              </div>
            )}

          </div>
        </div>

      </section>

      {/* Add Task Modal */}
      {activeDayModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] max-w-md w-full p-6 shadow-xl animate-in zoom-in-95">
            <h3 className="text-[16px] font-bold text-[#18181B] font-ui mb-1">
              Add Task for {daysConfig[activeDayModal].name}
            </h3>
            <p className="text-[12px] text-[#71717A] mb-4">
              Date: {daysConfig[activeDayModal].date}
            </p>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                  Task Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Code API endpoint, Run 8km, Team Sync"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as WeeklyTask['priority'])}
                    className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B] bg-white"
                  >
                    <option value="High">High Priority</option>
                    <option value="Med">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                    Category
                  </label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as AreaOfLife)}
                    className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B] bg-white"
                  >
                    <option value="Work">Work</option>
                    <option value="Health">Health</option>
                    <option value="Money">Money</option>
                    <option value="Personal Growth">Personal Growth</option>
                    <option value="Family">Family</option>
                    <option value="Spirituality">Spirituality</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                  Time Estimate
                </label>
                <input
                  type="text"
                  placeholder="e.g., 30m, 90m, 2h"
                  value={newTaskTimeEst}
                  onChange={(e) => setNewTaskTimeEst(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveDayModal(null)}
                  className="px-4 py-2 text-[12px] font-medium border border-[#E2E8F0] rounded-[6px] hover:bg-[#F4F4F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-[12px] font-bold bg-[#18181B] text-white rounded-[6px] hover:bg-[#27272A] cursor-pointer"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          IMPORT FROM TASK BACKLOG MODAL (OPTION A BRIDGE)
          ======================================================== */}
      {showBacklogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E2E8F0] rounded-[14px] max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[6px] bg-[#18181B] text-white flex items-center justify-center">
                  <Inbox size={15} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#18181B] font-ui">
                    Import from Task Backlog
                  </h3>
                  <p className="text-[11px] text-[#71717A] font-ui">
                    Pull uncompleted backlog tasks directly into {spotlightDayData.name}&apos;s sprint schedule
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowBacklogModal(false)}
                className="p-1 rounded-[6px] text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Backlog List */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {tasks.filter(t => t.status !== 'Completed').length > 0 ? (
                tasks.filter(t => t.status !== 'Completed').map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-[#F9FAFB] hover:bg-[#F4F4F5] border border-[#E2E8F0] rounded-[8px] flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold font-ui text-[#18181B] truncate">{task.title}</div>
                      <div className="flex items-center gap-2 text-[10px] text-[#71717A] mt-0.5">
                        <span className="font-semibold text-[#18181B]">{task.category}</span>
                        <span>•</span>
                        <span className={task.priority === 'High' ? 'text-[#E11D48] font-bold' : ''}>{task.priority}</span>
                        <span>•</span>
                        <span className="text-[#10B981] font-bold">+{task.expReward} EXP</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        addWeeklyTask(
                          selectedSpotlightDay,
                          task.title,
                          task.priority,
                          task.category,
                          spotlightDayData.date,
                          '45m'
                        );
                        sound.playPop();
                        addExp(10, `Pulled "${task.title}" to ${spotlightDayData.name}`);
                        setShowBacklogModal(false);
                      }}
                      className="px-3 py-1.5 bg-[#18181B] hover:bg-[#27272A] text-white text-[11px] font-bold font-ui rounded-[6px] transition-all flex-shrink-0 cursor-pointer shadow-xs"
                    >
                      Pull to {spotlightDayData.name}
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-[#71717A] text-[12px] font-ui">
                  No pending backlog tasks found. All clear!
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowBacklogModal(false)}
                className="px-4 py-2 text-[12px] font-medium text-[#71717A] hover:bg-[#F4F4F5] rounded-[6px] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WeeklyPlannerView;
