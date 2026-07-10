import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { usePomodoroStore } from '@/stores';
import { useStudyStore } from '@/stores';
import { useTaskStore } from '@/stores';
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer';

const PRESET_OPTIONS = [
  { label: '15/3', work: 15, breakMin: 3 },
  { label: '25/5', work: 25, breakMin: 5 },
  { label: '30/5', work: 30, breakMin: 5 },
  { label: '45/10', work: 45, breakMin: 10 },
  { label: '50/10', work: 50, breakMin: 10 },
  { label: '60/15', work: 60, breakMin: 15 },
];

function formatSessionTime(unix: number) {
  const d = new Date(unix * 1000);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}

export default function PomodoroPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { sessions, todayStats, saveSession, loadSessions, loadTodayStats } = usePomodoroStore();
  const { plans, loadPlans } = useStudyStore();
  const { tasks, loadTasks } = useTaskStore();
  const timer = usePomodoroTimer(saveSession);

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => { loadTodayStats(); loadSessions(); loadPlans(); loadTasks(); }, [loadTodayStats, loadSessions, loadPlans, loadTasks]);

  const currentPlan = plans.find(p => p.id === timer.currentPlanId) || null;
  const availableTasks = tasks.filter(t => t.status !== 'done');
  const currentTask = tasks.find(t => t.id === timer.currentTaskId) || null;
  const currentTaskTitle = currentTask?.title || timer.currentTaskTitle || null;
  const minutes = Math.floor(timer.secondsLeft / 60);
  const seconds = timer.secondsLeft % 60;
  const progress = timer.totalSeconds > 0 ? ((timer.totalSeconds - timer.secondsLeft) / timer.totalSeconds) * 100 : 0;
  const circleSize = isMobile ? 220 : 280;
  const radius = isMobile ? 95 : 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const center = circleSize / 2;

  const phaseLabel = timer.phase === 'work' ? '专注中' : timer.phase === 'break' ? '休息中' : '准备开始';
  const statusLabel = timer.status === 'running' ? '运行中' : timer.status === 'paused' ? '已暂停' : '';
  const displayMinutes = timer.elapsedWorkSeconds > 0 ? Math.ceil(timer.elapsedWorkSeconds / 60) : todayStats.total_minutes;

  function handleTaskChange(value: string) {
    if (!value) {
      timer.setTaskId(null);
      return;
    }
    const task = availableTasks.find(t => t.id === value);
    timer.setTaskId(value, task?.title ?? null);
  }

  return (
    <div className="flex h-full flex-col p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">番茄钟</h1>
        <p className="mt-1 text-[13px] text-gray-500">已完成 {todayStats.completed_count} 个番茄</p>
      </div>

      {/* 当前计划 */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800/60 dark:bg-gray-900/50">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] text-gray-500">当前学习计划</p>
            <p className="truncate text-[14px] font-medium text-gray-900 dark:text-gray-100">{currentPlan ? currentPlan.title : '未选择（通用番茄）'}</p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <select value={timer.currentPlanId || ''} onChange={(e) => timer.setPlanId(e.target.value || null)}
              className="max-w-[160px] truncate rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-[12px] text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
              <option value="">通用番茄</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            {currentPlan && (
              <button onClick={() => navigate('/study')} className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-[12px] text-gray-600 active:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:active:bg-gray-800">查看计划</button>
            )}
          </div>
        </div>
      </div>

      {/* 关联任务 */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800/60 dark:bg-gray-900/50">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] text-gray-500">关联任务</p>
            <p className="truncate text-[14px] font-medium text-gray-900 dark:text-gray-100">{currentTaskTitle || '未选择'}</p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <select value={timer.currentTaskId || ''} onChange={(e) => handleTaskChange(e.target.value)}
              className="max-w-[160px] truncate rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-[12px] text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
              <option value="">不关联任务</option>
              {availableTasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            {currentTaskTitle && (
              <button onClick={() => timer.setTaskId(null)} className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-[12px] text-gray-600 active:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:active:bg-gray-800">取消关联</button>
            )}
          </div>
        </div>
      </div>

      {/* 时长选择 - 仅 idle 时显示 */}
      {timer.phase === 'idle' && !showSettings && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] text-gray-500">选择时长</p>
            <button onClick={() => setShowSettings(true)} className="text-[11px] text-blue-500 active:text-blue-600">自定义</button>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {PRESET_OPTIONS.map(p => (
              <button key={p.label} onClick={() => timer.updateSettings({ ...timer.settings, workMinutes: p.work, breakMinutes: p.breakMin })}
                className={`flex-shrink-0 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors ${timer.settings.workMinutes === p.work && timer.settings.breakMinutes === p.breakMin ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 自定义时长设置 */}
      {timer.phase === 'idle' && showSettings && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800/60 dark:bg-gray-900/50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] text-gray-500">自定义时长</p>
            <button onClick={() => setShowSettings(false)} className="text-[11px] text-blue-500 active:text-blue-600">返回预设</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] text-gray-500">专注（分钟）</label>
              <input type="number" min={1} max={120} value={timer.settings.workMinutes}
                onChange={(e) => timer.updateSettings({ ...timer.settings, workMinutes: Number(e.target.value) || 1 })}
                className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-[13px] text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-gray-500">休息（分钟）</label>
              <input type="number" min={1} max={30} value={timer.settings.breakMinutes}
                onChange={(e) => timer.updateSettings({ ...timer.settings, breakMinutes: Number(e.target.value) || 1 })}
                className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-[13px] text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[12px] text-gray-500">自动开始休息</span>
            <button onClick={() => timer.updateSettings({ ...timer.settings, autoBreak: !timer.settings.autoBreak })}
              className={`relative h-5 w-9 rounded-full transition-colors ${timer.settings.autoBreak ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${timer.settings.autoBreak ? 'left-[18px]' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
      )}

      {/* 计时器圆环 */}
      <div className="flex flex-1 items-center justify-center">
        <div className="relative" style={{ width: circleSize, height: circleSize }}>
          <svg width={circleSize} height={circleSize} className="-rotate-90">
            <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeWidth={8}
              className="text-gray-200 dark:text-gray-800" />
            <circle cx={center} cy={center} r={radius} fill="none" strokeWidth={8} strokeLinecap="round"
              className={`${timer.phase === 'work' ? 'stroke-blue-500 dark:stroke-blue-400' : timer.phase === 'break' ? 'stroke-green-500 dark:stroke-green-400' : 'stroke-gray-400 dark:stroke-gray-600'}`}
              style={{ strokeDasharray: circumference, strokeDashoffset: strokeDashoffset }} />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={`font-light tabular-nums tracking-tight text-gray-900 dark:text-gray-100 ${isMobile ? 'text-5xl' : 'text-6xl'}`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className={`mt-2 text-[14px] font-medium ${timer.phase === 'work' ? 'text-blue-500 dark:text-blue-400' : timer.phase === 'break' ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
              {phaseLabel}
            </span>
            {statusLabel && (
              <span className={`mt-1 text-[11px] font-medium ${timer.status === 'paused' ? 'text-yellow-500 dark:text-yellow-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {statusLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className={`mt-8 flex gap-3 md:mt-10 md:gap-4 ${isMobile ? 'flex-col w-full px-8' : ''}`}>
        {timer.phase === 'idle' ? (
          <button onClick={() => timer.startPhase('work')} className="rounded-xl bg-blue-600 px-8 py-3 text-[15px] font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800">开始专注</button>
        ) : timer.status === 'paused' ? (
          <>
            <button onClick={timer.resume} className="rounded-xl bg-blue-600 px-8 py-3 text-[15px] font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800">继续</button>
            <button onClick={timer.finishWork} className="rounded-xl bg-green-500 px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-green-600 active:bg-green-700">结束并记录</button>
            <button onClick={timer.stop} className="rounded-xl border border-gray-300 bg-gray-100 px-6 py-3 text-[15px] font-medium text-gray-700 transition-colors hover:bg-gray-200 active:bg-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600">放弃</button>
          </>
        ) : (
          <>
            <button onClick={timer.pause} className="rounded-xl border border-gray-300 bg-gray-100 px-6 py-3 text-[15px] font-medium text-gray-700 transition-colors hover:bg-gray-200 active:bg-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600">暂停</button>
            {timer.phase === 'work' && (
              <button onClick={timer.finishWork} className="rounded-xl bg-green-500 px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-green-600 active:bg-green-700">结束并记录</button>
            )}
            <button onClick={timer.skipPhase} className="rounded-xl border border-gray-300 bg-gray-100 px-6 py-3 text-[15px] font-medium text-gray-700 transition-colors hover:bg-gray-200 active:bg-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600">跳过 → {timer.phase === 'work' ? '休息' : '专注'}</button>
          </>
        )}
      </div>

      {/* 统计卡片 */}
      <div className={`mt-6 grid gap-3 md:mt-8 md:gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 max-w-md mx-auto w-full'}`}>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-800/60 dark:bg-gray-900/50">
          <p className="text-[12px] text-gray-500">今日番茄</p>
          <div className="text-2xl font-bold text-blue-500 dark:text-blue-400 md:text-3xl">{todayStats.completed_count}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-800/60 dark:bg-gray-900/50">
          <p className="text-[12px] text-gray-500">专注分钟</p>
          <div className="text-2xl font-bold text-green-500 dark:text-green-400 md:text-3xl">{displayMinutes}</div>
        </div>
      </div>

      {/* 最近记录 */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800/60 dark:bg-gray-900/50">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] font-medium text-gray-500">最近完成</p>
        </div>
        <div className="space-y-2">
          {sessions.slice(0, 5).map(s => (
            <div key={s.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-[12px] dark:bg-gray-800/50">
              <span className="text-gray-700 dark:text-gray-300">{formatSessionTime(s.created_at)}</span>
              <span className="text-gray-500 dark:text-gray-400">{s.duration_minutes} 分钟</span>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="py-3 text-center text-[12px] text-gray-400">暂无记录</p>
          )}
        </div>
      </div>
    </div>
  );
}
