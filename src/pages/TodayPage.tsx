import { useEffect, useState } from 'react';
import { useTaskStore } from '@/stores';
import { useProjectStore } from '@/stores';
import { useIsMobile } from '@/hooks/useMediaQuery';
import TaskDetailModal from '@/components/TaskDetailModal';
import ConfirmModal from '@/components/ConfirmModal';
import { Task } from '@/types/task';

export default function TodayPage() {
  const { tasks, loading, loadTasks, addTask, toggleTaskStatus, editTask, removeTask } = useTaskStore();
  const { projects, loadProjects } = useProjectStore();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [hideDone, setHideDone] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => { loadTasks(); loadProjects(); }, [loadTasks, loadProjects]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const todayStartUnix = Math.floor(todayStart.getTime() / 1000);
  const todayEndUnix = Math.floor(todayEnd.getTime() / 1000);

  const tomorrowEnd = new Date();
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
  tomorrowEnd.setHours(23, 59, 59, 999);
  const tomorrowEndUnix = Math.floor(tomorrowEnd.getTime() / 1000);

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === 'done') return false;
    return task.due_date < todayStartUnix;
  };

  const isDueToday = (task: Task) => {
    if (!task.due_date) return false;
    return task.due_date >= todayStartUnix && task.due_date <= todayEndUnix;
  };

  const isDueTomorrow = (task: Task) => {
    if (!task.due_date) return false;
    return task.due_date > todayEndUnix && task.due_date <= tomorrowEndUnix;
  };

  const baseTasks = hideDone ? tasks.filter(t => t.status !== 'done') : tasks;
  const overdueTasks = baseTasks.filter(t => t.status !== 'done' && isOverdue(t));
  const todayTasks = baseTasks.filter(t => isDueToday(t));
  const tomorrowTasks = baseTasks.filter(t => isDueTomorrow(t));

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
    if (!unix) return '';
    const d = new Date(unix * 1000);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const renderTaskItem = (task: Task, showOverdueBadge: boolean) => (
    <div key={task.id} className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors active:bg-gray-100 dark:active:bg-gray-800/30 md:py-2.5">
      <button onClick={() => toggleTaskStatus(task.id, task.status)}
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-90 ${
          task.status === 'done'
            ? 'border-green-500 bg-green-500'
            : 'border-gray-300 active:border-green-500 dark:border-gray-600'
        }`}>
        {task.status === 'done' && (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        )}
      </button>
      <button onClick={() => setEditingTask(task)} className="min-w-0 flex-1 text-left">
        <span className={`block truncate text-[14px] ${task.status === 'done' ? 'text-gray-400 line-through dark:text-gray-500' : showOverdueBadge ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>{task.title}</span>
        {showOverdueBadge && task.due_date && (
          <span className="text-[11px] text-red-500 dark:text-red-400">逾期: {formatDueDate(task.due_date)}</span>
        )}
      </button>
      <button onClick={() => setDeleteTarget(task)} className="flex-shrink-0 rounded-md p-1.5 text-gray-400 transition-colors active:bg-red-500/20 active:text-red-500 dark:text-gray-500 dark:active:text-red-400">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );

  const hasAnyTasks = overdueTasks.length > 0 || todayTasks.length > 0 || tomorrowTasks.length > 0;

  return (
    <div className="p-4 pb-24 md:p-6 md:pb-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">今日</h1>
        <p className="mt-1 text-[13px] text-gray-500">{dateStr}</p>
      </div>

      <div className="mb-4 flex items-center md:mb-5">
        <button
          onClick={() => setHideDone(!hideDone)}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors md:text-[13px] ${
            hideDone
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
        >
          <span className={`inline-block h-3.5 w-3.5 rounded-sm border ${hideDone ? 'border-white bg-white/30' : 'border-gray-400 dark:border-gray-500'}`}>
            {hideDone && (
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            )}
          </span>
          只看未完成
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400">加载中...</div>
      ) : !hasAnyTasks ? (
        <div className="py-12 text-center text-gray-400">
          <span className="text-4xl">🎉</span>
          <p className="mt-3 text-[15px]">{hideDone ? '没有未完成的任务！' : '今日无待办任务！'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {overdueTasks.length > 0 && (
            <div>
              <h2 className="mb-2 flex items-center gap-2 px-1 text-[13px] font-semibold text-red-600 dark:text-red-400">
                <span>⚠️</span> 逾期 ({overdueTasks.length})
              </h2>
              <div className="rounded-xl border border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20">
                <div className="divide-y divide-red-100 dark:divide-red-900/30">
                  {overdueTasks.map(t => renderTaskItem(t, true))}
                </div>
              </div>
            </div>
          )}

          {todayTasks.length > 0 && (
            <div>
              <h2 className="mb-2 flex items-center gap-2 px-1 text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                <span>📌</span> 今日到期 ({todayTasks.length})
              </h2>
              <div className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800/60 dark:bg-gray-900/50">
                <div className="divide-y divide-gray-200 dark:divide-gray-800/40">
                  {todayTasks.map(t => renderTaskItem(t, false))}
                </div>
              </div>
            </div>
          )}

          {tomorrowTasks.length > 0 && (
            <div>
              <h2 className="mb-2 flex items-center gap-2 px-1 text-[13px] font-semibold text-gray-500 dark:text-gray-400">
                <span>🔜</span> 明天到期 ({tomorrowTasks.length})
              </h2>
              <div className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800/60 dark:bg-gray-900/50">
                <div className="divide-y divide-gray-200 dark:divide-gray-800/40">
                  {tomorrowTasks.map(t => renderTaskItem(t, false))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
