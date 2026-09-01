import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  LayoutGrid, 
  CalendarCheck2, 
  CalendarRange, 
  CheckSquare, 
  Target, 
  Wallet, 
  BarChart3,
  Volume2, 
  VolumeX, 
  Download, 
  RotateCcw,
  Check,
  Zap,
  Sparkles,
  ArrowRight,
  Workflow,
  LucideIcon
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { dateUtils } from '../../utils/date';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBackup: () => void;
  onOpenOnboarding?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Navigation' | 'Habits' | 'Tasks' | 'Goals' | 'System';
  icon: LucideIcon;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onOpenBackup, onOpenOnboarding }) => {
  const { 
    habits, 
    toggleHabitLog, 
    weeklyTasks, 
    toggleWeeklyTask, 
    tasks, 
    toggleTaskStatus, 
    goals, 
    toggleGoalStatus,
    setCurrentTab, 
    loadDemoData,
    resetAllData 
  } = useApp();

  const today = useMemo(() => dateUtils.getTodayInfo(), []);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
      sound.playClick();
    }
  }, [isOpen]);

  const toggleSoundMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playPop();
  };

  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // Navigation
      {
        id: 'nav-dashboard',
        title: 'Go to Master Dashboard',
        subtitle: 'Overview & Mission Control',
        category: 'Navigation',
        icon: LayoutGrid,
        action: () => { setCurrentTab('dashboard'); sound.playClick(); onClose(); }
      },
      {
        id: 'nav-habits',
        title: 'Go to Habit Matrix',
        subtitle: '31-Day Habit Tracker & Velocity Curve',
        category: 'Navigation',
        icon: CalendarCheck2,
        action: () => { setCurrentTab('habits'); sound.playClick(); onClose(); }
      },
      {
        id: 'nav-weekly',
        title: 'Go to Weekly To-Do',
        subtitle: '7-Day Sprint Board & Day Spotlight',
        category: 'Navigation',
        icon: CalendarRange,
        action: () => { setCurrentTab('weekly'); sound.playClick(); onClose(); }
      },
      {
        id: 'nav-tasks',
        title: 'Go to Task Manager',
        subtitle: 'Workload & Due Date Tracker',
        category: 'Navigation',
        icon: CheckSquare,
        action: () => { setCurrentTab('tasks'); sound.playClick(); onClose(); }
      },
      {
        id: 'nav-goals',
        title: 'Go to Strategic Goals',
        subtitle: 'Long-term Milestones & Vision',
        category: 'Navigation',
        icon: Target,
        action: () => { setCurrentTab('goals'); sound.playClick(); onClose(); }
      },
      {
        id: 'nav-finance',
        title: 'Go to Finance Hub',
        subtitle: '50/30/20 Budget Ledger & Burn Rate',
        category: 'Navigation',
        icon: Wallet,
        action: () => { setCurrentTab('finance'); sound.playClick(); onClose(); }
      },
      {
        id: 'nav-yearly',
        title: 'Go to Yearly Analytics',
        subtitle: '365-Day Heatmap & Trajectory',
        category: 'Navigation',
        icon: BarChart3,
        action: () => { setCurrentTab('yearly'); sound.playClick(); onClose(); }
      },
      {
        id: 'nav-automations',
        title: 'Go to Life Pipelines (Automations)',
        subtitle: '[Locked in Beta v0.1] Flow Graph & Reactive Logic Rules Engine',
        category: 'Navigation',
        icon: Workflow,
        action: () => { setCurrentTab('automations'); sound.playClick(); onClose(); }
      },

      // System
      {
        id: 'sys-backup',
        title: 'Backup & Restore Data',
        subtitle: 'Export JSON/CSV or import snapshot',
        category: 'System',
        icon: Download,
        action: () => { onOpenBackup(); onClose(); }
      },
      {
        id: 'sys-sound',
        title: isMuted ? 'Unmute Audio Telemetry' : 'Mute Audio Telemetry',
        subtitle: 'Toggle tactile UI sound effects',
        category: 'System',
        icon: isMuted ? VolumeX : Volume2,
        action: () => { toggleSoundMute(); onClose(); }
      },
      {
        id: 'sys-reset',
        title: 'Reset All Data to Default',
        subtitle: 'Wipe local data and load default state',
        category: 'System',
        icon: RotateCcw,
        action: () => {
          if (confirm('Are you sure you want to reset all data to default? This cannot be undone.')) {
            resetAllData();
            onClose();
          }
        }
      },
      {
        id: 'sys-onboarding',
        title: 'Run Onboarding Setup Wizard',
        subtitle: 'Configure call-sign, core focus, habits & income',
        category: 'System',
        icon: Sparkles,
        action: () => {
          onOpenOnboarding?.();
          onClose();
        }
      },
      {
        id: 'sys-demo',
        title: 'Load Demo Showcase Data (Level 14)',
        subtitle: 'Populate all 7 workstations with active sample data',
        category: 'System',
        icon: Zap,
        action: () => {
          loadDemoData();
          onClose();
        }
      },
    ];

    // Quick Action: Today's habits (toggle in place)
    habits.forEach(habit => {
      const isDone = !!habit.logs[today.dayOfMonth];
      list.push({
        id: `habit-${habit.id}`,
        title: `Habit: ${habit.title}`,
        subtitle: isDone ? `Completed for today (${today.dayOfMonth})` : `Pending today — Click to complete (+${habit.expReward} EXP)`,
        category: 'Habits',
        icon: isDone ? Check : CalendarCheck2,
        action: () => {
          toggleHabitLog(habit.id, today.dayOfMonth);
          onClose();
        }
      });
    });

    // Quick Action: Sprint tasks
    weeklyTasks.slice(0, 8).forEach(task => {
      list.push({
        id: `wtask-${task.id}`,
        title: `Sprint [${task.dayName}]: ${task.title}`,
        subtitle: `${task.priority} Priority • ${task.category} • ${task.isCompleted ? 'Done' : 'Pending'} (+${task.expReward} EXP)`,
        category: 'Tasks',
        icon: task.isCompleted ? Check : Zap,
        action: () => {
          toggleWeeklyTask(task.id);
          onClose();
        }
      });
    });

    // Quick Action: General Tasks
    tasks.filter(t => t.status !== 'Completed').slice(0, 6).forEach(task => {
      list.push({
        id: `task-${task.id}`,
        title: `Task: ${task.title}`,
        subtitle: `Due: ${task.dueDate} • ${task.priority} • ${task.status} (+${task.expReward} EXP)`,
        category: 'Tasks',
        icon: CheckSquare,
        action: () => {
          toggleTaskStatus(task.id);
          onClose();
        }
      });
    });

    // Quick Action: Goals
    goals.filter(g => g.status !== 'Achieved').forEach(goal => {
      list.push({
        id: `goal-${goal.id}`,
        title: `Goal: ${goal.title}`,
        subtitle: `${goal.areaOfLife} • ${goal.progressPercent}% • Target: ${goal.targetMetric}`,
        category: 'Goals',
        icon: Target,
        action: () => {
          toggleGoalStatus(goal.id);
          onClose();
        }
      });
    });

    return list;
  }, [
    habits,
    weeklyTasks,
    tasks,
    goals,
    isMuted,
    today,
    setCurrentTab,
    onClose,
    onOpenBackup,
    resetAllData,
    toggleHabitLog,
    toggleWeeklyTask,
    toggleTaskStatus,
    toggleGoalStatus,
  ]);

  // Filter commands by search query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(cmd => 
      cmd.title.toLowerCase().includes(lower) || 
      cmd.subtitle?.toLowerCase().includes(lower) ||
      cmd.category.toLowerCase().includes(lower)
    );
  }, [query, commands]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-[#E2E8F0] rounded-[12px] max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[480px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="p-3.5 border-b border-[#E2E8F0] flex items-center gap-3 bg-[#F9FAFB]">
              <Search size={16} className="text-[#71717A]" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search (e.g. 'habit', 'task', 'finance')..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full bg-transparent text-[13px] font-ui text-[#18181B] focus:outline-none placeholder:text-[#A1A1AA]"
              />
              <kbd className="text-[10px] font-num px-1.5 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#71717A]">
                ESC
              </kbd>
            </div>

        {/* Command Items List */}
        <div className="p-2 overflow-y-auto flex-1 space-y-1">
          {filteredCommands.map((cmd, idx) => {
            const isSelected = selectedIndex === idx;
            const Icon = cmd.icon;

            return (
              <div
                key={cmd.id}
                onClick={cmd.action}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-2.5 rounded-[6px] flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-[#18181B] text-white font-semibold' 
                    : 'hover:bg-[#F4F4F5] text-[#18181B]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-6 h-6 rounded-[4px] flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#71717A]'
                  }`}>
                    <Icon size={13} />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-[12.5px] font-ui font-medium truncate">
                      {cmd.title}
                    </span>
                    {cmd.subtitle && (
                      <span className={`text-[10.5px] truncate ${
                        isSelected ? 'text-white/70' : 'text-[#71717A]'
                      }`}>
                        {cmd.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[9.5px] uppercase font-ui px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#71717A]'
                  }`}>
                    {cmd.category}
                  </span>
                  {isSelected && <ArrowRight size={12} />}
                </div>
              </div>
            );
          })}

          {filteredCommands.length === 0 && (
            <div className="py-12 text-center text-[#71717A] font-ui text-[12px]">
              No matching commands found.
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="p-2.5 px-4 border-t border-[#E2E8F0] bg-[#FAFAFA] flex items-center justify-between text-[10.5px] text-[#71717A] font-num">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="font-ui font-medium text-[#18181B]">MPLT Quick-Command</span>
        </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
