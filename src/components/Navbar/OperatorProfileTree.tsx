import React, { useState } from 'react';
import { useApp, getUserRankTitle } from '../../context/AppContext';
import { 
  User, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Target, 
  Wallet, 
  Edit3, 
  X, 
  Shield, 
  Activity, 
  Layers, 
  Terminal, 
  Users, 
  Lock, 
  LogOut, 
  KeyRound, 
  ArrowRight 
} from 'lucide-react';
import { 
  TreeView, 
  TreeSection, 
  TreeFolder, 
  TreeItem 
} from '@/components/ui/animated-file-tree';
import { OPERATOR_LIST, OperatorMeta, verifyOperatorPin } from '../../types';
import { sound } from '../../utils/sound';
import { motion, AnimatePresence } from 'framer-motion';

interface OperatorProfileTreeProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEditModal: () => void;
}

const AVATARS = [
  { id: 'operator-1', label: 'Alpha', glyph: '⚡', desc: 'Kinetic High-Speed' },
  { id: 'operator-apex', label: 'Apex', glyph: '🛡️', desc: 'Tactical Discipline' },
  { id: 'operator-zen', label: 'Zen', glyph: '🌿', desc: 'Holistic Longevity' },
  { id: 'operator-cyborg', label: 'Core', glyph: '⚙️', desc: 'System Automation' },
  { id: 'operator-sovereign', label: 'Crown', glyph: '👑', desc: 'Sovereign Capital' },
  { id: 'operator-matrix', label: 'Grid', glyph: '📊', desc: 'Quantified Operator' },
];

