import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Check, 
  Plus, 
  Trash2, 
  Search, 
  LayoutGrid, 
  Table as TableIcon, 
  Columns, 
  Clock, 
  AlertCircle, 
  Tag,
  Calendar,
  Sparkles
} from 'lucide-react';
import { TaskItem, AreaOfLife } from '../../types';

export const TaskManagerView: React.FC = () => {
  const { tasks, toggleTaskStatus, addTask, deleteTask } = useApp();

  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'matrix'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<AreaOfLife>('Work');
  const [newPriority, setNewPriority] = useState<TaskItem['priority']>('High');
  const [newDueDate, setNewDueDate] = useState('2026-02-28');
  const [newNote, setNewNote] = useState('');

  // Calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const notStartedTasks = tasks.filter(t => t.status === 'Not Started').length;
  const dueTodayTasks = tasks.filter(t => t.dueDate === '2026-02-26').length;
  const overdueTasks = tasks.filter(t => t.dueDate < '2026-02-26' && t.status !== 'Completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalAvailableExp = tasks.reduce((acc, t) => acc + t.expReward, 0);

  // Filtered tasks list
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (task.note && task.note.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || 
                            (filterStatus === 'completed' && task.status === 'Completed') ||
                            (filterStatus === 'pending' && task.status !== 'Completed') ||
                            (filterStatus === 'today' && task.dueDate === '2026-02-26') ||
                            (filterStatus === 'overdue' && task.dueDate < '2026-02-26' && task.status !== 'Completed');
      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    });
  }, [tasks, searchQuery, filterCategory, filterPriority, filterStatus]);

  // Categories metrics
  const categories: AreaOfLife[] = ['Health', 'Work', 'Money', 'Family', 'Personal Growth', 'Spirituality'];
  const categoryMetrics = useMemo(() => {
    return categories.map(cat => {
      const catTasks = tasks.filter(t => t.category === cat);
      const done = catTasks.filter(t => t.status === 'Completed').length;
      const pct = catTasks.length > 0 ? Math.round((done / catTasks.length) * 100) : 0;
      return {
        name: cat,
        count: catTasks.length,
        completed: done,
        pct,
      };
    });
  }, [tasks]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      dueDate: newDueDate,
      status: 'Not Started',
      expReward: newPriority === 'High' ? 40 : newPriority === 'Med' ? 30 : 20,
      note: newNote.trim() || undefined,
    });

    setNewTitle('');
    setNewNote('');
    setShowAddModal(false);
  };

  const getDaysLeft = (dueDate: string, isCompleted: boolean) => {
    if (isCompleted) return { text: 'Resolved', color: 'text-[#10B981] bg-[#10B981]/10' };
    const today = '2026-02-26';
    if (dueDate === today) return { text: 'Due today', color: 'text-amber-700 bg-amber-50 border border-amber-200' };
    if (dueDate < today) return { text: 'Overdue 13 days', color: 'text-[#E11D48] bg-rose-50 border border-rose-200' };
    if (dueDate === '2026-02-28') return { text: '2 days left', color: 'text-[#18181B] bg-[#F1F5F9]' };
    if (dueDate === '2026-03-15') return { text: '17 days left', color: 'text-[#71717A] bg-[#F9FAFB]' };
    return { text: '51 days left', color: 'text-[#71717A] bg-[#F9FAFB]' };
  };

  // Kanban groups
  const kanbanColumns = [
    { id: 'Not Started', label: 'To Do / Backlog', tasks: tasks.filter(t => t.status === 'Not Started') },
    { id: 'In Progress', label: 'In Execution', tasks: tasks.filter(t => t.status === 'In Progress') },
    { id: 'Completed', label: 'Completed', tasks: tasks.filter(t => t.status === 'Completed') },
  ];

  return (
    <div className="max-w-[1440px] mx-auto p-6 space-y-6">
      
      {/* ========================================================
          TOP SECTION: STRATEGIC TASK TELEMETRY & VIEW SWITCHER
          ======================================================== */}
      <section className="mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0] space-y-5">
        
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#18181B]" />
              <h1 className="text-[24px] font-bold text-[#18181B] font-ui tracking-tight">
                TASK OPERATIONS & WORKLOAD MANAGER
              </h1>
            </div>
            
            <div className="flex items-center gap-4 text-[12px] flex-wrap mt-1">
              <span className="text-[#71717A] font-ui">
                Active Sprint Period: <strong className="text-[#18181B] font-num">February 2026</strong>
              </span>
              <span className="text-[#E2E8F0]">•</span>
              <span className="text-[#10B981] font-semibold font-ui flex items-center gap-1">
                <Sparkles size={12} />
                <span>EXP Reservoir: +{totalAvailableExp} EXP Total</span>
              </span>
            </div>
          </div>

          {/* Right Action & Multi-View Switcher */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center bg-[#F1F5F9] p-1 rounded-[6px] text-[11px] font-ui font-medium">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] transition-all ${
                  viewMode === 'table' ? 'bg-[#18181B] text-white shadow-sm font-bold' : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                <TableIcon size={13} />
                <span>Table Ledger</span>
              </button>

              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] transition-all ${
                  viewMode === 'kanban' ? 'bg-[#18181B] text-white shadow-sm font-bold' : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                <Columns size={13} />
                <span>Kanban Board</span>
              </button>

              <button
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] transition-all ${
                  viewMode === 'matrix' ? 'bg-[#18181B] text-white shadow-sm font-bold' : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                <LayoutGrid size={13} />
                <span>Priority Matrix</span>
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#18181B] text-white hover:bg-[#27272A] text-[12px] font-bold transition-all whitespace-nowrap shadow-none"
            >
              <Plus size={14} />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* 5 Strategic KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-[11px]">
          
          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <span className="text-[10.5px] font-ui text-[#71717A] uppercase tracking-wider block">
              Today Focus
            </span>
            <div className="text-[20px] font-num font-bold text-[#18181B] mt-0.5 flex items-baseline gap-1.5">
              <span>{dueTodayTasks}</span>
              <span className="text-[11px] font-normal text-[#71717A]">due today</span>
            </div>
            <span className="text-[10px] text-[#71717A] font-ui mt-0.5 block">High urgency items</span>
          </div>

          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <span className="text-[10.5px] font-ui text-[#71717A] uppercase tracking-wider block">
              In Execution
            </span>
            <div className="text-[20px] font-num font-bold text-[#18181B] mt-0.5 flex items-baseline gap-1.5">
              <span>{inProgressTasks}</span>
              <span className="text-[11px] font-normal text-[#71717A]">in progress</span>
            </div>
            <span className="text-[10px] text-[#71717A] font-ui mt-0.5 block">Active work streams</span>
          </div>

          <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-[8px]">
            <span className="text-[10.5px] font-ui text-[#E11D48] uppercase tracking-wider block font-semibold">
              Overdue Alert
            </span>
            <div className="text-[20px] font-num font-bold text-[#E11D48] mt-0.5 flex items-baseline gap-1.5">
              <span>{overdueTasks}</span>
              <span className="text-[11px] font-normal text-[#E11D48]">critical</span>
            </div>
            <span className="text-[10px] text-[#E11D48] font-ui mt-0.5 block">Requires immediate sync</span>
          </div>

          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <span className="text-[10.5px] font-ui text-[#71717A] uppercase tracking-wider block">
              Remaining Backlog
            </span>
            <div className="text-[20px] font-num font-bold text-[#71717A] mt-0.5 flex items-baseline gap-1.5">
              <span>{notStartedTasks}</span>
              <span className="text-[11px] font-normal text-[#71717A]">unstarted</span>
            </div>
            <span className="text-[10px] text-[#71717A] font-ui mt-0.5 block">Queued for execution</span>
          </div>

          <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-[8px]">
            <span className="text-[10.5px] font-ui text-[#10B981] uppercase tracking-wider block font-semibold">
              Resolution Rate
            </span>
            <div className="text-[20px] font-num font-bold text-[#10B981] mt-0.5 flex items-baseline gap-1.5">
              <span>{completionRate}%</span>
              <span className="text-[11px] font-normal text-[#10B981]">({completedTasks}/{totalTasks})</span>
            </div>
            <span className="text-[10px] text-[#10B981] font-ui mt-0.5 block">Optimistic pace target</span>
          </div>

        </div>

      </section>

      {/* ========================================================
          DOMAIN CATEGORIES OVERVIEW BAR
          ======================================================== */}
      <section className="mplt-card p-4 bg-[#FFFFFF] border border-[#E2E8F0]">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#E2E8F0]">
          <span className="text-[11px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-1.5">
            <Tag size={13} />
            Domain Category Distribution & Workload Allocation
          </span>
          <span className="text-[10px] text-[#71717A] font-ui">
            Click domain chip to filter view
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {categoryMetrics.map((cat) => {
            const isSelected = filterCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setFilterCategory(isSelected ? 'all' : cat.name)}
                className={`p-2.5 rounded-[6px] border text-left transition-all ${
                  isSelected 
                    ? 'bg-[#18181B] text-white border-[#18181B] shadow-sm' 
                    : 'bg-[#F9FAFB] border-[#E2E8F0] hover:border-[#CBD5E1] text-[#18181B]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-ui font-bold truncate">{cat.name}</span>
                  <span className={`font-num text-[10px] px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#FFFFFF] border border-[#E2E8F0] text-[#71717A]'
                  }`}>
                    {cat.completed}/{cat.count}
                  </span>
                </div>

                <div className="w-full bg-[#E2E8F0]/80 h-[4px] rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isSelected ? 'bg-[#10B981]' : 'bg-[#18181B]'
                    }`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          VIEW 1: TABLE VIEW (SPREADSHEET PRECISION)
          ======================================================== */}
      {viewMode === 'table' && (
        <section className="mplt-card bg-[#FFFFFF] border border-[#E2E8F0] overflow-hidden">
          
          {/* Table Filters Bar */}
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F9FAFB] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-sm bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-[6px]">
              <Search size={14} className="text-[#71717A]" />
              <input
                type="text"
                placeholder="Filter by title, tags, or context..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-[12px] bg-transparent focus:outline-none font-ui"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter Chips */}
              <div className="flex items-center gap-1 bg-white border border-[#E2E8F0] p-0.5 rounded-[6px]">
                {(['all', 'pending', 'completed', 'today', 'overdue'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium font-ui transition-colors capitalize ${
                      filterStatus === s ? 'bg-[#18181B] text-white font-bold' : 'text-[#71717A] hover:text-[#18181B]'
                    }`}
                  >
                    {s === 'all' ? 'All Tasks' : s}
                  </button>
                ))}
              </div>

              {/* Priority Filter */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-2.5 py-1.5 border border-[#E2E8F0] rounded-[6px] text-[11px] bg-white font-ui text-[#18181B]"
              >
                <option value="all">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Med">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="bg-[#FFFFFF] border-b border-[#E2E8F0] font-ui text-[10.5px] uppercase tracking-wider text-[#71717A]">
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Tasks</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Day Left</th>
                  <th className="p-3">EXP Yield</th>
                  <th className="p-3">Notes & Context</th>
                  <th className="p-3 w-10 text-center">Act</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredTasks.map((t) => {
                  const isDone = t.status === 'Completed';
                  const daysLeftInfo = getDaysLeft(t.dueDate, isDone);

                  return (
                    <tr key={t.id} className="hover:bg-[#F9FAFB] transition-colors group">
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleTaskStatus(t.id)}
                          className={`w-4 h-4 rounded-[3px] border flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-[#18181B] border-[#18181B] text-white'
                              : 'bg-white border-[#18181B] hover:border-black'
                          }`}
                        >
                          {isDone && <Check size={11} className="stroke-[3]" />}
                        </button>
                      </td>

                      <td className="p-3">
                        <span className={`font-ui font-medium ${isDone ? 'line-through text-[#71717A]' : 'text-[#18181B]'}`}>
                          {t.title}
                        </span>
                      </td>

                      <td className="p-3 font-num text-[#71717A]">
                        {t.dueDate}
                      </td>

                      <td className="p-3">
                        <span className={`font-num text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          t.priority === 'High'
                            ? 'bg-rose-50 text-[#E11D48] border border-rose-200'
                            : t.priority === 'Med'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-[#F1F5F9] text-[#71717A]'
                        }`}>
                          {t.priority}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className={`font-ui text-[10.5px] px-2.5 py-0.5 rounded-full font-medium ${
                          isDone
                            ? 'bg-[#10B981]/15 text-[#10B981]'
                            : t.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-[#F1F5F9] text-[#71717A]'
                        }`}>
                          {t.status}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="font-ui text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#F1F5F9] text-[#71717A]">
                          {t.category}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className={`font-num text-[10px] px-2 py-0.5 rounded font-semibold ${daysLeftInfo.color}`}>
                          {daysLeftInfo.text}
                        </span>
                      </td>

                      <td className="p-3 font-num font-bold text-[#10B981]">
                        +{t.expReward} EXP
                      </td>

                      <td className="p-3 font-ui text-[#71717A] text-[11px] truncate max-w-[160px]">
                        {t.note || '—'}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => deleteTask(t.id)}
                          className="p-1 rounded text-[#A1A1AA] hover:text-[#E11D48] hover:bg-rose-50 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-10 text-center text-[#71717A] font-ui text-[12px]">
                      No matching tasks found. Adjust search filter or create a new task.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ========================================================
          VIEW 2: KANBAN BOARD VIEW
          ======================================================== */}
      {viewMode === 'kanban' && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {kanbanColumns.map((col) => {
            return (
              <div key={col.id} className="mplt-card bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] overflow-hidden flex flex-col min-h-[500px]">
                
                {/* Column Header */}
                <div className="p-3.5 bg-[#F9FAFB] border-b border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      col.id === 'Completed' ? 'bg-[#10B981]' : col.id === 'In Progress' ? 'bg-blue-600' : 'bg-[#18181B]'
                    }`} />
                    <h3 className="text-[13px] font-bold text-[#18181B] font-ui uppercase tracking-wider">
                      {col.label}
                    </h3>
                  </div>

                  <span className="font-num text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#71717A]">
                    {col.tasks.length}
                  </span>
                </div>

                {/* Column Card Stack */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[550px]">
                  {col.tasks.map((task) => {
                    const isDone = task.status === 'Completed';

                    return (
                      <div
                        key={task.id}
                        onClick={() => toggleTaskStatus(task.id)}
                        className="group p-3.5 bg-white border border-[#E2E8F0] hover:border-[#18181B] rounded-[8px] transition-all cursor-pointer select-none space-y-2.5 shadow-none"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-[13px] font-ui font-medium leading-snug ${
                            isDone ? 'line-through text-[#71717A]' : 'text-[#18181B]'
                          }`}>
                            {task.title}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-[#A1A1AA] hover:text-[#E11D48] p-0.5 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {task.note && (
                          <p className="text-[11px] text-[#71717A] font-ui line-clamp-2">
                            {task.note}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9] text-[10.5px]">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-num font-bold px-1.5 py-0.2 rounded uppercase ${
                              task.priority === 'High' ? 'bg-rose-50 text-[#E11D48]' : 'bg-[#F1F5F9] text-[#71717A]'
                            }`}>
                              {task.priority}
                            </span>
                            <span className="font-ui px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#71717A]">
                              {task.category}
                            </span>
                          </div>

                          <span className="font-num font-bold text-[#10B981]">
                            +{task.expReward}xp
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {col.tasks.length === 0 && (
                    <div className="py-12 text-center text-[#A1A1AA] text-[12px] font-ui">
                      No tasks in this lane
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </section>
      )}

      {/* ========================================================
          VIEW 3: EISENHOWER STRATEGIC MATRIX (PRIORITY QUADRANTS)
          ======================================================== */}
      {viewMode === 'matrix' && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Quadrant 1: Urgent & Important */}
          <div className="mplt-card p-5 bg-[#FFFFFF] border-2 border-rose-200 rounded-[10px] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-rose-100">
              <span className="text-[12px] font-bold text-[#E11D48] font-ui uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={14} />
                Quadrant 1: Urgent & Critical (High Priority)
              </span>
              <span className="font-num text-[11px] font-bold text-[#E11D48] bg-rose-50 px-2 py-0.5 rounded">
                {tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length} Pending
              </span>
            </div>

            <div className="space-y-2">
              {tasks.filter(t => t.priority === 'High').map(t => (
                <div
                  key={t.id}
                  onClick={() => toggleTaskStatus(t.id)}
                  className={`p-2.5 rounded-[6px] border flex items-center justify-between cursor-pointer ${
                    t.status === 'Completed' ? 'bg-[#F9FAFB] border-[#E2E8F0] line-through text-[#71717A]' : 'bg-white border-rose-100 hover:border-rose-300'
                  }`}
                >
                  <span className="font-ui text-[12.5px] font-medium">{t.title}</span>
                  <span className="font-num text-[10px] text-[#10B981] font-bold">+{t.expReward} EXP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quadrant 2: Strategic & Important (Med Priority) */}
          <div className="mplt-card p-5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <span className="text-[12px] font-bold text-[#18181B] font-ui uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} />
                Quadrant 2: Strategic & Growth (Med Priority)
              </span>
              <span className="font-num text-[11px] font-bold text-[#18181B] bg-[#F1F5F9] px-2 py-0.5 rounded">
                {tasks.filter(t => t.priority === 'Med' && t.status !== 'Completed').length} Pending
              </span>
            </div>

            <div className="space-y-2">
              {tasks.filter(t => t.priority === 'Med').map(t => (
                <div
                  key={t.id}
                  onClick={() => toggleTaskStatus(t.id)}
                  className={`p-2.5 rounded-[6px] border flex items-center justify-between cursor-pointer ${
                    t.status === 'Completed' ? 'bg-[#F9FAFB] border-[#E2E8F0] line-through text-[#71717A]' : 'bg-white border-[#E2E8F0] hover:border-[#18181B]'
                  }`}
                >
                  <span className="font-ui text-[12.5px] font-medium">{t.title}</span>
                  <span className="font-num text-[10px] text-[#10B981] font-bold">+{t.expReward} EXP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quadrant 3: Quick Wins / Low Priority */}
          <div className="mplt-card p-5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] space-y-3 md:col-span-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <span className="text-[12px] font-bold text-[#71717A] font-ui uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} />
                Quadrant 3: Quick Maintenance & Low Priority Work
              </span>
              <span className="font-num text-[11px] font-bold text-[#71717A] bg-[#F1F5F9] px-2 py-0.5 rounded">
                {tasks.filter(t => t.priority === 'Low' && t.status !== 'Completed').length} Pending
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tasks.filter(t => t.priority === 'Low').map(t => (
                <div
                  key={t.id}
                  onClick={() => toggleTaskStatus(t.id)}
                  className={`p-2.5 rounded-[6px] border flex items-center justify-between cursor-pointer ${
                    t.status === 'Completed' ? 'bg-[#F9FAFB] border-[#E2E8F0] line-through text-[#71717A]' : 'bg-white border-[#E2E8F0] hover:border-[#18181B]'
                  }`}
                >
                  <span className="font-ui text-[12.5px] font-medium">{t.title}</span>
                  <span className="font-num text-[10px] text-[#10B981] font-bold">+{t.expReward} EXP</span>
                </div>
              ))}
            </div>
          </div>

        </section>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] max-w-md w-full p-6 shadow-xl animate-in zoom-in-95">
            <h3 className="text-[16px] font-bold text-[#18181B] font-ui mb-4">
              Add New Project Task
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Deploy backend service, Design flyer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as AreaOfLife)}
                    className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B] bg-white"
                  >
                    <option value="Work">Work</option>
                    <option value="Health">Health</option>
                    <option value="Money">Money</option>
                    <option value="Personal Growth">Personal Growth</option>
                    <option value="Family">Family</option>
                    <option value="Spirituality">Spirituality</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskItem['priority'])}
                    className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B] bg-white"
                  >
                    <option value="High">High (40 EXP)</option>
                    <option value="Med">Medium (30 EXP)</option>
                    <option value="Low">Low (20 EXP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B] bg-white font-num"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1 font-ui">
                  Notes / Context (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Additional parameters or links"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#18181B]"
                />
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
                  Add Task (+10 EXP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
