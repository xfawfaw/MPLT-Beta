import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp, getUserRankTitle } from '../../context/AppContext';
import { 
  Check, 
  Flame, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Plus, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  Clock, 
  Target, 
  Edit3, 
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '../../utils/sound';
import { dateUtils } from '../../utils/date';
import { AreaOfLife } from '../../types';

export const TodayFocusView: React.FC = () => {
  const { 
    profile, 
    habits, 
    toggleHabitLog, 
    toggleHabitGateway, 
    recordDeepWorkSession,
    tasks, 
    toggleTaskStatus, 
    addTask,
    weeklyTasks,
    toggleWeeklyTask,
    addWeeklyTask,
    addTransaction,
    setCurrentTab
  } = useApp();

  const today = useMemo(() => dateUtils.getTodayInfo(), []);
  const currentDayNum = today.dayOfMonth;

  // --- 1. CORE SKILL FOCUS STATE (Video 2: 18-25 High-Value Skill Compounding) ---
  const [coreSkill, setCoreSkill] = useState(() => {
    return localStorage.getItem('mplt_core_skill_focus') || 'Full-Stack Software Architecture';
  });
  const [isEditingSkill, setIsEditingSkill] = useState(false);
  const [skillInput, setSkillInput] = useState(coreSkill);

  const handleSaveSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = skillInput.trim() || 'Core High-Income Skill';
    setCoreSkill(clean);
    localStorage.setItem('mplt_core_skill_focus', clean);
    setIsEditingSkill(false);
    sound.playClick();
  };

  // --- 2. DEEP WORK TIMER STATE ---
  const [timerDurationMinutes, setTimerDurationMinutes] = useState<number>(50); // 50m default flow state
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(50 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Deep work total minutes today
  const todayDateStr = `${today.year}-${String(today.monthIndex + 1).padStart(2, '0')}-${String(today.dayOfMonth).padStart(2, '0')}`;
  const [todayDeepWorkMinutes, setTodayDeepWorkMinutes] = useState<number>(() => {
    const saved = localStorage.getItem(`mplt_deep_work_${todayDateStr}`);
    return saved ? Number(saved) : 0;
  });

  const selectTimerPreset = (mins: number) => {
    setIsTimerRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimerDurationMinutes(mins);
    setTimeLeftSeconds(mins * 60);
    sound.playClick();
  };

  const toggleTimer = () => {
    if (isTimerRunning) {
      // Pause
      setIsTimerRunning(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      sound.playClick();
    } else {
      // Start
      setIsTimerRunning(true);
      sound.playPop();
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimeLeftSeconds(timerDurationMinutes * 60);
    sound.playClick();
  };

  const completeSessionManually = () => {
    const minutesCompleted = Math.max(1, Math.round((timerDurationMinutes * 60 - timeLeftSeconds) / 60) || timerDurationMinutes);
    finishTimerSession(minutesCompleted);
  };

  const finishTimerSession = (minutesLogged: number) => {
    setIsTimerRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimeLeftSeconds(timerDurationMinutes * 60);

    const newTotal = todayDeepWorkMinutes + minutesLogged;
    setTodayDeepWorkMinutes(newTotal);
    localStorage.setItem(`mplt_deep_work_${todayDateStr}`, String(newTotal));

    recordDeepWorkSession(minutesLogged, coreSkill);
  };

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeftSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            finishTimerSession(timerDurationMinutes);
            return timerDurationMinutes * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timerDurationMinutes, coreSkill, todayDeepWorkMinutes]);

  const timerFormat = useMemo(() => {
    const mins = Math.floor(timeLeftSeconds / 60);
    const secs = timeLeftSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [timeLeftSeconds]);

  const timerProgress = useMemo(() => {
    const totalSecs = timerDurationMinutes * 60;
    return Math.min(100, Math.max(0, ((totalSecs - timeLeftSeconds) / totalSecs) * 100));
  }, [timeLeftSeconds, timerDurationMinutes]);

  // --- 3. TODAY'S HABITS TELEMETRY ---
  const habitsDoneCount = habits.filter(h => !!h.logs?.[currentDayNum]).length;
  const habitCompletionRate = habits.length > 0 
    ? Math.round((habitsDoneCount / habits.length) * 100) 
    : 0;

  // --- 4. TODAY'S TASKS (Unified from Tasks + Weekly Sprint for Today) ---
  const todaySprintTasks = useMemo(() => {
    return weeklyTasks.filter(t => t.dayIndex === today.dayOfWeekIndex);
  }, [weeklyTasks, today.dayOfWeekIndex]);

  const generalTasksDueToday = useMemo(() => {
    return tasks.filter(t => t.status !== 'Completed' && (t.dueDate === todayDateStr || t.priority === 'High'));
  }, [tasks, todayDateStr]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const handleAddTodayTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addWeeklyTask(today.dayOfWeekIndex, newTaskTitle.trim(), 'High', 'Work', today.todayISO);
    setNewTaskTitle('');
    sound.playPop();
  };

  // --- 5. QUICK KINETIC CAPTURE MODAL ('C' Hotkey) ---
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [captureTab, setCaptureTab] = useState<'task' | 'expense'>('task');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState<AreaOfLife>('Work');
  const [quickPriority, setQuickPriority] = useState<'High' | 'Med' | 'Low'>('High');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickBucket, setQuickBucket] = useState<'Needs' | 'Wants' | 'Savings'>('Needs');

  // 'C' Hotkey listener
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

  const handleSaveCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (captureTab === 'task') {
      if (!quickTitle.trim()) return;
      addTask({
        title: quickTitle.trim(),
        category: quickCategory,
        priority: quickPriority,
        dueDate: todayDateStr,
        status: 'In Progress',
        expReward: quickPriority === 'High' ? 35 : 25,
      });
      setQuickTitle('');
    } else {
      const num = Number(quickAmount.replace(/\D/g, ''));
      if (!num || !quickDesc.trim()) return;
      addTransaction({
        date: todayDateStr,
        description: quickDesc.trim(),
        bucket: quickBucket,
        amount: num,
        type: 'expense',
      });
      setQuickAmount('');
      setQuickDesc('');
    }
    sound.playPop();
    setShowQuickCapture(false);
  };

  const rankTitle = getUserRankTitle(profile.level);
  const expPercentage = Math.min(100, Math.round((profile.currentExp / profile.nextLevelExp) * 100));

  return (
    <div className="max-w-[1100px] mx-auto p-3.5 sm:p-6 space-y-5 selection:bg-[#18181B] selection:text-white">

      {/* ========================================================
          1. HEADER BAR: CALM IDENTITY & UNBROKEN STREAK
          ======================================================== */}
      <section className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-[11px] font-bold text-[#71717A] tracking-wider uppercase font-ui">
                {today.dayName}, {today.dayOfMonth} {today.monthName} {today.year}
              </span>
            </div>
            <h1 className="text-[20px] sm:text-[24px] font-bold text-[#18181B] font-ui tracking-tight flex items-center gap-2">
              <span>TODAY'S EXECUTION HUB</span>
            </h1>
            <p className="text-[12px] text-[#71717A] font-ui mt-0.5">
              Zero cognitive noise. Execute your #1 core skill, trigger the 2-minute gateway, and compound daily.
            </p>
          </div>

          {/* Gamification Badges */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Streak Badge */}
            <div className="flex items-center gap-1.5 bg-[#FFF7ED] border border-orange-200 px-3 py-1.5 rounded-[8px] font-num">
              <Flame size={15} className="text-orange-500 fill-orange-500" />
              <span className="text-[13px] font-bold text-orange-950">
                {profile.streakDays} Day Streak
              </span>
            </div>

            {/* Level & Rank Badge */}
            <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#E2E8F0] px-3 py-1.5 rounded-[8px]">
              <div className="bg-[#18181B] text-white font-bold text-[10px] font-num px-1.5 py-0.5 rounded-[4px]">
                LVL {profile.level}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#18181B] font-ui leading-none">
                  {rankTitle}
                </span>
                <span className="text-[9px] text-[#71717A] font-num leading-tight mt-0.5">
                  {profile.currentExp}/{profile.nextLevelExp} EXP ({expPercentage}%)
                </span>
              </div>
            </div>

            {/* Quick Capture Trigger */}
            <button
              onClick={() => {
                setShowQuickCapture(true);
                sound.playClick();
              }}
              title="Quick Capture (HotKey: C)"
              className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-[#18181B] text-white text-[11.5px] font-bold font-ui hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={13} />
              <span>Log (C)</span>
            </button>
          </div>
        </div>

        {/* Anti-Shame Reset Protocol Banner (Video 1: Hack #5 Failure as Data) */}
        {profile.streakDays === 0 && (
          <div className="mt-3.5 pt-3 border-t border-[#F1F5F9] flex items-center gap-2 text-[11.5px] text-[#71717A] font-ui">
            <AlertCircle size={14} className="text-[#10B981] flex-shrink-0" />
            <span>
              <strong>Clean Slate Active:</strong> Yesterday is just data, not a verdict. Complete just one <strong>2-minute gateway rep</strong> today to restart your momentum.
            </span>
          </div>
        )}
      </section>

      {/* ========================================================
          2. ANCHOR 1: #1 HIGH-VALUE SKILL & DEEP WORK TIMER
             (Directly implementing Video 2: Age 18-25 Monomaniacal Skill Compounding)
          ======================================================== */}
      <section className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-6 shadow-2xs space-y-4">
        {/* Core Skill Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Target size={14} className="text-[#10B981]" />
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#71717A] font-ui">
                18–25 Core Anchor • Single High-Income Skill
              </span>
            </div>
            {isEditingSkill ? (
              <form onSubmit={handleSaveSkill} className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  autoFocus
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="px-2.5 py-1 text-[14px] font-bold border border-[#18181B] rounded-[6px] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#18181B] text-white text-[11px] font-bold rounded-[6px]"
                >
                  Save
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-[16px] sm:text-[18px] font-bold text-[#18181B] font-ui tracking-tight">
                  {coreSkill}
                </h2>
                <button
                  onClick={() => setIsEditingSkill(true)}
                  className="text-[#A1A1AA] hover:text-[#18181B] p-1 rounded transition-colors"
                  title="Change core skill focus"
                >
                  <Edit3 size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Deep work total logged today */}
          <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#E2E8F0] px-3 py-1.5 rounded-[8px] text-[11.5px] font-ui">
            <Clock size={13} className="text-[#10B981]" />
            <span className="text-[#71717A]">Focused Today:</span>
            <span className="font-bold text-[#18181B] font-num">
              {todayDeepWorkMinutes} Mins
            </span>
          </div>
        </div>

        {/* Deep Work Timer Station */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Timer Display */}
          <div className="flex flex-col items-center justify-center p-4 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[10px]">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Circular SVG Progress */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-[#E2E8F0]"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-[#18181B] transition-all duration-300"
                  strokeWidth="6"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * timerProgress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[28px] font-bold font-num text-[#18181B] tracking-tight">
                  {timerFormat}
                </span>
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#71717A] font-ui">
                  {isTimerRunning ? 'Flow Active' : 'Session Ready'}
                </span>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={toggleTimer}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-[6px] text-[12px] font-bold font-ui transition-all shadow-xs cursor-pointer ${
                  isTimerRunning 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                    : 'bg-[#18181B] hover:bg-zinc-800 text-white'
                }`}
              >
                {isTimerRunning ? <Pause size={13} /> : <Play size={13} className="fill-white" />}
                <span>{isTimerRunning ? 'Pause Flow' : 'Start Deep Work'}</span>
              </button>

              <button
                onClick={resetTimer}
                title="Reset session"
                className="p-2 border border-[#E2E8F0] bg-white hover:bg-[#F4F4F5] rounded-[6px] text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
              </button>

              {isTimerRunning && (
                <button
                  onClick={completeSessionManually}
                  title="Finish and log completed minutes"
                  className="p-2 border border-[#10B981] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-[6px] transition-colors cursor-pointer"
                >
                  <Check size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Preset Buttons & Guidance */}
          <div className="md:col-span-2 space-y-3">
            <div>
              <p className="text-[11px] font-bold text-[#71717A] uppercase font-ui tracking-wider mb-2">
                Session Protocols (No Multitasking)
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => selectTimerPreset(25)}
                  className={`p-2.5 rounded-[8px] border text-left transition-all cursor-pointer ${
                    timerDurationMinutes === 25 
                      ? 'bg-[#18181B] text-white border-[#18181B]' 
                      : 'bg-white text-[#18181B] border-[#E2E8F0] hover:bg-[#F9FAFB]'
                  }`}
                >
                  <div className="text-[14px] font-bold font-num">25 Mins</div>
                  <div className={`text-[9.5px] font-ui ${timerDurationMinutes === 25 ? 'text-zinc-300' : 'text-[#71717A]'}`}>
                    Pomodoro Sprint
                  </div>
                </button>

                <button
                  onClick={() => selectTimerPreset(50)}
                  className={`p-2.5 rounded-[8px] border text-left transition-all cursor-pointer ${
                    timerDurationMinutes === 50 
                      ? 'bg-[#18181B] text-white border-[#18181B]' 
                      : 'bg-white text-[#18181B] border-[#E2E8F0] hover:bg-[#F9FAFB]'
                  }`}
                >
                  <div className="text-[14px] font-bold font-num">50 Mins</div>
                  <div className={`text-[9.5px] font-ui ${timerDurationMinutes === 50 ? 'text-zinc-300' : 'text-[#71717A]'}`}>
                    Deep Flow State
                  </div>
                </button>

                <button
                  onClick={() => selectTimerPreset(90)}
                  className={`p-2.5 rounded-[8px] border text-left transition-all cursor-pointer ${
                    timerDurationMinutes === 90 
                      ? 'bg-[#18181B] text-white border-[#18181B]' 
                      : 'bg-white text-[#18181B] border-[#E2E8F0] hover:bg-[#F9FAFB]'
                  }`}
                >
                  <div className="text-[14px] font-bold font-num">90 Mins</div>
                  <div className={`text-[9.5px] font-ui ${timerDurationMinutes === 90 ? 'text-zinc-300' : 'text-[#71717A]'}`}>
                    Mastery Block
                  </div>
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] text-[11px] text-[#71717A] font-ui space-y-1">
              <p className="font-bold text-[#18181B] flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-[#10B981]" />
                <span>The Video 2 Compound Rule:</span>
              </p>
              <p>
                At age 18–25, 2 hours of focused deep work every single day on <strong>{coreSkill}</strong> compounds into the top 1% market value before your peers finish scrolling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. ANCHOR 2: CORE HABITS & 2-MINUTE RULE GATEWAY
             (Directly implementing Video 1: Hack #1 Habit Loop + Hack #2 2-Minute Rule)
          ======================================================== */}
      <section className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-6 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-[15px] font-bold text-[#18181B] font-ui tracking-tight flex items-center gap-2">
              <Zap size={15} className="text-amber-500 fill-amber-500" />
              <span>CORE DAILY HABITS & 2-MINUTE GATEWAYS</span>
            </h3>
            <p className="text-[11.5px] text-[#71717A] font-ui">
              Normal days: check the box. Low-motivation days: tap <strong>⚡ 2-Min Force Start</strong> to break inertia and protect your streak.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[13px] font-bold text-[#18181B] font-num">
              {habitsDoneCount}/{habits.length} Done
            </span>
            <span className="text-[10px] text-[#71717A] font-ui block">
              ({habitCompletionRate}%)
            </span>
          </div>
        </div>

        {/* Habit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {habits.map((habit) => {
            const isDone = !!habit.logs?.[currentDayNum];
            const isGateway = !!habit.gatewayLogs?.[currentDayNum];

            return (
              <div 
                key={habit.id}
                className={`p-3 rounded-[9px] border transition-all flex items-start justify-between gap-3 ${
                  isDone 
                    ? isGateway 
                      ? 'bg-amber-50/60 border-amber-200' 
                      : 'bg-[#F0FDF4] border-emerald-200' 
                    : 'bg-[#F9FAFB] border-[#E2E8F0] hover:border-zinc-300'
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#71717A]">
                      {habit.category}
                    </span>
                    {isDone && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        isGateway 
                          ? 'bg-amber-100 text-amber-800 border-amber-300' 
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {isGateway ? '⚡ 2-Min Rep Done' : '✓ Full Rep Done'}
                      </span>
                    )}
                  </div>

                  <h4 className={`text-[13.5px] font-bold font-ui truncate ${isDone ? 'line-through text-[#71717A]' : 'text-[#18181B]'}`}>
                    {habit.title}
                  </h4>

                  {/* 2-Minute Gateway hint */}
                  <p className="text-[11px] text-[#71717A] font-ui">
                    <span className="text-amber-600 font-semibold">⚡ Gateway: </span>
                    <span>{habit.twoMinuteRuleGateway || 'Take 2 minutes to start'}</span>
                  </p>
                </div>

                {/* Habit Action Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                  {/* ⚡ 2-Min Force Start Button */}
                  <button
                    type="button"
                    onClick={() => toggleHabitGateway(habit.id, currentDayNum)}
                    title={isGateway ? 'Revert 2-Min Gateway' : 'Force 2-minute gateway start (protects streak)'}
                    className={`px-2 py-1.5 rounded-[6px] text-[10.5px] font-bold font-ui transition-all flex items-center gap-1 cursor-pointer border ${
                      isGateway 
                        ? 'bg-amber-500 text-white border-amber-600' 
                        : 'bg-white hover:bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <Zap size={11} className={isGateway ? 'fill-white' : 'fill-amber-500'} />
                    <span>2-Min</span>
                  </button>

                  {/* Full Rep Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleHabitLog(habit.id, currentDayNum)}
                    title="Mark full habit completed"
                    className={`w-8 h-8 rounded-[6px] border flex items-center justify-center transition-all cursor-pointer ${
                      isDone && !isGateway
                        ? 'bg-[#18181B] text-white border-[#18181B]' 
                        : 'bg-white hover:bg-[#F4F4F5] border-[#CBD5E1] text-transparent hover:text-zinc-300'
                    }`}
                  >
                    <Check size={14} className="stroke-[3]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex items-center justify-between text-[11px] text-[#71717A] font-ui border-t border-[#F1F5F9]">
          <span>Need full monthly ledger or habit editing?</span>
          <button
            onClick={() => setCurrentTab('system')}
            className="font-bold text-[#18181B] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open 31-Day Habit Matrix</span>
            <ChevronRight size={12} />
          </button>
        </div>
      </section>

      {/* ========================================================
          4. ANCHOR 3: TODAY'S HIGH-PRIORITY TASKS (UNIFIED)
          ======================================================== */}
      <section className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-6 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-[15px] font-bold text-[#18181B] font-ui tracking-tight flex items-center gap-2">
              <CheckCircle2 size={15} className="text-[#10B981]" />
              <span>TODAY'S CRITICAL TASKS</span>
            </h3>
            <p className="text-[11.5px] text-[#71717A] font-ui">
              Top 3–5 high-leverage deliverables scheduled for today. Check off as you execute.
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('system')}
            className="text-[11px] font-bold text-[#71717A] hover:text-[#18181B] font-ui flex items-center gap-1"
          >
            <span>View Full Backlog</span>
            <ChevronRight size={12} />
          </button>
        </div>

        {/* Inline Task Add Input */}
        <form onSubmit={handleAddTodayTask} className="flex items-center gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a high-priority task for today... (Press Enter)"
            className="flex-1 px-3 py-2 text-[12.5px] rounded-[7px] border border-[#E2E8F0] focus:border-[#18181B] focus:outline-none transition-colors font-ui"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-[#18181B] text-white rounded-[7px] text-[12px] font-bold font-ui hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus size={13} />
            <span>Add Task</span>
          </button>
        </form>

        {/* Task List */}
        <div className="space-y-2">
          {todaySprintTasks.length === 0 && generalTasksDueToday.length === 0 ? (
            <div className="py-6 text-center text-[#71717A] font-ui text-[12px] bg-[#F9FAFB] rounded-[8px] border border-dashed border-[#E2E8F0]">
              No pending tasks for today. Add your #1 priority task above to get started!
            </div>
          ) : (
            <>
              {todaySprintTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-2.5 rounded-[8px] border transition-all ${
                    task.isCompleted 
                      ? 'bg-[#F9FAFB] border-[#E2E8F0] opacity-60' 
                      : 'bg-white border-[#E2E8F0] hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleWeeklyTask(task.id)}
                      className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-all cursor-pointer ${
                        task.isCompleted 
                          ? 'bg-[#18181B] text-white border-[#18181B]' 
                          : 'bg-white hover:bg-[#F4F4F5] border-[#CBD5E1]'
                      }`}
                    >
                      {task.isCompleted && <Check size={12} className="stroke-[3]" />}
                    </button>
                    <span className={`text-[12.5px] font-medium font-ui truncate ${task.isCompleted ? 'line-through text-[#71717A]' : 'text-[#18181B]'}`}>
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[9px] font-bold font-num px-1.5 py-0.5 rounded border ${
                      task.priority === 'High' 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] font-num text-[#71717A]">
                      +{task.expReward} EXP
                    </span>
                  </div>
                </div>
              ))}

              {generalTasksDueToday.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2.5 rounded-[8px] border bg-white border-[#E2E8F0] hover:border-zinc-300 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleTaskStatus(task.id)}
                      className="w-5 h-5 rounded-[4px] border bg-white hover:bg-[#F4F4F5] border-[#CBD5E1] flex items-center justify-center cursor-pointer"
                    >
                      {task.status === 'Completed' && <Check size={12} className="stroke-[3]" />}
                    </button>
                    <span className="text-[12.5px] font-medium font-ui text-[#18181B] truncate">
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
                      {task.category}
                    </span>
                    <span className="text-[10px] font-num text-[#71717A]">
                      +{task.expReward} EXP
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      {/* ========================================================
          5. QUICK KINETIC CAPTURE MODAL ('C' Hotkey)
          ======================================================== */}
      <AnimatePresence>
        {showQuickCapture && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18181B]/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-[12px] shadow-xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <Zap size={15} className="text-[#10B981]" />
                  <h3 className="text-[14px] font-bold text-[#18181B] font-ui">
                    5-Second Quick Kinetic Capture
                  </h3>
                </div>
                <button
                  onClick={() => setShowQuickCapture(false)}
                  className="text-[#71717A] hover:text-[#18181B] p-1 rounded hover:bg-[#F4F4F5]"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex rounded-[6px] bg-[#F4F4F5] p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setCaptureTab('task')}
                  className={`flex-1 py-1 text-[11.5px] font-bold rounded-[5px] transition-all ${
                    captureTab === 'task' ? 'bg-white text-[#18181B] shadow-2xs' : 'text-[#71717A]'
                  }`}
                >
                  Task Deliverable
                </button>
                <button
                  type="button"
                  onClick={() => setCaptureTab('expense')}
                  className={`flex-1 py-1 text-[11.5px] font-bold rounded-[5px] transition-all ${
                    captureTab === 'expense' ? 'bg-white text-[#18181B] shadow-2xs' : 'text-[#71717A]'
                  }`}
                >
                  Quick Expense
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveCapture} className="space-y-3 font-ui text-[12px]">
                {captureTab === 'task' ? (
                  <>
                    <div className="space-y-1">
                      <label className="font-bold text-[#18181B]">Task Description</label>
                      <input
                        type="text"
                        autoFocus
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        placeholder="e.g. Refactor API routes, Review pull request"
                        className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[6px] focus:outline-none focus:border-[#18181B]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-[#71717A]">Category</label>
                        <select
                          value={quickCategory}
                          onChange={(e) => setQuickCategory(e.target.value as AreaOfLife)}
                          className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-[6px] bg-white"
                        >
                          <option value="Work">Work</option>
                          <option value="Health">Health</option>
                          <option value="Personal Growth">Personal Growth</option>
                          <option value="Money">Money</option>
                          <option value="Spirituality">Spirituality</option>
                          <option value="Family">Family</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-[#71717A]">Priority</label>
                        <select
                          value={quickPriority}
                          onChange={(e) => setQuickPriority(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-[6px] bg-white"
                        >
                          <option value="High">High</option>
                          <option value="Med">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="font-bold text-[#18181B]">Amount (IDR)</label>
                      <input
                        type="number"
                        autoFocus
                        value={quickAmount}
                        onChange={(e) => setQuickAmount(e.target.value)}
                        placeholder="e.g. 50000"
                        className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[6px] focus:outline-none focus:border-[#18181B] font-num"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-[#18181B]">Description</label>
                      <input
                        type="text"
                        value={quickDesc}
                        onChange={(e) => setQuickDesc(e.target.value)}
                        placeholder="e.g. Groceries, Coffee specialty"
                        className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[6px] focus:outline-none focus:border-[#18181B]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-[#71717A]">50/30/20 Bucket</label>
                      <select
                        value={quickBucket}
                        onChange={(e) => setQuickBucket(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-[6px] bg-white"
                      >
                        <option value="Needs">Needs (50%)</option>
                        <option value="Wants">Wants (30%)</option>
                        <option value="Savings">Savings/Invest (20%)</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickCapture(false)}
                    className="px-3 py-1.5 text-[11.5px] border border-[#E2E8F0] rounded-[6px] hover:bg-[#F4F4F5] text-[#71717A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#18181B] text-white rounded-[6px] text-[11.5px] font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Save Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
