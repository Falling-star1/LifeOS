import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useStudyStore } from '@/stores';
import { usePomodoroStore } from '@/stores';
import ConfirmModal from '@/components/ConfirmModal';

const colorMap: Record<string, { bar: string; bg: string; text: string }> = {
  blue: { bar: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  orange: { bar: 'bg-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
  purple: { bar: 'bg-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  green: { bar: 'bg-green-500', bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
};

const STUDY_STORAGE_KEY = 'lifeos_current_study_plan_id';

function formatSessionTime(unix: number) {
  const d = new Date(unix * 1000);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}

export default function StudyPage() {
  const navigate = useNavigate();
  const { plans, loading, loadPlans, addPlan, editPlan, removePlan } = useStudyStore();
  const { sessions, loadSessions } = usePomodoroStore();
  const isMobile = useIsMobile();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newColor, setNewColor] = useState('blue');
  const [deletePlanTarget, setDeletePlanTarget] = useState<{id: string; title: string} | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editHours, setEditHours] = useState('');
  const [newHours, setNewHours] = useState('');
  const [activePlanId, setActivePlanId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STUDY_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => { loadPlans(); loadSessions(); }, [loadPlans, loadSessions]);

  useEffect(() => {
    try {
      if (activePlanId) localStorage.setItem(STUDY_STORAGE_KEY, activePlanId);
      else localStorage.removeItem(STUDY_STORAGE_KEY);
    } catch {}
  }, [activePlanId]);

  const totalProgress = plans.length > 0 ? Math.round(plans.reduce((sum, p) => sum + (p.total_hours > 0 ? (p.completed_hours / p.total_hours) * 100 : 0), 0) / plans.length) : 0;
  const todayCount = sessions.length;
  const todayMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const activePlan = plans.find(p => p.id === activePlanId) || null;
  const recentSessions = sessions.slice(0, 8);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await addPlan(newTitle.trim(), newCategory.trim() || '未分类', newColor, parseFloat(newHours) || 20);
    setNewTitle(''); setNewCategory(''); setNewHours('');
    setShowAdd(false);
  };

  const startFocusForPlan = (planId: string) => {
    setActivePlanId(planId);
    navigate('/pomodoro');
  };

  const startEditPlan = (plan: {id: string; title: string; total_hours: number}) => {
    setEditingPlanId(plan.id);
    setEditTitle(plan.title);
    setEditHours(String(plan.total_hours));
  };

  const saveEditPlan = async () => {
    if (!editingPlanId || !editTitle.trim()) return;
    await editPlan(editingPlanId, editTitle.trim(), parseFloat(editHours) || 20);
    setEditingPlanId(null);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">学习计划</h1>
        <p className="mt-1 text-[13px] text-gray-500">{plans.length} 个计划进行中</p>
      </div>

      <div className={`mb-4 grid gap-3 md:mb-6 md:grid-cols-3 md:gap-4 ${isMobile ? 'grid-cols-3' : ''}`}>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800/60 dark:bg-gray-900/50 md:p-4">
          <span className="text-[12px] text-gray-500 md:text-[13px]">进行中</span>
          <div className="mt-1 text-xl font-bold text-blue-600 dark:text-blue-400 md:text-2xl">{plans.filter(p => p.status === 'active').length}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800/60 dark:bg-gray-900/50 md:p-4">
          <span className="text-[12px] text-gray-500 md:text-[13px]">今日专注</span>
          <div className="mt-1 text-xl font-bold text-green-600 dark:text-green-400 md:text-2xl">{todayMinutes}m</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800/60 dark:bg-gray-900/50 md:p-4">
          <span className="text-[12px] text-gray-500 md:text-[13px]">平均进度</span>
          <div className="mt-1 text-xl font-bold text-purple-600 dark:text-purple-400 md:text-2xl">{totalProgress}%</div>
        </div>
      </div>

      {activePlan && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800/60 dark:bg-gray-900/50 md:mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] text-gray-500">当前计划</p>
              <p className="truncate text-[15px] font-semibold text-gray-900 dark:text-gray-100">{activePlan.title}</p>
              <p className="mt-1 text-[12px] text-gray-500">今日番茄 {todayCount} 个 · {todayMinutes} 分钟</p>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <button onClick={() => startFocusForPlan(activePlan.id)} className="rounded-lg bg-blue-600 px-3 py-2 text-[12px] font-medium text-white active:bg-blue-700">开始专注</button>
              <button onClick={() => setActivePlanId(null)} className="rounded-lg border border-gray-300 px-3 py-2 text-[12px] text-gray-600 active:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:active:bg-gray-800">清除</button>
            </div>
          </div>
        </div>
      )}

      {loading && plans.length === 0 ? (
        <div className="py-12 text-center text-gray-400">加载中...</div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => {
            const c = colorMap[plan.color] || colorMap.blue;
            const progress = plan.total_hours > 0 ? Math.round((plan.completed_hours / plan.total_hours) * 100) : 0;
            const isActive = plan.id === activePlanId;
            return (
              <div key={plan.id} className={`group rounded-xl border bg-gray-50 p-4 transition-colors dark:bg-gray-900/50 md:p-5 ${isActive ? 'border-blue-400 dark:border-blue-500/40' : 'border-gray-200 dark:border-gray-800/60'}`}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[14px] font-medium text-gray-900 dark:text-gray-100 md:text-[15px]">{plan.title}</h3>
                    <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${c.bg} ${c.text}`}>{plan.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="ml-2 flex-shrink-0 text-[15px] font-bold text-gray-800 dark:text-gray-200">{progress}%</span>
                    <button onClick={() => startEditPlan(plan)} className="rounded-md p-1 text-gray-300 opacity-0 transition-all hover:text-blue-500 group-hover:opacity-100 dark:text-gray-600 dark:hover:text-blue-400" title="编辑">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                    </button>
                    <button onClick={() => removePlan(plan.id)} className="rounded-md p-1 text-gray-300 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100 dark:text-gray-600 dark:hover:text-red-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <div className="mt-3 md:mt-4">
                  <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800">
                    <div className={`h-full rounded-full transition-all duration-500 ${c.bar}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-[12px] text-gray-400 dark:text-gray-500">
                    <span>{Math.round(plan.completed_hours)}h / {Math.round(plan.total_hours)}h</span>
                    <span>剩余 {Math.round(plan.total_hours - plan.completed_hours)}h</span>
                  </div>
                </div>
                {editingPlanId === plan.id ? (
                  <div className="mt-3 space-y-2">
                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                    <input type="number" value={editHours} onChange={(e) => setEditHours(e.target.value)} placeholder="总时长(h)"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                    <div className="flex gap-2">
                      <button onClick={saveEditPlan} className="rounded-lg bg-blue-600 px-3 py-2 text-[12px] font-medium text-white active:bg-blue-700">保存</button>
                      <button onClick={() => setEditingPlanId(null)} className="rounded-lg border border-gray-300 px-3 py-2 text-[12px] text-gray-600 active:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:active:bg-gray-800">取消</button>
                    </div>
                  </div>
                ) : (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => startFocusForPlan(plan.id)} className="rounded-lg bg-blue-600 px-3 py-2 text-[12px] font-medium text-white active:bg-blue-700">开始专注</button>
                  <button onClick={() => { setActivePlanId(plan.id); }} className={`rounded-lg border px-3 py-2 text-[12px] font-medium active:bg-gray-100 dark:active:bg-gray-800 ${isActive ? 'border-blue-400 text-blue-600 dark:border-blue-500/40 dark:text-blue-400' : 'border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300'}`}>
                    {isActive ? '已选择' : '设为当前'}
                  </button>
                </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {recentSessions.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800/60 dark:bg-gray-900/50">
          <p className="mb-2 text-[12px] font-medium text-gray-500">最近完成</p>
          <div className="space-y-2">
            {recentSessions.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-[12px] dark:bg-gray-800/50">
                <span className="text-gray-700 dark:text-gray-300">{formatSessionTime(s.created_at)}</span>
                <span className="text-gray-500 dark:text-gray-400">{s.duration_minutes} 分钟</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAdd ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800/60 dark:bg-gray-900/50">
          <div className="space-y-3">
            <input type="text" placeholder="计划名称" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500" />
            <div className="flex gap-3">
              <input type="text" placeholder="分类 (如: 编程)" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500" />
              <input type="number" placeholder="总时长(h)" value={newHours} onChange={(e) => setNewHours(e.target.value)}
                className="w-28 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500" />
            </div>
            <div className="flex gap-2">
              {['blue', 'orange', 'purple', 'green'].map((c) => (
                <button key={c} onClick={() => setNewColor(c)}
                  className={`h-8 w-8 rounded-full ${colorMap[c].bar} ${newColor === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-gray-400' : ''}`} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="rounded-lg bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white active:bg-blue-700">创建</button>
              <button onClick={() => setShowAdd(false)} className="rounded-lg border border-gray-300 px-4 py-2.5 text-[13px] text-gray-600 active:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:active:bg-gray-800">取消</button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-3 text-[14px] text-gray-400 transition-colors active:border-gray-400 active:text-gray-500 dark:border-gray-700/60 dark:text-gray-500 md:py-4">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          添加学习计划
        </button>
      )}
      {deletePlanTarget && (
        <ConfirmModal
          title={"删除学习计划"}
          message={`确定要删除「${deletePlanTarget.title}」吗？此操作无法撤销。`}
          confirmLabel={"删除"}
          danger
          onConfirm={async () => { await removePlan(deletePlanTarget.id); if (activePlanId === deletePlanTarget.id) setActivePlanId(null); setDeletePlanTarget(null); }}
          onCancel={() => setDeletePlanTarget(null)}
        />
      )}
    </div>
  );
}