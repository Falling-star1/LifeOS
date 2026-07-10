import { useState, useCallback } from 'react';
import { StudyPlan } from '@/types/studyPlan';
import { getStudyPlans, createStudyPlan, updateStudyPlanHours, deleteStudyPlan } from '@/services/studyService';

export function useStudyPlans() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudyPlans();
      setPlans(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPlan = useCallback(async (title: string, category: string, color: string, totalHours: number) => {
    const plan = await createStudyPlan(title, category, color, totalHours);
    setPlans(prev => [plan, ...prev]);
    return plan;
  }, []);

  const updateHours = useCallback(async (id: string, completedHours: number) => {
    const updated = await updateStudyPlanHours(id, completedHours);
    setPlans(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  }, []);

  const removePlan = useCallback(async (id: string) => {
    await deleteStudyPlan(id);
    setPlans(prev => prev.filter(p => p.id !== id));
  }, []);

  return { plans, loading, loadPlans, addPlan, updateHours, removePlan };
}
