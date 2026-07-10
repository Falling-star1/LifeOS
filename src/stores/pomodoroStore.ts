import { create } from 'zustand';
import { savePomodoroSession, getPomodoroSessions, getPomodoroTodayStats } from '@/services/pomodoroService';
import type { PomodoroSession, PomodoroTodayStats } from '@/services/pomodoroService';

interface PomodoroStore {
  sessions: PomodoroSession[];
  todayStats: PomodoroTodayStats;
  loadSessions: () => Promise<void>;
  loadTodayStats: () => Promise<void>;
  saveSession: (durationMinutes: number, completed: boolean, studyPlanId?: string | null) => Promise<void>;
}

export const usePomodoroStore = create<PomodoroStore>((set) => ({
  sessions: [],
  todayStats: { completed_count: 0, total_minutes: 0 },

  loadSessions: async () => {
    const data = await getPomodoroSessions();
    set({ sessions: data });
  },

  loadTodayStats: async () => {
    const data = await getPomodoroTodayStats();
    set({ todayStats: data });
  },

  saveSession: async (durationMinutes, completed, studyPlanId) => {
    await savePomodoroSession(durationMinutes, completed, studyPlanId ?? null);
    await usePomodoroStore.getState().loadSessions();
    await usePomodoroStore.getState().loadTodayStats();
  },
}));
