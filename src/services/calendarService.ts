import { invoke } from '@tauri-apps/api/core';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: number;
  end_time?: number;
  all_day: number;
  color: string;
  created_at: number;
  updated_at: number;
}

export async function getCalendarEvents(start: number, end: number): Promise<CalendarEvent[]> {
  return invoke('get_calendar_events', { start, end });
}

export async function getCalendarEvent(id: string): Promise<CalendarEvent> {
  return invoke('get_calendar_event', { id });
}

export async function createCalendarEvent(
  title: string,
  startTime: number,
  endTime?: number | null,
  description?: string | null,
  allDay: boolean = false,
  color: string = 'blue',
): Promise<CalendarEvent> {
  return invoke('create_calendar_event', {
    title,
    description: description === undefined ? undefined : description ?? null,
    startTime,
    endTime: endTime === undefined ? undefined : endTime ?? null,
    allDay,
    color,
  });
}

export async function updateCalendarEvent(
  id: string,
  title?: string,
  description?: string | null,
  startTime?: number,
  endTime?: number | null,
  color?: string,
  allDay?: boolean,
): Promise<CalendarEvent> {
  return invoke('update_calendar_event', {
    id,
    title,
    description: description === undefined ? undefined : description ?? null,
    startTime,
    endTime: endTime === undefined ? undefined : endTime ?? null,
    color,
    allDay,
  });
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  return invoke('delete_calendar_event', { id });
}