import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Award, 
  Calendar, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Lightbulb, 
  ShieldAlert, 
  Sparkles, 
  Target, 
  Zap,
  Wallet,
  Check,
  RotateCcw,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { dateUtils } from '../../utils/date';
import { WeeklyEvaluation } from '../../types';
import confetti from 'canvas-confetti';

export const WeeklyEvaluationView: React.FC = () => {
  const { 
    habits, 
    tasks, 
    transactions, 
    weeklyEvaluations, 
    saveWeeklyEvaluation
  } = useApp();

  // weekOffset: -1 represents Last Week (primary debrief target), 0 is Current Week
  const [weekOffset, setWeekOffset] = useState<number>(-1);
  const sprintWeek = useMemo(() => dateUtils.getSprintWeekInfo(weekOffset), [weekOffset]);
  const currentWeekNumber = sprintWeek.currentWeekNumber;
  const currentYear = sprintWeek.mondayDate.getFullYear();

  // Check if this week already has a recorded evaluation
  const existingEvaluation = useMemo(() => {
    return weeklyEvaluations.find(e => e.year === currentYear && e.weekNumber === currentWeekNumber);
  }, [weeklyEvaluations, currentYear, currentWeekNumber]);

  // Compute live telemetry for the viewed sprint week
  const liveTelemetry = useMemo(() => {
    // 1. Habit Adherence
    const days = sprintWeek.sprintDays;
    let completedHabitLogs = 0;
    const targetHabitLogs = Math.max(1, habits.length * 7);

    habits.forEach(h => {
      days.forEach(d => {
        if (h.logs?.[d.dayNum]) {
          completedHabitLogs++;
        }
      });
    });

    const habitAdherencePct = Math.min(100, Math.round((completedHabitLogs / targetHabitLogs) * 100));

    // 2. Deep Work Total
    let deepWorkMins = 0;
    days.forEach(d => {
      const parts = d.dateStr.split('.');
      const iso = `${parts[2]}-${parts[1]}-${parts[0]}`;
      const saved = localStorage.getItem(`mplt_deep_work_${iso}`);
      if (saved) {
        deepWorkMins += Number(saved) || 0;
      }
    });

    // 3. Completed Tasks
    // Tasks marked completed or with due date in sprint range
    const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;

    // 4. Financial Spending
    let totalSpent = 0;
    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        totalSpent += tx.amount;
      }
    });

    // 5. Composite Performance Score (0 - 100)
    // 40% Habit Consistency + 35% Deep Work (target 5h = 300m) + 25% Task Execution
    const deepWorkScore = Math.min(100, Math.round((deepWorkMins / 300) * 100));
    const taskScore = Math.min(100, completedTasksCount * 20);
    const performanceScore = Math.min(100, Math.round(
      habitAdherencePct * 0.45 + deepWorkScore * 0.35 + taskScore * 0.20
    ));

    let performanceGrade: 'S' | 'A' | 'B' | 'C' | 'D' = 'C';
    if (performanceScore >= 90) performanceGrade = 'S';
    else if (performanceScore >= 80) performanceGrade = 'A';
    else if (performanceScore >= 70) performanceGrade = 'B';
    else if (performanceScore >= 55) performanceGrade = 'C';
    else performanceGrade = 'D';

    return {
      habitAdherencePct,
      habitsCompleted: completedHabitLogs,
      habitsTarget: targetHabitLogs,
      deepWorkMinutesTotal: deepWorkMins,
      tasksCompletedCount: completedTasksCount,
      totalSpending: totalSpent,
      performanceScore,
      performanceGrade
    };
  }, [sprintWeek, habits, tasks, transactions]);

  // Form State for Reflection
  const [wins, setWins] = useState(existingEvaluation?.reflection.wins || '');
  const [biggestObstacle, setBiggestObstacle] = useState(existingEvaluation?.reflection.biggestObstacle || '');
  const [energyLeaks, setEnergyLeaks] = useState(existingEvaluation?.reflection.energyLeaks || '');
  const [coreSkillProgress, setCoreSkillProgress] = useState(existingEvaluation?.reflection.coreSkillProgress || '');
  const [nextWeekOneThing, setNextWeekOneThing] = useState(existingEvaluation?.reflection.nextWeekOneThing || '');
  const [mentalClarityRating, setMentalClarityRating] = useState<number>(existingEvaluation?.reflection.mentalClarityRating || 4);
  const [energyRating, setEnergyRating] = useState<number>(existingEvaluation?.reflection.energyRating || 4);
  const [isEditing, setIsEditing] = useState(!existingEvaluation);

  // Sync form when viewed week changes
  React.useEffect(() => {
    if (existingEvaluation) {
      setWins(existingEvaluation.reflection.wins);
      setBiggestObstacle(existingEvaluation.reflection.biggestObstacle);
      setEnergyLeaks(existingEvaluation.reflection.energyLeaks);
      setCoreSkillProgress(existingEvaluation.reflection.coreSkillProgress);
      setNextWeekOneThing(existingEvaluation.reflection.nextWeekOneThing);
      setMentalClarityRating(existingEvaluation.reflection.mentalClarityRating || 4);
      setEnergyRating(existingEvaluation.reflection.energyRating || 4);
      setIsEditing(false);
    } else {
      setWins('');
      setBiggestObstacle('');
      setEnergyLeaks('');
      setCoreSkillProgress('');
      setNextWeekOneThing('');
      setMentalClarityRating(4);
      setEnergyRating(4);
      setIsEditing(true);
    }
  }, [existingEvaluation, weekOffset]);

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wins.trim() && !biggestObstacle.trim() && !nextWeekOneThing.trim()) {
      alert('Please fill out at least your key wins, biggest obstacle, and the #1 adjustment for next week.');
      return;
    }

    // Build synthesized insights based on reflection & telemetry
    const strengths: string[] = [];
    if (liveTelemetry.habitAdherencePct >= 70) {
      strengths.push(`Maintained high habit discipline (${liveTelemetry.habitAdherencePct}% adherence)`);
    }
    if (liveTelemetry.deepWorkMinutesTotal >= 180) {
      strengths.push(`Accumulated ${Math.round(liveTelemetry.deepWorkMinutesTotal / 60)}h of focused deep work`);
    }
    if (wins.trim()) {
      strengths.push(wins.slice(0, 100));
    }

    const evaluationRecord: WeeklyEvaluation = {
      id: existingEvaluation?.id || `eval-${currentYear}-W${String(currentWeekNumber).padStart(2, '0')}`,
      weekNumber: currentWeekNumber,
      year: currentYear,
      startDate: sprintWeek.sprintDays[0].dateStr,
      endDate: sprintWeek.sprintDays[6].dateStr,
      weekRangeStr: sprintWeek.formattedWeekRange,
      createdAt: new Date().toISOString(),
      metrics: {
        habitAdherencePct: liveTelemetry.habitAdherencePct,
        habitsCompleted: liveTelemetry.habitsCompleted,
        habitsTarget: liveTelemetry.habitsTarget,
        deepWorkMinutesTotal: liveTelemetry.deepWorkMinutesTotal,
        tasksCompletedCount: liveTelemetry.tasksCompletedCount,
        totalSpending: liveTelemetry.totalSpending,
        performanceScore: liveTelemetry.performanceScore,
        performanceGrade: liveTelemetry.performanceGrade,
      },
      reflection: {
        wins: wins.trim(),
        biggestObstacle: biggestObstacle.trim(),
        energyLeaks: energyLeaks.trim(),
        coreSkillProgress: coreSkillProgress.trim(),
        nextWeekOneThing: nextWeekOneThing.trim(),
        mentalClarityRating,
        energyRating,
      },
      aiSynthesis: {
        summary: `Week ${currentWeekNumber} evaluated with grade ${liveTelemetry.performanceGrade} (${liveTelemetry.performanceScore}% composite execution).`,
        strengths: strengths.slice(0, 2),
        criticalFix: nextWeekOneThing.trim() || 'Enforce daily deep work block on single core skill.',
      }
    };

    saveWeeklyEvaluation(evaluationRecord);
    setIsEditing(false);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          1. HEADER & SPRINT WEEK NAVIGATOR
          ======================================================== */}
      <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span className="text-[11px] font-bold text-[#71717A] tracking-wider uppercase font-ui">
                Weekly Retrospective & Performance Audit
              </span>
            </div>
            <h1 className="text-[20px] sm:text-[22px] font-bold text-[#18181B] font-ui tracking-tight flex items-center gap-2">
              <span>WEEKLY EVALUATION & REFLECTION</span>
            </h1>
            <p className="text-[12px] text-[#71717A] font-ui mt-0.5">
              &ldquo;Evaluasi mingguan bukan untuk menghakimi, melainkan mengukur apakah sistem hidup Anda benar-benar bekerja.&rdquo;
            </p>
          </div>

          {/* Week Selector Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#F9FAFB] p-1 border border-[#E2E8F0] rounded-[8px] text-[12px] font-ui font-semibold">
              <button
                type="button"
                onClick={() => {
                  setWeekOffset(prev => prev - 1);
                  sound.playClick();
                }}
                className="p-1.5 rounded-[5px] hover:bg-white text-[#18181B] transition-all cursor-pointer"
                title="Previous Week"
              >
                <ChevronLeft size={14} />
              </button>

              <div className="px-2.5 py-1 text-center min-w-[170px]">
                <div className="text-[12px] font-bold text-[#18181B] flex items-center justify-center gap-1.5">
                  <Calendar size={13} className="text-[#10B981]" />
                  <span>{sprintWeek.relativeWeekLabel}</span>
                  <span className="text-[10px] font-num bg-[#18181B] text-white px-1.5 py-0.2 rounded">
                    W{String(currentWeekNumber).padStart(2, '0')}
                  </span>
                </div>
                <div className="text-[10px] text-[#71717A] font-num mt-0.5">
                  {sprintWeek.formattedWeekRange}
                </div>
              </div>

              <button
                type="button"
                disabled={weekOffset >= 0}
                onClick={() => {
                  setWeekOffset(prev => prev + 1);
                  sound.playClick();
                }}
                className={`p-1.5 rounded-[5px] transition-all ${
                  weekOffset >= 0 ? 'text-[#CBD5E1] cursor-not-allowed' : 'hover:bg-white text-[#18181B] cursor-pointer'
                }`}
                title="Next Week"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Quick 'Last Week' Button */}
            {weekOffset !== -1 && (
              <button
                type="button"
                onClick={() => {
                  setWeekOffset(-1);
                  sound.playClick();
                }}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-2 text-[11px] font-bold text-[#18181B] bg-white border border-[#E2E8F0] rounded-[8px] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Last Week</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          2. OBJECTIVE TELEMETRY SCORECARD
          ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Habit Consistency */}
        <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-3.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-[11px] font-bold font-ui uppercase tracking-wider">Habit Consistency</span>
            <CheckCircle2 size={15} className="text-[#10B981]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-bold font-num text-[#18181B] leading-none">
              {liveTelemetry.habitAdherencePct}%
            </span>
            <span className="text-[11px] text-[#71717A] font-ui">adherence</span>
          </div>
          <div className="w-full bg-[#F4F4F5] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#10B981] h-full rounded-full transition-all duration-500" 
              style={{ width: `${liveTelemetry.habitAdherencePct}%` }}
            />
          </div>
          <p className="text-[10px] text-[#71717A] font-num">
            {liveTelemetry.habitsCompleted} of {liveTelemetry.habitsTarget} routine logs completed
          </p>
        </div>

        {/* Deep Work Focus */}
        <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-3.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-[11px] font-bold font-ui uppercase tracking-wider">Core Skill Deep Work</span>
            <Zap size={15} className="text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-bold font-num text-[#18181B] leading-none">
              {(liveTelemetry.deepWorkMinutesTotal / 60).toFixed(1)}h
            </span>
            <span className="text-[11px] text-[#71717A] font-ui">flow state</span>
          </div>
          <div className="w-full bg-[#F4F4F5] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (liveTelemetry.deepWorkMinutesTotal / 300) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-[#71717A] font-num">
            Target: 5.0h deliberate practice per week
          </p>
        </div>

        {/* Task Velocity */}
        <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-3.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-[11px] font-bold font-ui uppercase tracking-wider">Tasks Shipped</span>
            <Target size={15} className="text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-bold font-num text-[#18181B] leading-none">
              {liveTelemetry.tasksCompletedCount}
            </span>
            <span className="text-[11px] text-[#71717A] font-ui">deliverables</span>
          </div>
          <div className="w-full bg-[#F4F4F5] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, liveTelemetry.tasksCompletedCount * 20)}%` }}
            />
          </div>
          <p className="text-[10px] text-[#71717A] font-ui">
            Sprint deliverables shipped
          </p>
        </div>

        {/* Weekly Burn Rate */}
        <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-3.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-[11px] font-bold font-ui uppercase tracking-wider">Weekly Spend</span>
            <Wallet size={15} className="text-rose-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[18px] sm:text-[20px] font-bold font-num text-[#18181B] leading-none truncate">
              Rp {liveTelemetry.totalSpending.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-[#F4F4F5] h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: '65%' }} />
          </div>
          <p className="text-[10px] text-[#71717A] font-ui">
            50/30/20 Burn rate awareness
          </p>
        </div>

        {/* Composite Performance Grade */}
        <div className="col-span-2 lg:col-span-1 bg-[#18181B] text-white rounded-[10px] p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold font-ui uppercase tracking-wider text-zinc-400">
              System Grade
            </span>
            <Award size={16} className="text-[#10B981]" />
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-[32px] font-extrabold font-num text-white leading-none">
              {liveTelemetry.performanceGrade}
            </span>
            <span className="text-[12px] font-num text-zinc-400">
              {liveTelemetry.performanceScore}/100 PTS
            </span>
          </div>
          <div className="text-[10px] font-ui text-[#10B981] font-semibold">
            {liveTelemetry.performanceGrade === 'S' && '★ God Tier Compounding'}
            {liveTelemetry.performanceGrade === 'A' && '✓ High Momentum Velocity'}
            {liveTelemetry.performanceGrade === 'B' && '• Solid Steady Execution'}
            {liveTelemetry.performanceGrade === 'C' && '! Friction Detected'}
            {liveTelemetry.performanceGrade === 'D' && '⚠ Dopamine Reset Required'}
          </div>
        </div>
      </div>

      {/* ========================================================
          3. SELF-REFLECTION QUESTIONNAIRE (BASED ON 2 VIDEOS)
          ======================================================== */}
      <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[6px] bg-[#18181B] text-white flex items-center justify-center font-bold text-[12px]">
              Q
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#18181B] font-ui tracking-tight">
                Self-Reflection & System Audit
              </h2>
              <p className="text-[11.5px] text-[#71717A] font-ui">
                Answer these 5 core questions honestly to calibrate your compounding curve.
              </p>
            </div>
          </div>

          {existingEvaluation && !isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-[11.5px] font-bold font-ui text-[#18181B] hover:text-[#10B981] px-2.5 py-1 rounded-[6px] border border-[#E2E8F0] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
            >
              Edit Reflection
            </button>
          )}
        </div>

        {/* Existing Evaluation Display Mode */}
        {existingEvaluation && !isEditing ? (
          <div className="space-y-4">
            {/* AI / System Synthesis Banner */}
            {existingEvaluation.aiSynthesis && (
              <div className="p-3.5 rounded-[8px] bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-3">
                <Sparkles size={16} className="text-[#10B981] flex-shrink-0 mt-0.5" />
                <div className="text-[12px] font-ui text-emerald-950">
                  <div className="font-bold mb-0.5">Automated Coach Debrief:</div>
                  <p>{existingEvaluation.aiSynthesis.summary}</p>
                  <div className="mt-2 pt-2 border-t border-emerald-200/60 font-semibold flex items-center gap-2">
                    <span className="text-[#10B981]">Next Week Critical Fix:</span>
                    <span>{existingEvaluation.aiSynthesis.criticalFix}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px] font-ui">
              {/* Question 1 */}
              <div className="p-3.5 rounded-[8px] bg-[#F9FAFB] border border-[#E2E8F0] space-y-1">
                <div className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#10B981]" />
                  <span>1. Needle Movers & Wins</span>
                </div>
                <p className="text-[#18181B] whitespace-pre-line leading-relaxed">
                  {existingEvaluation.reflection.wins || 'No entry logged.'}
                </p>
              </div>

              {/* Question 2 */}
              <div className="p-3.5 rounded-[8px] bg-[#F9FAFB] border border-[#E2E8F0] space-y-1">
                <div className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert size={13} className="text-amber-500" />
                  <span>2. Biggest Obstacle & Friction</span>
                </div>
                <p className="text-[#18181B] whitespace-pre-line leading-relaxed">
                  {existingEvaluation.reflection.biggestObstacle || 'No entry logged.'}
                </p>
              </div>

              {/* Question 3 */}
              <div className="p-3.5 rounded-[8px] bg-[#F9FAFB] border border-[#E2E8F0] space-y-1">
                <div className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                  <Flame size={13} className="text-rose-500" />
                  <span>3. Energy Leaks & Low-Value Noise</span>
                </div>
                <p className="text-[#18181B] whitespace-pre-line leading-relaxed">
                  {existingEvaluation.reflection.energyLeaks || 'No entry logged.'}
                </p>
              </div>

              {/* Question 4 */}
              <div className="p-3.5 rounded-[8px] bg-[#F9FAFB] border border-[#E2E8F0] space-y-1">
                <div className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={13} className="text-indigo-500" />
                  <span>4. Core Skill Compounding (Age 18-25)</span>
                </div>
                <p className="text-[#18181B] whitespace-pre-line leading-relaxed">
                  {existingEvaluation.reflection.coreSkillProgress || 'No entry logged.'}
                </p>
              </div>

              {/* Question 5: Non-negotiable */}
              <div className="col-span-1 md:col-span-2 p-3.5 rounded-[8px] bg-[#18181B] text-white border border-[#18181B] space-y-1">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb size={13} className="text-yellow-400" />
                  <span>5. The #1 Non-Negotiable Lever for Next Week</span>
                </div>
                <p className="text-white text-[13px] font-semibold whitespace-pre-line leading-relaxed">
                  {existingEvaluation.reflection.nextWeekOneThing || 'No entry logged.'}
                </p>
              </div>
            </div>

            {/* Ratings Bar */}
            <div className="flex items-center gap-4 pt-2 text-[11.5px] font-ui text-[#71717A]">
              <div>
                Mental Clarity:{' '}
                <strong className="text-[#18181B] font-num">{existingEvaluation.reflection.mentalClarityRating}/5</strong>
              </div>
              <span>•</span>
              <div>
                Physical Energy:{' '}
                <strong className="text-[#18181B] font-num">{existingEvaluation.reflection.energyRating}/5</strong>
              </div>
            </div>
          </div>
        ) : (
          /* Form Entry Mode */
          <form onSubmit={handleSubmitEvaluation} className="space-y-5">
            {/* Question 1 */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[#18181B] font-ui flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#10B981]" />
                <span>1. What actually succeeded and moved the needle this past week?</span>
              </label>
              <p className="text-[11px] text-[#71717A] font-ui">
                Acknowledge wins: habit streaks protected, hard problems solved, or deep work completed.
              </p>
              <textarea
                rows={2}
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                placeholder="e.g. Protected morning deep work blocks 4 out of 5 days. Shipped the core client deliverable."
                className="w-full px-3 py-2 text-[12px] font-ui border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B]"
              />
            </div>

            {/* Question 2 */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[#18181B] font-ui flex items-center gap-1.5">
                <ShieldAlert size={13} className="text-amber-500" />
                <span>2. What was the single biggest obstacle or friction point?</span>
              </label>
              <p className="text-[11px] text-[#71717A] font-ui">
                Where did you slip? Late-night sleep compromise, procrastination loop, or emotional low.
              </p>
              <textarea
                rows={2}
                value={biggestObstacle}
                onChange={(e) => setBiggestObstacle(e.target.value)}
                placeholder="e.g. Thursday night scrolling ruined Friday morning energy. Hesitated to begin complex code refactor."
                className="w-full px-3 py-2 text-[12px] font-ui border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B]"
              />
            </div>

            {/* Question 3 */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[#18181B] font-ui flex items-center gap-1.5">
                <Flame size={13} className="text-rose-500" />
                <span>3. Energy Leaks: Where was time or energy wasted on trivial low-yield noise?</span>
              </label>
              <p className="text-[11px] text-[#71717A] font-ui">
                Dopamine trap audit: excessive social media, reactive chatting, multitasking, or superficial busywork.
              </p>
              <textarea
                rows={2}
                value={energyLeaks}
                onChange={(e) => setEnergyLeaks(e.target.value)}
                placeholder="e.g. Checking messaging channels during work. Swapping between 3 tasks instead of finishing one."
                className="w-full px-3 py-2 text-[12px] font-ui border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B]"
              />
            </div>

            {/* Question 4 */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[#18181B] font-ui flex items-center gap-1.5">
                <Zap size={13} className="text-indigo-500" />
                <span>4. Core Skill Focus: Did you genuinely compound your #1 high-value skill?</span>
              </label>
              <p className="text-[11px] text-[#71717A] font-ui">
                Video 2 age 18-25 principle: Don&apos;t juggle 10 skills. Did you do deliberate practice in your primary craft?
              </p>
              <textarea
                rows={2}
                value={coreSkillProgress}
                onChange={(e) => setCoreSkillProgress(e.target.value)}
                placeholder="e.g. Wrote 300+ lines of production TypeScript and mastered state machine logic."
                className="w-full px-3 py-2 text-[12px] font-ui border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B]"
              />
            </div>

            {/* Question 5: Non-negotiable */}
            <div className="space-y-1.5 p-3.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
              <label className="text-[12px] font-bold text-[#18181B] font-ui flex items-center gap-1.5">
                <Lightbulb size={13} className="text-yellow-600" />
                <span>5. The #1 Non-Negotiable Lever: What is your ONE adjustment for next week?</span>
              </label>
              <p className="text-[11px] text-[#71717A] font-ui">
                Define the single high-leverage change that will make everything else easier or unnecessary.
              </p>
              <input
                type="text"
                value={nextWeekOneThing}
                onChange={(e) => setNextWeekOneThing(e.target.value)}
                placeholder="e.g. Put phone in another room between 08:00 - 11:30 every single weekday."
                className="w-full px-3 py-2 text-[12px] font-ui bg-white border border-[#CBD5E1] rounded-[6px] focus:outline-none focus:border-[#18181B] font-semibold"
              />
            </div>

            {/* Qualitative Energy & Clarity Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11.5px] font-ui">
                  <span className="font-bold text-[#18181B]">Mental Clarity Rating:</span>
                  <span className="font-num font-bold text-[#10B981]">{mentalClarityRating} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={mentalClarityRating}
                  onChange={(e) => setMentalClarityRating(Number(e.target.value))}
                  className="w-full accent-[#18181B] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#71717A] font-ui">
                  <span>1: Brain Fog</span>
                  <span>5: Razor Sharp</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11.5px] font-ui">
                  <span className="font-bold text-[#18181B]">Physical Energy & Recovery:</span>
                  <span className="font-num font-bold text-amber-600">{energyRating} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={energyRating}
                  onChange={(e) => setEnergyRating(Number(e.target.value))}
                  className="w-full accent-[#18181B] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#71717A] font-ui">
                  <span>1: Exhausted</span>
                  <span>5: Peak Vitality</span>
                </div>
              </div>
            </div>

            {/* Submit Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
              <div className="text-[11px] text-[#71717A] font-ui">
                Saves to your historical trajectory log &bull; Awards <strong className="text-[#10B981]">+100 EXP</strong>
              </div>

              <div className="flex items-center gap-2">
                {existingEvaluation && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-[6px] border border-[#E2E8F0] text-[12px] font-bold text-[#71717A] hover:bg-[#F9FAFB] cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[6px] bg-[#18181B] text-white hover:bg-[#27272A] text-[12px] font-bold font-ui transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Lock In Weekly Evaluation</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================
          4. HISTORICAL TRAJECTORY ARCHIVE
          ======================================================== */}
      {weeklyEvaluations.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={15} className="text-[#10B981]" />
              <h3 className="text-[13px] font-bold text-[#18181B] font-ui">
                Reflection History & Weekly Archives ({weeklyEvaluations.length} Weeks)
              </h3>
            </div>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {weeklyEvaluations.map((evalRecord) => (
              <div key={evalRecord.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[6px] bg-[#18181B] text-white flex items-center justify-center font-bold text-[12px] font-num">
                    {evalRecord.metrics.performanceGrade}
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-[#18181B] font-ui flex items-center gap-1.5">
                      <span>Week {evalRecord.weekNumber}</span>
                      <span className="text-[10px] text-[#71717A] font-num">
                        ({evalRecord.weekRangeStr})
                      </span>
                    </div>
                    <p className="text-[11px] text-[#71717A] font-ui line-clamp-1">
                      {evalRecord.reflection.nextWeekOneThing ? (
                        <>#1 Priority: &ldquo;{evalRecord.reflection.nextWeekOneThing}&rdquo;</>
                      ) : (
                        evalRecord.reflection.wins || 'Weekly audit logged'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-num text-[#71717A] self-end sm:self-auto">
                  <span>{evalRecord.metrics.habitAdherencePct}% Habits</span>
                  <span>&bull;</span>
                  <span>{Math.round(evalRecord.metrics.deepWorkMinutesTotal / 60)}h Focus</span>
                  <span>&bull;</span>
                  <button
                    type="button"
                    onClick={() => {
                      // Calculate offset relative to real week
                      const currentRealW = dateUtils.getSprintWeekInfo(0).currentWeekNumber;
                      setWeekOffset(evalRecord.weekNumber - currentRealW);
                      sound.playClick();
                    }}
                    className="text-[#18181B] font-bold font-ui hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
