import { useEffect, useState } from 'react';
import { useTasks } from '@/hooks/useTasks';

export default function App() {
  const { tasks, loading, loadTasks, addTask, toggleTaskStatus, removeTask } = useTasks();
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await addTask(newTitle.trim());
    setNewTitle('');
  };

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white">L</span>
            </div>
            <h1 className="text-xl font-semibold">LifeOS</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="rounded-lg bg-gray-800 px-4 py-2 text-sm transition-colors hover:bg-gray-700">
              搜索
            </button>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm transition-colors hover:bg-blue-700">
              新建任务
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-gray-800 bg-gray-900/30 p-4">
          <nav className="space-y-1">
            {[
              { id: 'inbox', label: '收件箱', icon: '📥', count: 5 },
              { id: 'today', label: '今日', icon: '☀️', count: 3 },
              { id: 'calendar', label: '日历', icon: '📅' },
              { id: 'study', label: '学习', icon: '📚', count: 2 },
              { id: 'pomodoro', label: '番茄钟', icon: '🍅' },
              { id: 'notes', label: '备忘', icon: '📝' },
            ].map((item) => (
              <button
                key={item.id}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-gray-400 transition-colors hover:bg-gray-800/50 hover:text-gray-200"
              >
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.count && (
                  <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-400">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-8">
            <h3 className="mb-2 text-xs font-medium uppercase text-gray-500">
              项目
            </h3>
            <div className="space-y-1">
              {[
                { name: '工作', color: 'bg-blue-500' },
                { name: '个人', color: 'bg-green-500' },
                { name: '学习', color: 'bg-purple-500' },
              ].map((project) => (
                <button
                  key={project.name}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-400 transition-colors hover:bg-gray-800/50 hover:text-gray-200"
                >
                  <span className={h-2 w-2 rounded-full }></span>
                  <span>{project.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">任务管理</h2>
            <p className="mt-1 text-gray-400">管理你的待办事项和项目</p>
          </div>

          <div className="mb-6 grid grid-cols-4 gap-4">
            {[
              { label: '总任务', value: '12', icon: '📋', color: 'text-blue-400' },
              { label: '进行中', value: '3', icon: '🔄', color: 'text-yellow-400' },
              { label: '已完成', value: '8', icon: '✅', color: 'text-green-400' },
              { label: '逾期', value: '1', icon: '⚠️', color: 'text-red-400' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{stat.label}</span>
                  <span>{stat.icon}</span>
                </div>
                <div className={mt-2 text-3xl font-bold }>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
              <h3 className="font-medium">今日任务</h3>
              <div className="flex gap-2">
                <button className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-800">
                  全部
                </button>
                <button className="rounded bg-gray-800 px-2 py-1 text-xs text-white">
                  待办
                </button>
                <button className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-800">
                  进行中
                </button>
                <button className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-800">
                  已完成
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-800">
              {loading ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  加载中...
                </div>
              ) : tasks.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  暂无任务，添加一个吧
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.status === 'done'}
                        onChange={() => toggleTaskStatus(task.id, task.status)}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-600 transition-colors"
                      />
                      <span
                        className={${
                          task.status === 'done'
                            ? 'text-gray-500 line-through'
                            : 'text-gray-100'
                        }}
                      >
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={ounded px-2 py-1 text-xs font-medium }
                      >
                        {task.priority === 3
                          ? '紧急'
                          : task.priority === 2
                          ? '高'
                          : task.priority === 1
                          ? '中'
                          : '低'}
                      </span>
                      <span
                        className={ounded px-2 py-1 text-xs font-medium }
                      >
                        {task.status === 'done'
                          ? '已完成'
                          : task.status === 'in_progress'
                          ? '进行中'
                          : '待办'}
                      </span>
                      <button
                        onClick={() => removeTask(task.id)}
                        className="ml-2 rounded p-1 text-gray-500 transition-colors hover:bg-red-600/20 hover:text-red-400"
                        title="删除任务"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-gray-800 bg-gray-900 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="添加新任务..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm transition-colors placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleAdd}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium transition-colors hover:bg-blue-700"
              >
                添加
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}