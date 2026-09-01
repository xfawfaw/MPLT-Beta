import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowRight, 
  Check, 
  DollarSign, 
  Activity, 
  User, 
  Target 
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { addExp, setBudgetConfig } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [operatorName, setOperatorName] = useState('Sovereign Operator');
  const [primaryFocus, setPrimaryFocus] = useState('Deep Work & Capital Compound');
  
  // Starter habit choices
  const starterHabitOptions = [
    { id: 'h-run', title: 'Morning Movement & Running', category: 'Health' as const, selected: true },
    { id: 'h-deep', title: '90m Unbroken Deep Work Block', category: 'Work' as const, selected: true },
    { id: 'h-food', title: 'Zero Sugar & Whole Foods', category: 'Health' as const, selected: true },
    { id: 'h-finance', title: 'Review 50/30/20 Cash Ledger', category: 'Money' as const, selected: true },
    { id: 'h-read', title: 'Read 20 Pages Non-Fiction', category: 'Personal Growth' as const, selected: false },
    { id: 'h-night', title: 'Evening Reflection & Quran', category: 'Spirituality' as const, selected: false },
  ];

  const [selectedHabits, setSelectedHabits] = useState<string[]>([
    'h-run', 'h-deep', 'h-food', 'h-finance'
  ]);

  const [monthlyIncome, setMonthlyIncome] = useState<number>(15000000);
  const [budgetPreset, setBudgetPreset] = useState<'50/30/20' | '60/20/20' | '80/20'>('50/30/20');

  const toggleHabitSelection = (id: string) => {
    sound.playClick();
    setSelectedHabits(prev => 
      prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    sound.playLevelUp();
    
    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#18181B', '#38BDF8', '#F59E0B']
    });

    // Save income and budget config
    if (budgetPreset === '50/30/20') {
      setBudgetConfig(prev => ({ ...prev, incomeGoal: monthlyIncome, mode: '50/30/20', needsRatio: 50, wantsRatio: 30, savingsRatio: 20 }));
    } else if (budgetPreset === '60/20/20') {
      setBudgetConfig(prev => ({ ...prev, incomeGoal: monthlyIncome, mode: '60/20/20', needsRatio: 60, wantsRatio: 20, savingsRatio: 20 }));
    } else {
      setBudgetConfig(prev => ({ ...prev, incomeGoal: monthlyIncome, mode: '80/20', needsRatio: 80, wantsRatio: 0, savingsRatio: 20 }));
    }

    // Award +50 Welcome EXP
    addExp(50, 'Completed Sovereign System Onboarding');
    localStorage.setItem('mplt_zero_onboarded', 'true');
    localStorage.setItem('mplt_operator_name', operatorName);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18181B]/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[580px] bg-[#FFFFFF] border border-[#E2E8F0] rounded-[12px] shadow-2xl p-6 sm:p-7 space-y-6 select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <h3 className="text-[17px] font-bold text-[#18181B] font-ui tracking-tight">
                  WELCOME TO MPLT ZERO
                </h3>
              </div>
              <p className="text-[12px] text-[#71717A] font-ui">
                Sovereign Life Operations System • Setup Wizard (Step {step} of 3)
              </p>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-1.5 font-num">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all ${
                    step === s
                      ? 'bg-[#18181B] text-white border-[#18181B]'
                      : step > s
                      ? 'bg-[#10B981] text-white border-[#10B981]'
                      : 'bg-[#F1F5F9] text-[#71717A] border-[#CBD5E1]'
                  }`}
                >
                  {step > s ? <Check size={11} className="stroke-[3]" /> : s}
                </div>
              ))}
            </div>
          </div>

          {/* STEP 1: OPERATOR IDENTITY */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#18181B] font-ui flex items-center gap-1.5">
                  <User size={13} className="text-[#10B981]" />
                  <span>Operator Call-Sign / Name</span>
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  placeholder="e.g. Rian, Operator Alpha"
                  className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#CBD5E1] text-[13px] font-ui focus:border-[#18181B] focus:outline-none transition-colors"
                />
                <p className="text-[11px] text-[#71717A]">
                  This call-sign anchors your personal operational workstation.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#18181B] font-ui flex items-center gap-1.5">
                  <Target size={13} className="text-[#10B981]" />
                  <span>Primary Strategic Focus Area</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Deep Work & Capital Compound',
                    'Physical Longevity & Athleticism',
                    'Career Advancement & SaaS',
                    'Holistic Sovereign Balance'
                  ].map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        setPrimaryFocus(f);
                        sound.playClick();
                      }}
                      className={`p-3 text-left rounded-[8px] border text-[12px] font-ui transition-all ${
                        primaryFocus === f
                          ? 'border-[#18181B] bg-[#F9FAFB] font-bold text-[#18181B] ring-1 ring-[#18181B]'
                          : 'border-[#E2E8F0] hover:border-[#CBD5E1] text-[#71717A]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: STARTER HABITS */}
          {step === 2 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div>
                <h4 className="text-[13px] font-bold text-[#18181B] font-ui flex items-center gap-1.5">
                  <Activity size={13} className="text-[#10B981]" />
                  <span>Select Core Daily Habits (3 to 4 recommended)</span>
                </h4>
                <p className="text-[11.5px] text-[#71717A] font-ui mt-0.5">
                  You can modify, add, or delete any habit later in the Habit Builder workstation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {starterHabitOptions.map(h => {
                  const isChecked = selectedHabits.includes(h.id);
                  return (
                    <div
                      key={h.id}
                      onClick={() => toggleHabitSelection(h.id)}
                      className={`p-3 rounded-[8px] border cursor-pointer flex items-center justify-between gap-2 transition-all ${
                        isChecked
                          ? 'border-[#18181B] bg-[#F9FAFB] text-[#18181B]'
                          : 'border-[#E2E8F0] hover:border-[#CBD5E1] text-[#71717A]'
                      }`}
                    >
                      <div>
                        <p className={`text-[12px] font-ui ${isChecked ? 'font-bold' : 'font-medium'}`}>
                          {h.title}
                        </p>
                        <span className="text-[10px] font-ui text-[#71717A]">
                          {h.category} • +25 EXP
                        </span>
                      </div>
                      <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all ${
                        isChecked ? 'bg-[#18181B] border-[#18181B] text-white' : 'border-[#CBD5E1] bg-white'
                      }`}>
                        {isChecked && <Check size={11} className="stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: FINANCIAL BASELINE */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#18181B] font-ui flex items-center gap-1.5">
                  <DollarSign size={13} className="text-[#10B981]" />
                  <span>Monthly Inflow Target (IDR)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[13px] font-bold text-[#71717A] font-num">
                    Rp
                  </span>
                  <input
                    type="number"
                    step="500000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-[6px] border border-[#CBD5E1] text-[13px] font-num font-bold text-[#18181B] focus:border-[#18181B] focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-[11px] text-[#71717A]">
                  Used to automatically compute your 50/30/20 allocation buckets and Safe Daily Burn rate.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#18181B] font-ui">
                  Allocation Preset
                </label>
                <div className="grid grid-cols-3 gap-2 font-num">
                  {[
                    { id: '50/30/20', label: '50/30/20 Balanced' },
                    { id: '60/20/20', label: '60/20/20 Practical' },
                    { id: '80/20', label: '80/20 Aggressive' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setBudgetPreset(p.id as any);
                        sound.playClick();
                      }}
                      className={`p-2.5 text-center rounded-[6px] border text-[11px] transition-all ${
                        budgetPreset === p.id
                          ? 'border-[#18181B] bg-[#18181B] text-white font-bold'
                          : 'border-[#CBD5E1] hover:border-[#18181B] text-[#71717A] bg-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-[#E2E8F0]">
            <button
              onClick={() => {
                if (step > 1) {
                  sound.playClick();
                  setStep((step - 1) as any);
                } else {
                  // Skip to finish
                  handleFinish();
                }
              }}
              className="text-[12px] font-medium text-[#71717A] hover:text-[#18181B] transition-colors"
            >
              {step === 1 ? 'Skip Setup (Use Defaults)' : 'Back'}
            </button>

            <button
              onClick={() => {
                if (step < 3) {
                  sound.playClick();
                  setStep((step + 1) as any);
                } else {
                  handleFinish();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#18181B] text-white text-[12px] font-bold font-ui hover:bg-[#27272A] active:scale-[0.97] transition-all shadow-sm"
            >
              <span>{step === 3 ? 'Launch Sovereign System (+50 EXP)' : 'Next Step'}</span>
              <ArrowRight size={13} />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
