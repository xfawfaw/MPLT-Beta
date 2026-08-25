import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  DollarSign,
  Wallet,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { BudgetConfig } from '../../types';

export const MoneyTrackerView: React.FC = () => {
  const { budget, setBudgetConfig, transactions, addTransaction, deleteTransaction } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [txDate, setTxDate] = useState('2026-02-27');
  const [txDesc, setTxDesc] = useState('');
  const [txBucket, setTxBucket] = useState<'Needs' | 'Wants' | 'Savings'>('Needs');
  const [txAmount, setTxAmount] = useState<number>(250000);
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');

  // Currency format helper
  const formatIDR = (num: number) => {
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  // Calculations
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) || budget.incomeGoal;
  const needsSpent = transactions.filter(t => t.type === 'expense' && t.bucket === 'Needs').reduce((acc, t) => acc + t.amount, 0);
  const wantsSpent = transactions.filter(t => t.type === 'expense' && t.bucket === 'Wants').reduce((acc, t) => acc + t.amount, 0);
  const savingsActual = transactions.filter(t => t.type === 'expense' && t.bucket === 'Savings').reduce((acc, t) => acc + t.amount, 0);
  
  const totalSpent = needsSpent + wantsSpent;
  const netCashFlow = totalIncome - totalSpent;

  // Limits based on dynamic user ratio
  const needsLimit = totalIncome * (budget.needsRatio / 100);
  const wantsLimit = totalIncome * (budget.wantsRatio / 100);
  const savingsGoal = totalIncome * (budget.savingsRatio / 100);

  const isNeedsUnder = needsSpent <= needsLimit;
  const isWantsUnder = wantsSpent <= wantsLimit;
  const isSavingsMet = savingsActual >= savingsGoal;

  // Preset switchers
  const handlePresetSelect = (preset: BudgetConfig['mode']) => {
    if (preset === '50/30/20') {
      setBudgetConfig(prev => ({ ...prev, mode: '50/30/20', needsRatio: 50, wantsRatio: 30, savingsRatio: 20 }));
    } else if (preset === '60/20/20') {
      setBudgetConfig(prev => ({ ...prev, mode: '60/20/20', needsRatio: 60, wantsRatio: 20, savingsRatio: 20 }));
    } else if (preset === '80/20') {
      setBudgetConfig(prev => ({ ...prev, mode: '80/20', needsRatio: 80, wantsRatio: 0, savingsRatio: 20 }));
    } else {
      setBudgetConfig(prev => ({ ...prev, mode: 'custom' }));
    }
  };

  const handleCustomNeedsChange = (val: number) => {
    const remaining = 100 - val;
    const newWants = Math.min(budget.wantsRatio, remaining);
    const newSavings = Math.max(0, remaining - newWants);
    setBudgetConfig(prev => ({
      ...prev,
      mode: 'custom',
      needsRatio: val,
      wantsRatio: newWants,
      savingsRatio: newSavings,
    }));
  };

  const handleCustomWantsChange = (val: number) => {
    const remaining = 100 - budget.needsRatio;
    const newWants = Math.min(val, remaining);
    const newSavings = Math.max(0, remaining - newWants);
    setBudgetConfig(prev => ({
      ...prev,
      mode: 'custom',
      wantsRatio: newWants,
      savingsRatio: newSavings,
    }));
  };

  const handleAddTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc.trim() || txAmount <= 0) return;

    addTransaction({
      date: txDate,
      description: txDesc.trim(),
      bucket: txBucket,
      amount: Number(txAmount),
      type: txType,
    });

    setTxDesc('');
    setShowAddModal(false);
  };

  // Donut chart calculations
  const totalExpenseAndSavings = needsSpent + wantsSpent + savingsActual || 1;
  const needsDonutPct = needsSpent / totalExpenseAndSavings;
  const wantsDonutPct = wantsSpent / totalExpenseAndSavings;
  const savingsDonutPct = savingsActual / totalExpenseAndSavings;

  return (
    <div className="max-w-[1440px] mx-auto p-6 space-y-6">
      
      {/* ========================================================
          TOP GRID: 3 EQUAL SUMMARY METRIC CARDS
          ======================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1: Income Goal */}
        <div className="mplt-card p-5 bg-[#FFFFFF] border border-[#E2E8F0] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71717A] text-[11px] font-ui uppercase tracking-wider mb-2">
            <span>Income Goal</span>
            <span className="p-1 rounded bg-[#F1F5F9] text-[#18181B]">
              <DollarSign size={13} />
            </span>
          </div>
          <div className="text-[22px] font-bold text-[#18181B] font-num tracking-tight">
            {formatIDR(budget.incomeGoal)}
          </div>
          <div className="mt-2 text-[11px] text-[#71717A] font-ui flex items-center gap-1.5">
            <span className="text-[#10B981] font-semibold font-num">100%</span>
            <span>Monthly target benchmark</span>
          </div>
        </div>

        {/* Metric 2: Current Balance */}
        <div className="mplt-card p-5 bg-[#FFFFFF] border border-[#E2E8F0] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71717A] text-[11px] font-ui uppercase tracking-wider mb-2">
            <span>Current Balance</span>
            <span className="p-1 rounded bg-[#F1F5F9] text-[#18181B]">
              <Wallet size={13} />
            </span>
          </div>
          <div className="text-[22px] font-bold text-[#18181B] font-num tracking-tight">
            {formatIDR(budget.startBalance)}
          </div>
          <div className="mt-2 text-[11px] text-[#71717A] font-ui flex items-center gap-1.5">
            <span className="text-[#10B981] font-semibold font-num">Liquid</span>
            <span>Checking & Operational accounts</span>
          </div>
        </div>

        {/* Metric 3: Net Cash Flow */}
        <div className="mplt-card p-5 bg-[#FFFFFF] border border-[#E2E8F0] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71717A] text-[11px] font-ui uppercase tracking-wider mb-2">
            <span>Net Cash Flow</span>
            <span className="p-1 rounded bg-[#10B981]/15 text-[#10B981]">
              <TrendingUp size={13} />
            </span>
          </div>
          <div className="text-[22px] font-bold text-[#10B981] font-num tracking-tight">
            +{formatIDR(netCashFlow)}
          </div>
          <div className="mt-2 text-[11px] text-[#71717A] font-ui flex items-center gap-1.5">
            <span className="text-[#10B981] font-semibold font-num">Positive</span>
            <span>Surplus available for allocation</span>
          </div>
        </div>

      </section>

      {/* ========================================================
          MIDDLE SECTION: BUDGET ALLOCATION & CUSTOM RATIO CONFIG
          ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Panel (Span 6): Segmented Control & Progress Sliders */}
        <div className="lg:col-span-6 mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0] space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-[14px] font-bold text-[#18181B] font-ui">
                Budget Allocation Configurator
              </h3>
              <p className="text-[11px] text-[#71717A]">
                Dynamic ratios recalculate thresholds and expense caps
              </p>
            </div>

            {/* Segmented Control Toggle */}
            <div className="flex items-center bg-[#F1F5F9] p-1 rounded-[6px] text-[11px] font-ui font-medium">
              {(['50/30/20', '60/20/20', '80/20', 'custom'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetSelect(preset)}
                  className={`px-2.5 py-1 rounded-[4px] transition-all capitalize ${
                    budget.mode === preset
                      ? 'bg-[#18181B] text-white font-bold'
                      : 'text-[#71717A] hover:text-[#18181B]'
                  }`}
                >
                  {preset === 'custom' ? 'Custom' : `${preset}`}
                </button>
              ))}
            </div>
          </div>

          {/* Three Horizontal Progress Slider Bars */}
          <div className="space-y-4">
            
            {/* Needs Bar */}
            <div className="p-3.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#18181B]" />
                  <span className="font-ui font-bold text-[13px] text-[#18181B]">
                    Needs ({budget.needsRatio}%)
                  </span>
                </div>

                <span className={`text-[10px] font-num font-bold px-2 py-0.5 rounded ${
                  isNeedsUnder 
                    ? 'text-[#10B981] bg-[#10B981]/15' 
                    : 'text-[#E11D48] bg-rose-50 border border-rose-200'
                }`}>
                  {isNeedsUnder ? 'UNDER BUDGET' : 'OVER BUDGET'}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-[#71717A] font-num mb-1.5">
                <span>Spent: {formatIDR(needsSpent)}</span>
                <span>Cap: {formatIDR(needsLimit)}</span>
              </div>

              <div className="w-full bg-[#E2E8F0] h-[8px] rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isNeedsUnder ? 'bg-[#18181B]' : 'bg-[#E11D48]'
                  }`}
                  style={{ width: `${Math.min(100, (needsSpent / (needsLimit || 1)) * 100)}%` }}
                />
              </div>

              {budget.mode === 'custom' && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#E2E8F0]">
                  <span className="text-[10px] font-ui text-[#71717A]">Adjust Needs %:</span>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={budget.needsRatio}
                    onChange={(e) => handleCustomNeedsChange(Number(e.target.value))}
                    className="w-full h-1 bg-[#E2E8F0] rounded cursor-pointer accent-[#18181B]"
                  />
                  <span className="text-[11px] font-num font-bold">{budget.needsRatio}%</span>
                </div>
              )}
            </div>

            {/* Wants Bar */}
            <div className="p-3.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#71717A]" />
                  <span className="font-ui font-bold text-[13px] text-[#18181B]">
                    Wants ({budget.wantsRatio}%)
                  </span>
                </div>

                <span className={`text-[10px] font-num font-bold px-2 py-0.5 rounded ${
                  isWantsUnder 
                    ? 'text-[#10B981] bg-[#10B981]/15' 
                    : 'text-[#E11D48] bg-rose-50 border border-rose-200'
                }`}>
                  {isWantsUnder ? 'UNDER BUDGET' : 'OVER BUDGET'}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-[#71717A] font-num mb-1.5">
                <span>Spent: {formatIDR(wantsSpent)}</span>
                <span>Cap: {formatIDR(wantsLimit)}</span>
              </div>

              <div className="w-full bg-[#E2E8F0] h-[8px] rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isWantsUnder ? 'bg-[#71717A]' : 'bg-[#E11D48]'
                  }`}
                  style={{ width: `${Math.min(100, (wantsSpent / (wantsLimit || 1)) * 100)}%` }}
                />
              </div>

              {budget.mode === 'custom' && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#E2E8F0]">
                  <span className="text-[10px] font-ui text-[#71717A]">Adjust Wants %:</span>
                  <input
                    type="range"
                    min="0"
                    max={100 - budget.needsRatio}
                    value={budget.wantsRatio}
                    onChange={(e) => handleCustomWantsChange(Number(e.target.value))}
                    className="w-full h-1 bg-[#E2E8F0] rounded cursor-pointer accent-[#18181B]"
                  />
                  <span className="text-[11px] font-num font-bold">{budget.wantsRatio}%</span>
                </div>
              )}
            </div>

            {/* Savings Bar */}
            <div className="p-3.5 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#10B981]" />
                  <span className="font-ui font-bold text-[13px] text-[#18181B]">
                    Savings & Investments ({budget.savingsRatio}%)
                  </span>
                </div>

                <span className={`text-[10px] font-num font-bold px-2 py-0.5 rounded ${
                  isSavingsMet 
                    ? 'text-[#10B981] bg-[#10B981]/15' 
                    : 'text-[#71717A] bg-[#F1F5F9]'
                }`}>
                  {isSavingsMet ? 'GOAL MET' : 'SAVINGS IN PROGRESS'}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-[#71717A] font-num mb-1.5">
                <span>Funded: {formatIDR(savingsActual)}</span>
                <span>Target: {formatIDR(savingsGoal)}</span>
              </div>

              <div className="w-full bg-[#E2E8F0] h-[8px] rounded-full overflow-hidden">
                <div
                  className="bg-[#10B981] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (savingsActual / (savingsGoal || 1)) * 100)}%` }}
                />
              </div>
            </div>

          </div>

        </div>

        {/* Right Panel (Span 6): Donut Chart Breakdown */}
        <div className="lg:col-span-6 mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0] flex flex-col justify-between">
          
          <div className="pb-3 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-bold text-[#18181B] font-ui">
                Expense & Allocation Distribution
              </h3>
              <p className="text-[11px] text-[#71717A]">
                Actual real-world capital utilization
              </p>
            </div>
            <span className="text-[11px] font-num font-bold text-[#18181B] bg-[#F1F5F9] px-2 py-0.5 rounded">
              3-Bucket Matrix
            </span>
          </div>

          {/* Donut Chart with central label */}
          <div className="flex items-center justify-center my-6 relative">
            <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
              {(() => {
                const radius = 68;
                const circumference = 2 * Math.PI * radius;
                
                const slices = [
                  { pct: needsDonutPct, color: '#18181B' },
                  { pct: wantsDonutPct, color: '#71717A' },
                  { pct: savingsDonutPct, color: '#10B981' },
                ];

                let accumulated = 0;
                return slices.map((s, idx) => {
                  const strokeDasharray = `${s.pct * circumference} ${circumference}`;
                  const strokeDashoffset = -accumulated * circumference;
                  accumulated += s.pct;

                  return (
                    <circle
                      key={idx}
                      cx="90"
                      cy="90"
                      r={radius}
                      fill="transparent"
                      stroke={s.color}
                      strokeWidth="18"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300"
                    />
                  );
                });
              })()}
            </svg>

            {/* Central Metric Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] uppercase font-ui tracking-wider text-[#71717A]">
                Total Spent
              </span>
              <span className="text-[15px] font-bold font-num text-[#18181B]">
                {formatIDR(totalSpent)}
              </span>
              <span className="text-[9.5px] font-num text-[#10B981] mt-0.5">
                +{formatIDR(netCashFlow)} Net
              </span>
            </div>
          </div>

          {/* Slices Legend Table */}
          <div className="grid grid-cols-3 gap-2 text-[11px] pt-3 border-t border-[#E2E8F0]">
            <div className="p-2 bg-[#F9FAFB] rounded border border-[#E2E8F0] text-center">
              <span className="font-ui text-[#71717A] text-[10px] block">Needs (Actual)</span>
              <span className="font-num font-bold text-[#18181B] block">{formatIDR(needsSpent)}</span>
            </div>
            <div className="p-2 bg-[#F9FAFB] rounded border border-[#E2E8F0] text-center">
              <span className="font-ui text-[#71717A] text-[10px] block">Wants (Actual)</span>
              <span className="font-num font-bold text-[#71717A] block">{formatIDR(wantsSpent)}</span>
            </div>
            <div className="p-2 bg-[#F9FAFB] rounded border border-[#E2E8F0] text-center">
              <span className="font-ui text-[#71717A] text-[10px] block">Savings (Actual)</span>
              <span className="font-num font-bold text-[#10B981] block">{formatIDR(savingsActual)}</span>
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================
          BOTTOM SECTION: TRANSACTION LEDGER TABLE
          ======================================================== */}
      <section className="mplt-card bg-[#FFFFFF] border border-[#E2E8F0] overflow-hidden">
        
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F9FAFB] flex items-center justify-between">
          <div>
            <h3 className="text-[13px] font-bold text-[#18181B] font-ui uppercase tracking-wider">
              Transaction Ledger Table
            </h3>
            <span className="text-[11px] text-[#71717A]">
              1px solid dividers, zero zebra striping, instant cash-flow sync
            </span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#18181B] text-white hover:bg-[#27272A] text-[12px] font-bold transition-all"
          >
            <Plus size={14} />
            <span>Add Transaction</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="bg-[#FFFFFF] border-b border-[#E2E8F0] font-ui text-[10.5px] uppercase tracking-wider text-[#71717A]">
                <th className="p-3">Date</th>
                <th className="p-3">Description</th>
                <th className="p-3">Budget Bucket</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 w-10 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {transactions.map((tx) => {
                const isIncome = tx.type === 'income';

                return (
                  <tr key={tx.id} className="hover:bg-[#F9FAFB] transition-colors group">
                    <td className="p-3 font-num text-[#71717A]">
                      {tx.date}
                    </td>

                    <td className="p-3 font-ui font-medium text-[#18181B]">
                      {tx.description}
                    </td>

                    <td className="p-3">
                      <span className={`font-ui text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${
                        tx.bucket === 'Needs'
                          ? 'bg-[#18181B] text-white'
                          : tx.bucket === 'Wants'
                          ? 'bg-[#71717A] text-white'
                          : 'bg-[#10B981] text-white'
                      }`}>
                        {tx.bucket}
                      </span>
                    </td>

                    <td className="p-3 font-ui">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        isIncome ? 'text-[#10B981]' : 'text-[#71717A]'
                      }`}>
                        {isIncome ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                        <span className="capitalize">{tx.type}</span>
                      </span>
                    </td>

                    <td className="p-3 text-right font-num font-bold">
                      <span className={isIncome ? 'text-[#10B981]' : 'text-[#18181B]'}>
                        {isIncome ? '+' : '-'}{formatIDR(tx.amount)}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1 rounded text-[#A1A1AA] hover:text-[#E11D48] hover:bg-rose-50 transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#71717A] font-ui text-[12px]">
                    No transactions recorded. Click "Add Transaction" above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </section>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] max-w-md w-full p-6 shadow-xl animate-in zoom-in-95">
            <h3 className="text-[16px] font-bold text-[#18181B] font-ui mb-4">
              Record New Cash Flow Transaction
            </h3>

            <form onSubmit={handleAddTxSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                  Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Grocery Shopping, Freelance Payout, Dining"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                    Type
                  </label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as 'expense' | 'income')}
                    className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B] bg-white"
                  >
                    <option value="expense">Expense (Outflow)</option>
                    <option value="income">Income (Inflow)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                    Budget Bucket
                  </label>
                  <select
                    value={txBucket}
                    onChange={(e) => setTxBucket(e.target.value as 'Needs' | 'Wants' | 'Savings')}
                    className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B] bg-white"
                  >
                    <option value="Needs">Needs ({budget.needsRatio}%)</option>
                    <option value="Wants">Wants ({budget.wantsRatio}%)</option>
                    <option value="Savings">Savings ({budget.savingsRatio}%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                    Amount (IDR)
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B] font-num"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B] font-num"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[12px] font-medium border border-[#E2E8F0] rounded-[6px] hover:bg-[#F4F4F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-[12px] font-bold bg-[#18181B] text-white rounded-[6px] hover:bg-[#27272A]"
                >
                  Record Transaction (+15 EXP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
