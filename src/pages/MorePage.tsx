import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';

const moreItems = [
  { path: '/pomodoro', label: '番茄钟', icon: '🍅', desc: '专注工作，高效休息' },
  { path: '/notes', label: '备忘录', icon: '📝', desc: '记录想法和笔记' },
];

export default function MorePage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">更多</h1>
      </div>

      {/* Appearance */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800/60 dark:bg-gray-900/50">
        <div className="mb-3 text-[13px] font-medium text-gray-500">外观</div>
        <ThemeToggle />
      </div>

      <div className="space-y-2">
        {moreItems.map((item) => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className="flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left transition-colors active:bg-gray-100 dark:border-gray-800/60 dark:bg-gray-900/50 dark:active:bg-gray-800/30">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <div className="text-[15px] font-medium text-gray-900 dark:text-gray-100">{item.label}</div>
              <div className="text-[13px] text-gray-500">{item.desc}</div>
            </div>
            <svg className="ml-auto h-5 w-5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
