import React, { useRef, useState } from 'react';
import { useApp, STORAGE_KEY } from '../../context/AppContext';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  X, 
  ShieldCheck,
  Sparkles,
  RotateCcw,
  Archive,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { OPERATOR_LIST } from '../../types';
import { sound } from '../../utils/sound';
import { motion, AnimatePresence } from 'framer-motion';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { 
    activeOperatorId,
    profile, 
    habits, 
    weeklyTasks, 
    tasks, 
    goals, 
    budget, 
    transactions,
    triggerToast,
    loadDemoData,
    resetAllData
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeOpMeta = OPERATOR_LIST.find(o => o.id === activeOperatorId);

  // 1. Export Active Operator Snapshot
  const handleExportActiveOperator = () => {
    sound.playClick();
    const snapshotData = {
      format: 'mplt_operator_snapshot',
      version: '0.1.0',
      exportedAt: new Date().toISOString(),
      operatorId: activeOperatorId,
      operatorCallsign: profile.callsign || activeOpMeta?.defaultCallsign,
      data: {
        profile,
        habits,
        weeklyTasks,
        tasks,
        goals,
        budget,
        transactions,
      }
    };

    const blob = new Blob([JSON.stringify(snapshotData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mplt-zero-personal-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    sound.playPop();
    triggerToast('Exported personal workstation snapshot', 0);
  };

  // 2. Export Complete Workstation Archive (All 5 Operators)
  const handleExportFullArchive = () => {
    sound.playClick();
    const operatorsData: Record<string, any> = {};

    for (const op of OPERATOR_LIST) {
      const opProfile = localStorage.getItem(`${STORAGE_KEY}_${op.id}_profile`);
      const opHabits = localStorage.getItem(`${STORAGE_KEY}_${op.id}_habits`);
      const opWeekly = localStorage.getItem(`${STORAGE_KEY}_${op.id}_weeklyTasks`);
      const opTasks = localStorage.getItem(`${STORAGE_KEY}_${op.id}_tasks`);
      const opGoals = localStorage.getItem(`${STORAGE_KEY}_${op.id}_goals`);
      const opBudget = localStorage.getItem(`${STORAGE_KEY}_${op.id}_budget`);
      const opTx = localStorage.getItem(`${STORAGE_KEY}_${op.id}_transactions`);
      const customPin = localStorage.getItem(`mplt_pin_${op.id}`);

      operatorsData[op.id] = {
        profile: opProfile ? JSON.parse(opProfile) : (op.id === activeOperatorId ? profile : null),
        habits: opHabits ? JSON.parse(opHabits) : (op.id === activeOperatorId ? habits : null),
        weeklyTasks: opWeekly ? JSON.parse(opWeekly) : (op.id === activeOperatorId ? weeklyTasks : null),
        tasks: opTasks ? JSON.parse(opTasks) : (op.id === activeOperatorId ? tasks : null),
        goals: opGoals ? JSON.parse(opGoals) : (op.id === activeOperatorId ? goals : null),
        budget: opBudget ? JSON.parse(opBudget) : (op.id === activeOperatorId ? budget : null),
        transactions: opTx ? JSON.parse(opTx) : (op.id === activeOperatorId ? transactions : null),
        customPin: customPin || null,
      };
    }

    const fullArchive = {
      format: 'mplt_full_workstation_archive',
      version: '0.1.0',
      exportedAt: new Date().toISOString(),
      activeOperatorId,
      operators: operatorsData,
    };

    const blob = new Blob([JSON.stringify(fullArchive, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mplt-zero-full-workstation-archive-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    sound.playPop();
    triggerToast('Exported full 5-operator workstation archive', 0);
  };

  // 3. Export Financial Ledger CSV
  const handleExportCSV = () => {
    sound.playClick();
    const headers = ['Date', 'Description', 'Bucket', 'Type', 'Amount (IDR)', 'Category Tag'];
    const rows = transactions.map(t => [
      t.date,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.bucket,
      t.type,
      t.amount,
      `"${(t.categoryTag || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mplt-zero-ledger-${activeOperatorId}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    sound.playPop();
    triggerToast('Exported CSV transaction ledger', 0);
  };

  // 4. Smart Restore: Handles Full Archive, Operator Snapshot, or Legacy Backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Case A: Full Workstation Archive
        if (parsed.format === 'mplt_full_workstation_archive' && parsed.operators) {
          for (const op of OPERATOR_LIST) {
            const opData = parsed.operators[op.id];
            if (opData) {
              if (opData.profile) localStorage.setItem(`${STORAGE_KEY}_${op.id}_profile`, JSON.stringify(opData.profile));
              if (opData.habits) localStorage.setItem(`${STORAGE_KEY}_${op.id}_habits`, JSON.stringify(opData.habits));
              if (opData.weeklyTasks) localStorage.setItem(`${STORAGE_KEY}_${op.id}_weeklyTasks`, JSON.stringify(opData.weeklyTasks));
              if (opData.tasks) localStorage.setItem(`${STORAGE_KEY}_${op.id}_tasks`, JSON.stringify(opData.tasks));
              if (opData.goals) localStorage.setItem(`${STORAGE_KEY}_${op.id}_goals`, JSON.stringify(opData.goals));
              if (opData.budget) localStorage.setItem(`${STORAGE_KEY}_${op.id}_budget`, JSON.stringify(opData.budget));
              if (opData.transactions) localStorage.setItem(`${STORAGE_KEY}_${op.id}_transactions`, JSON.stringify(opData.transactions));
              if (opData.customPin) localStorage.setItem(`mplt_pin_${op.id}`, opData.customPin);
            }
          }

          if (parsed.activeOperatorId) {
            localStorage.setItem('mplt_active_operator_id', parsed.activeOperatorId);
            sessionStorage.setItem('mplt_authenticated_operator', parsed.activeOperatorId);
          }

          sound.playLevelUp();
          setRestoreStatus({
            type: 'success',
            message: 'Complete 5-operator workstation archive restored successfully! Reloading...'
          });
          setTimeout(() => window.location.reload(), 1400);
          return;
        }

        // Case B: Operator Snapshot or Legacy Backup
        const targetData = parsed.data || parsed;
        if (targetData.profile || targetData.habits) {
          const targetOp = parsed.operatorId || activeOperatorId;
          
          if (targetData.profile) {
            localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(targetData.profile));
            localStorage.setItem(`${STORAGE_KEY}_${targetOp}_profile`, JSON.stringify(targetData.profile));
          }
          if (targetData.habits) {
            localStorage.setItem(`${STORAGE_KEY}_habits`, JSON.stringify(targetData.habits));
            localStorage.setItem(`${STORAGE_KEY}_${targetOp}_habits`, JSON.stringify(targetData.habits));
          }
          if (targetData.weeklyTasks) {
            localStorage.setItem(`${STORAGE_KEY}_weeklyTasks`, JSON.stringify(targetData.weeklyTasks));
            localStorage.setItem(`${STORAGE_KEY}_${targetOp}_weeklyTasks`, JSON.stringify(targetData.weeklyTasks));
          }
          if (targetData.tasks) {
            localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(targetData.tasks));
            localStorage.setItem(`${STORAGE_KEY}_${targetOp}_tasks`, JSON.stringify(targetData.tasks));
          }
          if (targetData.goals) {
            localStorage.setItem(`${STORAGE_KEY}_goals`, JSON.stringify(targetData.goals));
            localStorage.setItem(`${STORAGE_KEY}_${targetOp}_goals`, JSON.stringify(targetData.goals));
          }
          if (targetData.budget) {
            localStorage.setItem(`${STORAGE_KEY}_budget`, JSON.stringify(targetData.budget));
            localStorage.setItem(`${STORAGE_KEY}_${targetOp}_budget`, JSON.stringify(targetData.budget));
          }
          if (targetData.transactions) {
            localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(targetData.transactions));
            localStorage.setItem(`${STORAGE_KEY}_${targetOp}_transactions`, JSON.stringify(targetData.transactions));
          }

          sound.playLevelUp();
          setRestoreStatus({
            type: 'success',
            message: 'Personal workstation snapshot restored successfully! Reloading...'
          });
          setTimeout(() => window.location.reload(), 1400);
          return;
        }

        throw new Error('Unrecognized backup format. Please select a valid MPLT Zero JSON backup.');
      } catch (err: any) {
        sound.playClick();
        setRestoreStatus({
          type: 'error',
          message: err.message || 'Failed to parse backup JSON file.'
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-[#E2E8F0] rounded-[14px] max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#18181B] text-[#10B981] flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#18181B] font-ui flex items-center gap-2">
                    <span>Data Portability & Backup Center</span>
                    <span className="text-[10px] font-num font-bold px-1.5 py-0.5 rounded bg-[#10B981]/10 text-[#059669]">
                      {activeOpMeta?.label || activeOperatorId}
                    </span>
                  </h3>
                  <p className="text-[11.5px] text-[#71717A] font-ui">
                    Air-gapped local-first storage. Export single operator snapshots or full multi-user archives.
                  </p>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="p-1.5 rounded-md text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Status Alert Banner if Any */}
            {restoreStatus && (
              <div className={`p-3 rounded-lg flex items-center gap-2.5 text-[12px] font-ui ${
                restoreStatus.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {restoreStatus.type === 'success' ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                )}
                <span>{restoreStatus.message}</span>
              </div>
            )}

            {/* Actions Grid */}
            <div className="space-y-3">
              
              {/* Action 1: Export Active Operator Snapshot */}
              <div className="p-3.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[13px] font-bold text-[#18181B] font-ui">
                      Active Operator Snapshot (.JSON)
                    </h4>
                    <span className="text-[9.5px] font-num font-semibold text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.2 rounded">
                      {activeOpMeta?.badge || 'ACTIVE'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717A] mt-0.5">
                    Exports {activeOpMeta?.label || 'current operator'}’s habits, tasks, roadmap, and budget ledger.
                  </p>
                </div>

                <button
                  onClick={handleExportActiveOperator}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#18181B] text-white text-[11.5px] font-bold font-ui hover:bg-[#27272A] active:scale-[0.97] transition-all flex-shrink-0 cursor-pointer"
                >
                  <Download size={13} />
                  <span>Export ({activeOpMeta?.badge})</span>
                </button>
              </div>

              {/* Action 2: Export Full 5-Operator Workstation Archive */}
              <div className="p-3.5 bg-[#F9FAFB] border border-[#CBD5E1] rounded-xl flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[13px] font-bold text-[#18181B] font-ui">
                      Full Workstation Archive (.JSON)
                    </h4>
                    <span className="text-[9.5px] font-num font-semibold text-[#6366F1] bg-[#6366F1]/10 px-1.5 py-0.2 rounded">
                      5 OPERATORS
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717A] mt-0.5">
                    Complete multi-user backup including Dev Mode and all 4 operator partitions + PINs.
                  </p>
                </div>

                <button
                  onClick={handleExportFullArchive}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[11.5px] font-bold font-ui active:scale-[0.97] transition-all flex-shrink-0 cursor-pointer shadow-xs"
                >
                  <Archive size={13} />
                  <span>Full Archive</span>
                </button>
              </div>

              {/* Action 3: Smart Restore */}
              <div className="p-3.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-[13px] font-bold text-[#18181B] font-ui">
                    Smart Restore (.JSON)
                  </h4>
                  <p className="text-[11px] text-[#71717A] mt-0.5">
                    Restores either a single-operator snapshot or full 5-operator archive automatically.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#CBD5E1] hover:border-[#18181B] bg-white text-[#18181B] text-[11.5px] font-bold font-ui active:scale-[0.97] transition-all flex-shrink-0 cursor-pointer"
                >
                  <Upload size={13} />
                  <span>Restore File</span>
                </button>
              </div>

              {/* Action 4: Export Financial CSV */}
              <div className="p-3.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-[13px] font-bold text-[#18181B] font-ui">
                    Financial Transactions (.CSV)
                  </h4>
                  <p className="text-[11px] text-[#71717A] mt-0.5">
                    Tabular cash flow ledger for Google Sheets, Excel, or accounting analysis.
                  </p>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#10B981] hover:bg-[#059669] text-white text-[11.5px] font-bold font-ui active:scale-[0.97] transition-all flex-shrink-0 cursor-pointer"
                >
                  <FileSpreadsheet size={13} />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Action 5: Load Demo Showcase Data */}
              <div className="p-3.5 bg-[#FEF3C7]/40 border border-[#FDE68A] rounded-xl flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-[13px] font-bold text-[#92400E] font-ui flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#D97706]" />
                    <span>Load Demo Showcase Data (Level 14)</span>
                  </h4>
                  <p className="text-[11px] text-[#B45309] mt-0.5">
                    Populates current workstation with realistic active habits, tasks, goals, and transactions.
                  </p>
                </div>

                <button
                  onClick={() => {
                    loadDemoData();
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#D97706] hover:bg-[#B45309] text-white text-[11.5px] font-bold font-ui active:scale-[0.97] transition-all flex-shrink-0 cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>Load Demo</span>
                </button>
              </div>

              {/* Action 6: Reset to Clean Slate */}
              <div className="p-3.5 bg-[#FFF1F2] border border-[#FECDD3] rounded-xl flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-[13px] font-bold text-[#9F1239] font-ui flex items-center gap-1.5">
                    <RotateCcw size={14} className="text-[#E11D48]" />
                    <span>Reset Operator to Clean Slate</span>
                  </h4>
                  <p className="text-[11px] text-[#BE123C] mt-0.5">
                    Wipe current operator data and restart fresh with Level 1 Novice and blank ledger.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to reset ${activeOpMeta?.label || activeOperatorId} back to Level 1 Clean Slate?`)) {
                      resetAllData();
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#E11D48] hover:bg-[#BE123C] text-white text-[11.5px] font-bold font-ui active:scale-[0.97] transition-all flex-shrink-0 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset Slate</span>
                </button>
              </div>

            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#71717A]">
              <span className="font-ui">Partition Key: <code className="font-mono text-[#18181B] bg-[#F1F5F9] px-1.5 py-0.5 rounded text-[10px]">{STORAGE_KEY}_{activeOperatorId}</code></span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-[12px] font-medium border border-[#E2E8F0] rounded-[6px] hover:bg-[#F4F4F5] text-[#18181B] active:scale-[0.97] transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BackupModal;
