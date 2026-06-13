import { useEffect, useState } from 'react';
import { Task } from '@/types/task';
import { getTasks } from '@/services/taskService';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    getTasks().then(setTasks);
  }, []);

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-gray-800 p-4 text-lg font-semibold">LifeOS</header>
      <main className="flex-1 overflow-auto p-4">
        <pre className="rounded bg-gray-900 p-4 text-sm">{JSON.stringify(tasks, null, 2)}</pre>
      </main>
    </div>
  );
}
