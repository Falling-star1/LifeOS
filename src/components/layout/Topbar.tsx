interface TopbarProps {
  title: string;
  subtitle?: string;
  onSearch?: () => void;
  onNewTask?: () => void;
}

export default function Topbar({ title, subtitle, onSearch, onNewTask }: TopbarProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white/30 px-6 py-4 backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/30">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[13px] text-gray-500 dark:text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onSearch} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-[13px] text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>搜索</span>
          <kbd className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400 dark:bg-gray-800 dark:text-gray-500">⌘K</kbd>
        </button>
        <button onClick={onNewTask} className="rounded-lg bg-blue-600 px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800">
          + 新建
        </button>
      </div>
    </header>
  );
}
