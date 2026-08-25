import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles } from 'lucide-react';

export const ExpToast: React.FC = () => {
  const { expToast } = useApp();

  if (!expToast || !expToast.visible) return null;

  return (
    <div className="fixed top-20 right-6 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-2">
      <div className="bg-[#18181B] text-[#FFFFFF] border border-[#27272A] rounded-[8px] px-3.5 py-2 flex items-center gap-2.5 shadow-sm">
        <div className="w-5 h-5 rounded-[4px] bg-[#10B981] flex items-center justify-center text-white">
          <Sparkles size={12} className="stroke-[2.5]" />
        </div>
        <div className="text-[12px] font-medium font-ui flex items-center gap-2">
          <span>{expToast.message}</span>
          <span className="font-num text-[#10B981] font-bold bg-[#10B981]/15 px-1.5 py-0.5 rounded-[4px] text-[11px]">
            +{expToast.exp} EXP
          </span>
        </div>
      </div>
    </div>
  );
};
