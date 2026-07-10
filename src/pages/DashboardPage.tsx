import { useEffect, useMemo } from 'react';
import { exportData, importData } from '@/services/dataService';
import { useTaskStore, usePomodoroStore, useStudyStore } from '@/stores';

/* --- 简易环形进度条 --- */
function DonutRing({ percent, size = 120, stroke = 10 }: { percent: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  const center = size / 2;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke}
        className="text-gray-200 dark:text-gray-800" />
      <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
        className="text-blue-500 transition-all duration-500" />
    </svg>
  );
}

/* --- 简易柱状图 --- */
function BarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-2" style={{ height: 140 }}>
      {data.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[11px] tabular-nums text-gray-500 dark:text-gray-400">{v}</span>
          <div className="w-full rounded-t-md bg-blue-500/80 dark:bg-blue-400/70 transition-all duration-300"
            style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? 4 : 0 }} />
          <span className="text-[10px] text-gray-400 dark:text-gray-500">{labels[i]}</span>
        </div>
      ))}

      {/* 数据导出/导入 */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800/60 dark:bg-gray-900/50">
        <p className="mb-3 text-[13px] font-medium text-gray-700 dark:text-gray-300">数据管理</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={async () => {
            try {
              const json = await exportData();
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `lifeos-backup-${new Date().toISOString().slice(0,10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            } catch (e) { alert('导出失败: ' + e); }
          }} className="rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-medium text-white active:bg-blue-700">
            📦 导出数据
          </button>
          <label className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-[13px] font-medium text-gray-700 transition-colors active:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:active:bg-gray-800">
            📥 导入数据
            <input type="file" accept=".json" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (!confirm('导入将覆盖所有现有数据，确定继续吗？')) return;
              try {
                const text = await file.text();
                await importData(text);
                alert('导入成功！页面将刷新。');
                window.location.reload();
              } catch (err) { alert('导入失败: ' + err); }
              e.target.value = '';
            }} />
          </label>
        </div>
      </div>
    </div>
  );
}

/* --- 主页面 --- */
export default function DashboardPage() {
  const { tasks, loadTasks } = useTaskStore();
  const { sessions, todayStats, loadSessions, loadTodayStats } = usePomodoroStore();
  const { plans, loadPlans } = useStudyStore();

  useEffect(() => {
    loadTasks();
    loadSessions();
    loadTodayStats();
    loadPlans();
  }, [loadTasks, loadSessions, loadTodayStats, loadPlans]);

  /* 任务统计 */
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  /* 学习计划统计 */
  const planCount = plans.length;
  const avgProgress = planCount > 0
    ? Math.round(plans.reduce((s, p) => s + (p.total_hours > 0 ? (p.completed_hours / p.total_hours) * 100 : 0), 0) / planCount)
    : 0;

  /* 最近7天番茄趋势 */
  const weeklyData = useMemo(() => {
    const now = new Date();
    const days: number[] = [];
    const labels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 1000;
      const dayEnd = dayStart + 86400;
      const count = sessions.filter(s => s.created_at >= dayStart && s.created_at < dayEnd && s.completed === 1).length;
      days.push(count);
      labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }
    return { days, labels };
  }, [sessions]);

  /* 最近完成的任务 */
  const recentDone = useMemo(
    () => tasks.filter(t => t.status === 'done').sort((a, b) => b.updated_at - a.updated_at).slice(0, 5),
    [tasks],
  );

  const statCards = [
    { label: '总任务数', value: totalTasks, color: 'text-gray-900 dark:text-gray-100' },
    { label: '已完成', value: doneTasks, color: 'text-green-600 dark:text-green-400' },
    { label: '进行中', value: inProgressTasks, color: 'text-blue-600 dark:text-blue-400' },
    { label: '今日番茄', value: todayStats.completed_count, color: 'text-red-500 dark:text-red-400' },
    { label: '今日专注', value: `${todayStats.total_minutes}分`, color: 'text-orange-500 dark:text-orange-400' },
    { label: '学习计划', value: planCount, color: 'text-purple-600 dark:text-purple-400' },
    { label: '平均进度', value: `${avgProgress}%`, color: 'text-indigo-600 dark:text-indigo-400' },
  ];

  return (
    <div className="flex h-full flex-col p-4 pb-24 md:p-6 md:pb-6">
      {/* 标题 */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">仪表盘</h1>
        <p className="mt-1 text-[13px] text-gray-500">你的生活概览</p>
      </div>

      {/* 统计卡片网格 */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {statCards.map(card => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800/60 dark:bg-gray-900/50">
            <p className="text-[12px] text-gray-500">{card.label}</p>
            <div className={`mt-1 text-2xl font-bold ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* 下方两栏 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 任务完成率 */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800/60 dark:bg-gray-900/50">
          <p className="mb-3 text-[13px] font-medium text-gray-700 dark:text-gray-300">任务完成率</p>
          <div className="flex flex-col items-center">
            <div className="relative">
              <DonutRing percent={completionRate} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completionRate}%</span>
                <span className="text-[11px] text-gray-500">{doneTasks}/{totalTasks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 本周番茄趋势 */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800/60 dark:bg-gray-900/50">
          <p className="mb-3 text-[13px] font-medium text-gray-700 dark:text-gray-300">本周番茄趋势</p>
          <BarChart data={weeklyData.days} labels={weeklyData.labels} />
        </div>
      </div>

      {/* 最近完成的任务 */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800/60 dark:bg-gray-900/50">
        <p className="mb-2 text-[13px] font-medium text-gray-700 dark:text-gray-300">最近完成的任务</p>
        {recentDone.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-gray-400">暂无已完成任务</p>
        ) : (
          <div className="space-y-2">
            {recentDone.map(t => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 dark:bg-gray-800/50">
                <span className="text-green-500">✓</span>
                <span className="flex-1 truncate text-[13px] text-gray-800 line-through decoration-gray-400 dark:text-gray-300 dark:decoration-gray-600">{t.title}</span>
                <span className="flex-shrink-0 text-[11px] text-gray-400">
                  {new Date(t.updated_at * 1000).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
