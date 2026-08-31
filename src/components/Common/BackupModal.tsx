import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  X, 
  ShieldCheck
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { motion, AnimatePresence } from 'framer-motion';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { 
    profile, 
    habits, 
    weeklyTasks, 
    tasks, 
    goals, 
    budget, 
    transactions 
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Export JSON Backup
  const handleExportJSON = () => {
    sound.playClick();
    const stateData = {
      version: 'MPLT ZERO',
      exportedAt: new Date().toISOString(),
      profile,
      habits,
      weeklyTasks,
      tasks,
      goals,
      budget,
      transactions,
    };

    const blob = new Blob([JSON.stringify(stateData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mplt-zero-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    sound.playPop();
  };

  // 2. Export Financial Ledger CSV
  const handleExportCSV = () => {
    sound.playClick();
    const headers = ['Date', 'Description', 'Bucket', 'Type', 'Amount (IDR)'];
    const rows = transactions.map(t => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.bucket,
      t.type,
      t.amount
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mplt-zero-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    sound.playPop();
  };

  // 3. Import JSON Backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile && parsed.habits) {
          localStorage.setItem('mplt_zero_state_v1_profile', JSON.stringify(parsed.profile));
          localStorage.setItem('mplt_zero_state_v1_habits', JSON.stringify(parsed.habits));
          localStorage.setItem('mplt_zero_state_v1_weeklyTasks', JSON.stringify(parsed.weeklyTasks || []));
          localStorage.setItem('mplt_zero_state_v1_tasks', JSON.stringify(parsed.tasks || []));
          localStorage.setItem('mplt_zero_state_v1_goals', JSON.stringify(parsed.goals || []));
          localStorage.setItem('mplt_zero_state_v1_budget', JSON.stringify(parsed.budget || {}));
          localStorage.setItem('mplt_zero_state_v1_transactions', JSON.stringify(parsed.transactions || []));

          sound.playLevelUp();
          alert('System backup restored successfully! Reloading...');
          window.location.reload();
        } else {
          alert('Invalid backup file format.');
        }
      } catch {
        alert('Failed to parse backup JSON file.');
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
            className="bg-white border border-[#E2E8F0] rounded-[12px] max-w-lg w-full p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#10B981]" />
                <h3 className="text-[16px] font-bold text-[#18181B] font-ui">
                  Data Portability & Backup Center
                </h3>
              </div>

              <button 
                onClick={onClose}
                className="p-1 rounded text-[#71717A] hover:text-[#18181B] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[12px] text-[#71717A] font-ui">
              All your operations state is stored locally with zero cloud telemetry. You can export a snapshot backup file anytime to sync across devices or keep safe.
            </p>

            {/* 3 Action Cards */}
            <div className="space-y-3">
              
              {/* Action 1: Export Full JSON */}
              <div className="p-3.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-[13px] font-bold text-[#18181B] font-ui">
                    Full Operations Backup (.JSON)
                  </h4>
                  <p className="text-[11px] text-[#71717A]">
                    Includes Habits, Weekly Planner, Tasks, Goals, and 50/30/20 Ledger
                  </p>
                </div>

                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#18181B] text-white text-[11.5px] font-bold font-ui hover:bg-[#27272A] active:scale-[0.97] transition-all flex-shrink-0"
                >
                  <Download size={13} />
                  <span>Export JSON</span>
                </button>
              </div>

              {/* Action 2: Import JSON */}
              <div className="p-3.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-[13px] font-bold text-[#18181B] font-ui">
                    Restore Operations Backup
                  </h4>
                  <p className="text-[11px] text-[#71717A]">
                    Upload and restore a previous `.json` backup file
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#CBD5E1] hover:border-[#18181B] bg-white text-[#18181B] text-[11.5px] font-bold font-ui active:scale-[0.97] transition-all flex-shrink-0"
                >
                  <Upload size={13} />
                  <span>Restore File</span>
                </button>
              </div>

              {/* Action 3: Export Financial CSV */}
              <div className="p-3.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px] flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-[13px] font-bold text-[#18181B] font-ui">
                    Financial Transactions (.CSV)
                  </h4>
                  <p className="text-[11px] text-[#71717A]">
                    Export tabular cash flow ledger for Excel or Google Sheets
                  </p>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#10B981] hover:bg-[#059669] text-white text-[11.5px] font-bold font-ui active:scale-[0.97] transition-all flex-shrink-0"
                >
                  <FileSpreadsheet size={13} />
                  <span>Export CSV</span>
                </button>
              </div>

            </div>

            {/* Footer */}
            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-[12px] font-medium border border-[#E2E8F0] rounded-[6px] hover:bg-[#F4F4F5] text-[#18181B] active:scale-[0.97] transition-all"
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
