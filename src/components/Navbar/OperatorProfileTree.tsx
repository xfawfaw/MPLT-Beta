import React from 'react';
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
  Layers 
} from 'lucide-react';
import { 
  TreeView, 
  TreeSection, 
  TreeFolder, 
  TreeItem 
} from '@/components/ui/animated-file-tree';
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
  const { profile, habits, tasks, goals, budget, updateProfile } = useApp();

  const rankTitle = getUserRankTitle(profile.level);
  const expPercentage = Math.min(100, Math.round((profile.currentExp / profile.nextLevelExp) * 100));

  const totalHabitsLogged = Object.values(habits).reduce((acc, h) => {
    return acc + Object.values(h.logs).filter(Boolean).length;
  }, 0);

  const totalTasksCompleted = tasks.filter(t => t.status === 'Completed').length;
  const activeAvatar = AVATARS.find(a => a.id === profile.avatarSeed) || AVATARS[0];

  const handleSelectGlyph = (avatarId: string) => {
    updateProfile({ avatarSeed: avatarId });
    sound.playPop();
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
            className="fixed inset-0 top-[64px] bg-black/15 backdrop-blur-[3px] z-40"
          />

          {/* Floating Operator Tree Card */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 8, scale: 0.97, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 480, damping: 34 }}
            className="absolute right-0 top-[calc(100%+8px)] w-[330px] sm:w-[360px] bg-white/95 backdrop-blur-xl rounded-2xl border border-[#E2E8F0] shadow-2xl z-50 p-3.5 flex flex-col gap-3 overflow-hidden select-none"
          >
            {/* Header: Operator Avatar, Call-sign & Rank */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#18181B] text-[#10B981] flex items-center justify-center text-[13px] font-bold shadow-inner border border-[#10B981]/30 flex-shrink-0">
                  {activeAvatar.glyph}
                </div>
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
                  title="Edit Profile Dossier"
                  className="p-1 rounded-md hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#18181B] transition-colors"
                >
                  <Edit3 size={13} />
                </button>
                <button 
                  onClick={onClose}
                  className="p-1 rounded-md hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#18181B] transition-colors"
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
              <button
                onClick={() => {
                  onOpenEditModal();
                  onClose();
                  sound.playClick();
                }}
                title="Open Full Profile Settings"
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[6px] bg-[#18181B] text-white hover:bg-[#27272A] text-[10.5px] font-ui font-bold transition-colors shadow-2xs cursor-pointer"
              >
                <User size={12} />
                <span>Configure Profile Dossier</span>
              </button>
            </div>

            {/* Interactive Operator Profile TreeView */}
            <div className="max-h-[340px] overflow-y-auto pr-1">
              <TreeView
                variant="line"
                activeColor="text-[#18181B]"
                selectedId={undefined}
                onSelect={() => {}}
              >
                {/* 1. OPERATOR IDENTITY & DOSSIER */}
                <TreeSection title="Operator Dossier" defaultExpanded={true}>
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
                    badge={`Rp ${(budget.incomeGoal / 1000000).toFixed(1)}M`} 
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

            {/* Footer */}
            <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[10px] text-[#71717A] font-ui">
              <span className="flex items-center gap-1.5">
                <Shield size={11} className="text-[#10B981]" />
                Sovereign Operator
              </span>
              <span className="font-num text-[#18181B] font-semibold">
                {profile.joinedDate || '2026.09'}
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
