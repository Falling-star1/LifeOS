import { useEffect, useState } from 'react';
import { useTaskStore } from '@/stores';
import { useProjectStore } from '@/stores';
import { useIsMobile } from '@/hooks/useMediaQuery';
import TaskDetailModal from '@/components/TaskDetailModal';
import ConfirmModal from '@/components/ConfirmModal';
import { getTaskTags } from '@/services/tagService';
import { Tag } from '@/types/tag';
import { Task } from '@/types/task';

type SortKey = 'default' | 'priority' | 'due_date';

export default function InboxPage() {
  const { tasks, loading, loadTasks, addTask, toggleTaskStatus, editTask, removeTask } = useTaskStore();
  const { projects, loadProjects } = useProjectStore();
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [taskTagsMap, setTaskTagsMap] = useState<Record<string, Tag[]>>({});
  const isMobile = useIsMobile();

  useEffect(() => { loadTasks(); loadProjects(); }, [loadTasks, loadProjects]);

  useEffect(() => {
    tasks.forEach(t => {
      if (!taskTagsMap[t.id]) {
        getTaskTags(t.id).then(tags => {
          if (tags.length > 0) setTaskTagsMap(prev => ({ ...prev, [t.id]: tags }));
        }).catch(() => {});
      }
    });
  }, [tasks]);

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortKey === 'priority') return b.priority - a.priority;
    if (sortKey === 'due_date') {
      const aDate = a.due_date ?? Infinity;
      const bDate = b.due_date ?? Infinity;
      return aDate - bDate;
    }
    return 0;
  });

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    todo: tasks.filter(t => t.status === 'todo').length,
  };

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'default', label: '默认（创建时间）' },
    { key: 'priority', label: '按优先级' },
    { key: 'due_date', label: '按截止日期' },
  ];

  const getPriorityLabel = (p: number) => {
    const map: Record<number, { text: string; cls: string }> = {
      3: { text: '紧急', cls: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/30' },
      2: { text: '高', cls: 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:ring-orange-500/30' },
      1: { text: '中', cls: 'bg-yellow-100 text-yellow-700 ring-1 ring-inset ring-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-400 dark:ring-yellow-500/30' },
      0: { text: '低', cls: 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200 dark:bg-gray-700/40 dark:text-gray-300 dark:ring-gray-600/40' },
    };
    return map[p] || map[0];
  };

  const handleSave = async (
    id: string | null,
    data: { title: string; description?: string | null; priority?: number; status?: string; dueDate?: number | null; projectId?: string | null },
  ) => {
    if (id) {
      await editTask(id, data.title, data.description ?? null, data.status, data.priority, data.dueDate ?? null, data.projectId ?? null);
    } else {
      await addTask(data.title, data.description ?? null, data.status, data.priority, data.dueDate ?? null, data.projectId ?? null);
    }
  };

  const formatDueDate = (unix?: number | null) => {
    if (!unix) return null;
    const d = new Date(unix * 1000);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${m}月${day}日`;
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === 'done') return false;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return task.due_date * 1000 < todayStart.getTime();
  };

  const getProjectName = (projectId?: string | null) => {
    if (!projectId) return null;
    const p = projects.find(pr => pr.id === projectId);
    return p ? p.name : null;
  };

  return (
    <div className="p-4 pb-24 md:p-6 md:pb-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">收件箱</h1>
        <p className="mt-1 text-[13px] text-gray-500">管理你的所有待办事项</p>
      </div>

      <div className={`mb-4 grid gap-3 md:mb-6 md:gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
        {[
          { label: '总任务', value: stats.total, icon: '📋', color: 'text-blue-500 dark:text-blue-400' },
          { label: '待办', value: stats.todo, icon: '📌', color: 'text-gray-700 dark:text-gray-300' },
          { label: '进行中', value: stats.inProgress, icon: '🔥', color: 'text-yellow-600 dark:text-yellow-400' },
          { label: '已完成', value: stats.done, icon: '✅', color: 'text-green-600 dark:text-green-400' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-gray-50 p-3 transition-colors dark:border-gray-800/60 dark:bg-gray-900/50 md:p-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-gray-500 md:text-[13px]">{stat.label}</span>
              <span className="text-base md:text-lg">{stat.icon}</span>
            </div>
            <p className={`mt-1 text-xl font-bold md:text-2xl ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 md:mb-5">
        {(['all', 'todo', 'in_progress', 'done'] as const).map((f) => {
          const labels = { all: '全部', todo: '待办', in_progress: '进行中', done: '已完成' };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors md:text-[13px] ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {labels[f]}
            </button>
          );
        })}

        <div className="relative ml-auto">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 pr-8 text-[12px] text-gray-600 transition-colors focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 md:text-[13px]"
          >
            {sortOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800/60 dark:bg-gray-900/80">
        <div className="divide-y divide-gray-100 dark:divide-gray-800/40">
          {loading ? (
            <div className="py-12 text-center text-gray-400">加载中...</div>
          ) : sortedTasks.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <span className="text-4xl">📭</span>
              <p className="mt-3 text-[15px]">暂无任务</p>
            </div>
          ) : (
            sortedTasks.map((task) => {
              const priority = getPriorityLabel(task.priority);
              const overdue = isOverdue(task);
              const dueLabel = formatDueDate(task.due_date);
              const projName = getProjectName(task.project_id);
              return (
                <div key={task.id} className="flex items-center justify-between px-4 py-3 transition-colors active:bg-gray-100 dark:active:bg-gray-800/30">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <button onClick={() => toggleTaskStatus(task.id, task.status)}
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-90 ${
                        task.status === 'done' ? 'border-green-500 bg-green-500' : 'border-gray-300 active:border-blue-500 dark:border-gray-600'
                      }`}>
                      {task.status === 'done' && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      )}
                    </button>
                    <button onClick={() => setEditingTask(task)} className="min-w-0 flex-1 text-left">
                      <span className={`block truncate text-[14px] ${task.status === 'done' ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{task.title}</span>
                      <div className="flex items-center gap-2">
                        {task.description && <span className="block truncate text-[12px] text-gray-400">{task.description}</span>}
                        {projName && <span className="flex-shrink-0 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-700 dark:text-gray-400">{projName}</span>}
                        {dueLabel && (
                          <span className={`flex-shrink-0 text-[11px] ${overdue ? 'font-medium text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                            📅 {dueLabel}
                          </span>
                        )}
                        {(taskTagsMap[task.id] || []).map(tag => (
                          <span key={tag.id} className="flex-shrink-0 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-400">{tag.name}</span>
                        ))}
                      </div>
                    </button>
                  </div>
                  <div className="ml-2 flex flex-shrink-0 items-center gap-2">
                    <span className={`hidden rounded-md px-2 py-0.5 text-[11px] font-medium md:inline-block ${priority.cls}`}>{priority.text}</span>
                    <button onClick={() => setDeleteTarget(task)} className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-500/15 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400" title="删除">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className={`${isMobile ? 'fixed bottom-16 left-0 right-0 z-30 border-t border-gray-200 bg-white/95 p-3 backdrop-blur-lg dark:border-gray-800/60 dark:bg-gray-900/95' : 'mt-4'}`}>
        <button 
          onClick={() => setShowCreateModal(true)}
          className={`w-full rounded-xl bg-blue-600 px-4 py-3 text-[14px] font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800 ${isMobile ? '' : 'max-w-md mx-auto block'}`}
        >
          + 新建任务
        </button>
      </div>

      {showCreateModal && (
        <TaskDetailModal 
          task={null} 
          projects={projects}
          onClose={() => setShowCreateModal(false)} 
          onSave={handleSave} 
        />
      )}

      {editingTask && (
        <TaskDetailModal 
          task={editingTask} 
          projects={projects}
          onClose={() => setEditingTask(null)} 
          onSave={handleSave}
          onDelete={removeTask}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          title={"删除任务"}
          message={`确定要删除「${deleteTarget.title}」吗？此操作无法撤销。`}
          confirmLabel={"删除"}
          danger
          onConfirm={async () => { await removeTask(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
