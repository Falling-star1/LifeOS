import { useEffect, useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import UIPreview from '@/components/UIPreview';

export default function App() {
  const { tasks, loading, loadTasks, addTask } = useTasks();
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
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <h1 className="text-xl font-semibold">LifeOS</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="rounded-lg bg-gray-800 px-4 py-2 text-sm hover:bg-gray-700">
              搜索
            </button>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700">
              新建任务
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-gray-800 bg-gray-900/30 p-4">
          <nav className="space-y-1">
            {[
              { id: 'inbox', label: '收件箱', icon: '📥' },
              { id: 'today', label: '今日', icon: '☀️' },
              { id: 'calendar', label: '日历', icon: '📅' },
              { id: 'study', label: '学习', icon: '📚' },
              { id: 'pomodoro', label: '番茄钟', icon: '🍅' },
              { id: 'notes', label: '备忘', icon: '📝' },
            ].map((item) => (
              <button
                key={item.id}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8">
            <h3 className="mb-2 text-xs font-medium uppercase text-gray-500">
              项目
            </h3>
            <div className="space-y-1">
              {['工作', '个人', '学习'].map((project) => (
                <button
                  key={project}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                >
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  <span>{project}</span>
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
              { label: '总任务', value: '12', color: 'bg-blue-600' },
              { label: '进行中', value: '3', color: 'bg-yellow-600' },
              { label: '已完成', value: '8', color: 'bg-green-600' },
              { label: '逾期', value: '1', color: 'bg-red-600' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-gray-800 bg-gray-900 p-4"
              >
                <div className="text-sm text-gray-400">{stat.label}</div>
                <div className="mt-1 text-2xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900">
            <div className="border-b border-gray-800 px-4 py-3">
              <h3 className="font-medium">今日任务</h3>
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
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.status === 'done'}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-600"
                        readOnly
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
                        className={ounded px-2 py-1 text-xs }
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
                        className={ounded px-2 py-1 text-xs }
                      >
                        {task.status === 'done'
                          ? '已完成'
                          : task.status === 'in_progress'
                          ? '进行中'
                          : '待办'}
                      </span>
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
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleAdd}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700"
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