import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  LayoutGrid, 
  CalendarCheck2, 
  CalendarRange, 
  CheckSquare, 
  Target, 
  Wallet, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Download, 
  RotateCcw,
  Check,
  Zap,
  ArrowRight,
  LucideIcon
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBackup: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Navigation' | 'Habits' | 'Tasks' | 'System';
  icon: LucideIcon;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onOpenBackup }) => {
  const { 
    habits, 
    toggleHabitLog, 
    weeklyTasks, 
    toggleWeeklyTask, 
    setCurrentTab, 
    theme, 
    toggleTheme, 
    resetAllData 
  } = useApp();

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

  // Build command items list
  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Go to Master Dashboard',
      subtitle: 'Overview & Mission Control',
      category: 'Navigation',
      icon: LayoutGrid,
      action: () => { setCurrentTab('dashboard'); onClose(); }
    },
    {
      id: 'nav-habits',
      title: 'Go to Habit Matrix',
      subtitle: '31-Day Habit Tracker & Velocity Curve',
      category: 'Navigation',
      icon: CalendarCheck2,
      action: () => { setCurrentTab('habits'); onClose(); }
    },
    {
      id: 'nav-weekly',
      title: 'Go to Weekly To-Do',
      subtitle: '7-Day Sprint Board & Day Spotlight',
      category: 'Navigation',
      icon: CalendarRange,
      action: () => { setCurrentTab('weekly'); onClose(); }
    },
    {
      id: 'nav-tasks',
      title: 'Go to Task Manager',
      subtitle: 'Table Ledger, Kanban & Priority Matrix',
      category: 'Navigation',
      icon: CheckSquare,
      action: () => { setCurrentTab('tasks'); onClose(); }
    },
    {
      id: 'nav-goals',
      title: 'Go to Goal Tracker',
      subtitle: '6 Areas of Life Vision Cards & Milestones',
      category: 'Navigation',
      icon: Target,
      action: () => { setCurrentTab('goals'); onClose(); }
    },
    {
      id: 'nav-finance',
      title: 'Go to 50/30/20 Finance',
      subtitle: 'Cash Flow & Transaction Ledger',
      category: 'Navigation',
      icon: Wallet,
      action: () => { setCurrentTab('finance'); onClose(); }
    },

    // Habits (Today Quick Check)
    ...habits.map(h => {
      const isChecked = !!h.logs[26];
      return {
        id: `habit-${h.id}`,
        title: `${isChecked ? 'Uncheck' : 'Check'} Habit: ${h.title}`,
        subtitle: `${h.category} • +${h.expReward} EXP`,
        category: 'Habits' as const,
        icon: isChecked ? Check : Zap,
        action: () => {
          toggleHabitLog(h.id, 26);
          sound.playPop();
          onClose();
        }
      };
    }),

    // Weekly Tasks (Quick Toggle)
    ...weeklyTasks.slice(0, 8).map(t => {
      return {
        id: `task-${t.id}`,
        title: `${t.isCompleted ? 'Reopen' : 'Complete'} Task: ${t.title}`,
        subtitle: `${t.dayName} • ${t.category} • +${t.expReward} EXP`,
        category: 'Tasks' as const,
        icon: t.isCompleted ? Check : CheckSquare,
        action: () => {
          toggleWeeklyTask(t.id);
          sound.playPop();
          onClose();
        }
      };
    }),

    // System Commands
    {
      id: 'sys-theme',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      subtitle: 'Toggle workstation theme',
      category: 'System',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => { toggleTheme(); sound.playClick(); onClose(); }
    },
    {
      id: 'sys-sound',
      title: `${isMuted ? 'Unmute' : 'Mute'} Audio Feedback`,
      subtitle: 'Mechanical click and game sound effects',
      category: 'System',
      icon: isMuted ? VolumeX : Volume2,
      action: () => { toggleSoundMute(); onClose(); }
    },
    {
      id: 'sys-backup',
      title: 'Export / Import System Backup',
      subtitle: 'JSON backup & CSV financial export',
      category: 'System',
      icon: Download,
      action: () => { onClose(); onOpenBackup(); }
    },
    {
      id: 'sys-reset',
      title: 'Reset All Data to Default',
      subtitle: 'Clear local state and restore demo configuration',
      category: 'System',
      icon: RotateCcw,
      action: () => {
        if (window.confirm('Reset all demo data to default state?')) {
          resetAllData();
          onClose();
        }
      }
    }
  ];

  // Filter commands by search query
  const filteredCommands = commands.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    (c.subtitle && c.subtitle.toLowerCase().includes(query.toLowerCase())) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
        sound.playClick();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
        sound.playClick();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-[2px] p-4 animate-in fade-in duration-100">
      <div 
        className="bg-white dark:bg-[#121215] border border-[#E2E8F0] dark:border-[#27272A] rounded-[12px] max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[480px] animate-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[#E2E8F0] dark:border-[#27272A] flex items-center gap-3 bg-[#F9FAFB] dark:bg-[#18181B]">
          <Search size={16} className="text-[#71717A] dark:text-[#A1A1AA]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search (e.g. 'habit', 'task', 'theme')..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-[13px] font-ui text-[#18181B] dark:text-[#F4F4F5] focus:outline-none placeholder:text-[#A1A1AA]"
          />
          <kbd className="text-[10px] font-num px-1.5 py-0.5 rounded bg-white dark:bg-[#27272A] border border-[#E2E8F0] dark:border-[#3F3F46] text-[#71717A] dark:text-[#A1A1AA]">
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
                    ? 'bg-[#18181B] dark:bg-white text-white dark:text-[#18181B]' 
                    : 'hover:bg-[#F4F4F5] dark:hover:bg-[#1C1C21] text-[#18181B] dark:text-[#F4F4F5]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-6 h-6 rounded-[4px] flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-white/20 dark:bg-black/10' : 'bg-[#F1F5F9] dark:bg-[#27272A] text-[#71717A] dark:text-[#A1A1AA]'
                  }`}>
                    <Icon size={13} />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-[12.5px] font-ui font-medium truncate">
                      {cmd.title}
                    </span>
                    {cmd.subtitle && (
                      <span className={`text-[10.5px] truncate ${
                        isSelected ? 'text-white/70 dark:text-black/60' : 'text-[#71717A] dark:text-[#A1A1AA]'
                      }`}>
                        {cmd.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[9.5px] uppercase font-ui px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-white/20 dark:bg-black/10 text-white dark:text-black' : 'bg-[#F1F5F9] dark:bg-[#27272A] text-[#71717A] dark:text-[#A1A1AA]'
                  }`}>
                    {cmd.category}
                  </span>
                  {isSelected && <ArrowRight size={12} />}
                </div>
              </div>
            );
          })}

          {filteredCommands.length === 0 && (
            <div className="py-12 text-center text-[#71717A] dark:text-[#A1A1AA] font-ui text-[12px]">
              No matching commands found.
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="p-2.5 px-4 border-t border-[#E2E8F0] dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B] flex items-center justify-between text-[10.5px] text-[#71717A] dark:text-[#A1A1AA] font-num">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="font-ui">MPLT Quick-Command</span>
        </div>

      </div>
    </div>
  );
};
