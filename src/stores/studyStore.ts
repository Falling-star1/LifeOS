import { create } from 'zustand';
import { StudyPlan } from '@/types/studyPlan';
import { getStudyPlans, createStudyPlan, updateStudyPlan, updateStudyPlanHours, deleteStudyPlan } from '@/services/studyService';

interface StudyStore {
  plans: StudyPlan[];
  loading: boolean;
  loadPlans: () => Promise<void>;
  addPlan: (title: string, category: string, color: string, totalHours: number) => Promise<StudyPlan>;
  editPlan: (id: string, title: string, totalHours: number) => Promise<void>;
  updateHours: (id: string, hours: number) => Promise<void>;
  removePlan: (id: string) => Promise<void>;
}

export const useStudyStore = create<StudyStore>((set) => ({
  plans: [],
  loading: false,

  loadPlans: async () => {
    set({ loading: true });
    try {
      const data = await getStudyPlans();
      set({ plans: data });
    } finally {
      set({ loading: false });
    }
  },

  addPlan: async (title, category, color, totalHours) => {
    const plan = await createStudyPlan(title, category, color, totalHours);
    set(s => ({ plans: [...s.plans, plan] }));
    return plan;
  },

  editPlan: async (id, title, totalHours) => {
    const updated = await updateStudyPlan(id, title, totalHours);
    set(s => ({ plans: s.plans.map(p => p.id === id ? updated : p) }));
  },

  updateHours: async (id, hours) => {
    await updateStudyPlanHours(id, hours);
    set(s => ({
      plans: s.plans.map(p => p.id === id ? { ...p, completed_hours: p.completed_hours + hours, updated_at: Math.floor(Date.now() / 1000) } : p),
    }));
  },

  removePlan: async (id) => {
    await deleteStudyPlan(id);
    set(s => ({ plans: s.plans.filter(p => p.id !== id) }));
  },
}));
