import { useState, useCallback } from 'react';
import { getCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, CalendarEvent } from '@/services/calendarService';

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = useCallback(async (start: number, end: number) => {
    setLoading(true);
    try {
      const data = await getCalendarEvents(start, end);
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const addEvent = useCallback(async (title: string, startTime: number, endTime?: number | null, description?: string | null, allDay?: boolean, color?: string) => {
    const event = await createCalendarEvent(title, startTime, endTime ?? null, description ?? null, allDay ?? false, color ?? 'blue');
    setEvents(prev => [...prev, event]);
    return event;
  }, []);

  const editEvent = useCallback(async (id: string, title?: string, description?: string | null, startTime?: number, endTime?: number | null, color?: string, allDay?: boolean) => {
    const updated = await updateCalendarEvent(id, title, description ?? null, startTime, endTime ?? null, color, allDay);
    setEvents(prev => prev.map(e => e.id === id ? updated : e));
    return updated;
  }, []);

  const removeEvent = useCallback(async (id: string) => {
    await deleteCalendarEvent(id);
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  return { events, loading, loadEvents, addEvent, editEvent, removeEvent };
}