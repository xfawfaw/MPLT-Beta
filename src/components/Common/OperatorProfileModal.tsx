import React, { useState } from 'react';
import { useApp, getUserRankTitle } from '../../context/AppContext';
import { 
  User, 
  X, 
  Save, 
  Flame, 
  Sparkles,
  Award
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { motion, AnimatePresence } from 'framer-motion';

interface OperatorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_OPTIONS = [
  { id: 'operator-1', label: 'Alpha', glyph: '⚡', bg: 'bg-[#18181B] text-[#10B981]' },
  { id: 'operator-apex', label: 'Apex', glyph: '🛡️', bg: 'bg-[#18181B] text-[#38BDF8]' },
  { id: 'operator-zen', label: 'Zen', glyph: '🌿', bg: 'bg-[#18181B] text-[#F59E0B]' },
  { id: 'operator-cyborg', label: 'Core', glyph: '⚙️', bg: 'bg-[#18181B] text-[#EC4899]' },
  { id: 'operator-sovereign', label: 'Crown', glyph: '👑', bg: 'bg-[#18181B] text-[#FBBF24]' },
  { id: 'operator-matrix', label: 'Grid', glyph: '📊', bg: 'bg-[#18181B] text-[#FFFFFF]' },
];

export const OperatorProfileModal: React.FC<OperatorProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, habits, tasks, goals, budget, updateProfile } = useApp();

  const [callsign, setCallsign] = useState(profile.callsign || 'Sovereign Operator');
  const [bio, setBio] = useState(profile.bio || 'Building discipline through quantified daily execution.');
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarSeed || 'operator-1');
  
  // Lifetime telemetry calculations
  const totalHabitsLogged = Object.values(habits).reduce((acc, h) => {
    return acc + Object.values(h.logs).filter(Boolean).length;
  }, 0);

  const totalTasksCompleted = tasks.filter(t => t.status === 'Completed').length;
  const rankTitle = getUserRankTitle(profile.level);

  const handleSave = () => {
    updateProfile({
      callsign,
      bio,
      avatarSeed: selectedAvatar,
    });
    sound.playLevelUp();
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
          className="w-full max-w-[620px] max-h-[90vh] overflow-y-auto bg-[#FFFFFF] border border-[#E2E8F0] rounded-[12px] shadow-2xl p-6 sm:p-7 space-y-6 select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <div>
                <h3 className="text-[16px] font-bold text-[#18181B] font-ui tracking-tight flex items-center gap-1.5">
                  <span>OPERATOR PROFILE & IDENTITY</span>
                </h3>
                <p className="text-[11.5px] text-[#71717A] font-ui">
                  Personal configuration, avatar identity, and lifetime operational telemetry
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-[6px] hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#18181B] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Identity & Rank Hero Card */}
          <div className="p-4 rounded-[10px] bg-[#F9FAFB] border border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Active Avatar Badge */}
              <div className="w-14 h-14 rounded-full bg-[#18181B] border-2 border-[#10B981] flex items-center justify-center text-[22px] shadow-inner flex-shrink-0">
                {AVATAR_OPTIONS.find(a => a.id === selectedAvatar)?.glyph || '⚡'}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-[15px] font-bold text-[#18181B] font-ui tracking-tight">
                    {callsign || 'Sovereign Operator'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-[4px] bg-[#10B981]/10 text-[#059669] text-[10.5px] font-bold font-num border border-[#10B981]/20">
                    LVL {profile.level}
                  </span>
                </div>
                <p className="text-[12px] font-medium text-[#71717A] font-ui">
                  {rankTitle}
                </p>
                <div className="flex items-center gap-3 text-[11px] font-num text-[#71717A] mt-1">
                  <span className="flex items-center gap-1">
                    <Sparkles size={11} className="text-[#10B981]" />
                    <span>{profile.currentExp} / {profile.nextLevelExp} EXP</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Flame size={11} className="text-[#E11D48]" />
                    <span>{profile.streakDays} Day Streak</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Avatar Selector Presets */}
            <div>
              <p className="text-[10.5px] font-bold text-[#71717A] uppercase tracking-wider mb-1.5">
                Avatar Glyph
              </p>
              <div className="flex items-center gap-1.5">
                {AVATAR_OPTIONS.map(a => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(a.id);
                      sound.playClick();
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] border transition-all ${
                      selectedAvatar === a.id
                        ? 'border-[#10B981] bg-[#18181B] scale-110 shadow-sm'
                        : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
                    }`}
                  >
                    {a.glyph}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Details Edit Form */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11.5px] font-bold text-[#18181B] font-ui flex items-center gap-1.5">
                <User size={12} className="text-[#10B981]" />
                <span>Call-Sign / Operative Name</span>
              </label>
              <input
                type="text"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                placeholder="e.g. Commander Rian, Sovereign 01"
                className="w-full px-3 py-2 rounded-[6px] border border-[#CBD5E1] text-[12.5px] font-ui focus:border-[#18181B] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11.5px] font-bold text-[#18181B] font-ui">
                Operational Bio / Sovereign Mantra
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="Personal mission statement or daily operational mantra..."
                className="w-full px-3 py-2 rounded-[6px] border border-[#CBD5E1] text-[12.5px] font-ui focus:border-[#18181B] focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* Lifetime Telemetry Grid */}
          <div className="space-y-1.5">
            <h4 className="text-[12px] font-bold text-[#18181B] font-ui flex items-center gap-1.5">
              <Award size={13} className="text-[#10B981]" />
              <span>Lifetime Operational Statistics</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-num">
              <div className="p-2.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
                <p className="text-[10px] font-bold text-[#71717A] uppercase font-ui">Habits Checked</p>
                <p className="text-[16px] font-bold text-[#18181B] mt-0.5">{totalHabitsLogged}</p>
              </div>
              <div className="p-2.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
                <p className="text-[10px] font-bold text-[#71717A] uppercase font-ui">Tasks Closed</p>
                <p className="text-[16px] font-bold text-[#18181B] mt-0.5">{totalTasksCompleted}</p>
              </div>
              <div className="p-2.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
                <p className="text-[10px] font-bold text-[#71717A] uppercase font-ui">Active Goals</p>
                <p className="text-[16px] font-bold text-[#18181B] mt-0.5">{goals.length}</p>
              </div>
              <div className="p-2.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
                <p className="text-[10px] font-bold text-[#71717A] uppercase font-ui">Target Inflow</p>
                <p className="text-[16px] font-bold text-[#10B981] mt-0.5">{(budget.incomeGoal / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E8F0]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[12px] font-medium border border-[#E2E8F0] rounded-[6px] hover:bg-[#F4F4F5] text-[#71717A] active:scale-[0.97] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#18181B] text-white text-[12px] font-bold font-ui hover:bg-[#27272A] active:scale-[0.97] transition-all shadow-sm"
            >
              <Save size={13} />
              <span>Save Profile Changes</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
