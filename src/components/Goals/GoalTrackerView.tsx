import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Trophy, 
  Calendar, 
  Gift, 
  CheckCircle2, 
  Target, 
  Plus, 
  Check, 
  Sparkles, 
  Clock, 
  Layers, 
  ShieldCheck, 
  HeartHandshake, 
  Briefcase, 
  TrendingUp, 
  BookOpen, 
  Moon, 
  Compass,
  X,
  Trash2
} from 'lucide-react';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import { AreaOfLife } from '../../types';
import { sound } from '../../utils/sound';
import { dateUtils } from '../../utils/date';

export const GoalTrackerView: React.FC = () => {
  const { 
    goals, 
    toggleGoalStatus, 
    updateGoalProgress, 
    toggleGoalMilestone, 
    addGoal, 
    deleteGoal 
  } = useApp();

  const today = useMemo(() => dateUtils.getTodayInfo(), []);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newArea, setNewArea] = useState<AreaOfLife>('Work');
  const [newTargetMetric, setNewTargetMetric] = useState('');
  const [newReward, setNewReward] = useState('');
  const [newDeadline, setNewDeadline] = useState('31 Des 2026');
  const [newQuarter, setNewQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q4');
  const [newWhy, setNewWhy] = useState('');

  const areas: AreaOfLife[] = ['Health', 'Work', 'Money', 'Family', 'Personal Growth', 'Spirituality'];

  const totalGoals = goals.length;
  const achievedGoals = goals.filter(g => g.status === 'Achieved').length;
  const yearlySuccessRatio = totalGoals > 0 ? Math.round((achievedGoals / totalGoals) * 100) : 0;

  // Milestone telemetry calculations
  const allMilestones = goals.flatMap(g => g.milestones || []);
  const totalMilestonesCount = allMilestones.length;
  const completedMilestonesCount = allMilestones.filter(m => m.isCompleted).length;
  const milestoneCompletionRate = totalMilestonesCount > 0 
    ? Math.round((completedMilestonesCount / totalMilestonesCount) * 100) 
    : 0;

  const filteredGoals = selectedArea === 'all' 
    ? goals 
    : goals.filter(g => g.areaOfLife === selectedArea);

  const getDomainIcon = (area: AreaOfLife) => {
    switch (area) {
      case 'Health': return ShieldCheck;
      case 'Work': return Briefcase;
      case 'Money': return TrendingUp;
      case 'Family': return HeartHandshake;
      case 'Personal Growth': return BookOpen;
      case 'Spirituality': return Moon;
      default: return Target;
    }
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    sound.playPop();
    addGoal({
      title: newTitle.trim(),
      areaOfLife: newArea,
      targetMetric: newTargetMetric.trim() || 'Target Metric',
      reward: newReward.trim() || 'Achievement Reward',
      deadline: newDeadline.trim() || '31 Des 2026',
      quarterTarget: newQuarter,
      whyStatement: newWhy.trim() || undefined,
      status: 'In Progress',
      progressPercent: 0,
      milestones: [
        { id: `m-${Date.now()}-1`, title: 'Define execution roadmap', isCompleted: false, expReward: 30 },
        { id: `m-${Date.now()}-2`, title: 'First major benchmark reached', isCompleted: false, expReward: 40 },
        { id: `m-${Date.now()}-3`, title: 'Final milestone & goal achieved', isCompleted: false, expReward: 50 },
      ]
    });
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewTargetMetric('');
    setNewReward('');
    setNewWhy('');
  };

  return (
    <div className="max-w-[1440px] mx-auto p-6 space-y-6">
      
      {/* ========================================================
          TOP SECTION: GOAL TRACKER 2026 STRATEGIC HORIZON & TELEMETRY
          ======================================================== */}
      <section className="mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0] space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#18181B]" />
              <h1 className="text-[22px] sm:text-[24px] font-bold text-[#18181B] font-ui tracking-tight">
                STRATEGIC GOAL ROADMAP — 2026
              </h1>
            </div>
            <p className="text-[12px] text-[#71717A] font-ui">
              Executive Multi-Step Vision Board, Quarterly Milestones & Gamified Reward System
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                setIsAddModalOpen(true);
                sound.playClick();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#18181B] text-white text-[12px] font-bold font-ui hover:bg-[#27272A] transition-colors"
            >
              <Plus size={14} />
              <span>Add Strategic Goal</span>
            </button>
          </div>
        </div>

        {/* 4 Horizon Telemetry Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-ui tracking-wider text-[#71717A] mb-1">
              <Trophy size={13} className="text-[#10B981]" />
              <span>Goals Achieved</span>
            </div>
            <div className="text-[18px] font-num font-bold text-[#18181B]">
              {achievedGoals} / {totalGoals} <span className="text-[12px] font-ui text-[#71717A]">({yearlySuccessRatio}%)</span>
            </div>
          </div>

          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-ui tracking-wider text-[#71717A] mb-1">
              <Layers size={13} className="text-[#38BDF8]" />
              <span>Milestones Executed</span>
            </div>
            <div className="text-[18px] font-num font-bold text-[#18181B]">
              {completedMilestonesCount} / {totalMilestonesCount} <span className="text-[12px] font-ui text-[#10B981]">({milestoneCompletionRate}%)</span>
            </div>
          </div>

          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-ui tracking-wider text-[#71717A] mb-1">
              <Clock size={13} className="text-orange-500" />
              <span>2026 Countdown</span>
            </div>
            <div className="text-[18px] font-num font-bold text-[#18181B]">
              {today.daysRemainingInYear} Days <span className="text-[11px] font-ui text-[#71717A]">Remaining</span>
            </div>
          </div>

          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-ui tracking-wider text-[#71717A] mb-1">
              <Compass size={13} className="text-[#10B981]" />
              <span>Discipline Pacing</span>
            </div>
            <div className="text-[18px] font-ui font-bold text-[#10B981]">
              Optimal Velocity
            </div>
          </div>

        </div>

        {/* Areas of Life Filter Expandable Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <ExpandableTabs
            size="sm"
            tabs={[
              { id: 'all', title: 'All Domains', icon: Target, badge: goals.length },
              { id: 'Health', title: 'Health', icon: ShieldCheck, badge: goals.filter(g => g.areaOfLife === 'Health').length },
              { id: 'Work', title: 'Work', icon: Briefcase, badge: goals.filter(g => g.areaOfLife === 'Work').length },
              { id: 'Money', title: 'Money', icon: TrendingUp, badge: goals.filter(g => g.areaOfLife === 'Money').length },
              { id: 'Family', title: 'Family', icon: HeartHandshake, badge: goals.filter(g => g.areaOfLife === 'Family').length },
              { id: 'Personal Growth', title: 'Growth', icon: BookOpen, badge: goals.filter(g => g.areaOfLife === 'Personal Growth').length },
              { id: 'Spirituality', title: 'Spirituality', icon: Moon, badge: goals.filter(g => g.areaOfLife === 'Spirituality').length },
            ]}
            selectedIndex={
              selectedArea === 'all'
                ? 0
                : selectedArea === 'Health'
                ? 1
                : selectedArea === 'Work'
                ? 2
                : selectedArea === 'Money'
                ? 3
                : selectedArea === 'Family'
                ? 4
                : selectedArea === 'Personal Growth'
                ? 5
                : 6
            }
            activeBgColor="bg-[#18181B]"
            activeColor="text-white"
            className="bg-[#F9FAFB] border-[#E2E8F0] rounded-[8px]"
            onChange={(idx) => {
              sound.playClick();
              const areaMap = ['all', 'Health', 'Work', 'Money', 'Family', 'Personal Growth', 'Spirituality'];
              if (idx !== null && areaMap[idx]) {
                setSelectedArea(areaMap[idx]);
              }
            }}
          />
        </div>
      </section>

      {/* ========================================================
          VISION BOARD & ROADMAP CARDS GRID
          ======================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoals.map((goal) => {
          const isAchieved = goal.status === 'Achieved';
          const DomainIcon = getDomainIcon(goal.areaOfLife);
          const milestones = goal.milestones || [];
          const completedCount = milestones.filter(m => m.isCompleted).length;

          return (
            <div
              key={goal.id}
              className={`mplt-card bg-[#FFFFFF] border rounded-[12px] p-5 flex flex-col justify-between transition-all space-y-4 ${
                isAchieved ? 'border-[#10B981]/50 bg-[#FCFDFD]' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
              }`}
            >
              <div className="space-y-3.5">
                
                {/* Header: Area badge, Quarter target, & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#18181B] text-white font-ui">
                      <DomainIcon size={10} />
                      <span>{goal.areaOfLife}</span>
                    </span>
                    {goal.quarterTarget && (
                      <span className="text-[10px] font-num font-bold px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#71717A] border border-[#E2E8F0]">
                        {goal.quarterTarget}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleGoalStatus(goal.id)}
                      className={`flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-[4px] font-ui transition-colors ${
                        isAchieved
                          ? 'bg-[#10B981] text-white'
                          : 'bg-[#F1F5F9] text-[#71717A] hover:bg-[#18181B] hover:text-white'
                      }`}
                    >
                      <CheckCircle2 size={11} />
                      <span>{isAchieved ? 'ACHIEVED (+150 EXP)' : 'IN PROGRESS'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete strategic goal "${goal.title}"?`)) {
                          deleteGoal(goal.id);
                          sound.playClick();
                        }
                      }}
                      className="p-1 text-[#A1A1AA] hover:text-[#E11D48] hover:bg-rose-50 rounded transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Title & Why Statement */}
                <div>
                  <h3 className="text-[15.5px] font-bold text-[#18181B] font-ui leading-snug">
                    {goal.title}
                  </h3>
                  {goal.whyStatement && (
                    <p className="text-[11px] text-[#71717A] italic mt-1 font-ui leading-relaxed">
                      "{goal.whyStatement}"
                    </p>
                  )}
                </div>

                {/* Target Metric & Reward Container */}
                <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#71717A] font-ui">Target Metric:</span>
                    <span className="font-num font-bold text-[#18181B]">{goal.targetMetric}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#71717A] font-ui flex items-center gap-1">
                      <Gift size={11} className="text-[#10B981]" />
                      <span>Unlocked Reward:</span>
                    </span>
                    <span className="font-ui font-bold text-[#10B981]">{goal.reward}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#71717A] font-ui flex items-center gap-1">
                      <Calendar size={11} />
                      <span>Target Deadline:</span>
                    </span>
                    <span className="font-num text-[#71717A]">{goal.deadline}</span>
                  </div>
                </div>

                {/* Multi-Step Milestone Roadmap Checklist */}
                {milestones.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-[#71717A] font-ui">
                      <span className="font-medium flex items-center gap-1">
                        <Sparkles size={11} className="text-[#10B981]" />
                        <span>Execution Milestones</span>
                      </span>
                      <span className="font-num font-bold text-[#18181B]">
                        {completedCount}/{milestones.length} Completed
                      </span>
                    </div>

                    <div className="space-y-1.5 bg-white border border-[#E2E8F0] p-2.5 rounded-[8px]">
                      {milestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          onClick={() => toggleGoalMilestone(goal.id, milestone.id)}
                          className={`p-1.5 rounded-[5px] flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            milestone.isCompleted 
                              ? 'bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534]' 
                              : 'hover:bg-[#F9FAFB] text-[#18181B]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-4 h-4 rounded-[3px] flex items-center justify-center flex-shrink-0 border transition-all ${
                              milestone.isCompleted 
                                ? 'bg-[#10B981] border-[#10B981] text-white' 
                                : 'border-[#CBD5E1] bg-white'
                            }`}>
                              {milestone.isCompleted && <Check size={10} className="stroke-[3]" />}
                            </div>
                            <span className={`text-[11.5px] font-ui truncate ${
                              milestone.isCompleted ? 'line-through text-[#71717A]' : 'font-medium'
                            }`}>
                              {milestone.title}
                            </span>
                          </div>

                          <span className="text-[9.5px] font-num font-bold text-[#10B981] flex-shrink-0">
                            +{milestone.expReward} EXP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Progress Slider & Gauge */}
              <div className="pt-3 border-t border-[#E2E8F0] space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#71717A] font-ui font-medium">Progress Pacing</span>
                  <span className="font-num font-bold text-[#18181B]">
                    {goal.progressPercent}%
                  </span>
                </div>

                <div className="w-full bg-[#E2E8F0] h-[7px] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isAchieved ? 'bg-[#10B981]' : 'bg-[#18181B]'
                    }`}
                    style={{ width: `${goal.progressPercent}%` }}
                  />
                </div>

                {/* Interactive Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={goal.progressPercent}
                  onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
                  className="w-full h-1 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#18181B] mt-1"
                />
              </div>

            </div>
          );
        })}
      </section>

      {/* Add Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-100">
          <div 
            className="bg-white border border-[#E2E8F0] rounded-[12px] max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-[#18181B]" />
                <h3 className="text-[16px] font-bold text-[#18181B] font-ui">
                  Create Strategic Vision Goal
                </h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded text-[#71717A] hover:text-[#18181B]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#71717A] font-ui block mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100 Juta Pertama Liquid Portfolio"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[6px] text-[12.5px] font-ui focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#71717A] font-ui block mb-1">
                    Life Domain
                  </label>
                  <select
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value as AreaOfLife)}
                    className="w-full p-2 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[6px] text-[12px] font-ui focus:outline-none"
                  >
                    {areas.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#71717A] font-ui block mb-1">
                    Target Quarter
                  </label>
                  <select
                    value={newQuarter}
                    onChange={(e) => setNewQuarter(e.target.value as 'Q1' | 'Q2' | 'Q3' | 'Q4')}
                    className="w-full p-2 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[6px] text-[12px] font-ui focus:outline-none"
                  >
                    <option value="Q1">Q1 (Jan - Mar)</option>
                    <option value="Q2">Q2 (Apr - Jun)</option>
                    <option value="Q3">Q3 (Jul - Sep)</option>
                    <option value="Q4">Q4 (Oct - Dec)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#71717A] font-ui block mb-1">
                    Target Metric
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rp 100.000.000"
                    value={newTargetMetric}
                    onChange={(e) => setNewTargetMetric(e.target.value)}
                    className="w-full p-2 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[6px] text-[12px] font-ui focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#71717A] font-ui block mb-1">
                    Unlocked Reward
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Trip ke Bali"
                    value={newReward}
                    onChange={(e) => setNewReward(e.target.value)}
                    className="w-full p-2 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[6px] text-[12px] font-ui focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#71717A] font-ui block mb-1">
                    Target Deadline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 31 Des 2026"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full p-2 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[6px] text-[12px] font-ui focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#71717A] font-ui block mb-1">
                    Why Statement (Purpose)
                  </label>
                  <input
                    type="text"
                    placeholder="Why is this non-negotiable?"
                    value={newWhy}
                    onChange={(e) => setNewWhy(e.target.value)}
                    className="w-full p-2 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[6px] text-[12px] font-ui focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-[6px] text-[12px] font-ui border border-[#E2E8F0] hover:bg-[#F4F4F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[6px] text-[12px] font-bold font-ui bg-[#18181B] text-white hover:bg-[#27272A]"
                >
                  Create Goal (+50 EXP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
