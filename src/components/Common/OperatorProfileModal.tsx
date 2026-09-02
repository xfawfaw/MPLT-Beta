import React, { useState, useRef } from 'react';
import { useApp, getUserRankTitle } from '../../context/AppContext';
import { 
  User, 
  X, 
  Save, 
  Flame, 
  Sparkles,
  Award,
  Upload,
  Trash2,
  Camera
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { processAvatarImage } from '../../utils/image';
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
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(profile.avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Lifetime telemetry calculations
  const totalHabitsLogged = Object.values(habits).reduce((acc, h) => {
    return acc + Object.values(h.logs).filter(Boolean).length;
  }, 0);

  const totalTasksCompleted = tasks.filter(t => t.status === 'Completed').length;
  const rankTitle = getUserRankTitle(profile.level);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    try {
      const optimizedDataUrl = await processAvatarImage(file, {
        maxDimension: 256,
        quality: 0.85,
      });
      setAvatarUrl(optimizedDataUrl);
      sound.playPop();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process image');
      sound.playClick();
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    sound.playClick();
  };

  const handleSave = () => {
    updateProfile({
      callsign,
      bio,
      avatarSeed: selectedAvatar,
      avatarUrl: avatarUrl || undefined,
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
          className="w-full max-w-[640px] max-h-[90vh] overflow-y-auto bg-[#FFFFFF] border border-[#E2E8F0] rounded-[14px] shadow-2xl p-6 sm:p-7 space-y-5 select-none"
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
                  Personal configuration, custom avatar photo, and lifetime telemetry
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

          {/* Identity & Rank Hero Card with Avatar Upload */}
          <div className="p-4 rounded-[12px] bg-[#F9FAFB] border border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Active Avatar Preview with Hover Upload Trigger */}
              <div className="relative group">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Custom Avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#10B981] shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#18181B] border-2 border-[#10B981] flex items-center justify-center text-[26px] shadow-inner flex-shrink-0">
                    {AVATAR_OPTIONS.find(a => a.id === selectedAvatar)?.glyph || '⚡'}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Custom Image"
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer text-[9px] font-bold"
                >
                  <Camera size={16} className="mb-0.5" />
                  <span>Change</span>
                </button>
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

            {/* Avatar Photo Controls & Presets */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] bg-white border border-[#CBD5E1] hover:border-[#18181B] text-[#18181B] text-[10.5px] font-ui font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  <Upload size={11} className="text-[#10B981]" />
                  <span>{isUploading ? 'Cropping...' : avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    title="Remove custom photo and use preset glyph"
                    className="p-1.5 rounded-[6px] bg-white border border-[#E2E8F0] hover:border-rose-300 text-rose-500 text-[10.5px] shadow-2xs transition-all cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              {/* Glyph selector (shown if no custom avatar or to change fallback glyph) */}
              <div className="flex items-center gap-1">
                {AVATAR_OPTIONS.map(a => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(a.id);
                      sound.playClick();
                    }}
                    title={a.label}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] border transition-all ${
                      selectedAvatar === a.id && !avatarUrl
                        ? 'border-[#10B981] bg-[#18181B] scale-110 shadow-sm'
                        : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
                    }`}
                  >
                    {a.glyph}
                  </button>
                ))}
              </div>

              {uploadError && (
                <p className="text-[10px] text-rose-600 font-medium">{uploadError}</p>
              )}
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
                <p className="text-[16px] font-bold text-[#10B981] mt-0.5">{budget.incomeGoal > 0 ? `${(budget.incomeGoal / 1000000).toFixed(1)}M` : '0M'}</p>
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
