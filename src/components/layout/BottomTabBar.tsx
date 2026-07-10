import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/inbox', label: '收件箱', icon: '📥' },
  { path: '/today', label: '今日', icon: '☀️' },
  { path: '/calendar', label: '日历', icon: '📅' },
  { path: '/study', label: '学习', icon: '📚' },
  { path: '/more', label: '更多', icon: '···' },
];

export default function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="flex items-center justify-around border-t border-gray-200 bg-white/95 backdrop-blur-lg dark:border-gray-800/80 dark:bg-gray-900/95"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path ||
          (tab.path === '/more' && ['/pomodoro', '/notes'].includes(location.pathname));
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors active:bg-gray-100 dark:active:bg-gray-800/50 ${
              isActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <span className={`text-[20px] ${tab.path === '/more' ? 'text-[16px] font-bold tracking-tighter' : ''}`}>
              {tab.icon}
            </span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
