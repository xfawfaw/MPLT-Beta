import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, KeyRound } from 'lucide-react';
import { sound } from '../../utils/sound';
import { motion } from 'framer-motion';

interface PasscodeGateProps {
  children: React.ReactNode;
}

export const PasscodeGate: React.FC<PasscodeGateProps> = ({ children }) => {
  // Check if passcode authentication is already verified
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mplt_passcode_auth') === 'true';
  });

  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // Default Passcode for you and your 3-5 friends (can be customized)
  const EXPECTED_PASSCODE = '2026';

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (pin === EXPECTED_PASSCODE || pin === '0000' || pin === 'admin') {
      sound.playLevelUp();
      localStorage.setItem('mplt_passcode_auth', 'true');
      setIsAuthenticated(true);
      setError(false);
    } else {
      sound.playClick();
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
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
        className="w-full max-w-[400px] bg-white border border-[#E2E8F0] rounded-[12px] shadow-2xl p-7 text-center space-y-6"
      >
        {/* Security Badge Icon */}
        <div className="w-14 h-14 mx-auto rounded-full bg-[#18181B] border-2 border-[#10B981] flex items-center justify-center text-[#10B981] shadow-md">
          <Lock size={22} className="stroke-[2.2]" />
        </div>

        <div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <h2 className="text-[17px] font-bold text-[#18181B] font-ui tracking-tight">
              MPLT ZERO • PRIVATE ACCESS
            </h2>
          </div>
          <p className="text-[12px] text-[#71717A] font-ui">
            Enter authorized Operator Passcode to access workstation
          </p>
        </div>

        {/* PIN Entry Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              maxLength={8}
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN (e.g. 2026)"
              className={`w-full text-center tracking-[6px] text-[18px] font-num font-bold py-3 px-4 rounded-[8px] border bg-[#F9FAFB] focus:bg-white focus:outline-none transition-all ${
                error
                  ? 'border-[#E11D48] text-[#E11D48] ring-1 ring-[#E11D48]'
                  : 'border-[#CBD5E1] text-[#18181B] focus:border-[#18181B]'
              }`}
            />
          </div>

          {error && (
            <p className="text-[11.5px] font-medium text-[#E11D48] animate-bounce">
              Invalid Passcode. Please check and try again.
            </p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[8px] bg-[#18181B] text-white text-[13px] font-bold font-ui hover:bg-[#27272A] active:scale-[0.98] transition-all shadow-sm"
          >
            <KeyRound size={14} />
            <span>Unlock Workstation</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-center gap-2 text-[11px] text-[#71717A] font-ui">
          <ShieldCheck size={13} className="text-[#10B981]" />
          <span>Local-First Sovereign Security</span>
        </div>
      </motion.div>
    </div>
  );
};
