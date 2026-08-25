import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MasterDashboard } from './components/Dashboard/MasterDashboard';
import { HabitMatrixView } from './components/Habits/HabitMatrixView';
import { WeeklyPlannerView } from './components/Weekly/WeeklyPlannerView';
import { TaskManagerView } from './components/Tasks/TaskManagerView';
import { GoalTrackerView } from './components/Goals/GoalTrackerView';
import { MoneyTrackerView } from './components/Finance/MoneyTrackerView';
import { LevelUpModal } from './components/Common/LevelUpModal';
import { ExpToast } from './components/Common/ExpToast';

export const AppContent: React.FC = () => {
  const { currentTab } = useApp();

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#18181B] flex flex-col font-ui selection:bg-[#18181B] selection:text-white">
      {/* Sticky Top Navbar */}
      <Navbar />

      {/* Main Workspace Container */}
      <main className="flex-1 pb-16">
        {currentTab === 'dashboard' && <MasterDashboard />}
        {currentTab === 'habits' && <HabitMatrixView />}
        {currentTab === 'weekly' && <WeeklyPlannerView />}
        {currentTab === 'tasks' && <TaskManagerView />}
        {currentTab === 'goals' && <GoalTrackerView />}
        {currentTab === 'finance' && <MoneyTrackerView />}
      </main>

      {/* Floating System Modals & Telemetry Toasts */}
      <LevelUpModal />
      <ExpToast />

      {/* Footer Info & Architecture Signature */}
      <footer className="border-t border-[#E2E8F0] bg-white py-4 text-center text-[11px] text-[#71717A] font-ui">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span className="font-semibold text-[#18181B]">MPLT ZERO v2.4</span>
            <span>— Gamified Personal Operations System</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-num">
            <span>GEIST MONO & JETBRAINS MONO</span>
            <span>•</span>
            <span>ANALOG SPREADSHEET PRECISION</span>
            <span>•</span>
            <span className="text-[#10B981] font-bold">100% CLIENT OPTIMISTIC</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
