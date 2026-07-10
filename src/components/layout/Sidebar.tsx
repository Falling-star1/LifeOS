import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import ConfirmModal from '@/components/ConfirmModal';
import { useProjectStore } from '@/stores';

const navItems = [
  { path: '/inbox', label: '收件箱', icon: '📥' },
  { path: '/today', label: '今日', icon: '☀️' },
  { path: '/calendar', label: '日历', icon: '📅' },
  { path: '/study', label: '学习', icon: '📚' },
  { path: '/pomodoro', label: '番茄钟', icon: '🍅' },
  { path: '/notes', label: '备忘', icon: '📝' },
  { path: '/dashboard', label: '仪表盘', icon: '📊' },
];

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

export default function Sidebar({ onBgClick }: { onBgClick?: () => void }) {
  const { projects, loadProjects, addProject, removeProject } = useProjectStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteProjectTarget, setDeleteProjectTarget] = useState<{id: string; name: string} | null>(null);
  const [hasBg, setHasBg] = useState(() => { try { return !!localStorage.getItem('lifeos_background'); } catch { return false; } });

  useEffect(() => { loadProjects(); }, [loadProjects]);
  useEffect(() => {
    const handler = () => { try { setHasBg(!!localStorage.getItem('lifeos_background')); } catch {} };
    window.addEventListener('storage', handler);
    const interval = setInterval(handler, 500);
    return () => { window.removeEventListener('storage', handler); clearInterval(interval); };
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const colors = ['blue', 'green', 'purple', 'red', 'orange', 'pink'];
    const color = colors[projects.length % colors.length];
    await addProject(newName.trim(), color);
    setNewName('');
    setShowAdd(false);
  };

  return (
    <aside className={`flex w-60 flex-col border-r backdrop-blur-lg transition-colors duration-500 ${hasBg ? "border-white/20 bg-white/60 dark:border-gray-700/40 dark:bg-gray-900/60" : "border-gray-200 bg-gray-50 dark:border-gray-800/80 dark:bg-gray-900/40"}`}>
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
          <span className="text-sm font-bold text-white">L</span>
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-gray-900 dark:text-gray-100">LifeOS</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all duration-150 ${
                isActive
                  ? 'bg-gray-200/80 text-gray-900 font-medium dark:bg-gray-800/80 dark:text-gray-100'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/40 dark:hover:text-gray-300'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <div className="mb-2 flex items-center justify-between px-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">项目</h3>
          <button onClick={() => setShowAdd(!showAdd)} className="rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>

        {showAdd && (
          <div className="mb-2 flex gap-1 px-3">
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="项目名称"
              className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-[12px] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
            <button onClick={handleAdd} className="rounded bg-blue-600 px-2 py-1 text-[11px] text-white">+</button>
          </div>
        )}

        <div className="space-y-0.5">
          {projects.map((project) => (
            <div key={project.id} className="group flex items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/40 dark:hover:text-gray-300">
              <span className={`h-2 w-2 rounded-full ${colorMap[project.color] || 'bg-gray-500'}`}></span>
              <span className="flex-1">{project.name}</span>
              <button onClick={() => setDeleteProjectTarget({ id: project.id, name: project.name })}
                className="rounded p-0.5 text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
          {projects.length === 0 && (
            <p className="px-3 py-2 text-[12px] text-gray-400">暂无项目</p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-800/60 space-y-2">
        {onBgClick && (
          <button onClick={onBgClick}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-gray-500 transition-colors active:bg-gray-100 dark:text-gray-400 dark:active:bg-gray-800">
            <span>🖼️</span>
            <span>更换背景</span>
          </button>
        )}
        <ThemeToggle />
      </div>
    
      {deleteProjectTarget && (
        <ConfirmModal
          title={"删除项目"}
          message={`确定要删除项目「${deleteProjectTarget.name}」吗？项目内的任务不会被删除。`}
          confirmLabel={"删除"}
          danger
          onConfirm={async () => { await removeProject(deleteProjectTarget.id); setDeleteProjectTarget(null); }}
          onCancel={() => setDeleteProjectTarget(null)}
        />
      )}
    
      {deleteProjectTarget && (
        <ConfirmModal
          title={"删除项目"}
          message={`确定要删除项目「${deleteProjectTarget.name}」吗？项目内的任务不会被删除。`}
          confirmLabel={"删除"}
          danger
          onConfirm={async () => { await removeProject(deleteProjectTarget.id); setDeleteProjectTarget(null); }}
          onCancel={() => setDeleteProjectTarget(null)}
        />
      )}
    </aside>
  );
}
