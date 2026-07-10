import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { useState, useEffect } from 'react';
import { updateTaskStatus } from '@/services/taskService';

type Phase = 'work' | 'break' | 'idle';
type TimerStatus = 'running' | 'paused' | 'idle';

export interface PomodoroSettings {
  workMinutes: number;
  breakMinutes: number;
  autoBreak: boolean;
}

const SETTINGS_KEY = 'lifeos_pomodoro_settings';
const TIMER_KEY = 'lifeos_pomodoro_timer';
const PLAN_KEY = 'lifeos_current_study_plan_id';
const TASK_KEY = 'lifeos_current_task_id';
const TASK_TITLE_KEY = 'lifeos_current_task_title';

const DEFAULT_SETTINGS: PomodoroSettings = { workMinutes: 25, breakMinutes: 5, autoBreak: true };

function loadSettings(): PomodoroSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function loadTimerState(): { phase: Phase; status: TimerStatus; secondsLeft: number; totalSeconds: number; elapsedWorkSeconds: number; savedAt: number } | null {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

interface TimerSnapshot {
  phase: Phase;
  status: TimerStatus;
  secondsLeft: number;
  totalSeconds: number;
  elapsedWorkSeconds: number;
}

let globalPhase: Phase = 'idle';
let globalStatus: TimerStatus = 'idle';
let globalSecondsLeft = DEFAULT_SETTINGS.workMinutes * 60;
let globalTotalSeconds = DEFAULT_SETTINGS.workMinutes * 60;
let globalElapsedWorkSeconds = 0;
let globalSettings: PomodoroSettings = loadSettings();
let globalCurrentPlanId: string | null = (() => { try { return localStorage.getItem(PLAN_KEY) || null; } catch { return null; } })();
let globalCurrentTaskId: string | null = (() => { try { return localStorage.getItem(TASK_KEY) || null; } catch { return null; } })();
let globalCurrentTaskTitle: string | null = (() => { try { return localStorage.getItem(TASK_TITLE_KEY) || null; } catch { return null; } })();

const listeners = new Set<() => void>();

function notifyListeners() { listeners.forEach(fn => fn()); }

function persistTimer() {
  try {
    localStorage.setItem(TIMER_KEY, JSON.stringify({
      phase: globalPhase,
      status: globalStatus,
      secondsLeft: globalSecondsLeft,
      totalSeconds: globalTotalSeconds,
      elapsedWorkSeconds: globalElapsedWorkSeconds,
      savedAt: Date.now(),
    }));
  } catch {}
}

function clearTimerPersist() {
  try { localStorage.removeItem(TIMER_KEY); } catch {}
}

function resetToIdle() {
  globalPhase = 'idle';
  globalStatus = 'idle';
  globalSecondsLeft = globalSettings.workMinutes * 60;
  globalTotalSeconds = globalSettings.workMinutes * 60;
  globalElapsedWorkSeconds = 0;
  clearTimerPersist();
}


async function notify(title: string, body: string) {
  try {
    let granted = await isPermissionGranted();
    if (!granted) {
      const permission = await requestPermission();
      granted = permission === 'granted';
    }
    if (granted) {
      sendNotification({ title, body });
    }
  } catch {}
}

async function markTaskInProgress() {
  if (!globalCurrentTaskId) return;
  try {
    await updateTaskStatus(globalCurrentTaskId, 'in_progress');
  } catch {}
}

(function restoreTimer() {
  const snap = loadTimerState();
  if (snap && snap.status === 'running') {
    const elapsed = Math.floor((Date.now() - snap.savedAt) / 1000);
    globalPhase = snap.phase;
    globalStatus = 'running';
    globalTotalSeconds = snap.totalSeconds;
    globalElapsedWorkSeconds = snap.elapsedWorkSeconds + (snap.phase === 'work' ? elapsed : 0);
    globalSecondsLeft = Math.max(0, snap.secondsLeft - elapsed);
    if (globalSecondsLeft <= 0) resetToIdle();
  } else if (snap && snap.status === 'paused') {
    globalPhase = snap.phase;
    globalStatus = 'paused';
    globalTotalSeconds = snap.totalSeconds;
    globalSecondsLeft = snap.secondsLeft;
    globalElapsedWorkSeconds = snap.elapsedWorkSeconds;
  }
})();

let tickInterval: ReturnType<typeof setInterval> | null = null;
let saveCallback: ((durationMinutes: number, completed: boolean, studyPlanId?: string | null) => Promise<any>) | null = null;

function startTick() {
  if (tickInterval) return;
  tickInterval = setInterval(() => {
    if (globalStatus !== 'running' || globalPhase === 'idle') return;

    globalSecondsLeft -= 1;
    if (globalPhase === 'work') globalElapsedWorkSeconds += 1;

    if (globalSecondsLeft <= 0) {
      if (globalPhase === 'work') {
        const workMin = globalSettings.workMinutes;
        if (saveCallback) saveCallback(workMin, true, globalCurrentPlanId);
        markTaskInProgress();
        notify('🍅 专注完成！', `已完成 ${workMin} 分钟专注，休息一下吧`);
        if (globalSettings.autoBreak) {
          globalPhase = 'break';
          globalStatus = 'running';
          globalSecondsLeft = globalSettings.breakMinutes * 60;
          globalTotalSeconds = globalSettings.breakMinutes * 60;
        } else {
          resetToIdle();
        }
      } else {
        notify('☕ 休息结束', '休息时间到，准备开始新的专注吧！');
        resetToIdle();
      }
      persistTimer();
      notifyListeners();
      return;
    }

    persistTimer();
    notifyListeners();
  }, 1000);
}

function stopTick() {
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
}

export function startPhaseGlobal(p: Phase) {
  const dur = p === 'work' ? globalSettings.workMinutes * 60 : globalSettings.breakMinutes * 60;
  globalPhase = p;
  globalSecondsLeft = dur;
  globalTotalSeconds = dur;
  globalStatus = 'running';
  if (p === 'work') globalElapsedWorkSeconds = 0;
  persistTimer();
  startTick();
  notifyListeners();
}

export function pauseGlobal() {
  globalStatus = 'paused';
  stopTick();
  persistTimer();
  notifyListeners();
}

export function resumeGlobal() {
  if (globalPhase === 'idle') return;
  globalStatus = 'running';
  startTick();
  persistTimer();
  notifyListeners();
}

export function stopGlobal() {
  stopTick();
  resetToIdle();
  notifyListeners();
}

export async function finishWorkGlobal() {
  stopTick();
  const workedMinutes = Math.ceil(globalElapsedWorkSeconds / 60);
  if (workedMinutes >= 1 && saveCallback) {
    await saveCallback(workedMinutes, true, globalCurrentPlanId);
  }
  await markTaskInProgress();
  resetToIdle();
  notifyListeners();
}

export async function skipPhaseGlobal() {
  stopTick();
  if (globalPhase === 'work') {
    const workedMinutes = Math.ceil(globalElapsedWorkSeconds / 60);
    if (workedMinutes >= 1 && saveCallback) {
      await saveCallback(workedMinutes, true, globalCurrentPlanId);
    }
    await markTaskInProgress();
  }
  if (globalSettings.autoBreak) {
    startPhaseGlobal(globalPhase === 'work' ? 'break' : 'work');
  } else {
    resetToIdle();
    notifyListeners();
  }
}

export function updateSettingsGlobal(s: PomodoroSettings) {
  globalSettings = s;
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
  if (globalPhase === 'idle') {
    globalSecondsLeft = s.workMinutes * 60;
    globalTotalSeconds = s.workMinutes * 60;
    persistTimer();
  }
  notifyListeners();
}

export function setPlanIdGlobal(id: string | null) {
  globalCurrentPlanId = id;
  try {
    if (id) localStorage.setItem(PLAN_KEY, id);
    else localStorage.removeItem(PLAN_KEY);
  } catch {}
  notifyListeners();
}

export function setTaskIdGlobal(taskId: string | null, taskTitle?: string | null) {
  globalCurrentTaskId = taskId;
  globalCurrentTaskTitle = taskTitle ?? null;
  try {
    if (taskId) {
      localStorage.setItem(TASK_KEY, taskId);
      if (taskTitle) localStorage.setItem(TASK_TITLE_KEY, taskTitle);
      else localStorage.removeItem(TASK_TITLE_KEY);
    } else {
      localStorage.removeItem(TASK_KEY);
      localStorage.removeItem(TASK_TITLE_KEY);
    }
  } catch {}
  notifyListeners();
}

export function getGlobalTimer(): TimerSnapshot {
  return {
    phase: globalPhase,
    status: globalStatus,
    secondsLeft: globalSecondsLeft,
    totalSeconds: globalTotalSeconds,
    elapsedWorkSeconds: globalElapsedWorkSeconds,
  };
}

export function getGlobalSettings(): PomodoroSettings { return globalSettings; }
export function getGlobalPlanId(): string | null { return globalCurrentPlanId; }
export function getGlobalTaskId(): string | null { return globalCurrentTaskId; }
export function getGlobalTaskTitle(): string | null { return globalCurrentTaskTitle; }

export function usePomodoroTimer(onSaveSession: (durationMinutes: number, completed: boolean, studyPlanId?: string | null) => Promise<any>) {
  saveCallback = onSaveSession;

  const [snapshot, setSnapshot] = useState<TimerSnapshot>(getGlobalTimer);

  useEffect(() => {
    const handler = () => setSnapshot({ ...getGlobalTimer() });
    listeners.add(handler);
    if (globalStatus === 'running') startTick();
    return () => { listeners.delete(handler); };
  }, []);

  return {
    phase: snapshot.phase,
    status: snapshot.status,
    secondsLeft: snapshot.secondsLeft,
    totalSeconds: snapshot.totalSeconds,
    elapsedWorkSeconds: snapshot.elapsedWorkSeconds,
    settings: getGlobalSettings(),
    currentPlanId: getGlobalPlanId(),
    currentTaskId: getGlobalTaskId(),
    currentTaskTitle: getGlobalTaskTitle(),
    startPhase: startPhaseGlobal,
    pause: pauseGlobal,
    resume: resumeGlobal,
    stop: stopGlobal,
    finishWork: finishWorkGlobal,
    skipPhase: skipPhaseGlobal,
    updateSettings: updateSettingsGlobal,
    setPlanId: setPlanIdGlobal,
    setTaskId: setTaskIdGlobal,
  };
}
