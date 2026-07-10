import { useState, useMemo, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useCalendar } from '@/hooks/useCalendar';
import { CalendarEvent } from '@/services/calendarService';
import { useTaskStore } from '@/stores';
import ConfirmModal from '@/components/ConfirmModal';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

const eventColors: { key: string; cls: string }[] = [
  { key: 'blue', cls: 'bg-blue-500' },
  { key: 'green', cls: 'bg-green-500' },
  { key: 'purple', cls: 'bg-purple-500' },
  { key: 'red', cls: 'bg-red-500' },
  { key: 'orange', cls: 'bg-orange-500' },
  { key: 'pink', cls: 'bg-pink-500' },
];

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year: number, month: number) { const day = new Date(year, month, 1).getDay(); return day === 0 ? 6 : day - 1; }

function toStartOfDay(year: number, month: number, day: number, hour: number, minute: number) {
  return Math.floor(new Date(year, month, day, hour, minute, 0).getTime() / 1000);
}

function formatDatetimeLocalFromUnix(unix?: number | null) {
  if (!unix) return '';
  const d = new Date(unix * 1000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${hh}:${mm}`;
}

function unixFromDatetimeLocal(value: string) {
  if (!value) return null;
  return Math.floor(new Date(value).getTime() / 1000);
}

function nextHourRange(year: number, month: number, day: number) {
  const now = new Date();
  const startHour = Math.max(8, Math.min(20, now.getHours() + 1));
  return {
    startUnix: toStartOfDay(year, month, day, startHour, 0),
    endUnix: toStartOfDay(year, month, day, startHour + 1, 0),
  };
}

type CalendarItem = {
  id: string;
  kind: 'event' | 'task';
  title: string;
  startUnix: number;
  endUnix?: number | null;
  allDay?: boolean;
  color: string;
  meta?: string;
};

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startLocal, setStartLocal] = useState('');
  const [endLocal, setEndLocal] = useState('');
  const [color, setColor] = useState('blue');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [deleteEventTarget, setDeleteEventTarget] = useState<string | null>(null);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { events, loadEvents, addEvent, editEvent, removeEvent } = useCalendar();
  const { tasks, loadTasks } = useTaskStore();

  const rangeStart = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0);
  const rangeEnd = new Date(currentYear, currentMonth + 2, 0, 23, 59, 59);

  const loadMonthEvents = useCallback(() => {
    loadEvents(Math.floor(rangeStart.getTime() / 1000), Math.floor(rangeEnd.getTime() / 1000));
    loadTasks();
  }, [currentYear, currentMonth]);

  useEffect(() => { loadMonthEvents(); }, [loadMonthEvents]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

  const calendarDays = useMemo(() => {
    const days: { day: number; isCurrentMonth: boolean; isToday: boolean; dayIndex: number }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) days.push({ day: prevMonthDays - i, isCurrentMonth: false, isToday: false, dayIndex: days.length });
    for (let d = 1; d <= daysInMonth; d++) days.push({ day: d, isCurrentMonth: true, isToday: d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear(), dayIndex: days.length });
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) days.push({ day: d, isCurrentMonth: false, isToday: false, dayIndex: days.length });
    return days;
  }, [currentYear, currentMonth, daysInMonth, firstDay, prevMonthDays, today]);

  const calendarItemsByDay = useMemo(() => {
    const map: Record<number, CalendarItem[]> = {};
    const monthStartUnix = Math.floor(new Date(currentYear, currentMonth, 1, 0, 0, 0).getTime() / 1000);
    const monthEndUnix = Math.floor(new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).getTime() / 1000);

    events.forEach((ev) => {
      const evEnd = ev.end_time ?? ev.start_time;
      if (evEnd < monthStartUnix || ev.start_time > monthEndUnix) return;
      const d = new Date(ev.start_time * 1000);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push({
          id: `event-${ev.id}`,
          kind: 'event',
          title: ev.title,
          startUnix: ev.start_time,
          endUnix: ev.end_time,
          allDay: !!ev.all_day,
          color: ev.color || 'blue',
        });
      }
    });

    tasks.forEach((task) => {
      if (!task.due_date || task.status === 'done') return;
      const dueUnix = task.due_date;
      if (dueUnix < monthStartUnix || dueUnix > monthEndUnix) return;
      const d = new Date(dueUnix * 1000);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push({
          id: `task-${task.id}`,
          kind: 'task',
          title: task.title,
          startUnix: dueUnix,
          endUnix: dueUnix,
          allDay: true,
          color: 'orange',
          meta: task.project_id ? '已关联项目' : undefined,
        });
      }
    });

    Object.keys(map).forEach((key) => {
      const day = Number(key);
      map[day] = map[day].sort((a, b) => a.startUnix - b.startUnix);
    });

    return map;
  }, [events, tasks, currentMonth, currentYear]);

  const selectedDayItems: CalendarItem[] = selectedDay ? (calendarItemsByDay[selectedDay] || []) : [];


  const resetEditorForCreate = (day: number) => {
    setEditorMode('create');
    setActiveEventId(null);
    setTitle('');
    setDescription('');
    setColor('blue');
    setAllDay(false);
    const { startUnix, endUnix } = nextHourRange(currentYear, currentMonth, day);
    setStartLocal(formatDatetimeLocalFromUnix(startUnix));
    setEndLocal(formatDatetimeLocalFromUnix(endUnix));
    setShowEditor(true);
  };

  const openEditorForEvent = (ev: CalendarEvent) => {
    setEditorMode('edit');
    setActiveEventId(ev.id);
    setTitle(ev.title);
    setDescription(ev.description || '');
    setColor(ev.color || 'blue');
    setAllDay(!!ev.all_day);
    setStartLocal(formatDatetimeLocalFromUnix(ev.start_time));
    setEndLocal(ev.end_time ? formatDatetimeLocalFromUnix(ev.end_time) : formatDatetimeLocalFromUnix(ev.start_time + 3600));
    setShowEditor(true);
  };

  const handleSaveEditor = async () => {
    if (!title.trim() || !selectedDay) return;
    const startUnix = unixFromDatetimeLocal(startLocal);
    const endUnix = unixFromDatetimeLocal(endLocal);
    if (!startUnix) return;
    const finalEndUnix = allDay ? null : (endUnix ?? startUnix + 3600);

    if (editorMode === 'edit' && activeEventId) {
      await editEvent(activeEventId, title.trim(), description.trim() === '' ? null : description.trim(), startUnix, finalEndUnix, color, allDay);
    } else {
      await addEvent(title.trim(), startUnix, finalEndUnix, description.trim() === '' ? null : description.trim(), allDay, color);
    }
    setShowEditor(false);
    setTitle('');
    setDescription('');
    loadMonthEvents();
  };

  const handleDeleteActiveEvent = async () => {
    if (!activeEventId) return;
    await removeEvent(activeEventId);
    setShowEditor(false);
    setActiveEventId(null);
    loadMonthEvents();
  }

  const confirmDeleteEvent = () => {
    if (deleteEventTarget) {
      removeEvent(deleteEventTarget);
      setDeleteEventTarget(null);
      setActiveEventId(null);
      setShowEditor(false);
    }
  };;

  const formatEventTime = (unix: number) => {
    const d = new Date(unix * 1000);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };


  const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  const getWeekDays = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.getFullYear(), d.getMonth(), diff);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const dd = new Date(monday);
      dd.setDate(monday.getDate() + i);
      days.push(dd);
    }
    return days;
  };

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate.getTime()]);

  const isTodayDate = (date: Date) => {
    const t = new Date();
    return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
  };

  const navigateDate = (dir: number) => {
    if (viewMode === 'month') {
      let m = currentMonth + dir, y = currentYear;
      if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
      setCurrentMonth(m); setCurrentYear(y);
    } else if (viewMode === 'week') {
      const d = new Date(selectedDate); d.setDate(d.getDate() + dir * 7); setSelectedDate(d);
    } else {
      const d = new Date(selectedDate); d.setDate(d.getDate() + dir); setSelectedDate(d);
    }
  };

  const goToToday = () => {
    const t = new Date();
    setSelectedDate(t); setCurrentMonth(t.getMonth()); setCurrentYear(t.getFullYear());
  };

  const getViewTitle = () => {
    if (viewMode === 'month') return `${currentYear}年${currentMonth + 1}月`;
    if (viewMode === 'week') {
      const s = weekDays[0], e = weekDays[6];
      return `${s.getMonth()+1}月${s.getDate()}日 - ${e.getMonth()+1}月${e.getDate()}日`;
    }
    return `${selectedDate.getMonth()+1}月${selectedDate.getDate()}日 ${WEEKDAY_LABELS[(selectedDate.getDay()+6)%7]}`;
  };

  const getEventsForDay = (date: Date) => {
    const ds = Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0,0,0).getTime()/1000);
    const de = Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23,59,59).getTime()/1000);
    return calendarItemsByDay[date.getDate()]?.filter(it => it.startUnix <= de && (it.endUnix || it.startUnix) >= ds) || [];
  };

  return (
    <div className="p-4 pb-24 md:p-6 md:pb-6">
      {/* 视图切换 + 导航 */}
      <div className="mb-4 flex items-center justify-between md:mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">日历</h1>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
          {([['month','月'],['week','周'],['day','日']] as const).map(([m,l]) => (
            <button key={m} onClick={() => setViewMode(m)} className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${viewMode===m ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => navigateDate(-1)} className="rounded-lg p-2 text-gray-500 active:bg-gray-100 dark:active:bg-gray-800">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">{getViewTitle()}</span>
          <button onClick={goToToday} className="rounded-lg border border-gray-300 px-2.5 py-1 text-[11px] text-gray-600 active:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:active:bg-gray-800">今天</button>
        </div>
        <button onClick={() => navigateDate(1)} className="rounded-lg p-2 text-gray-500 active:bg-gray-100 dark:active:bg-gray-800">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </button>
      </div>

      {/* 日视图 */}
      {viewMode === 'day' && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800/60 dark:bg-gray-900/50">
          {Array.from({length: 18}, (_, i) => i + 6).map(hour => {
            const hourEvents = getEventsForDay(selectedDate).filter(e => new Date(e.startUnix * 1000).getHours() === hour);
            return (
              <div key={hour} className="flex min-h-[48px] border-b border-gray-200 dark:border-gray-800/40">
                <div className="w-14 flex-shrink-0 py-2 pr-2 text-right text-[11px] text-gray-400">{hour.toString().padStart(2,'0')}:00</div>
                <div className="flex-1 py-1 pl-2">
                  {hourEvents.map(e => (
                    <div key={e.id} className={`mb-1 truncate rounded px-2 py-1 text-[12px] font-medium text-white ${eventColors.find(c=>c.key===e.color)?.cls || 'bg-blue-500'}`}>{e.title}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 周视图 */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((date, i) => {
            const events = getEventsForDay(date);
            const today = isTodayDate(date);
            return (
              <button key={i} onClick={() => { setSelectedDate(date); setViewMode('day'); }}
                className={`min-h-[120px] rounded-lg border p-1.5 text-left transition-colors ${today ? 'border-blue-400 bg-blue-50/50 dark:border-blue-500/40 dark:bg-blue-950/20' : 'border-gray-200 bg-gray-50 dark:border-gray-800/60 dark:bg-gray-900/50'}`}>
                <div className={`mb-1 text-center text-[11px] ${today ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                  <span className="text-[10px]">{WEEKDAY_LABELS[i]}</span><br/>{date.getDate()}
                </div>
                <div className="space-y-0.5">
                  {events.slice(0,3).map(e => (
                    <div key={e.id} className={`truncate rounded px-1 py-0.5 text-[10px] text-white ${eventColors.find(c=>c.key===e.color)?.cls || 'bg-blue-500'}`}>{e.title}</div>
                  ))}
                  {events.length > 3 && <div className="text-[10px] text-gray-400">+{events.length-3}</div>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 月视图 */}
      {viewMode === 'month' && (
      <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800/60 dark:bg-gray-900/50">
        <div className="grid grid-cols-7">
          {WEEKDAYS.map((day) => (<div key={day} className="px-1 py-2 text-center text-[11px] font-medium text-gray-400 dark:text-gray-500 md:px-3 md:py-3 md:text-[12px]">{day}</div>))}
        </div>
        <div className="grid grid-cols-7">
          {calendarDays.map((item) => {
            const dayItems = item.isCurrentMonth ? (calendarItemsByDay[item.day] || []) : [];
            const isSelected = selectedDay === item.day && item.isCurrentMonth;
            const hasEvent = dayItems.some(i => i.kind === 'event');
            const hasTask = dayItems.some(i => i.kind === 'task');
            return (
              <div key={item.dayIndex}
                onClick={() => { if (item.isCurrentMonth) { const next = item.day === selectedDay ? null : item.day; setSelectedDay(next); if (next !== null) resetEditorForCreate(next); else setShowEditor(false); } }}
                onDragOver={(e) => { if (item.isCurrentMonth && dragTaskId) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; } }}
                onDrop={async (e) => { e.preventDefault(); if (item.isCurrentMonth && dragTaskId) { const newDate = new Date(currentYear, currentMonth, item.day, 9, 0, 0); const newDueDate = Math.floor(newDate.getTime() / 1000); await useTaskStore.getState().editTask(dragTaskId, undefined, undefined, undefined, undefined, newDueDate, undefined); setDragTaskId(null); loadMonthEvents(); } }}
                className={`border-b border-r border-gray-100 p-1 transition-colors cursor-pointer dark:border-gray-800/30 ${isMobile ? 'min-h-[44px]' : 'min-h-[100px]'} ${!item.isCurrentMonth ? 'opacity-30' : ''} ${isSelected ? 'bg-blue-50 dark:bg-blue-950/30' : 'active:bg-gray-100 dark:active:bg-gray-800/20'}`}>
                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] md:text-[13px] ${item.isToday ? 'bg-blue-600 font-semibold text-white' : isSelected ? 'font-semibold text-blue-600 dark:text-blue-400' : item.isCurrentMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-600'}`}>{item.day}{dayItems.length > 0 && <span className="ml-0.5 text-[8px] text-orange-500 font-bold">{dayItems.filter(i => i.kind === 'task').length || ''}</span>}</span>
                {!isMobile && dayItems.slice(0, 2).map((it) => (
                  <div key={it.id} draggable={it.kind === 'task'} onDragStart={(e) => { if (it.kind === 'task') { setDragTaskId(it.id.replace('task-', '')); e.dataTransfer.effectAllowed = 'move'; } }} onClick={(e) => { e.stopPropagation(); if (it.kind === 'event') { const ev = events.find(x => x.id === it.id.replace('event-', '')); if (ev) openEditorForEvent(ev); } else { resetEditorForCreate(item.day); } }} className="mt-0.5 flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] cursor-grab active:cursor-grabbing">
                    <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${it.kind === 'task' ? 'bg-orange-500' : eventColors.find(c => c.key === it.color)?.cls || 'bg-blue-500'}`}></span>
                    <span className="truncate text-gray-600 dark:text-gray-400">{it.kind === 'task' ? `📋 ${it.title}` : it.title}</span>
                  </div>
                ))}
                {!isMobile && dayItems.length > 2 && (
                  <div className="px-1 text-[10px] text-gray-400">+{dayItems.length - 2}更多</div>
                )}
                {isMobile && dayItems.length > 0 && (
                  <div className="mt-0.5 flex justify-center gap-1">
                    {hasEvent && <span className="h-1 w-1 rounded-full bg-blue-500"></span>}
                    {hasTask && <span className="h-1 w-1 rounded-full bg-orange-500"></span>}
                    {dayItems.length > 0 && <span className="text-[9px] text-gray-400">{dayItems.length}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      )}
      {selectedDay && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800/60 dark:bg-gray-900/50">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">{currentMonth + 1}月{selectedDay}日</h3>
            <button onClick={() => resetEditorForCreate(selectedDay)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-[12px] font-medium text-white active:bg-blue-700">+ 新事件</button>
          </div>

          {showEditor && (
            <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">{editorMode === 'edit' ? '编辑事件' : '新建事件'}</h4>
                <button onClick={() => setShowEditor(false)} className="rounded p-1 text-gray-400 active:text-gray-700 dark:active:text-gray-200">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-500">标题</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="事件标题" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-medium text-gray-500">全天</label>
                  <button onClick={() => setAllDay((v) => !v)} className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${allDay ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {allDay ? '开启' : '关闭'}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-gray-500">开始</label>
                    <input type="datetime-local" value={startLocal} onChange={(e) => setStartLocal(e.target.value)} disabled={allDay} className={`w-full rounded-lg border px-3 py-2 text-[13px] text-gray-900 focus:outline-none dark:text-gray-100 ${allDay ? 'border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-500' : 'border-gray-300 bg-white focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900'}`} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-gray-500">结束</label>
                    <input type="datetime-local" value={endLocal} onChange={(e) => setEndLocal(e.target.value)} disabled={allDay} className={`w-full rounded-lg border px-3 py-2 text-[13px] text-gray-900 focus:outline-none dark:text-gray-100 ${allDay ? 'border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-500' : 'border-gray-300 bg-white focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900'}`} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-500">颜色</label>
                  <div className="flex gap-2">
                    {eventColors.map((c) => (
                      <button key={c.key} onClick={() => setColor(c.key)} className={`h-6 w-6 rounded-full ${c.cls} ${color === c.key ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-gray-900' : ''}`} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-500">描述</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="可选" className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  {editorMode === 'edit' ? (
                    <button onClick={handleDeleteActiveEvent} className="rounded-lg px-3 py-2 text-[12px] font-medium text-red-600 active:bg-red-50 dark:text-red-400 dark:active:bg-red-500/10">删除事件</button>
                  ) : (
                    <span />
                  )}
                  <button onClick={handleSaveEditor} className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white active:bg-blue-700">{editorMode === 'edit' ? '保存修改' : '添加事件'}</button>
                </div>
              </div>
            </div>
          )}

          {selectedDayItems.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-gray-400">暂无事件</p>
          ) : (
            <div className="space-y-2">
              {selectedDayItems.map((it) => (
                <div key={it.id} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2.5 transition-colors dark:bg-gray-800/50">
                  <span className={`h-2 w-2 flex-shrink-0 rounded-full ${it.kind === 'task' ? 'bg-orange-500' : eventColors.find(c => c.key === it.color)?.cls || 'bg-blue-500'}`}></span>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-gray-800 dark:text-gray-200">{it.kind === 'task' ? `📋 ${it.title}` : it.title}</span>
                    <span className="text-[11px] text-gray-400">{it.kind === 'task' ? '截止任务' : (it.allDay ? '全天' : `${formatEventTime(it.startUnix)}${it.endUnix ? ` - ${formatEventTime(it.endUnix)}` : ''}`)}</span>
                  </div>
                  {it.kind === 'event' && (
                    <button onClick={() => { const ev = events.find(x => x.id === it.id.replace('event-', '')); if (ev) openEditorForEvent(ev); }} className="rounded p-1 text-gray-400 active:text-gray-700 dark:active:text-gray-200">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {deleteEventTarget && (
        <ConfirmModal
          title={"删除事件"}
          message={"确定要删除这个日历事件吗？此操作无法撤销。"}
          confirmLabel={"删除"}
          danger
          onConfirm={confirmDeleteEvent}
          onCancel={() => setDeleteEventTarget(null)}
        />
      )}
    </div>
  );
}