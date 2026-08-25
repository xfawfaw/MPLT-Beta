import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutGrid, 
  CalendarCheck2, 
  CalendarRange, 
  CheckSquare, 
  Target, 
  Wallet, 
  Flame, 
  Sparkles,
  RotateCcw
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { profile, currentTab, setCurrentTab, resetAllData } = useApp();

  const expPercentage = Math.min(100, Math.round((profile.currentExp / profile.nextLevelExp) * 100));

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'habits', label: 'Habit Matrix', icon: CalendarCheck2 },
    { id: 'weekly', label: 'Weekly To-Do', icon: CalendarRange },
    { id: 'tasks', label: 'Task Manager', icon: CheckSquare },
    { id: 'goals', label: 'Goal Tracker', icon: Target },
    { id: 'finance', label: '50/30/20 Finance', icon: Wallet },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E2E8F0] h-[64px]">
      <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-2 lg:gap-4">
        
        {/* Left: Brand & Gamification Profile */}
        <div className="flex items-center gap-3 lg:gap-5 flex-shrink-0">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-8 h-8 rounded-[6px] bg-[#18181B] text-white flex items-center justify-center font-bold text-xs tracking-tighter">
              Z0
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-[14px] font-ui text-[#18181B] leading-tight">
                MPLT ZERO
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#71717A]">
                Life Ops
              </span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[#E2E8F0] hidden sm:block" />

          {/* Gamification Bar */}
          <div className="flex items-center gap-2.5 bg-[#F9FAFB] border border-[#E2E8F0] px-2.5 py-1.5 rounded-[8px]">
            {/* Level Badge */}
            <div className="bg-[#10B981] text-white font-bold text-[10.5px] font-num px-1.5 py-0.5 rounded-[4px] tracking-tight">
              LVL {profile.level}
            </div>

            {/* EXP Bar & Metrics */}
            <div className="flex flex-col gap-0.5 w-28 sm:w-36">
              <div className="flex justify-between items-center text-[9.5px] text-[#71717A]">
                <span className="font-ui font-medium">EXP</span>
                <span className="font-num font-semibold text-[#18181B]">
                  {profile.currentExp.toLocaleString()}/{profile.nextLevelExp.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-[5px] rounded-full overflow-hidden">
                <div 
                  className="bg-[#18181B] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${expPercentage}%` }}
                />
              </div>
            </div>

            {/* Points Chip */}
            <div className="hidden xl:flex items-center gap-1 text-[10.5px] font-num font-bold text-[#18181B] bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded-[4px]">
              <Sparkles size={11} className="text-[#10B981]" />
              {profile.totalPoints.toLocaleString()} PTS
            </div>

            {/* Streak Chip */}
            <div className="hidden md:flex items-center gap-1 text-[10.5px] font-num font-bold text-[#18181B] bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded-[4px]">
              <Flame size={11} className="text-orange-500 fill-orange-500" />
              {profile.streakDays}D
            </div>
          </div>
        </div>

        {/* Center / Right: Module Tabs Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[11.5px] font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#18181B] text-white border border-[#18181B]'
                    : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] border border-transparent'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-white' : 'text-[#71717A]'} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Reset button */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo data to default state?')) {
                resetAllData();
              }
            }}
            title="Reset to Initial Data"
            className="p-1.5 ml-1 rounded-[6px] text-[#A1A1AA] hover:text-[#E11D48] hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
          >
            <RotateCcw size={14} />
          </button>
        </nav>

      </div>
    </header>
  );
};
