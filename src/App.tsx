import { useEffect, useState } from 'react';
import { useTasks } from '@/hooks/useTasks';

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
      <header className="border-b border-gray-800 p-4 text-lg font-semibold">
        LifeOS
      </header>
      <main className="flex-1 overflow-auto p-4">
        <div className="mb-4 flex gap-2">
          <input
            className="flex-1 rounded bg-gray-800 p-2 text-gray-100"
            placeholder="添加任务..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button
            className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-700"
            onClick={handleAdd}
          >
            添加
          </button>
        </div>
        {loading ? (
          <div>加载中...</div>
        ) : (
          <ul className="space-y-2">
            {tasks.map(task => (
              <li
                key={task.id}
                className="rounded bg-gray-900 p-3"
              >
                {task.title}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}