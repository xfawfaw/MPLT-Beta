import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Trophy, 
  Calendar, 
  Gift, 
  CheckCircle2
} from 'lucide-react';
import { AreaOfLife } from '../../types';

export const GoalTrackerView: React.FC = () => {
  const { goals, toggleGoalStatus, updateGoalProgress } = useApp();

  const [selectedArea, setSelectedArea] = useState<string>('all');

  const areas: AreaOfLife[] = ['Health', 'Work', 'Money', 'Family', 'Personal Growth', 'Spirituality'];

  const totalGoals = goals.length;
  const achievedGoals = goals.filter(g => g.status === 'Achieved').length;
  const yearlySuccessRatio = totalGoals > 0 ? Math.round((achievedGoals / totalGoals) * 100) : 0;

  const filteredGoals = selectedArea === 'all' 
    ? goals 
    : goals.filter(g => g.areaOfLife === selectedArea);

  return (
    <div className="max-w-[1440px] mx-auto p-6 space-y-6">
      
      {/* ========================================================
          TOP SECTION: GOAL TRACKER 2026 HEADER & PROGRESS
          ======================================================== */}
      <section className="mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#18181B]" />
              <h1 className="text-[24px] font-bold text-[#18181B] font-ui tracking-tight">
                GOAL TRACKER — 2026
              </h1>
            </div>
            <p className="text-[12px] text-[#71717A] font-ui">
              Life Area Management, Milestones, Deadlines & Visualized Rewards
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#E2E8F0] px-3.5 py-2 rounded-[8px]">
              <Trophy size={16} className="text-[#10B981]" />
              <div className="text-right">
                <span className="text-[10px] text-[#71717A] uppercase tracking-wider block font-ui">
                  Achieved Ratio
                </span>
                <span className="text-[16px] font-num font-bold text-[#18181B]">
                  {achievedGoals} / {totalGoals} Goals ({yearlySuccessRatio}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Areas of Life Overview Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedArea('all')}
            className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium font-ui transition-all whitespace-nowrap ${
              selectedArea === 'all' 
                ? 'bg-[#18181B] text-white' 
                : 'bg-[#F9FAFB] text-[#71717A] hover:bg-[#F4F4F5] border border-[#E2E8F0]'
            }`}
          >
            All Life Areas ({goals.length})
          </button>
          {areas.map(area => {
            const count = goals.filter(g => g.areaOfLife === area).length;
            const isSelected = selectedArea === area;
            return (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium font-ui transition-all whitespace-nowrap ${
                  isSelected 
                    ? 'bg-[#18181B] text-white' 
                    : 'bg-[#F9FAFB] text-[#71717A] hover:bg-[#F4F4F5] border border-[#E2E8F0]'
                }`}
              >
                {area} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          VISION BOARD & GOAL CARDS GRID
          ======================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoals.map((goal) => {
          const isAchieved = goal.status === 'Achieved';

          return (
            <div
              key={goal.id}
              className={`mplt-card bg-[#FFFFFF] border rounded-[12px] p-5 flex flex-col justify-between transition-all ${
                isAchieved ? 'border-[#10B981]/50 bg-[#FAFCFB]' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
              }`}
            >
              <div>
                {/* Header: Area tag & Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#18181B] text-white font-ui">
                    {goal.areaOfLife}
                  </span>

                  <button
                    onClick={() => toggleGoalStatus(goal.id)}
                    className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-[4px] font-ui transition-colors ${
                      isAchieved
                        ? 'bg-[#10B981] text-white'
                        : 'bg-[#F1F5F9] text-[#71717A] hover:bg-[#18181B] hover:text-white'
                    }`}
                  >
                    <CheckCircle2 size={12} />
                    <span>{isAchieved ? 'ACHIEVED (+100 EXP)' : 'IN PROGRESS'}</span>
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-[16px] font-bold text-[#18181B] font-ui leading-snug">
                  {goal.title}
                </h3>

                {/* Target Metric */}
                <div className="mt-3 p-2.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[6px] space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#71717A] font-ui">Target Parameter:</span>
                    <span className="font-num font-bold text-[#18181B]">{goal.targetMetric}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#71717A] font-ui flex items-center gap-1">
                      <Gift size={11} className="text-[#10B981]" />
                      <span>Unlocked Reward:</span>
                    </span>
                    <span className="font-ui font-semibold text-[#10B981]">{goal.reward}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#71717A] font-ui flex items-center gap-1">
                      <Calendar size={11} />
                      <span>Deadline:</span>
                    </span>
                    <span className="font-num text-[#71717A]">{goal.deadline}</span>
                  </div>
                </div>
              </div>

              {/* Progress Slider Bar */}
              <div className="mt-5 pt-3 border-t border-[#E2E8F0]">
                <div className="flex justify-between items-center text-[11px] mb-1.5">
                  <span className="text-[#71717A] font-ui font-medium">Goal Progress</span>
                  <span className="font-num font-bold text-[#18181B]">
                    {goal.progressPercent}%
                  </span>
                </div>

                <div className="w-full bg-[#E2E8F0] h-[8px] rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isAchieved ? 'bg-[#10B981]' : 'bg-[#18181B]'
                    }`}
                    style={{ width: `${goal.progressPercent}%` }}
                  />
                </div>

                {/* Interactive Slider to increment milestone */}
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={goal.progressPercent}
                    onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
                    className="w-full h-1 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#18181B]"
                  />
                </div>
              </div>

            </div>
          );
        })}
      </section>

    </div>
  );
};
