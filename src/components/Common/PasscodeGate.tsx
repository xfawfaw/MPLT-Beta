import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, KeyRound, ChevronDown, ChevronUp, UserCheck, Terminal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OPERATOR_LIST, findOperatorByPin } from '../../types';
import { sound } from '../../utils/sound';
import { motion, AnimatePresence } from 'framer-motion';

interface PasscodeGateProps {
  children: React.ReactNode;
}

export const PasscodeGate: React.FC<PasscodeGateProps> = ({ children }) => {
  const { switchOperator } = useApp();

  // Check if passcode authentication is already verified
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mplt_passcode_auth') === 'true';
  });

  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showKeyDirectory, setShowKeyDirectory] = useState(false);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const matchedOp = findOperatorByPin(pin);

    if (matchedOp) {
      sound.playLevelUp();
      switchOperator(matchedOp.id);
      localStorage.setItem('mplt_passcode_auth', 'true');
      localStorage.setItem('mplt_authenticated_operator', matchedOp.id);
      setIsAuthenticated(true);
      setError(false);
    } else {
      sound.playClick();
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2500);
    }
  };

  const handleQuickFill = (targetPin: string) => {
    setPin(targetPin);
    sound.playClick();
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4 selection:bg-[#18181B] selection:text-white select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[430px] bg-white border border-[#E2E8F0] rounded-[14px] shadow-2xl p-7 text-center space-y-5"
      >
        {/* Security Badge Icon */}
        <div className="w-14 h-14 mx-auto rounded-full bg-[#18181B] border-2 border-[#10B981] flex items-center justify-center text-[#10B981] shadow-md">
          <Lock size={22} className="stroke-[2.2]" />
        </div>

        <div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <h2 className="text-[17px] font-bold text-[#18181B] font-ui tracking-tight">
              MPLT ZERO • PRIVATE GATEWAY
            </h2>
          </div>
          <p className="text-[12px] text-[#71717A] font-ui">
            Enter your assigned Operator Key/PIN to unlock your personal workspace
          </p>
        </div>

        {/* PIN Entry Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              maxLength={12}
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter Operator PIN"
              className={`w-full text-center tracking-[6px] text-[18px] font-num font-bold py-3 px-4 rounded-[8px] border bg-[#F9FAFB] focus:bg-white focus:outline-none transition-all ${
                error
                  ? 'border-[#E11D48] text-[#E11D48] ring-1 ring-[#E11D48]'
                  : 'border-[#CBD5E1] text-[#18181B] focus:border-[#18181B]'
              }`}
            />
          </div>

          {error && (
            <p className="text-[11.5px] font-medium text-[#E11D48] animate-bounce font-ui">
              Access Denied: Unrecognized Operator PIN.
            </p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[8px] bg-[#18181B] text-white text-[13px] font-bold font-ui hover:bg-[#27272A] active:scale-[0.98] transition-all shadow-sm cursor-pointer"
          >
            <KeyRound size={14} />
            <span>Authenticate & Unlock</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Operator Key Directory Helper */}
        <div className="pt-2 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => {
              setShowKeyDirectory(prev => !prev);
              sound.playClick();
            }}
            className="flex items-center justify-between w-full px-2 py-1.5 text-[11px] font-medium text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <UserCheck size={13} className="text-[#10B981]" />
              <span>Operator Key Directory</span>
            </span>
            {showKeyDirectory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          <AnimatePresence>
            {showKeyDirectory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-2 text-left"
              >
                <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] space-y-1.5 text-[11px]">
                  <p className="text-[10px] uppercase font-bold text-[#71717A] tracking-wider mb-1">
                    Click key to prefill PIN:
                  </p>
                  {OPERATOR_LIST.map((op) => (
                    <div
                      key={op.id}
                      onClick={() => handleQuickFill(op.defaultPin)}
                      className="flex items-center justify-between p-1.5 rounded hover:bg-white hover:border hover:border-[#E2E8F0] cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-1.5">
                        {op.isDev ? <Terminal size={12} className="text-amber-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />}
                        <span className="font-ui font-medium text-[#18181B]">{op.label}</span>
                      </div>
                      <span className="font-num font-bold px-1.5 py-0.2 rounded bg-[#18181B] text-white text-[10px]">
                        PIN: {op.defaultPin}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pt-1 flex items-center justify-center gap-2 text-[10.5px] text-[#71717A] font-ui">
          <ShieldCheck size={13} className="text-[#10B981]" />
          <span>Local-First Sovereign Key Security</span>
        </div>
      </motion.div>
    </div>
  );
};

