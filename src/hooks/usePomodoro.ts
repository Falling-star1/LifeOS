import { useState, useCallback } from 'react';
import {
  savePomodoroSession,
  getPomodoroSessions,
  getPomodoroTodayStats,
  PomodoroSession,
  PomodoroTodayStats,
} from '@/services/pomodoroService';

export function usePomodoro() {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [todayStats, setTodayStats] = useState<PomodoroTodayStats>({ completed_count: 0, total_minutes: 0 });
  const [loading, setLoading] = useState(false);

  const saveSession = useCallback(async (durationMinutes: number, completed: boolean, studyPlanId?: string | null) => {
    const session = await savePomodoroSession(durationMinutes, completed, studyPlanId ?? null);
    setSessions(prev => [session, ...prev]);
    const stats = await getPomodoroTodayStats();
    setTodayStats(stats);
    return session;
  }, []);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPomodoroSessions();
      setSessions(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTodayStats = useCallback(async () => {
    const stats = await getPomodoroTodayStats();
    setTodayStats(stats);
  }, []);

  return { sessions, todayStats, loading, saveSession, loadSessions, loadTodayStats };
}