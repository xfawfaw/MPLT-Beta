import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Check, 
  Plus, 
  Trash2, 
  Search
} from 'lucide-react';
import { TaskItem, AreaOfLife } from '../../types';

export const TaskManagerView: React.FC = () => {
  const { tasks, toggleTaskStatus, addTask, deleteTask } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<AreaOfLife>('Work');
  const [newPriority, setNewPriority] = useState<TaskItem['priority']>('High');
  const [newDueDate, setNewDueDate] = useState('2026-02-28');
  const [newNote, setNewNote] = useState('');

  // Stats calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const notCompletedTasks = totalTasks - completedTasks;
  const dueTodayTasks = tasks.filter(t => t.dueDate === '2026-02-26').length;
  const overdueTasks = tasks.filter(t => t.dueDate < '2026-02-26' && t.status !== 'Completed').length;

  // Filtered tasks list
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.note && task.note.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'completed' && task.status === 'Completed') ||
                          (filterStatus === 'pending' && task.status !== 'Completed') ||
                          (filterStatus === 'today' && task.dueDate === '2026-02-26');
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Category counts
  const categories: AreaOfLife[] = ['Health', 'Work', 'Money', 'Family', 'Personal Growth', 'Spirituality'];
  const categoryCounts = categories.map(cat => ({
    name: cat,
    count: tasks.filter(t => t.category === cat).length,
    completed: tasks.filter(t => t.category === cat && t.status === 'Completed').length,
  }));

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
    if (isCompleted) return { text: 'Done', color: 'text-[#10B981] bg-[#10B981]/10' };
    const today = '2026-02-26';
    if (dueDate === today) return { text: 'Due today', color: 'text-amber-700 bg-amber-50 border border-amber-200' };
    if (dueDate < today) return { text: 'Overdue 13 days', color: 'text-[#E11D48] bg-rose-50 border border-rose-200' };
    if (dueDate === '2026-02-28') return { text: '2 days left', color: 'text-[#18181B] bg-[#F1F5F9]' };
    if (dueDate === '2026-03-15') return { text: '17 days left', color: 'text-[#71717A] bg-[#F9FAFB]' };
    return { text: '51 days left', color: 'text-[#71717A] bg-[#F9FAFB]' };
  };

  return (
    <div className="max-w-[1440px] mx-auto p-6 space-y-6">
      
      {/* ========================================================
          TOP SECTION: STATS ROW (FROM SPREADSHEET BLUEPRINT)
          ======================================================== */}
      <section className="mplt-card p-6 bg-[#FFFFFF] border border-[#E2E8F0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#18181B]" />
            <h1 className="text-[24px] font-bold text-[#18181B] font-ui tracking-tight">
              TASK MANAGER — FEBRUARY 2026
            </h1>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#18181B] text-white hover:bg-[#27272A] text-[12px] font-bold transition-all self-start md:self-auto"
          >
            <Plus size={15} />
            <span>New Task</span>
          </button>
        </div>

        {/* 5 Stats Blocks from PDF: Today, Total Tasks, Overdue, Not Completed, Completed */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          
          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <span className="text-[10.5px] font-ui text-[#71717A] uppercase tracking-wider block">
              Today Due
            </span>
            <span className="text-[22px] font-num font-bold text-[#18181B] mt-0.5 block">
              {dueTodayTasks}
            </span>
          </div>

          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <span className="text-[10.5px] font-ui text-[#71717A] uppercase tracking-wider block">
              Total Tasks
            </span>
            <span className="text-[22px] font-num font-bold text-[#18181B] mt-0.5 block">
              {totalTasks}
            </span>
          </div>

          <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-[8px]">
            <span className="text-[10.5px] font-ui text-[#E11D48] uppercase tracking-wider block font-semibold">
              Overdue
            </span>
            <span className="text-[22px] font-num font-bold text-[#E11D48] mt-0.5 block">
              {overdueTasks}
            </span>
          </div>

          <div className="p-3 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[8px]">
            <span className="text-[10.5px] font-ui text-[#71717A] uppercase tracking-wider block">
              Incomplete
            </span>
            <span className="text-[22px] font-num font-bold text-[#71717A] mt-0.5 block">
              {notCompletedTasks}
            </span>
          </div>

          <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-[8px]">
            <span className="text-[10.5px] font-ui text-[#10B981] uppercase tracking-wider block font-semibold">
              Completed
            </span>
            <span className="text-[22px] font-num font-bold text-[#10B981] mt-0.5 block">
              {completedTasks} ({totalTasks > 0 ? Math.round((completedTasks/totalTasks)*100) : 0}%)
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================
          MIDDLE SECTION: CATEGORIES + UPCOMING + DONUT BREAKDOWN
          ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Category Counts (Span 4) */}
        <div className="lg:col-span-4 mplt-card p-5 bg-[#FFFFFF] border border-[#E2E8F0]">
          <h3 className="text-[13px] font-bold text-[#18181B] font-ui uppercase tracking-wider mb-3 pb-2 border-b border-[#E2E8F0]">
            Set Your Categories
          </h3>
          <div className="space-y-1.5 text-[12px]">
            {categoryCounts.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setFilterCategory(filterCategory === cat.name ? 'all' : cat.name)}
                className={`w-full flex items-center justify-between p-2 rounded-[6px] transition-colors ${
                  filterCategory === cat.name ? 'bg-[#18181B] text-white' : 'hover:bg-[#F4F4F5] text-[#18181B]'
                }`}
              >
                <span className="font-medium font-ui">{cat.name}</span>
                <span className={`font-num text-[11px] px-2 py-0.5 rounded-[4px] font-semibold ${
                  filterCategory === cat.name ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#71717A]'
                }`}>
                  {cat.completed}/{cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Center: 10 Upcoming Deadlines (Span 4) */}
        <div className="lg:col-span-4 mplt-card p-5 bg-[#FFFFFF] border border-[#E2E8F0]">
          <h3 className="text-[13px] font-bold text-[#18181B] font-ui uppercase tracking-wider mb-3 pb-2 border-b border-[#E2E8F0]">
            Upcoming Deadlines
          </h3>
          <div className="space-y-2">
            {tasks.filter(t => t.status !== 'Completed').slice(0, 5).map((t) => {
              const daysStatus = getDaysLeft(t.dueDate, false);
              return (
                <div key={t.id} className="flex items-center justify-between text-[11px] p-2 bg-[#F9FAFB] border border-[#E2E8F0] rounded-[6px]">
                  <span className="font-ui font-medium text-[#18181B] truncate max-w-[170px]">
                    {t.title}
                  </span>
                  <span className={`font-num text-[10px] px-1.5 py-0.2 rounded font-semibold ${daysStatus.color}`}>
                    {daysStatus.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Completed Tasks by Category (Donut style) (Span 4) */}
        <div className="lg:col-span-4 mplt-card p-5 bg-[#FFFFFF] border border-[#E2E8F0] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <h3 className="text-[13px] font-bold text-[#18181B] font-ui uppercase tracking-wider">
              Completed by Category
            </h3>
            <span className="text-[11px] font-num font-bold text-[#10B981]">
              {completedTasks}/{totalTasks}
            </span>
          </div>

          <div className="flex items-center justify-center my-3 relative">
            <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="12"
              />
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke="#18181B"
                strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - (completedTasks / (totalTasks || 1)))}`}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] uppercase tracking-wider text-[#71717A]">Completed</span>
              <span className="text-[16px] font-num font-bold text-[#18181B]">
                {completedTasks}/{totalTasks}
              </span>
            </div>
          </div>

          <div className="text-center text-[11px] text-[#71717A] font-ui">
            Task resolution velocity: <strong className="text-[#18181B] font-num">{totalTasks > 0 ? Math.round((completedTasks/totalTasks)*100) : 0}%</strong>
          </div>
        </div>

      </section>

      {/* ========================================================
          BOTTOM SECTION: FULL TASK LEDGER TABLE
          ======================================================== */}
      <section className="mplt-card bg-[#FFFFFF] border border-[#E2E8F0] overflow-hidden">
        
        {/* Table Filters Bar */}
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F9FAFB] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-sm bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-[6px]">
            <Search size={14} className="text-[#71717A]" />
            <input
              type="text"
              placeholder="Search tasks, tags, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[12px] bg-transparent focus:outline-none font-ui"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-[5px] text-[11px] font-medium font-ui transition-colors ${
                filterStatus === 'all' ? 'bg-[#18181B] text-white' : 'bg-white border border-[#E2E8F0] text-[#71717A]'
              }`}
            >
              All ({totalTasks})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-2.5 py-1 rounded-[5px] text-[11px] font-medium font-ui transition-colors ${
                filterStatus === 'pending' ? 'bg-[#18181B] text-white' : 'bg-white border border-[#E2E8F0] text-[#71717A]'
              }`}
            >
              Pending ({notCompletedTasks})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-2.5 py-1 rounded-[5px] text-[11px] font-medium font-ui transition-colors ${
                filterStatus === 'completed' ? 'bg-[#18181B] text-white' : 'bg-white border border-[#E2E8F0] text-[#71717A]'
              }`}
            >
              Completed ({completedTasks})
            </button>
          </div>
        </div>

        {/* Task Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E2E8F0] font-ui text-[10.5px] uppercase tracking-wider text-[#71717A]">
                <th className="p-3 w-10 text-center">#</th>
                <th className="p-3">Tasks</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Category</th>
                <th className="p-3">Day Left</th>
                <th className="p-3">Note</th>
                <th className="p-3 w-10 text-center">Act</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredTasks.map((t) => {
                const isDone = t.status === 'Completed';
                const daysLeftInfo = getDaysLeft(t.dueDate, isDone);

                return (
                  <tr key={t.id} className="hover:bg-[#FBFBFC] transition-colors group">
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
                      <span className={`font-num text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
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
                      <span className={`font-ui text-[10.5px] px-2 py-0.5 rounded-full font-medium ${
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
                      <span className="font-ui text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#71717A]">
                        {t.category}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className={`font-num text-[10px] px-2 py-0.5 rounded font-semibold ${daysLeftInfo.color}`}>
                        {daysLeftInfo.text}
                      </span>
                    </td>

                    <td className="p-3 font-ui text-[#71717A] text-[11px] truncate max-w-[180px]">
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
                  <td colSpan={9} className="p-8 text-center text-[#71717A] font-ui text-[12px]">
                    No matching tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

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
