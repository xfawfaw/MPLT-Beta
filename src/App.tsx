import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/Navbar/MobileBottomNav';
import { LevelUpModal } from './components/Common/LevelUpModal';
import { ExpToast } from './components/Common/ExpToast';
import { CommandPalette } from './components/Common/CommandPalette';
import { BackupModal } from './components/Common/BackupModal';
import { OnboardingModal } from './components/Common/OnboardingModal';
import { OperatorProfileModal } from './components/Common/OperatorProfileModal';
import { PasscodeGate } from './components/Common/PasscodeGate';
import { ViewSkeleton } from './components/Common/ViewSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

// Code-splitting via React.lazy for sub-100kB chunks and instant LCP
const MasterDashboard = lazy(() => import('./components/Dashboard/MasterDashboard').then(m => ({ default: m.MasterDashboard })));
const HabitMatrixView = lazy(() => import('./components/Habits/HabitMatrixView').then(m => ({ default: m.HabitMatrixView })));
const WeeklyPlannerView = lazy(() => import('./components/Weekly/WeeklyPlannerView').then(m => ({ default: m.WeeklyPlannerView })));
const TaskManagerView = lazy(() => import('./components/Tasks/TaskManagerView').then(m => ({ default: m.TaskManagerView })));
const GoalTrackerView = lazy(() => import('./components/Goals/GoalTrackerView').then(m => ({ default: m.GoalTrackerView })));
const MoneyTrackerView = lazy(() => import('./components/Finance/MoneyTrackerView').then(m => ({ default: m.MoneyTrackerView })));
const YearlyStatsView = lazy(() => import('./components/Analytics/YearlyStatsView').then(m => ({ default: m.YearlyStatsView })));
const LifeAutomationView = lazy(() => import('./components/Automations/LifeAutomationView').then(m => ({ default: m.LifeAutomationView })));

export const AppContent: React.FC = () => {
  const { currentTab } = useApp();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Check if first-time visitor needs onboarding
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('mplt_zero_onboarded');
    if (!hasOnboarded) {
      // Delay slightly for smooth page entrance
      const timer = setTimeout(() => {
        setIsOnboardingModalOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

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
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Workspace Container with Suspense and Smooth Spring Transitions */}
      <main className="flex-1 pb-24 md:pb-16 overflow-hidden">
        <Suspense fallback={<ViewSkeleton />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(8px)' }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {currentTab === 'dashboard' && <MasterDashboard />}
              {currentTab === 'habits' && <HabitMatrixView />}
              {currentTab === 'weekly' && <WeeklyPlannerView />}
              {currentTab === 'tasks' && <TaskManagerView />}
              {currentTab === 'goals' && <GoalTrackerView />}
              {currentTab === 'finance' && <MoneyTrackerView />}
              {currentTab === 'yearly' && <YearlyStatsView />}
              {currentTab === 'automations' && <LifeAutomationView />}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Sticky Mobile Bottom Navigation Dock (< 768px) */}
      <MobileBottomNav onOpenProfile={() => setIsProfileModalOpen(true)} />

      {/* Floating System Modals & Telemetry Toasts */}
      <LevelUpModal />
      <ExpToast />
      
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />
      
      <BackupModal 
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      {/* Operator Profile Modal */}
      <OperatorProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* First-Time User Onboarding Setup Wizard */}
      <OnboardingModal 
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
      />

      {/* Footer Info & Operational Mantra */}
      <footer className="border-t border-[#E2E8F0] bg-white py-4 text-center text-[11px] text-[#71717A] font-ui hidden md:block">
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
  return (
    <PasscodeGate>
      <AppContent />
    </PasscodeGate>
  );
}
