import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CalendarCheck2, 
  Target, 
  CheckSquare, 
  BarChart3, 
  Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HabitMatrixView } from '../Habits/HabitMatrixView';
import { GoalTrackerView } from '../Goals/GoalTrackerView';
import { TaskManagerView } from '../Tasks/TaskManagerView';
import { YearlyStatsView } from '../Analytics/YearlyStatsView';
import { sound } from '../../utils/sound';

type SystemSubTab = 'habits' | 'goals' | 'tasks' | 'yearly';

export const SystemHubView: React.FC = () => {
  const { currentTab, habits, goals, tasks } = useApp();

  // Initialize active subtab based on currentTab if user navigated directly to one
  const [activeSubTab, setActiveSubTab] = useState<SystemSubTab>(() => {
    if (currentTab === 'goals') return 'goals';
    if (currentTab === 'tasks') return 'tasks';
    if (currentTab === 'yearly') return 'yearly';
    return 'habits';
  });

  // Sync subtab if external navigation triggers a specific sub-route
  useEffect(() => {
    if (currentTab === 'goals') setActiveSubTab('goals');
    else if (currentTab === 'tasks') setActiveSubTab('tasks');
    else if (currentTab === 'yearly') setActiveSubTab('yearly');
    else if (currentTab === 'habits') setActiveSubTab('habits');
  }, [currentTab]);

  const handleTabChange = (tab: SystemSubTab) => {
    sound.playClick();
    setActiveSubTab(tab);
  };

  const tabs = [
    { 
      id: 'habits' as SystemSubTab, 
      label: '31-Day Habit Matrix', 
      icon: CalendarCheck2, 
      badge: `${habits.length} Routines` 
    },
    { 
      id: 'goals' as SystemSubTab, 
      label: 'Strategic Roadmaps', 
      icon: Target, 
      badge: `${goals.length} Goals` 
    },
    { 
      id: 'tasks' as SystemSubTab, 
      label: 'Task Backlog', 
      icon: CheckSquare, 
      badge: `${tasks.filter(t => t.status !== 'Completed').length} Pending` 
    },
    { 
      id: 'yearly' as SystemSubTab, 
      label: '365D Heatmap', 
      icon: BarChart3, 
      badge: 'Annual' 
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6">
      {/* Top Segmented Architecture Control */}
      <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-2 sm:p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 pl-2">
          <Layers size={16} className="text-[#10B981]" />
          <div>
            <h2 className="text-[13px] sm:text-[14px] font-bold text-[#18181B] font-ui tracking-tight leading-none">
              SYSTEM ARCHITECTURE & ROADMAPS
            </h2>
            <p className="text-[10px] text-[#71717A] font-ui mt-0.5">
              Long-horizon tracking: Monthly Habit Matrix, Quarterly Goals, and Annual Heatmap.
            </p>
          </div>
        </div>

        {/* Tactile Tab Selector */}
        <div className="flex rounded-[8px] bg-[#F4F4F5] p-1 gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-[6px] text-[11.5px] sm:text-[12px] font-bold font-ui transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#18181B] shadow-2xs border border-[#E2E8F0]'
                    : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-[#10B981]' : 'text-[#71717A]'} />
                <span>{tab.label}</span>
                <span className={`text-[9.5px] font-num px-1.5 py-0.2 rounded border transition-colors ${
                  isActive ? 'bg-zinc-100 text-zinc-800 border-zinc-200' : 'bg-transparent text-zinc-400 border-transparent'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic View Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
        >
          {activeSubTab === 'habits' && <HabitMatrixView />}
          {activeSubTab === 'goals' && <GoalTrackerView />}
          {activeSubTab === 'tasks' && <TaskManagerView />}
          {activeSubTab === 'yearly' && <YearlyStatsView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
