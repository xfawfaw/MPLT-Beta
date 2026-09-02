import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Terminal, 
  Sparkles, 
  TrendingUp, 
  RotateCcw, 
  Database, 
  Flame, 
  ChevronUp, 
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '../../utils/sound';

export const DevToolbar: React.FC = () => {
  const { 
    activeOperatorId, 
    profile, 
    devAddExp, 
    devLevelUp, 
    devSetStreak, 
    devSeedDemoData, 
    devResetSandbox 
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);

  // Strictly only show in Developer Mode
  if (activeOperatorId !== 'dev') return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 select-none font-ui">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(8px)' }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="mb-2 w-72 p-3 bg-[#18181B] text-white border border-[#27272A] rounded-xl shadow-2xl space-y-2.5 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[11px] font-bold tracking-wider uppercase font-mono text-[#10B981]">
                  Dev God Controls
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#27272A] text-[#A1A1AA]">
                LVL {profile.level} • {profile.currentExp}xp
              </span>
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
              <motion.button
                whileTap={{ scale: 0.95, filter: 'blur(1px)' }}
                onClick={() => {
                  devAddExp(500);
                  sound.playPop();
                }}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white transition-colors cursor-pointer"
              >
                <Sparkles size={12} className="text-[#10B981]" />
                <span>+500 EXP</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95, filter: 'blur(1px)' }}
                onClick={() => {
                  devLevelUp();
                  sound.playLevelUp();
                }}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white transition-colors cursor-pointer"
              >
                <TrendingUp size={12} className="text-[#38BDF8]" />
                <span>Instant Level Up</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95, filter: 'blur(1px)' }}
                onClick={() => {
                  devSetStreak(profile.streakDays + 7);
                  sound.playPop();
                }}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white transition-colors cursor-pointer"
              >
                <Flame size={12} className="text-orange-500" />
                <span>+7 Day Streak</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95, filter: 'blur(1px)' }}
                onClick={() => {
                  devSeedDemoData();
                  sound.playLevelUp();
                }}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white transition-colors cursor-pointer"
              >
                <Database size={12} className="text-amber-400" />
                <span>Seed Demo DB</span>
              </motion.button>
            </div>

            {/* Reset Sandbox */}
            <motion.button
              whileTap={{ scale: 0.96, filter: 'blur(1px)' }}
              onClick={() => {
                devResetSandbox();
                sound.playPop();
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-[10px] font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw size={11} />
              <span>Reset Dev Sandbox to Clean</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger Floating Pill */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95, filter: 'blur(1.2px)' }}
        onClick={() => {
          setIsExpanded(prev => !prev);
          sound.playClick();
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#18181B] text-white border border-[#27272A] shadow-xl hover:border-[#10B981] transition-all cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <Terminal size={13} className="text-[#10B981]" />
          <span className="text-[11px] font-bold font-mono tracking-wide">DEV MODE</span>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
        {isExpanded ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
      </motion.button>
    </div>
  );
};
