import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ShieldCheck, Undo2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ExpToast: React.FC = () => {
  const { expToast } = useApp();

  const isDeduction = expToast && typeof expToast.exp === 'number' && expToast.exp < 0;

  return (
    <div className="fixed top-20 right-6 z-50 pointer-events-none">
      <AnimatePresence>
        {expToast && expToast.visible && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="bg-[#18181B] text-[#FFFFFF] border border-[#27272A] rounded-[8px] px-3.5 py-2 flex items-center gap-2.5 shadow-lg shadow-black/10"
          >
            <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center text-white shadow-xs ${
              isDeduction ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
            }`}>
              {isDeduction ? (
                <Undo2 size={12} className="stroke-[2.5]" />
              ) : expToast.exp && expToast.exp > 0 ? (
                <Sparkles size={12} className="stroke-[2.5]" />
              ) : (
                <ShieldCheck size={12} className="stroke-[2.5]" />
              )}
            </div>
            <div className="text-[12px] font-medium font-ui flex items-center gap-2">
              <span>{expToast.message}</span>
              {typeof expToast.exp === 'number' && expToast.exp > 0 && (
                <span className="font-num text-[#10B981] font-bold bg-[#10B981]/15 px-1.5 py-0.5 rounded-[4px] text-[11px]">
                  +{expToast.exp} EXP
                </span>
              )}
              {typeof expToast.exp === 'number' && expToast.exp < 0 && (
                <span className="font-num text-[#F59E0B] font-bold bg-[#F59E0B]/15 px-1.5 py-0.5 rounded-[4px] text-[11px]">
                  {expToast.exp} EXP
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
