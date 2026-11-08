import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CalendarCheck2, 
  Target, 
  CheckSquare, 
  BarChart3, 
  Layers,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HabitMatrixView } from '../Habits/HabitMatrixView';
import { WeeklyEvaluationView } from '../Weekly/WeeklyEvaluationView';
import { GoalTrackerView } from '../Goals/GoalTrackerView';
import { TaskManagerView } from '../Tasks/TaskManagerView';
import { YearlyStatsView } from '../Analytics/YearlyStatsView';
import { sound } from '../../utils/sound';
import { dateUtils } from '../../utils/date';
import { ExpandableTabs, TabItem } from '@/components/ui/expandable-tabs';

type SystemSubTab = 'habits' | 'weekly' | 'goals' | 'tasks' | 'yearly';

export const SystemHubView: React.FC = () => {
  const { currentTab, habits, goals, tasks } = useApp();
  const currentWeekInfo = useMemo(() => dateUtils.getSprintWeekInfo(0), []);

  // Initialize active subtab based on currentTab if user navigated directly to one
  const [activeSubTab, setActiveSubTab] = useState<SystemSubTab>(() => {
    if (currentTab === 'weekly') return 'weekly';
    if (currentTab === 'goals') return 'goals';
    if (currentTab === 'tasks') return 'tasks';
    if (currentTab === 'yearly') return 'yearly';
    return 'habits';
  });

  // Sync subtab if external navigation triggers a specific sub-route
  useEffect(() => {
    if (currentTab === 'weekly') setActiveSubTab('weekly');
    else if (currentTab === 'goals') setActiveSubTab('goals');
    else if (currentTab === 'tasks') setActiveSubTab('tasks');
    else if (currentTab === 'yearly') setActiveSubTab('yearly');
    else if (currentTab === 'habits') setActiveSubTab('habits');
  }, [currentTab]);

  const tabs: TabItem[] = useMemo(() => [
    { 
      id: 'habits', 
      title: '31-Day Habit Matrix', 
      icon: CalendarCheck2, 
      badge: `${habits.length} Routines` 
    },
    { 
      id: 'weekly', 
      title: 'Weekly Evaluation', 
      icon: TrendingUp, 
      badge: `W${String(currentWeekInfo.currentWeekNumber).padStart(2, '0')}` 
    },
    { 
      id: 'goals', 
      title: 'Strategic Roadmaps', 
      icon: Target, 
      badge: `${goals.length} Goals` 
    },
    { 
      id: 'tasks', 
      title: 'Task Backlog', 
      icon: CheckSquare, 
      badge: `${tasks.filter(t => t.status !== 'Completed').length} Pending` 
    },
    { 
      id: 'yearly', 
      title: '365D Heatmap', 
      icon: BarChart3, 
      badge: 'Annual' 
    },
  ], [habits.length, goals.length, tasks, currentWeekInfo.currentWeekNumber]);

  const selectedIndex = useMemo(() => {
    const idx = tabs.findIndex(t => t.id === activeSubTab);
    return idx >= 0 ? idx : 0;
  }, [tabs, activeSubTab]);

  const handleTabChange = (idx: number | null) => {
    if (idx === null) return;
    const tab = tabs[idx];
    if (!tab || !tab.id) return;
    sound.playClick();
    setActiveSubTab(tab.id as SystemSubTab);
  };

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

        {/* Tactile Tab Selector via ExpandableTabs */}
        <ExpandableTabs
          tabs={tabs}
          selectedIndex={selectedIndex}
          onChange={handleTabChange}
          activeBgColor="bg-[#18181B]"
          activeColor="text-white"
          className="bg-[#F9FAFB] border-[#E2E8F0] rounded-[8px]"
          size="sm"
        />
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
          {activeSubTab === 'weekly' && <WeeklyEvaluationView />}
          {activeSubTab === 'goals' && <GoalTrackerView />}
          {activeSubTab === 'tasks' && <TaskManagerView />}
          {activeSubTab === 'yearly' && <YearlyStatsView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
