import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutGrid, 
  CalendarCheck2, 
  CalendarRange, 
  CheckSquare, 
  Target, 
  Wallet, 
  BarChart3,
  Flame, 
  Sparkles, 
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Command,
  FolderTree,
  X,
  ChevronDown,
  Compass
} from 'lucide-react';
import { sound } from '../utils/sound';
import { 
  TreeView, 
  TreeSection, 
  TreeFolder, 
  TreeItem 
} from '@/components/ui/animated-file-tree';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onOpenBackup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCommandPalette, onOpenBackup }) => {
  const { profile, currentTab, setCurrentTab, resetAllData, tasks } = useApp();
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());
  const [isTreeDrawerOpen, setIsTreeDrawerOpen] = useState(false);
  const treeDropdownRef = useRef<HTMLDivElement>(null);

  const expPercentage = Math.min(100, Math.round((profile.currentExp / profile.nextLevelExp) * 100));

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playPop();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { id: 'habits', label: 'Habits', icon: CalendarCheck2, section: 'Core' },
    { id: 'weekly', label: 'Weekly', icon: CalendarRange, section: 'Core' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, section: 'Core' },
    { id: 'goals', label: 'Goals', icon: Target, section: 'Strategy' },
    { id: 'finance', label: 'Finance', icon: Wallet, section: 'Strategy' },
    { id: 'yearly', label: 'Stats', icon: BarChart3, section: 'Strategy' },
  ];

  const currentNav = navItems.find(item => item.id === currentTab) || navItems[0];
  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (treeDropdownRef.current && !treeDropdownRef.current.contains(event.target as Node)) {
        setIsTreeDrawerOpen(false);
      }
    };

    if (isTreeDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTreeDrawerOpen]);

  const handleTreeSelect = (id: string) => {
    sound.playClick();
    if (id === 'cmd-palette') {
      onOpenCommandPalette();
      setIsTreeDrawerOpen(false);
      return;
    }
    if (id === 'backup-center') {
      onOpenBackup();
      setIsTreeDrawerOpen(false);
      return;
    }
    
    // Check if selecting a tab or subfolder tab alias
    const tabMap: Record<string, string> = {
      'dashboard': 'dashboard',
      'habits': 'habits',
      'weekly': 'weekly',
      'tasks': 'tasks',
      'tasks-all': 'tasks',
      'tasks-priority': 'tasks',
      'goals': 'goals',
      'goals-active': 'goals',
      'finance': 'finance',
      'finance-budget': 'finance',
      'finance-ledger': 'finance',
      'yearly': 'yearly',
    };

    if (tabMap[id]) {
      setCurrentTab(tabMap[id]);
      setIsTreeDrawerOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E2E8F0] h-[64px] transition-colors">
      <div className="max-w-[1440px] mx-auto h-full px-3 sm:px-6 flex items-center justify-between gap-2 lg:gap-4">
        
        {/* Left: Brand & Gamification Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
          <div 
            className="flex items-center gap-2 cursor-pointer select-none group" 
            onClick={() => {
              setCurrentTab('dashboard');
              sound.playClick();
            }}
          >
            <div className="w-8 h-8 rounded-[6px] bg-[#18181B] text-white flex items-center justify-center font-bold text-xs tracking-tighter shadow-xs group-hover:bg-zinc-800 transition-colors">
              Z0
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-[13.5px] font-ui text-[#18181B] leading-tight">
                MPLT ZERO
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[8.5px] uppercase tracking-widest text-[#71717A] font-medium">
                  Life Ops
                </span>
                <span className="text-[#CBD5E1] text-[9px]">•</span>
                <span className="text-[8.5px] uppercase tracking-wider text-[#10B981] font-semibold">
                  Tree v2
                </span>
              </div>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[#E2E8F0] hidden sm:block" />

          {/* Gamification Bar */}
          <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#E2E8F0] px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-[8px]">
            {/* Level Badge */}
            <div className="bg-[#10B981] text-white font-bold text-[10px] sm:text-[10.5px] font-num px-1.5 py-0.5 rounded-[4px] tracking-tight">
              LVL {profile.level}
            </div>

            {/* EXP Bar & Metrics */}
            <div className="flex flex-col gap-0.5 w-20 sm:w-28">
              <div className="flex justify-between items-center text-[9px] sm:text-[9.5px] text-[#71717A]">
                <span className="font-ui font-medium">EXP</span>
                <span className="font-num font-semibold text-[#18181B]">
                  {profile.currentExp.toLocaleString()}/{profile.nextLevelExp.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-[4.5px] sm:h-[5px] rounded-full overflow-hidden">
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

        {/* Center / Right: Module Tabs & Tree Workstation Controller */}
        <div className="flex items-center gap-2">
          
          {/* Animated Tree Workstation Trigger */}
          <div className="relative" ref={treeDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsTreeDrawerOpen(prev => !prev);
                sound.playPop();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[11.5px] font-medium transition-all border select-none ${
                isTreeDrawerOpen
                  ? 'bg-[#18181B] text-white border-[#18181B] shadow-sm'
                  : 'bg-[#F9FAFB] text-[#18181B] hover:bg-[#F4F4F5] border-[#E2E8F0]'
              }`}
              title="Toggle Workstation Animated File Tree"
            >
              <FolderTree size={14} className={isTreeDrawerOpen ? 'text-white' : 'text-[#10B981]'} />
              <span className="font-ui font-semibold hidden md:inline">Workstation Tree</span>
              <span className="text-[10px] font-num px-1 py-0.2 rounded bg-white text-[#18181B] border border-[#E2E8F0] ml-0.5 hidden lg:inline">
                {currentNav.label}
              </span>
              <ChevronDown 
                size={12} 
                className={`transition-transform duration-200 ${isTreeDrawerOpen ? 'rotate-180 text-white' : 'text-[#71717A]'}`} 
              />
            </button>

            {/* Tree Navigation Popover / Flyout Drawer */}
            <AnimatePresence>
              {isTreeDrawerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="absolute left-0 sm:left-auto right-0 top-full mt-2 w-[310px] bg-white rounded-xl border border-[#E2E8F0] shadow-xl z-50 p-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#18181B] font-ui">
                        Workstation Hierarchy
                      </span>
                    </div>
                    <button 
                      onClick={() => setIsTreeDrawerOpen(false)}
                      className="text-[#71717A] hover:text-[#18181B] p-1 rounded hover:bg-[#F4F4F5]"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto pr-1">
                    <TreeView
                      variant="line"
                      activeColor="text-[#18181B]"
                      selectedId={currentTab}
                      onSelect={handleTreeSelect}
                    >
                      <TreeSection title="Core Operations" defaultExpanded={true}>
                        <TreeItem 
                          id="dashboard" 
                          label="Master Dashboard" 
                          icon={LayoutGrid} 
                          badge="LIVE" 
                        />
                        <TreeItem 
                          id="habits" 
                          label="Habit Matrix" 
                          icon={CalendarCheck2} 
                          badge={`${profile.streakDays}D`} 
                        />
                        <TreeItem 
                          id="weekly" 
                          label="Weekly To-Do" 
                          icon={CalendarRange} 
                          badge="W09" 
                        />
                        <TreeFolder id="tasks-folder" label="Tasks Operations" defaultExpanded={true}>
                          <TreeItem 
                            id="tasks" 
                            label="All Tasks" 
                            icon={CheckSquare} 
                            badge={pendingTasksCount > 0 ? `${pendingTasksCount} DUE` : undefined} 
                          />
                        </TreeFolder>
                      </TreeSection>

                      <TreeSection title="Strategy & Capital" defaultExpanded={true}>
                        <TreeFolder id="goals-folder" label="Life Goals" defaultExpanded={true}>
                          <TreeItem 
                            id="goals" 
                            label="Goal Tracker" 
                            icon={Target} 
                            badge="6 ACTIVE" 
                          />
                        </TreeFolder>
                        <TreeFolder id="finance-folder" label="Finance Hub" defaultExpanded={false}>
                          <TreeItem 
                            id="finance" 
                            label="Budget & Ledger" 
                            icon={Wallet} 
                            badge="50/30/20" 
                          />
                        </TreeFolder>
                        <TreeItem 
                          id="yearly" 
                          label="Yearly Analytics" 
                          icon={BarChart3} 
                          badge="2026" 
                        />
                      </TreeSection>

                      <TreeSection title="System Tools" defaultExpanded={false}>
                        <TreeItem 
                          id="cmd-palette" 
                          label="Command Palette" 
                          icon={Command} 
                          badge="⌘K" 
                        />
                        <TreeItem 
                          id="backup-center" 
                          label="Backup & Data" 
                          icon={Download} 
                        />
                      </TreeSection>
                    </TreeView>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[10px] text-[#71717A] font-ui">
                    <span className="flex items-center gap-1">
                      <Compass size={11} className="text-[#10B981]" />
                      Analog Precision System
                    </span>
                    <span className="font-num text-[#18181B] font-semibold">
                      v2.4
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Direct Horizontal Navigation Tabs with smooth LayoutId Pill */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
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
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[11.5px] font-medium transition-colors whitespace-nowrap select-none ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-pill"
                      className="absolute inset-0 rounded-[6px] bg-[#18181B] z-0"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon size={13} className={isActive ? 'text-white' : 'text-[#71717A]'} />
                    <span>{item.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="h-5 w-[1px] bg-[#E2E8F0] mx-0.5 hidden sm:block" />

          {/* Quick-Action Workstation Toolbar */}
          <div className="flex items-center gap-1">
            
            {/* Quick Command Palette Button */}
            <button
              onClick={onOpenCommandPalette}
              title="Command Palette (Ctrl+K or ⌘K)"
              className="flex items-center gap-1 px-2 py-1.5 rounded-[6px] text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] border border-[#E2E8F0] text-[11px] font-ui transition-colors"
            >
              <Command size={13} />
              <kbd className="hidden lg:inline-block text-[9.5px] font-num bg-white px-1 rounded border border-[#E2E8F0]">
                Ctrl+K
              </kbd>
            </button>

            {/* Audio Feedback Toggle */}
            <button
              onClick={toggleSound}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              className="p-1.5 rounded-[6px] text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] transition-colors border border-[#E2E8F0]"
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-[#10B981]" />}
            </button>

            {/* Backup / Export Center */}
            <button
              onClick={onOpenBackup}
              title="Export / Import Backup"
              className="p-1.5 rounded-[6px] text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] transition-colors border border-[#E2E8F0]"
            >
              <Download size={14} />
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
              className="p-1.5 rounded-[6px] text-[#A1A1AA] hover:text-[#E11D48] hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
            >
              <RotateCcw size={14} />
            </button>

          </div>

        </div>

      </div>
    </header>
  );
};
