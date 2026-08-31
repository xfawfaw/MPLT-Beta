import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MasterDashboard } from './components/Dashboard/MasterDashboard';
import { HabitMatrixView } from './components/Habits/HabitMatrixView';
import { WeeklyPlannerView } from './components/Weekly/WeeklyPlannerView';
import { TaskManagerView } from './components/Tasks/TaskManagerView';
import { GoalTrackerView } from './components/Goals/GoalTrackerView';
import { MoneyTrackerView } from './components/Finance/MoneyTrackerView';
import { YearlyStatsView } from './components/Analytics/YearlyStatsView';
import { LevelUpModal } from './components/Common/LevelUpModal';
import { ExpToast } from './components/Common/ExpToast';
import { CommandPalette } from './components/Common/CommandPalette';
import { BackupModal } from './components/Common/BackupModal';

import { motion, AnimatePresence } from 'framer-motion';

export const AppContent: React.FC = () => {
  const { currentTab } = useApp();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#18181B] flex flex-col font-ui selection:bg-[#18181B] selection:text-white">
      {/* Sticky Top Navbar */}
      <Navbar 
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
      />

      {/* Main Workspace Container with Smooth Spring Transitions */}
      <main className="flex-1 pb-16 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {currentTab === 'dashboard' && <MasterDashboard />}
            {currentTab === 'habits' && <HabitMatrixView />}
            {currentTab === 'weekly' && <WeeklyPlannerView />}
            {currentTab === 'tasks' && <TaskManagerView />}
            {currentTab === 'goals' && <GoalTrackerView />}
            {currentTab === 'finance' && <MoneyTrackerView />}
            {currentTab === 'yearly' && <YearlyStatsView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating System Modals & Telemetry Toasts */}
      <LevelUpModal />
      <ExpToast />
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
      />
      <BackupModal 
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      {/* Footer Info & Operational Mantra */}
      <footer className="border-t border-[#E2E8F0] bg-white py-4 text-center text-[11px] text-[#71717A] font-ui">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span className="font-bold text-[#18181B] tracking-tight">MPLT ZERO</span>
            <span className="text-[#71717A]">— Gamified Life Operations Workstation</span>
          </div>
          <div className="flex items-center gap-3 text-[10.5px] font-ui tracking-wide">
            <span className="text-[#18181B] font-semibold">DISCIPLINE OVER MOTIVATION</span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-[#18181B] font-semibold">EXECUTE WITH PRECISION</span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-[#10B981] font-bold">COMPOUND EVERY DAY</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
