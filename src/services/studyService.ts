import { StudyPlan } from '@/types/studyPlan';
import { invoke } from '@tauri-apps/api/core';

export async function getStudyPlans(): Promise<StudyPlan[]> {
  return invoke('get_study_plans');
}

export async function createStudyPlan(title: string, category: string, color: string, totalHours: number): Promise<StudyPlan> {
  return invoke('create_study_plan', { title, category, color, totalHours });
}

export async function updateStudyPlan(id: string, title: string, totalHours: number): Promise<StudyPlan> {
  return invoke('update_study_plan', { id, title, totalHours });
}

export async function updateStudyPlanHours(id: string, completedHours: number): Promise<StudyPlan> {
  return invoke('update_study_plan_hours', { id, completedHours });
}

export async function deleteStudyPlan(id: string): Promise<void> {
  return invoke('delete_study_plan', { id });
}
