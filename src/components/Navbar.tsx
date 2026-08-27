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
  ChevronRight,
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
  const [isWorkstationOpen, setIsWorkstationOpen] = useState(false);
  const workstationRef = useRef<HTMLDivElement>(null);

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

  // Close floating workstation on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workstationRef.current && !workstationRef.current.contains(event.target as Node)) {
        setIsWorkstationOpen(false);
      }
    };

    if (isWorkstationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isWorkstationOpen]);

  const handleTreeSelect = (id: string) => {
    sound.playClick();
    if (id === 'cmd-palette') {
      onOpenCommandPalette();
      setIsWorkstationOpen(false);
      return;
    }
    if (id === 'backup-center') {
      onOpenBackup();
      setIsWorkstationOpen(false);
      return;
    }
    if (id === 'sound-toggle') {
      toggleSound();
      return;
    }
    
    // Map tree selection to valid tabs
    const tabMap: Record<string, string> = {
      'dashboard': 'dashboard',
      'habits': 'habits',
      'weekly': 'weekly',
      'tasks': 'tasks',
      'tasks-all': 'tasks',
      'goals': 'goals',
      'finance': 'finance',
      'yearly': 'yearly',
    };

    if (tabMap[id]) {
      setCurrentTab(tabMap[id]);
      setIsWorkstationOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E2E8F0] h-[64px] transition-colors">
      <div className="max-w-[1440px] mx-auto h-full px-3 sm:px-6 flex items-center justify-between gap-2 lg:gap-4">
        
        {/* Left: Brand, Gamification Profile & Workstation Navigator */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 flex-shrink-0">
          {/* Brand Logo */}
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
              <span className="text-[8.5px] uppercase tracking-widest text-[#71717A] font-medium">
                Life Ops
              </span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[#E2E8F0] hidden sm:block" />

          {/* Gamification Bar */}
          <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#E2E8F0] px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-[8px] h-[38px]">
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

          <div className="h-6 w-[1px] bg-[#E2E8F0] hidden sm:block" />

          {/* Workstation Trigger Button & Floating Modal Container */}
          <div className="relative" ref={workstationRef}>
            <button
              type="button"
              onClick={() => {
                setIsWorkstationOpen(prev => !prev);
                sound.playPop();
              }}
              className={`flex items-center gap-2 border px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[8px] h-[38px] text-[11.5px] font-medium transition-all select-none cursor-pointer ${
                isWorkstationOpen
                  ? 'bg-[#18181B] text-white border-[#18181B] shadow-sm'
                  : 'bg-[#F9FAFB] text-[#18181B] hover:bg-[#F4F4F5] border-[#E2E8F0]'
              }`}
              title="Toggle Workstation"
            >
              <FolderTree size={14} className={isWorkstationOpen ? 'text-white' : 'text-[#10B981]'} />
              <span className="font-ui font-semibold text-[11.5px] sm:text-[12px] tracking-tight">Workstation</span>
              <span className={`text-[10px] font-num px-1.5 py-0.5 rounded font-bold border transition-colors ${
                isWorkstationOpen 
                  ? 'bg-zinc-800 text-white border-zinc-700' 
                  : 'bg-white text-[#18181B] border-[#E2E8F0]'
              }`}>
                {currentNav.label}
              </span>
              <ChevronRight 
                size={13} 
                className={`transition-transform duration-200 ${isWorkstationOpen ? 'rotate-90 text-white' : 'text-[#71717A]'}`} 
              />
            </button>

            {/* Floating Workstation Popover Card with Motion & Backdrop Blur */}
            <AnimatePresence>
              {isWorkstationOpen && (
                <>
                  {/* Subtle Screen Motion Blur Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => setIsWorkstationOpen(false)}
                    className="fixed inset-0 top-[64px] bg-black/15 backdrop-blur-[3px] z-40"
                  />

                  {/* Floating Card Anchor */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.97, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 8, scale: 0.97, filter: 'blur(4px)' }}
                    transition={{ type: "spring", stiffness: 480, damping: 34 }}
                    className="absolute left-0 top-[calc(100%+8px)] w-[320px] sm:w-[350px] bg-white/95 backdrop-blur-xl rounded-2xl border border-[#E2E8F0] shadow-2xl z-50 p-3.5 flex flex-col gap-3 overflow-hidden"
                  >
                    {/* Header with Rightward Breadcrumb Indicator */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E8F0]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-[6px] bg-[#18181B] text-white flex items-center justify-center">
                          <FolderTree size={13} className="text-[#10B981]" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#18181B] font-ui">
                              Workstation
                            </span>
                            <ChevronRight size={11} className="text-[#10B981]" />
                            <span className="text-[10px] font-semibold text-[#71717A] font-ui">
                              {currentNav.label}
                            </span>
                          </div>
                          <span className="text-[9px] text-[#71717A] font-ui">
                            Interactive Tree Workstation
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsWorkstationOpen(false)}
                        className="text-[#71717A] hover:text-[#18181B] p-1 rounded-md hover:bg-[#F4F4F5] transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Integrated Quick Action Workstation Toolbar */}
                    <div className="flex items-center justify-between gap-1.5 p-1.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
                      {/* Command Palette Button */}
                      <button
                        onClick={() => {
                          onOpenCommandPalette();
                          setIsWorkstationOpen(false);
                          sound.playClick();
                        }}
                        title="Command Palette (Ctrl+K or ⌘K)"
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-[6px] bg-white text-[#18181B] hover:bg-[#F4F4F5] border border-[#E2E8F0] text-[10.5px] font-ui font-medium transition-colors shadow-2xs"
                      >
                        <Command size={12} className="text-[#71717A]" />
                        <span>Ctrl+K</span>
                      </button>

                      {/* Sound Toggle */}
                      <button
                        onClick={toggleSound}
                        title={isMuted ? 'Unmute Audio Feedback' : 'Mute Audio Feedback'}
                        className="p-1.5 rounded-[6px] bg-white hover:bg-[#F4F4F5] border border-[#E2E8F0] transition-colors text-[#71717A] hover:text-[#18181B] flex items-center justify-center shadow-2xs"
                      >
                        {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} className="text-[#10B981]" />}
                      </button>

                      {/* Backup Modal */}
                      <button
                        onClick={() => {
                          onOpenBackup();
                          setIsWorkstationOpen(false);
                          sound.playClick();
                        }}
                        title="Export / Import Backup"
                        className="p-1.5 rounded-[6px] bg-white hover:bg-[#F4F4F5] border border-[#E2E8F0] transition-colors text-[#71717A] hover:text-[#18181B] flex items-center justify-center shadow-2xs"
                      >
                        <Download size={13} />
                      </button>

                      {/* Reset Demo Data */}
                      <button
                        onClick={() => {
                          if (window.confirm('Reset all demo data to default state?')) {
                            resetAllData();
                            setIsWorkstationOpen(false);
                            sound.playClick();
                          }
                        }}
                        title="Reset Demo Data"
                        className="p-1.5 rounded-[6px] bg-white hover:bg-rose-50 border border-[#E2E8F0] hover:border-rose-200 transition-colors text-[#A1A1AA] hover:text-[#E11D48] flex items-center justify-center shadow-2xs"
                      >
                        <RotateCcw size={13} />
                      </button>
                    </div>

                    {/* Tree View Navigation (Rightward Branching) */}
                    <div className="max-h-[380px] overflow-y-auto pr-1">
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
                      </TreeView>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[10px] text-[#71717A] font-ui">
                      <span className="flex items-center gap-1.5">
                        <Compass size={11} className="text-[#10B981]" />
                        Precision Life System
                      </span>
                      <span className="font-num text-[#18181B] font-semibold">
                        v2.4
                      </span>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right side is now ultra-clean */}
        <div className="flex items-center gap-2">
          {/* Subtle status indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-ui text-[#71717A] px-2 py-1 rounded-md bg-[#F9FAFB] border border-[#E2E8F0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span className="font-medium text-[#18181B]">Synced</span>
          </div>
        </div>

      </div>
    </header>
  );
};
