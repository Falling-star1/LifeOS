import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { globalSearch, SearchResult } from '@/services/searchService';

interface PageItem {
  id: string;
  type: 'page';
  title: string;
  icon: string;
  path: string;
}

const PAGES: PageItem[] = [
  { id: 'p1', type: 'page', title: '收件箱', icon: '📥', path: '/inbox' },
  { id: 'p2', type: 'page', title: '今日', icon: '☀️', path: '/today' },
  { id: 'p3', type: 'page', title: '日历', icon: '📅', path: '/calendar' },
  { id: 'p4', type: 'page', title: '学习计划', icon: '📚', path: '/study' },
  { id: 'p5', type: 'page', title: '番茄钟', icon: '🍅', path: '/pomodoro' },
  { id: 'p7', type: 'page', title: '仪表盘', icon: '📊', path: '/dashboard' },
  { id: 'p6', type: 'page', title: '备忘录', icon: '📝', path: '/notes' },
];

type DisplayItem = {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  path?: string;
};

const typeIcon: Record<string, string> = {
  task: '✅',
  note: '📝',
  study_plan: '📚',
};

const typePath: Record<string, string> = {
  task: '/inbox',
  note: '/notes',
  study_plan: '/study',
};

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setSearchResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim() === '') { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    try { setSearchResults(await globalSearch(q.trim())); }
    catch { setSearchResults([]); }
    finally { setSearching(false); }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value); setSelectedIndex(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 250);
  };

  const pageResults: DisplayItem[] = query.trim() === ''
    ? PAGES.map(p => ({ id: p.id, icon: p.icon, title: p.title, path: p.path }))
    : PAGES.filter(p => p.title.toLowerCase().includes(query.toLowerCase())).map(p => ({ id: p.id, icon: p.icon, title: p.title, path: p.path }));

  const dataResults: DisplayItem[] = searchResults.map(r => ({
    id: r.id, icon: typeIcon[r.result_type] || '🔍', title: r.title,
    subtitle: r.subtitle || undefined, path: typePath[r.result_type],
  }));

  const allResults: DisplayItem[] = [...pageResults, ...dataResults];
  useEffect(() => { setSelectedIndex(0); }, [allResults.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, allResults.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && allResults[selectedIndex]) { if (allResults[selectedIndex].path) navigate(allResults[selectedIndex].path!); onClose(); }
    else if (e.key === 'Escape') onClose();
  };

  const handleSelect = (r: DisplayItem) => { if (r.path) navigate(r.path); onClose(); };
  if (!open) return null;
  const hasQuery = query.trim() !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 md:pt-[20vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm dark:bg-black/60" />
      <div className={`relative w-full border border-gray-200 bg-white shadow-2xl dark:border-gray-700/60 dark:bg-gray-900 ${isMobile ? 'mx-3 rounded-xl' : 'max-w-lg rounded-xl'}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center border-b border-gray-200 px-4 dark:border-gray-800/60">
          <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input ref={inputRef} type="text" value={query} onChange={e => handleQueryChange(e.target.value)} onKeyDown={handleKeyDown} placeholder="搜索页面、任务、笔记..." className="flex-1 bg-transparent px-3 py-3.5 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100 dark:placeholder:text-gray-500" />
          {searching && <span className="text-[11px] text-gray-400">搜索中...</span>}
          {isMobile ? (
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 active:bg-gray-100 dark:text-gray-400 dark:active:bg-gray-800"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
          ) : <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-400 dark:bg-gray-800 dark:text-gray-500">ESC</kbd>}
        </div>
        <div className="max-h-[60vh] overflow-auto py-2 md:max-h-80">
          {allResults.length === 0 ? (
            <div className="px-4 py-6 text-center text-[13px] text-gray-400 dark:text-gray-500">{hasQuery && !searching ? '无搜索结果' : '输入关键词搜索...'}</div>
          ) : (
            <>
              {pageResults.length > 0 && (
                <>
                  {hasQuery && dataResults.length > 0 && <div className="px-4 py-1.5"><span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">页面</span></div>}
                  {pageResults.map((r, i) => (
                    <button key={r.id} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-gray-100 dark:active:bg-gray-800/50 md:py-2.5 ${i === selectedIndex ? 'bg-gray-100 dark:bg-gray-800/60' : ''}`} onClick={() => handleSelect(r)} onMouseEnter={() => !isMobile && setSelectedIndex(i)}>
                      <span className="text-lg md:text-base">{r.icon}</span>
                      <div><div className="text-[14px] text-gray-800 dark:text-gray-200">{r.title}</div>{r.subtitle && <div className="text-[12px] text-gray-500">{r.subtitle}</div>}</div>
                    </button>
                  ))}
                </>
              )}
              {dataResults.length > 0 && (
                <>
                  {pageResults.length > 0 && <div className="px-4 py-1.5"><span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">内容</span></div>}
                  {dataResults.map((r, i) => {
                    const gi = pageResults.length + i;
                    return (
                      <button key={r.id} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-gray-100 dark:active:bg-gray-800/50 md:py-2.5 ${gi === selectedIndex ? 'bg-gray-100 dark:bg-gray-800/60' : ''}`} onClick={() => handleSelect(r)} onMouseEnter={() => !isMobile && setSelectedIndex(gi)}>
                        <span className="text-lg md:text-base">{r.icon}</span>
                        <div className="min-w-0 flex-1"><div className="truncate text-[14px] text-gray-800 dark:text-gray-200">{r.title}</div>{r.subtitle && <div className="truncate text-[12px] text-gray-500">{r.subtitle}</div>}</div>
                      </button>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
        {!isMobile && (
          <div className="flex items-center gap-4 border-t border-gray-200 px-4 py-2.5 text-[11px] text-gray-400 dark:border-gray-800/60 dark:text-gray-500">
            <span>↑↓ 导航</span><span>↵ 选择</span><span>ESC 关闭</span>
          </div>
        )}
      </div>
    </div>
  );
}
