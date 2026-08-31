import React from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, CheckCircle2, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

export const LevelUpModal: React.FC = () => {
  const { levelUpModal, closeLevelUpModal, profile } = useApp();

  const triggerMoreConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#10B981', '#18181B', '#E11D48', '#38BDF8'],
    });
  };

  return (
    <AnimatePresence>
      {levelUpModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[12px] max-w-md w-full p-6 text-center shadow-2xl relative"
          >
            {/* Level Emblem */}
            <div className="w-16 h-16 bg-[#18181B] border-2 border-[#10B981] rounded-xl mx-auto flex items-center justify-center mb-4 text-[#10B981] shadow-sm">
              <Trophy size={32} className="stroke-[2]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#10B981]/10 text-[#10B981] text-[12px] font-bold tracking-wide uppercase mb-2">
              <Zap size={14} className="stroke-[2.5]" />
              System Promotion
            </div>

            <h2 className="text-[24px] font-bold text-[#18181B] tracking-tight font-ui">
              LEVEL UP ACHIEVED!
            </h2>
            
            <p className="text-[13px] text-[#71717A] mt-1 font-ui">
              You reached <span className="text-[#18181B] font-semibold font-num">LEVEL {levelUpModal.newLevel}</span> in MPLT Zero.
            </p>

            {/* Stats card */}
            <div className="mt-5 p-4 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] text-left space-y-2.5 text-[12px]">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                <span className="text-[#71717A]">Total EXP Gathered</span>
                <span className="font-num font-bold text-[#18181B]">{(levelUpModal.newLevel - 1) * 2000 + profile.currentExp} EXP</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                <span className="text-[#71717A]">Gamification Points</span>
                <span className="font-num font-bold text-[#10B981]">{profile.totalPoints} PTS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#71717A]">Discipline Multiplier</span>
                <span className="font-num font-semibold text-[#18181B]">1.{(levelUpModal.newLevel % 10)}x Boost</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={triggerMoreConfetti}
                className="flex-1 px-4 py-2.5 text-[12px] font-medium border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F4F4F5] rounded-[6px] text-[#18181B] active:scale-[0.97] transition-all"
              >
                Celebrate 🎉
              </button>
              <button
                onClick={closeLevelUpModal}
                className="flex-1 px-4 py-2.5 text-[12px] font-bold bg-[#18181B] hover:bg-[#27272A] text-white rounded-[6px] active:scale-[0.97] transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 size={15} />
                Claim & Resume
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
