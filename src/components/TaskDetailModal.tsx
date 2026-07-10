import { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import { Project } from '@/services/projectService';
import DatePicker from './DatePicker';
import ConfirmModal from './ConfirmModal';
import { useTags } from '@/hooks/useTags';
import { getSubtasks, createTask, updateTaskStatus, deleteTask } from '@/services/taskService';

interface TaskDetailModalProps {
  task: Task | null;
  projects?: Project[];
  onClose: () => void;
  onSave: (
    id: string | null,
    data: {
      title: string;
      description?: string | null;
      priority?: number;
      status?: string;
      dueDate?: number | null;
      projectId?: string | null;
    },
  ) => void;
  onDelete?: (id: string) => void;
}

const priorityOptions = [
  { value: 0, label: '低', cls: 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200 dark:bg-gray-700/40 dark:text-gray-300 dark:ring-gray-600/40' },
  { value: 1, label: '中', cls: 'bg-yellow-100 text-yellow-700 ring-1 ring-inset ring-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-400 dark:ring-yellow-500/30' },
  { value: 2, label: '高', cls: 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:ring-orange-500/30' },
  { value: 3, label: '紧急', cls: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/30' },
];

const statusOptions = [
  { value: 'todo', label: '待办' },
  { value: 'in_progress', label: '进行中' },
  { value: 'done', label: '已完成' },
];

function unixToDateInput(unix?: number | null): string {
  if (!unix) return '';
  const d = new Date(unix * 1000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dateInputToUnix(dateStr: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return Math.floor(d.getTime() / 1000);
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  pink: 'bg-pink-500',
  gray: 'bg-gray-500',
};

export default function TaskDetailModal({ task, projects = [], onClose, onSave, onDelete }: TaskDetailModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(0);
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { tags: allTags, loadTags, addTag } = useTags();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [subtasks, setSubtasks] = useState<{id: string; title: string; status: string}[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => { loadTags(); }, [loadTags]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showDeleteConfirm && !showTagInput) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, showDeleteConfirm, showTagInput]);

  useEffect(() => {
    if (task) {
      getSubtasks(task.id).then(setSubtasks).catch(() => setSubtasks([]));
      import('@/services/tagService').then(m => m.getTaskTags(task.id)).then(tags => setSelectedTagIds(tags.map(t => t.id))).catch(() => {});
    } else {
      setSubtasks([]);
      setSelectedTagIds([]);
    }
  }, [task]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(unixToDateInput(task.due_date));
      setProjectId(task.project_id || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority(0);
      setStatus('todo');
      setDueDate('');
      setProjectId('');
    }
  }, [task]);

  const isCreateMode = !task;

  const handleSave = () => {
    if (!title.trim()) return;

    const nextDueDate = dueDate === '' ? null : dateInputToUnix(dueDate);
    const nextProjectId = projectId === '' ? null : projectId;

    const savedTaskId = task?.id || null;
    onSave(savedTaskId, {
      title: title.trim(),
      description: description.trim() === '' ? null : description.trim(),
      priority,
      status,
      dueDate: nextDueDate ?? null,
      projectId: nextProjectId ?? null,
    });
    // Save tags if editing existing task
    if (savedTaskId) {
      import('@/services/tagService').then(m => m.setTaskTags(savedTaskId, selectedTagIds)).catch(() => {});
    }
    onClose();
  };

  const handleClearDate = () => setDueDate('');

  const todayStr = unixToDateInput(Math.floor(Date.now() / 1000));
  const isOverdue = dueDate !== '' && dueDate < todayStr && status !== 'done';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm dark:bg-black/60" />
      <div
        className="relative w-full max-w-lg rounded-t-2xl bg-white shadow-2xl dark:bg-gray-900 md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800/60">
          <h2 className="text-[16px] font-semibold text-gray-900 dark:text-gray-100">
            {isCreateMode ? '新建任务' : '任务详情'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 active:bg-gray-100 dark:active:bg-gray-800">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-gray-500">标题</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务标题..."
              autoFocus={isCreateMode}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-gray-500">描述</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              placeholder="添加描述..." />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-gray-500">截止日期</label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <DatePicker 
                  value={dueDate} 
                  onChange={setDueDate}
                  isOverdue={isOverdue}
                />
              </div>
              {dueDate && (
                <button onClick={handleClearDate}
                  className="rounded-lg border border-gray-300 px-3 py-2.5 text-[13px] text-gray-500 transition-colors active:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:active:bg-gray-800">
                  清除
                </button>
              )}
            </div>
            {isOverdue && (
              <p className="mt-1.5 text-[12px] text-red-500 dark:text-red-400">⚠ 此任务已逾期</p>
            )}
          </div>

          {projects.length > 0 && (
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-gray-500">所属项目</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setProjectId('')}
                  className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                    projectId === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>无</button>
                {projects.map((p) => (
                  <button key={p.id} onClick={() => setProjectId(p.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                      projectId === p.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                    <span className={`h-2 w-2 rounded-full ${colorMap[p.color] || 'bg-gray-500'}`}></span>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-gray-500">状态</label>
            <div className="flex gap-2">
              {statusOptions.map((opt) => (
                <button key={opt.value} onClick={() => setStatus(opt.value)}
                  className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                    status === opt.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>{opt.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-gray-500">优先级</label>
            <div className="flex gap-2">
              {priorityOptions.map((opt) => (
                <button key={opt.value} onClick={() => setPriority(opt.value)}
                  className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
                    priority === opt.value ? `${opt.cls} ring-2 ring-offset-1 ring-gray-400 dark:ring-offset-gray-900` : opt.cls
                  }`}>{opt.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-gray-500">标签</label>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => {
                const selected = selectedTagIds.includes(tag.id);
                return (
                  <button key={tag.id} onClick={() => {
                    setSelectedTagIds(prev => selected ? prev.filter(id => id !== tag.id) : [...prev, tag.id]);
                  }} className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors ${
                    selected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>{tag.name}</button>
                );
              })}
              {showTagInput ? (
                <div className="flex gap-1">
                  <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && newTagName.trim()) {
                        const tag = await addTag(newTagName.trim());
                        setSelectedTagIds(prev => [...prev, tag.id]);
                        setNewTagName('');
                        setShowTagInput(false);
                      } else if (e.key === 'Escape') {
                        setShowTagInput(false);
                        setNewTagName('');
                      }
                    }}
                    placeholder="标签名"
                    className="w-20 rounded-full border border-gray-300 bg-white px-2.5 py-1 text-[12px] focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                </div>
              ) : (
                <button onClick={() => setShowTagInput(true)}
                  className="rounded-full border border-dashed border-gray-300 px-2.5 py-1 text-[12px] text-gray-400 dark:border-gray-700 dark:text-gray-500">+ 标签</button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800/60">
          {!isCreateMode && (
            <div className="mt-3">
              <label className="mb-1.5 block text-[12px] font-medium text-gray-500">子任务 ({subtasks.length})</label>
              <div className="space-y-1.5">
                {subtasks.map(st => (
                  <div key={st.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/50">
                    <button onClick={async () => {
                      const newStatus = st.status === 'done' ? 'todo' : 'done';
                      await updateTaskStatus(st.id, newStatus);
                      setSubtasks(prev => prev.map(s => s.id === st.id ? {...s, status: newStatus} : s));
                    }} className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      st.status === 'done' ? 'border-green-500 bg-green-500' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {st.status === 'done' && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <span className={`flex-1 text-[13px] ${st.status === 'done' ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{st.title}</span>
                    <button onClick={async () => { await deleteTask(st.id); setSubtasks(prev => prev.filter(s => s.id !== st.id)); }}
                      className="rounded p-1 text-gray-400 active:text-red-500">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input type="text" value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && newSubtaskTitle.trim() && task) {
                      const st = await createTask(newSubtaskTitle.trim(), null, 'todo', 0, null, null, task.id);
                      setSubtasks(prev => [...prev, { id: st.id, title: st.title, status: st.status }]);
                      setNewSubtaskTitle('');
                    }
                  }}
                  placeholder="添加子任务..."
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
              </div>
            </div>
          )}

          {onDelete && (
            <div className="mt-3">
              <button onClick={() => setShowDeleteConfirm(true)}
                className="rounded-lg px-3 py-2 text-[13px] font-medium text-red-600 transition-colors active:bg-red-50 dark:text-red-400 dark:active:bg-red-500/10">
                删除任务
              </button>
            </div>
          )}
          <div className={`${isCreateMode ? 'ml-auto' : ''} flex gap-2`}>
            <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2.5 text-[13px] text-gray-600 active:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:active:bg-gray-800">取消</button>
            <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white active:bg-blue-700">
              {isCreateMode ? '创建任务' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

      {showDeleteConfirm && (
        <ConfirmModal
          title={"删除任务"}
          message={"确定要删除这个任务吗？此操作无法撤销。"}
          confirmLabel={"删除"}
          danger
          onConfirm={() => { onDelete!(task!.id); onClose(); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

}