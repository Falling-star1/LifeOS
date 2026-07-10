import { invoke } from '@tauri-apps/api/core';

export interface PomodoroSession {
  id: string;
  duration_minutes: number;
  completed: number;
  study_plan_id?: string | null;
  created_at: number;
}

export interface PomodoroTodayStats {
  completed_count: number;
  total_minutes: number;
}

export async function savePomodoroSession(durationMinutes: number, completed: boolean, studyPlanId?: string | null): Promise<PomodoroSession> {
  return invoke('save_pomodoro_session', { durationMinutes, completed, studyPlanId: studyPlanId ?? null });
}

export async function getPomodoroSessions(): Promise<PomodoroSession[]> {
  return invoke('get_pomodoro_sessions');
}

export async function getPomodoroTodayStats(): Promise<PomodoroTodayStats> {
  return invoke('get_pomodoro_today_stats');
}