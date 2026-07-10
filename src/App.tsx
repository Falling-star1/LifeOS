import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import InboxPage from '@/pages/InboxPage';
import TodayPage from '@/pages/TodayPage';
import CalendarPage from '@/pages/CalendarPage';
import StudyPage from '@/pages/StudyPage';
import PomodoroPage from '@/pages/PomodoroPage';
import NotesPage from '@/pages/NotesPage';
import MorePage from '@/pages/MorePage';
import DashboardPage from '@/pages/DashboardPage';
import CommandPalette from '@/components/CommandPalette';

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/pomodoro" element={<PomodoroPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/more" element={<MorePage />} />
          <Route path="*" element={<Navigate to="/inbox" replace />} />
        </Route>
      </Routes>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </HashRouter>
  );
}