export const OperatorProfileTree: React.FC<OperatorProfileTreeProps> = ({ 
  isOpen, 
  onClose, 
  onOpenEditModal 
}) => {
  const { 
    activeOperatorId, 
    switchOperator, 
    profile, 
    habits, 
    tasks, 
    goals, 
    budget, 
    updateProfile 
  } = useApp();

  const [targetSwitchOp, setTargetSwitchOp] = useState<OperatorMeta | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const rankTitle = getUserRankTitle(profile.level);
  const expPercentage = Math.min(100, Math.round((profile.currentExp / profile.nextLevelExp) * 100));

  const totalHabitsLogged = Object.values(habits).reduce((acc, h) => {
    return acc + Object.values(h.logs).filter(Boolean).length;
  }, 0);

  const totalTasksCompleted = tasks.filter(t => t.status === 'Completed').length;
  const activeAvatar = AVATARS.find(a => a.id === profile.avatarSeed) || AVATARS[0];

  const handleSelectGlyph = (avatarId: string) => {
    updateProfile({ avatarSeed: avatarId, avatarUrl: undefined });
    sound.playPop();
  };

  const handleOperatorClick = (op: OperatorMeta) => {
    if (op.id === activeOperatorId) return;
    setTargetSwitchOp(op);
    setPinInput('');
    setPinError('');
    sound.playClick();
  };

  const handleVerifySwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSwitchOp) return;

    if (verifyOperatorPin(targetSwitchOp.id, pinInput)) {
      sound.playLevelUp();
      switchOperator(targetSwitchOp.id);
      localStorage.setItem('mplt_authenticated_operator', targetSwitchOp.id);
      setTargetSwitchOp(null);
      setPinInput('');
      setPinError('');
      onClose();
    } else {
      sound.playClick();
      setPinError(`Incorrect PIN for ${targetSwitchOp.label}`);
    }
  };

  const handleLockWorkstation = () => {
    sound.playClick();
    localStorage.removeItem('mplt_passcode_auth');
    localStorage.removeItem('mplt_authenticated_operator');
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 top-[64px] bg-black/20 backdrop-blur-[6px] z-40"
          />

          {/* Floating Operator Tree Card with Kinetic Motion Blur */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10, scale: 0.96, filter: 'blur(12px)' }}
            transition={{ type: 'spring', stiffness: 480, damping: 32 }}
            className="absolute right-0 top-[calc(100%+8px)] w-[330px] sm:w-[360px] bg-white/95 backdrop-blur-xl rounded-2xl border border-[#E2E8F0] shadow-2xl z-50 p-3.5 flex flex-col gap-3 overflow-hidden select-none"
          >
            {/* Header: Operator Avatar, Call-sign & Rank */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Custom Avatar"
                    className="w-8 h-8 rounded-full object-cover border border-[#10B981] flex-shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#18181B] text-[#10B981] flex items-center justify-center text-[13px] font-bold shadow-inner border border-[#10B981]/30 flex-shrink-0">
                    {activeAvatar.glyph}
                  </div>
                )}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-[#18181B] font-ui tracking-tight max-w-[130px] truncate">
                      {profile.callsign || 'Sovereign Operator'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-[#10B981]/10 text-[#059669] text-[9.5px] font-bold font-num border border-[#10B981]/20">
                      LVL {profile.level}
                    </span>
                  </div>
                  <span className="text-[9.5px] text-[#71717A] font-ui font-medium">
                    {rankTitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    onOpenEditModal();
                    onClose();
                    sound.playClick();
                  }}
                  title="Edit Profile Dossier & Photo"
                  className="p-1 rounded-md hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
                >
                  <Edit3 size={13} />
                </button>
                <button 
                  onClick={onClose}
                  className="p-1 rounded-md hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* EXP & Progress Mini-Hero */}
            <div className="p-2.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] space-y-1.5 font-num">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-ui font-bold text-[#18181B] flex items-center gap-1">
                  <Sparkles size={11} className="text-[#10B981]" />
                  <span>KINETIC EXP</span>
                </span>
                <span className="text-[#71717A]">
                  <strong className="text-[#18181B]">{profile.currentExp.toLocaleString()}</strong> / {profile.nextLevelExp.toLocaleString()} ({expPercentage}%)
                </span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-[4.5px] rounded-full overflow-hidden">
                <div 
                  className="bg-[#18181B] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${expPercentage}%` }}
                />
              </div>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex items-center justify-between gap-1.5 p-1.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
              <motion.button
                onClick={() => {
                  onOpenEditModal();
                  onClose();
                  sound.playClick();
                }}
                whileTap={{ scale: 0.95, filter: 'blur(1px)' }}
                transition={{ duration: 0.1 }}
                title="Open Full Profile Settings"
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[6px] bg-[#18181B] text-white hover:bg-[#27272A] text-[10.5px] font-ui font-bold transition-colors shadow-2xs cursor-pointer"
              >
                <User size={12} />
                <span>Configure Profile & Avatar</span>
              </motion.button>
            </div>

            {/* Interactive Operator Profile TreeView */}
            <div className="max-h-[340px] overflow-y-auto pr-1">
              <TreeView
                variant="line"
                activeColor="text-[#18181B]"
                selectedId={undefined}
                onSelect={() => {}}
              >
                {/* 1. OPERATOR SWITCHER (MULTI-USER ENGINE) */}
                <TreeSection title="Operator Accounts (Multi-User)" defaultExpanded={true}>
                  {OPERATOR_LIST.map((op) => {
                    const isActive = op.id === activeOperatorId;
                    return (
                      <TreeItem 
                        key={op.id}
                        id={`op-switch-${op.id}`}
                        label={op.label}
                        icon={op.isDev ? Terminal : Users}
                        badge={isActive ? '● ACTIVE' : `${op.badge} • 🔒`}
                        onClick={() => handleOperatorClick(op)}
                      />
                    );
                  })}
                </TreeSection>

                {/* 2. OPERATOR IDENTITY & DOSSIER */}
                <TreeSection title="Operator Dossier" defaultExpanded={false}>
                  <TreeItem 
                    id="profile-callsign" 
                    label="Call-Sign" 
                    icon={User} 
                    badge={profile.callsign || 'Operator'} 
                  />
                  <TreeFolder id="avatar-folder" label="Active Avatar Glyph" defaultExpanded={false}>
                    {AVATARS.map(a => (
                      <TreeItem 
                        key={a.id}
                        id={`avatar-${a.id}`}
                        label={`${a.label} (${a.desc})`}
                        badge={a.glyph}
                        icon={Shield}
                        onClick={() => handleSelectGlyph(a.id)}
                      />
                    ))}
                  </TreeFolder>
                </TreeSection>

                {/* 2. PROGRESSION & KINETICS */}
                <TreeSection title="Progression & Kinetics" defaultExpanded={true}>
                  <TreeItem 
                    id="stat-streak" 
                    label="Discipline Streak" 
                    icon={Flame} 
                    badge={`${profile.streakDays} Days`} 
                  />
                  <TreeItem 
                    id="stat-points" 
                    label="Reserve Points" 
                    icon={Sparkles} 
                    badge={`${profile.totalPoints.toLocaleString()} PTS`} 
                  />
                  <TreeItem 
                    id="stat-habits" 
                    label="Habits Executed" 
                    icon={Activity} 
                    badge={`${totalHabitsLogged} Logs`} 
                  />
                  <TreeItem 
                    id="stat-tasks" 
                    label="Tasks Closed" 
                    icon={CheckCircle2} 
                    badge={`${totalTasksCompleted} Closed`} 
                  />
                </TreeSection>

                {/* 3. STRATEGIC BASELINES */}
                <TreeSection title="Strategic Baselines" defaultExpanded={false}>
                  <TreeItem 
                    id="base-income" 
                    label="Target Inflow" 
                    icon={Wallet} 
                    badge={budget.incomeGoal > 0 ? `Rp ${(budget.incomeGoal / 1000000).toFixed(1)}M` : 'Rp 0'} 
                  />
                  <TreeItem 
                    id="base-goals" 
                    label="Active Goals" 
                    icon={Target} 
                    badge={`${goals.length} Roadmaps`} 
                  />
                  <TreeItem 
                    id="base-budget" 
                    label="Allocation Mode" 
                    icon={Layers} 
                    badge={budget.mode} 
                  />
                </TreeSection>
              </TreeView>
            </div>

            {/* Target Operator PIN Verification Modal (Inline) */}
            <AnimatePresence>
              {targetSwitchOp && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3 bg-[#F9FAFB] border border-[#CBD5E1] rounded-[10px] space-y-2.5 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Lock size={13} className="text-[#10B981]" />
                      <span className="text-[11px] font-bold text-[#18181B] font-ui">
                        Unlock {targetSwitchOp.label}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTargetSwitchOp(null)}
                      className="text-[#71717A] hover:text-[#18181B] p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  <form onSubmit={handleVerifySwitch} className="space-y-2">
                    <input
                      type="password"
                      autoFocus
                      maxLength={10}
                      placeholder={`PIN (e.g. ${targetSwitchOp.defaultPin})`}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-[12px] font-num font-bold rounded-[6px] border border-[#CBD5E1] bg-white text-center tracking-[3px] focus:outline-none focus:border-[#18181B]"
                    />
                    {pinError && (
                      <p className="text-[10px] text-[#E11D48] font-ui text-center font-medium">
                        {pinError}
                      </p>
                    )}
                    <button
                      type="submit"
                      className="w-full py-1.5 px-3 rounded-[6px] bg-[#18181B] text-white text-[11px] font-bold font-ui flex items-center justify-center gap-1.5 hover:bg-[#27272A] cursor-pointer"
                    >
                      <KeyRound size={12} />
                      <span>Unlock & Switch</span>
                      <ArrowRight size={12} />
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer & Lock Button */}
            <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[10px] text-[#71717A] font-ui">
              <span className="flex items-center gap-1.5">
                <Shield size={11} className="text-[#10B981]" />
                <span>{profile.callsign || 'Sovereign Operator'}</span>
              </span>

              <button
                type="button"
                onClick={handleLockWorkstation}
                className="flex items-center gap-1 px-2 py-1 rounded-[4px] text-rose-600 hover:bg-rose-50 font-bold transition-colors cursor-pointer"
                title="Lock Workstation & Sign Out"
              >
                <LogOut size={11} />
                <span>Lock</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
