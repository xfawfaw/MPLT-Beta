import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Check, 
  Plus, 
  Trash2, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Flame,
  LayoutGrid,
  Clock,
  ListFilter,
  ArrowRight
} from 'lucide-react';
import { WeeklyTask, AreaOfLife } from '../../types';

export const WeeklyPlannerView: React.FC = () => {
  const { weeklyTasks, toggleWeeklyTask, addWeeklyTask, deleteWeeklyTask } = useApp();

  const [activeViewMode, setActiveViewMode] = useState<'grid' | 'spotlight' | 'agenda'>('grid');
  const [selectedSpotlightDay, setSelectedSpotlightDay] = useState<number>(3); // Default Thursday (26.02)
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [activeDayModal, setActiveDayModal] = useState<number | null>(null);
  
  // Task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<WeeklyTask['priority']>('Med');
  const [newTaskCategory, setNewTaskCategory] = useState<AreaOfLife>('Work');
  const [newTaskTimeEst, setNewTaskTimeEst] = useState('45m');

  const daysConfig: { index: number; name: WeeklyTask['dayName']; date: string; short: string }[] = [
    { index: 0, name: 'Monday', date: '23.02.2026', short: 'Mon' },
    { index: 1, name: 'Tuesday', date: '24.02.2026', short: 'Tue' },
    { index: 2, name: 'Wednesday', date: '25.02.2026', short: 'Wed' },
    { index: 3, name: 'Thursday', date: '26.02.2026', short: 'Thu' },
    { index: 4, name: 'Friday', date: '27.02.2026', short: 'Fri' },
    { index: 5, name: 'Saturday', date: '28.02.2026', short: 'Sat' },
    { index: 6, name: 'Sunday', date: '01.03.2026', short: 'Sun' },
  ];

  // Overall calculations
  const totalTasks = weeklyTasks.length;
  const completedTasks = weeklyTasks.filter(t => t.isCompleted).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalWeeklyExp = weeklyTasks.filter(t => t.isCompleted).reduce((acc, t) => acc + t.expReward, 0);

  // Day-by-day statistics
  const dayStats = useMemo(() => {
    return daysConfig.map(day => {
      const tasks = weeklyTasks.filter(t => t.dayIndex === day.index);
      const done = tasks.filter(t => t.isCompleted).length;
      const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
      const isBonus = day.index === 0 && pct === 100;
      const displayPct = isBonus ? '120%' : `${pct}%`;
      return {
        ...day,
        tasks,
        total: tasks.length,
        done,
        pct,
        displayPct,
      };
    });
  }, [weeklyTasks, daysConfig]);

  // Today spotlight tasks
  const spotlightDayData = dayStats.find(d => d.index === selectedSpotlightDay) || dayStats[3];

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeDayModal === null || !newTaskTitle.trim()) return;
    addWeeklyTask(activeDayModal, newTaskTitle.trim(), newTaskPriority, newTaskCategory);
    setNewTaskTitle('');
    setActiveDayModal(null);
  };

  return (
    <div className="max-w-[1440px] mx-auto p-6 space-y-6">
      
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
                WEEKLY TO-DO'S & TIME-BLOCKING
              </h1>
            </div>
            
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[6px] text-[12px] font-medium font-ui text-[#18181B]">
                <Calendar size={13} className="text-[#71717A]" />
                <span>Week of Feb 23, 2026 — Mar 01, 2026</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 border border-[#E2E8F0] rounded-[4px] bg-white hover:bg-[#F4F4F5] text-[#18181B]">
                  <ChevronLeft size={13} />
                </button>
                <button className="p-1.5 border border-[#E2E8F0] rounded-[4px] bg-white hover:bg-[#F4F4F5] text-[#18181B]">
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#F1F5F9] p-1 rounded-[6px] text-[11px] font-ui font-medium">
              <button
                onClick={() => setActiveViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] transition-all ${
                  activeViewMode === 'grid'
                    ? 'bg-[#18181B] text-white shadow-sm font-bold'
                    : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                <LayoutGrid size={13} />
                <span>Sprint Board</span>
              </button>

              <button
                onClick={() => setActiveViewMode('spotlight')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] transition-all ${
                  activeViewMode === 'spotlight'
                    ? 'bg-[#18181B] text-white shadow-sm font-bold'
                    : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                <Clock size={13} />
                <span>Day Spotlight</span>
              </button>

              <button
                onClick={() => setActiveViewMode('agenda')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] transition-all ${
                  activeViewMode === 'agenda'
                    ? 'bg-[#18181B] text-white shadow-sm font-bold'
                    : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                <ListFilter size={13} />
                <span>Agenda List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistical Analytics Bar & Telemetry Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left (Span 7): 7-Day Consistency Histogram */}
          <div className="lg:col-span-7 p-4 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[10px]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#E2E8F0]">
              <span className="text-[11px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={13} className="text-[#10B981]" />
                Daily Velocity & Completion Spectrum
              </span>
              <span className="text-[10px] font-num text-[#71717A]">
                Optimal Target: 85%+
              </span>
            </div>

            {/* 7-Day Histogram Bars */}
            <div className="grid grid-cols-7 gap-2 items-end pt-2">
              {dayStats.map((d) => {
                const isSelected = selectedSpotlightDay === d.index;
                const isFull = d.pct >= 100;
                
                return (
                  <div
                    key={d.index}
                    onClick={() => {
                      setSelectedSpotlightDay(d.index);
                      if (activeViewMode !== 'spotlight') setActiveViewMode('spotlight');
                    }}
                    className={`flex flex-col items-center gap-1.5 cursor-pointer p-1.5 rounded-[6px] transition-all ${
                      isSelected ? 'bg-white border border-[#18181B] shadow-sm' : 'hover:bg-white/80'
                    }`}
                  >
                    <span className="text-[10px] font-num font-bold text-[#18181B]">
                      {d.displayPct}
                    </span>

                    {/* Vertical Bar Container */}
                    <div className="w-full bg-[#E2E8F0] h-[52px] rounded-[4px] relative overflow-hidden flex items-end">
                      <div
                        className={`w-full rounded-[3px] transition-all duration-300 ${
                          isFull ? 'bg-[#10B981]' : isSelected ? 'bg-[#18181B]' : 'bg-[#71717A]'
                        }`}
                        style={{ height: `${Math.min(100, Math.max(12, d.pct))}%` }}
                      />
                    </div>

                    <span className={`text-[10px] font-ui font-semibold uppercase ${
                      isSelected ? 'text-[#18181B]' : 'text-[#71717A]'
                    }`}>
                      {d.short}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right (Span 5): 4 Metric Summary Chips */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 text-[11px]">
            
            <div className="p-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[8px]">
              <span className="text-[#71717A] font-ui uppercase tracking-wider block">
                Total Workload
              </span>
              <span className="text-[20px] font-num font-bold text-[#18181B] mt-0.5 block">
                {totalTasks} Tasks
              </span>
              <span className="text-[10px] text-[#71717A] font-ui mt-0.5 block">
                Across 7 sprint days
              </span>
            </div>

            <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-[8px]">
              <span className="text-[#10B981] font-ui uppercase tracking-wider block font-semibold">
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
              <span className="text-[#71717A] font-ui uppercase tracking-wider block">
                Weekly EXP Yield
              </span>
              <span className="text-[20px] font-num font-bold text-[#18181B] mt-0.5 block">
                +{totalWeeklyExp} EXP
              </span>
              <span className="text-[10px] text-[#71717A] font-ui mt-0.5 block">
                Earned from tasks
              </span>
            </div>

            <div className="p-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[8px]">
              <span className="text-[#71717A] font-ui uppercase tracking-wider block">
                Consistency Score
              </span>
              <span className="text-[20px] font-num font-bold text-[#18181B] mt-0.5 block">
                87% Optimal
              </span>
              <span className="text-[10px] text-[#10B981] font-ui font-semibold mt-0.5 flex items-center gap-1">
                <Flame size={11} className="text-orange-500 fill-orange-500" />
                Streak Active
              </span>
            </div>

          </div>

        </div>

      </section>

      {/* ========================================================
          VIEW MODE 1: SPRINT BOARD (SPACIOUS 7-DAY WORKSTATION)
          ======================================================== */}
      {activeViewMode === 'grid' && (
        <section className="space-y-4">
          
          {/* Quick Day Navigator Pills */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {daysConfig.map((d) => {
                const isSelected = selectedSpotlightDay === d.index;
                const stats = dayStats[d.index];
                return (
                  <button
                    key={d.index}
                    onClick={() => {
                      setSelectedSpotlightDay(d.index);
                      setActiveViewMode('spotlight');
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-[11px] font-ui font-medium border transition-all ${
                      isSelected
                        ? 'bg-[#18181B] text-white border-[#18181B]'
                        : 'bg-white text-[#71717A] border-[#E2E8F0] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <span>{d.name}</span>
                    <span className={`font-num px-1.5 py-0.2 rounded text-[10px] ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#18181B]'
                    }`}>
                      {stats.done}/{stats.total}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-[#71717A] font-ui">
              Click any day column to expand spotlight
            </div>
          </div>

          {/* Responsive Comfortable Multi-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7 gap-4 items-start">
            {dayStats.map((day) => {
              const radius = 26;
              const circ = 2 * Math.PI * radius;
              const offset = circ - (Math.min(100, day.pct) / 100) * circ;

              return (
                <div
                  key={day.index}
                  className="mplt-card bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] overflow-hidden flex flex-col min-h-[480px] hover:border-[#CBD5E1] transition-colors"
                >
                  {/* Column Header: Black container (#18181B fill, #FFFFFF text) */}
                  <div className="bg-[#18181B] text-[#FFFFFF] p-3 text-center border-b border-[#27272A] flex items-center justify-between">
                    <div className="text-left">
                      <h3 className="text-[12.5px] font-bold uppercase tracking-wider font-ui block">
                        {day.name}
                      </h3>
                      <span className="text-[10px] font-num text-[#A1A1AA] block mt-0.5">
                        {day.date}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedSpotlightDay(day.index);
                        setActiveViewMode('spotlight');
                      }}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Open in Spotlight View"
                    >
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  {/* 64px Circular Progress Ring Indicator */}
                  <div className="py-3 px-3 flex flex-col items-center justify-center border-b border-[#F1F5F9] bg-[#FAFAFA]">
                    <div className="relative w-[60px] h-[60px] flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
                        <circle
                          cx="30"
                          cy="30"
                          r={radius}
                          stroke="#E2E8F0"
                          strokeWidth="4"
                          fill="none"
                        />
                        <circle
                          cx="30"
                          cy="30"
                          r={radius}
                          stroke={day.pct >= 100 ? '#10B981' : '#18181B'}
                          strokeWidth="4"
                          strokeDasharray={circ}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          fill="none"
                          className="transition-all duration-300"
                        />
                      </svg>
                      <span className="absolute text-[12.5px] font-num font-bold text-[#18181B]">
                        {day.displayPct}
                      </span>
                    </div>
                    <span className="text-[10px] font-num text-[#71717A] mt-1 font-medium">
                      {day.done} of {day.total} Completed
                    </span>
                  </div>

                  {/* Task Card Stack */}
                  <div className="p-3 flex-1 space-y-2.5 overflow-y-auto max-h-[360px]">
                    {day.tasks.map((task) => {
                      return (
                        <div
                          key={task.id}
                          onClick={() => toggleWeeklyTask(task.id)}
                          className={`group p-2.5 rounded-[6px] border text-left transition-all cursor-pointer select-none ${
                            task.isCompleted
                              ? 'bg-[#F9FAFB] border-[#E2E8F0]'
                              : 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#18181B] hover:bg-[#FAFAFA]'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {/* Outline square checkbox */}
                            <div
                              className={`w-4 h-4 rounded-[3px] border mt-0.5 flex-shrink-0 flex items-center justify-center transition-colors ${
                                task.isCompleted
                                  ? 'bg-[#18181B] border-[#18181B] text-white'
                                  : 'bg-white border-[#18181B] group-hover:border-[#000000]'
                              }`}
                            >
                              {task.isCompleted && <Check size={11} className="stroke-[3]" />}
                            </div>

                            {/* Task label in Geist Mono 13px */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-[12.5px] font-ui leading-snug break-words ${
                                task.isCompleted
                                  ? 'line-through text-[#71717A]'
                                  : 'text-[#18181B] font-medium'
                              }`}>
                                {task.title}
                              </p>

                              {/* Badges: Priority + Category Tag */}
                              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                <span className={`text-[9px] font-num font-bold px-1.5 py-0.2 rounded uppercase ${
                                  task.priority === 'High'
                                    ? 'bg-rose-50 text-[#E11D48] border border-rose-200'
                                    : task.priority === 'Med'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-[#F1F5F9] text-[#71717A]'
                                }`}>
                                  {task.priority}
                                </span>

                                <span className="text-[9px] font-ui px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#71717A]">
                                  {task.category}
                                </span>

                                <span className="text-[9px] font-num text-[#10B981] ml-auto font-medium">
                                  +{task.expReward}xp
                                </span>
                              </div>
                            </div>

                            {/* Delete on hover */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteWeeklyTask(task.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-[#A1A1AA] hover:text-[#E11D48] p-0.5 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {day.tasks.length === 0 && (
                      <div className="py-8 text-center text-[#A1A1AA] text-[11px] font-ui">
                        No tasks scheduled
                      </div>
                    )}
                  </div>

                  {/* Add Task Trigger */}
                  <div className="p-2.5 border-t border-[#E2E8F0] bg-[#FFFFFF]">
                    <button
                      onClick={() => setActiveDayModal(day.index)}
                      className="w-full py-1.5 px-2 rounded-[5px] border border-dashed border-[#CBD5E1] hover:border-[#18181B] text-[11px] font-medium text-[#71717A] hover:text-[#18181B] flex items-center justify-center gap-1 transition-colors"
                    >
                      <Plus size={12} />
                      <span>Add Task</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================
          VIEW MODE 2: DAY SPOTLIGHT & TIME-BLOCKING VIEW
          ======================================================== */}
      {activeViewMode === 'spotlight' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (Span 4): Day Selector & Daily Progress Card */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Day Selector List */}
            <div className="mplt-card p-4 bg-[#FFFFFF] border border-[#E2E8F0]">
              <h3 className="text-[12px] font-bold text-[#18181B] font-ui uppercase tracking-wider mb-3 pb-2 border-b border-[#E2E8F0]">
                Select Active Day
              </h3>

              <div className="space-y-1.5">
                {dayStats.map((d) => {
                  const isSelected = selectedSpotlightDay === d.index;
                  return (
                    <button
                      key={d.index}
                      onClick={() => setSelectedSpotlightDay(d.index)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-[6px] text-left transition-all ${
                        isSelected
                          ? 'bg-[#18181B] text-white shadow-sm font-bold'
                          : 'hover:bg-[#F4F4F5] text-[#18181B]'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-[13px] font-ui">{d.name}</span>
                        <span className={`text-[10px] font-num ${isSelected ? 'text-[#94A3B8]' : 'text-[#71717A]'}`}>
                          {d.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-num">
                        <span className={`text-[11px] px-2 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#71717A]'
                        }`}>
                          {d.done}/{d.total}
                        </span>
                        <span className={`text-[12px] font-bold w-10 text-right ${
                          isSelected ? 'text-[#10B981]' : d.pct >= 100 ? 'text-[#10B981]' : 'text-[#18181B]'
                        }`}>
                          {d.displayPct}
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
                {spotlightDayData.name} Completion Pace
              </span>
              <div className="text-[28px] font-num font-bold text-[#18181B] my-1">
                {spotlightDayData.displayPct}
              </div>
              <p className="text-[11px] text-[#71717A] font-ui">
                {spotlightDayData.done} completed out of {spotlightDayData.total} planned items
              </p>
            </div>

          </div>

          {/* Right Column (Span 8): Dedicated Spacious Task Workstation */}
          <div className="lg:col-span-8 space-y-4">
            <div className="mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0]">
              
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-[18px] font-bold text-[#18181B] font-ui">
                    {spotlightDayData.name} — Task Execution Board
                  </h2>
                  <p className="text-[12px] text-[#71717A] font-num">
                    Scheduled Date: {spotlightDayData.date}
                  </p>
                </div>

                <button
                  onClick={() => setActiveDayModal(spotlightDayData.index)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#18181B] text-white hover:bg-[#27272A] text-[12px] font-bold transition-all"
                >
                  <Plus size={14} />
                  <span>Add Task for Today</span>
                </button>
              </div>

              {/* Spacious Task List with Detailed Chips */}
              <div className="space-y-3">
                {spotlightDayData.tasks.map((task, idx) => {
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleWeeklyTask(task.id)}
                      className={`group p-3.5 rounded-[8px] border transition-all cursor-pointer select-none flex items-center justify-between gap-4 ${
                        task.isCompleted
                          ? 'bg-[#F9FAFB] border-[#CBD5E1]'
                          : 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#18181B] hover:bg-[#FAFAFA]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        {/* Checkbox */}
                        <div
                          className={`w-5 h-5 rounded-[4px] border flex-shrink-0 flex items-center justify-center transition-colors ${
                            task.isCompleted
                              ? 'bg-[#18181B] border-[#18181B] text-white'
                              : 'bg-white border-[#18181B] group-hover:border-black'
                          }`}
                        >
                          {task.isCompleted && <Check size={13} className="stroke-[3]" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-[14px] font-ui leading-tight ${
                            task.isCompleted
                              ? 'line-through text-[#71717A]'
                              : 'text-[#18181B] font-medium'
                          }`}>
                            {idx + 1}. {task.title}
                          </p>

                          <div className="flex items-center gap-2 mt-1.5 text-[10.5px]">
                            <span className={`font-num font-bold px-2 py-0.5 rounded uppercase ${
                              task.priority === 'High'
                                ? 'bg-rose-50 text-[#E11D48] border border-rose-200'
                                : task.priority === 'Med'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-[#F1F5F9] text-[#71717A]'
                            }`}>
                              {task.priority} Priority
                            </span>

                            <span className="font-ui px-2 py-0.5 rounded bg-[#F1F5F9] text-[#71717A]">
                              {task.category}
                            </span>

                            <span className="font-num text-[#71717A] flex items-center gap-1">
                              <Clock size={11} />
                              {task.timeEstimate || '45m'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Exp Badge & Action */}
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-num font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-[5px]">
                          +{task.expReward} EXP
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWeeklyTask(task.id);
                          }}
                          className="text-[#A1A1AA] hover:text-[#E11D48] p-1 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {spotlightDayData.tasks.length === 0 && (
                  <div className="py-12 text-center text-[#71717A] font-ui text-[13px]">
                    No tasks scheduled for {spotlightDayData.name}. Click "Add Task for Today" to plan.
                  </div>
                )}
              </div>

            </div>
          </div>

        </section>
      )}

      {/* ========================================================
          VIEW MODE 3: AGENDA LIST VIEW
          ======================================================== */}
      {activeViewMode === 'agenda' && (
        <section className="mplt-card bg-[#FFFFFF] border border-[#E2E8F0] p-6 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-[16px] font-bold text-[#18181B] font-ui">
                Full Weekly Chronological Agenda
              </h3>
              <p className="text-[12px] text-[#71717A]">
                Unified chronological sprint view across all 7 days
              </p>
            </div>

            {/* Filter Priority */}
            <div className="flex items-center gap-2">
              {(['all', 'High', 'Med', 'Low'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-2.5 py-1 rounded-[5px] text-[11px] font-ui transition-colors capitalize ${
                    filterPriority === p
                      ? 'bg-[#18181B] text-white font-bold'
                      : 'bg-[#F1F5F9] text-[#71717A] hover:text-[#18181B]'
                  }`}
                >
                  {p === 'all' ? 'All Priorities' : `${p} Only`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {weeklyTasks
              .filter(t => filterPriority === 'all' || t.priority === filterPriority)
              .map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleWeeklyTask(task.id)}
                  className={`p-3 rounded-[6px] border flex items-center justify-between gap-3 transition-colors cursor-pointer select-none ${
                    task.isCompleted ? 'bg-[#F9FAFB] border-[#E2E8F0]' : 'bg-white border-[#E2E8F0] hover:border-[#18181B]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-[3px] border flex items-center justify-center ${
                        task.isCompleted ? 'bg-[#18181B] border-[#18181B] text-white' : 'border-[#18181B]'
                      }`}
                    >
                      {task.isCompleted && <Check size={11} className="stroke-[3]" />}
                    </div>

                    <span className="font-num text-[11px] font-bold px-2 py-0.5 rounded bg-[#18181B] text-white uppercase">
                      {task.dayName.substring(0, 3)}
                    </span>

                    <span className={`text-[13px] font-ui ${
                      task.isCompleted ? 'line-through text-[#71717A]' : 'text-[#18181B] font-medium'
                    }`}>
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-num font-bold px-2 py-0.5 rounded uppercase ${
                      task.priority === 'High' ? 'bg-rose-50 text-[#E11D48]' : 'bg-[#F1F5F9] text-[#71717A]'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-[11px] font-num font-semibold text-[#10B981]">
                      +{task.expReward} EXP
                    </span>
                  </div>
                </div>
              ))}
          </div>

        </section>
      )}

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
                  className="px-4 py-2 text-[12px] font-medium border border-[#E2E8F0] rounded-[6px] hover:bg-[#F4F4F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-[12px] font-bold bg-[#18181B] text-white rounded-[6px] hover:bg-[#27272A]"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
