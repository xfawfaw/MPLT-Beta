import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Check, 
  Plus, 
  Trash2, 
  Calendar, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { WeeklyTask, AreaOfLife } from '../../types';

export const WeeklyPlannerView: React.FC = () => {
  const { weeklyTasks, toggleWeeklyTask, addWeeklyTask, deleteWeeklyTask } = useApp();

  const [activeDayModal, setActiveDayModal] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<WeeklyTask['priority']>('Med');
  const [newTaskCategory, setNewTaskCategory] = useState<AreaOfLife>('Work');

  const daysConfig: { index: number; name: WeeklyTask['dayName']; date: string }[] = [
    { index: 0, name: 'Monday', date: '23.02.2026' },
    { index: 1, name: 'Tuesday', date: '24.02.2026' },
    { index: 2, name: 'Wednesday', date: '25.02.2026' },
    { index: 3, name: 'Thursday', date: '26.02.2026' },
    { index: 4, name: 'Friday', date: '27.02.2026' },
    { index: 5, name: 'Saturday', date: '28.02.2026' },
    { index: 6, name: 'Sunday', date: '01.03.2026' },
  ];

  const totalTasks = weeklyTasks.length;
  const completedTasks = weeklyTasks.filter(t => t.isCompleted).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
          HEADER SECTION: DATE RANGE & COMPLETION TOTALS
          ======================================================== */}
      <section className="mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#18181B]" />
              <h1 className="text-[24px] font-bold text-[#18181B] font-ui tracking-tight">
                WEEKLY TO-DO'S & TIME-BLOCKING
              </h1>
            </div>
            
            {/* Date Range Picker Display */}
            <div className="flex items-center gap-2 mt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[6px] text-[12px] font-medium font-ui text-[#18181B]">
                <Calendar size={13} className="text-[#71717A]" />
                <span>Week of Feb 23, 2026 — Mar 01, 2026</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 border border-[#E2E8F0] rounded-[4px] bg-white hover:bg-[#F4F4F5]">
                  <ChevronLeft size={13} />
                </button>
                <button className="p-1 border border-[#E2E8F0] rounded-[4px] bg-white hover:bg-[#F4F4F5]">
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Metrics */}
          <div className="flex items-center gap-4 bg-[#F9FAFB] border border-[#E2E8F0] px-4 py-2.5 rounded-[8px]">
            <div className="text-right">
              <span className="text-[10px] text-[#71717A] uppercase tracking-wider block font-ui">
                Total Tasks
              </span>
              <span className="text-[18px] font-num font-bold text-[#18181B]">
                {totalTasks}
              </span>
            </div>

            <div className="h-8 w-[1px] bg-[#E2E8F0]" />

            <div className="text-right">
              <span className="text-[10px] text-[#71717A] uppercase tracking-wider block font-ui">
                Completed Ratio
              </span>
              <span className="text-[18px] font-num font-bold text-[#10B981]">
                {completedTasks} ({completionPercentage}%)
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          CENTER BOARD: 7-COLUMN FULL-WIDTH LAYOUT
          ======================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5 items-start">
        {daysConfig.map((day) => {
          const dayTasks = weeklyTasks.filter(t => t.dayIndex === day.index);
          const doneTasks = dayTasks.filter(t => t.isCompleted).length;
          const pct = dayTasks.length > 0 ? Math.round((doneTasks / dayTasks.length) * 100) : 0;
          
          // Display value (Monday shows 120% bonus from blueprint)
          const displayPct = day.index === 0 && pct === 100 ? '120%' : `${pct}%`;

          // 64px diameter circular ring calculations
          const radius = 26;
          const circ = 2 * Math.PI * radius;
          const offset = circ - (Math.min(100, pct) / 100) * circ;

          return (
            <div
              key={day.index}
              className="mplt-card bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] overflow-hidden flex flex-col min-h-[520px]"
            >
              {/* Column Header: Black container (#18181B fill, #FFFFFF text) */}
              <div className="bg-[#18181B] text-[#FFFFFF] p-3 text-center border-b border-[#27272A]">
                <h3 className="text-[12px] font-bold uppercase tracking-wider font-ui block">
                  {day.name}
                </h3>
                <span className="text-[10.5px] font-num text-[#A1A1AA] block mt-0.5">
                  {day.date}
                </span>
              </div>

              {/* Metric Indicator: 64px High-Contrast Circular Progress Ring */}
              <div className="py-4 px-3 flex flex-col items-center justify-center border-b border-[#F1F5F9] bg-[#FAFAFA]">
                <div className="relative w-[64px] h-[64px] flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      stroke="#E2E8F0"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      stroke={pct >= 100 ? '#10B981' : '#18181B'}
                      strokeWidth="4"
                      strokeDasharray={circ}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      fill="none"
                      className="transition-all duration-300"
                    />
                  </svg>
                  <span className="absolute text-[13px] font-num font-bold text-[#18181B]">
                    {displayPct}
                  </span>
                </div>
                <span className="text-[10px] font-num text-[#71717A] mt-1.5 font-medium">
                  {doneTasks} of {dayTasks.length} Completed
                </span>
              </div>

              {/* Task Card Stack */}
              <div className="p-2.5 flex-1 space-y-2 overflow-y-auto max-h-[380px]">
                {dayTasks.map((task) => {
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleWeeklyTask(task.id)}
                      className={`group p-2 rounded-[6px] border text-left transition-all cursor-pointer select-none ${
                        task.isCompleted
                          ? 'bg-[#F9FAFB] border-[#E2E8F0]'
                          : 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#18181B] hover:bg-[#FAFAFA]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
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
                          <p className={`text-[13px] font-ui leading-snug break-words ${
                            task.isCompleted
                              ? 'line-through text-[#71717A]'
                              : 'text-[#18181B] font-medium'
                          }`}>
                            {task.title}
                          </p>

                          {/* Badges: Priority + Category Tag */}
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
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

                            <span className="text-[9px] font-num text-[#10B981] ml-auto">
                              +{task.expReward}xp
                            </span>
                          </div>
                        </div>

                        {/* Delete option on hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWeeklyTask(task.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[#A1A1AA] hover:text-[#E11D48] p-0.5 transition-opacity"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {dayTasks.length === 0 && (
                  <div className="py-6 text-center text-[#A1A1AA] text-[11px] font-ui">
                    No tasks scheduled
                  </div>
                )}
              </div>

              {/* Add Task Trigger */}
              <div className="p-2 border-t border-[#E2E8F0] bg-[#FFFFFF]">
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
      </section>

      {/* Add Task Modal for Specific Day */}
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
