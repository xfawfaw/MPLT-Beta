import React, { useState } from 'react';
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
  RotateCcw,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Download,
  Command
} from 'lucide-react';
import { sound } from '../utils/sound';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onOpenBackup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCommandPalette, onOpenBackup }) => {
  const { profile, currentTab, setCurrentTab, resetAllData, theme, toggleTheme } = useApp();
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());

  const expPercentage = Math.min(100, Math.round((profile.currentExp / profile.nextLevelExp) * 100));

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playPop();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'habits', label: 'Habit Matrix', icon: CalendarCheck2 },
    { id: 'weekly', label: 'Weekly To-Do', icon: CalendarRange },
    { id: 'tasks', label: 'Task Manager', icon: CheckSquare },
    { id: 'goals', label: 'Goal Tracker', icon: Target },
    { id: 'finance', label: '50/30/20 Finance', icon: Wallet },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] dark:bg-[#121215] border-b border-[#E2E8F0] dark:border-[#27272A] h-[64px] transition-colors">
      <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-2 lg:gap-4">
        
        {/* Left: Brand & Gamification Profile */}
        <div className="flex items-center gap-3 lg:gap-5 flex-shrink-0">
          <div 
            className="flex items-center gap-2 cursor-pointer select-none" 
            onClick={() => {
              setCurrentTab('dashboard');
              sound.playClick();
            }}
          >
            <div className="w-8 h-8 rounded-[6px] bg-[#18181B] dark:bg-white dark:text-[#18181B] text-white flex items-center justify-center font-bold text-xs tracking-tighter transition-colors">
              Z0
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-[14px] font-ui text-[#18181B] dark:text-[#F4F4F5] leading-tight">
                MPLT ZERO
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#71717A] dark:text-[#A1A1AA]">
                Life Ops
              </span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[#E2E8F0] dark:bg-[#27272A] hidden sm:block" />

          {/* Gamification Bar */}
          <div className="flex items-center gap-2.5 bg-[#F9FAFB] dark:bg-[#18181B] border border-[#E2E8F0] dark:border-[#27272A] px-2.5 py-1.5 rounded-[8px]">
            {/* Level Badge */}
            <div className="bg-[#10B981] text-white font-bold text-[10.5px] font-num px-1.5 py-0.5 rounded-[4px] tracking-tight">
              LVL {profile.level}
            </div>

            {/* EXP Bar & Metrics */}
            <div className="flex flex-col gap-0.5 w-24 sm:w-32">
              <div className="flex justify-between items-center text-[9.5px] text-[#71717A] dark:text-[#A1A1AA]">
                <span className="font-ui font-medium">EXP</span>
                <span className="font-num font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                  {profile.currentExp.toLocaleString()}/{profile.nextLevelExp.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-[#E2E8F0] dark:bg-[#27272A] h-[5px] rounded-full overflow-hidden">
                <div 
                  className="bg-[#18181B] dark:bg-white h-full transition-all duration-300 rounded-full"
                  style={{ width: `${expPercentage}%` }}
                />
              </div>
            </div>

            {/* Points Chip */}
            <div className="hidden xl:flex items-center gap-1 text-[10.5px] font-num font-bold text-[#18181B] dark:text-[#F4F4F5] bg-white dark:bg-[#27272A] border border-[#E2E8F0] dark:border-[#3F3F46] px-1.5 py-0.5 rounded-[4px]">
              <Sparkles size={11} className="text-[#10B981]" />
              {profile.totalPoints.toLocaleString()} PTS
            </div>

            {/* Streak Chip */}
            <div className="hidden md:flex items-center gap-1 text-[10.5px] font-num font-bold text-[#18181B] dark:text-[#F4F4F5] bg-white dark:bg-[#27272A] border border-[#E2E8F0] dark:border-[#3F3F46] px-1.5 py-0.5 rounded-[4px]">
              <Flame size={11} className="text-orange-500 fill-orange-500" />
              {profile.streakDays}D
            </div>
          </div>
        </div>

        {/* Center / Right: Module Tabs & Utility Controls */}
        <div className="flex items-center gap-2">
          
          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    sound.playClick();
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[11.5px] font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#18181B] dark:bg-white dark:text-[#18181B] text-white border border-[#18181B] dark:border-white font-bold'
                      : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#1C1C21] border border-transparent'
                  }`}
                >
                  <Icon size={13} className={isActive ? 'text-white dark:text-[#18181B]' : 'text-[#71717A] dark:text-[#A1A1AA]'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="h-5 w-[1px] bg-[#E2E8F0] dark:bg-[#27272A] mx-0.5 hidden sm:block" />

          {/* Quick-Action Workstation Toolbar */}
          <div className="flex items-center gap-1">
            
            {/* Quick Command Palette Button */}
            <button
              onClick={onOpenCommandPalette}
              title="Command Palette (Ctrl+K or ⌘K)"
              className="flex items-center gap-1 px-2 py-1.5 rounded-[6px] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#1C1C21] border border-[#E2E8F0] dark:border-[#27272A] text-[11px] font-ui transition-colors"
            >
              <Command size={13} />
              <kbd className="hidden md:inline-block text-[9.5px] font-num bg-white dark:bg-[#27272A] px-1 rounded border border-[#E2E8F0] dark:border-[#3F3F46]">
                Ctrl+K
              </kbd>
            </button>

            {/* Audio Feedback Toggle */}
            <button
              onClick={toggleSound}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              className="p-1.5 rounded-[6px] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#1C1C21] transition-colors border border-[#E2E8F0] dark:border-[#27272A]"
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-[#10B981]" />}
            </button>

            {/* Backup / Export Center */}
            <button
              onClick={onOpenBackup}
              title="Export / Import Backup"
              className="p-1.5 rounded-[6px] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#1C1C21] transition-colors border border-[#E2E8F0] dark:border-[#27272A]"
            >
              <Download size={14} />
            </button>

            {/* Theme Toggle Button (Light / Dark) */}
            <button
              onClick={() => {
                toggleTheme();
                sound.playClick();
              }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-1.5 rounded-[6px] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#1C1C21] transition-colors border border-[#E2E8F0] dark:border-[#27272A]"
            >
              {theme === 'dark' ? (
                <Sun size={14} className="text-amber-400 fill-amber-400" />
              ) : (
                <Moon size={14} className="text-[#18181B]" />
              )}
            </button>

            {/* Reset Data Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset all demo data to default state?')) {
                  resetAllData();
                  sound.playClick();
                }
              }}
              title="Reset to Initial Data"
              className="p-1.5 rounded-[6px] text-[#A1A1AA] hover:text-[#E11D48] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
            >
              <RotateCcw size={14} />
            </button>

          </div>

        </div>

      </div>
    </header>
  );
};
