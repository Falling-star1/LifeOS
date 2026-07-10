import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useNoteStore } from '@/stores';
import { Note } from '@/types/note';
import ConfirmModal from '@/components/ConfirmModal';

function formatTime(ts: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - ts;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  return `${Math.floor(diff / 86400)} 天前`;
}

function NoteItem({ note, selected, onClick }: { note: Note; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full px-4 py-3 text-left transition-colors active:bg-gray-100 dark:active:bg-gray-800/30 ${selected ? 'bg-gray-100 dark:bg-gray-800/60' : ''}`}>
      <div className="flex items-center gap-1.5">
        {note.pinned === 1 && <span className="text-[10px]">📌</span>}
        <div className="truncate text-[14px] font-medium text-gray-800 dark:text-gray-200">{note.title}</div>
      </div>
      <div className="mt-0.5 truncate text-[12px] text-gray-400 dark:text-gray-500">{note.content}</div>
      <div className="mt-1 text-[11px] text-gray-300 dark:text-gray-600">{formatTime(note.updated_at)}</div>
    </button>
  );
}

export default function NotesPage() {
  const { notes, loading, loadNotes, addNote, editNote, togglePin, removeNote } = useNoteStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const selectedNote = notes.find((n) => n.id === selectedId);
  const filteredNotes = notes.filter((n) => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()));
  const pinnedNotes = filteredNotes.filter((n) => n.pinned === 1);
  const otherNotes = filteredNotes.filter((n) => n.pinned !== 1);

  const updateContent = (content: string) => {
    if (!selectedId) return;
    editNote(selectedId, undefined, content);
  };

  const handleAddNote = async () => {
    const note = await addNote();
    setSelectedId(note.id);
  };

  const handleDelete = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) setDeleteTarget(note);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await removeNote(deleteTarget.id);
    if (selectedId === deleteTarget.id) setSelectedId(null);
    setDeleteTarget(null);
  };

  const handleTogglePin = (id: string) => {
    togglePin(id);
  };

  if (isMobile) {
    if (selectedNote) {
      return (
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800/60">
            <button onClick={() => setSelectedId(null)} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors active:bg-gray-100 dark:text-gray-400 dark:active:bg-gray-800">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-medium text-gray-900 dark:text-gray-100">{selectedNote.title}</div>
              <div className="text-[11px] text-gray-400">更新于 {formatTime(selectedNote.updated_at)}</div>
            </div>
            <button onClick={() => handleTogglePin(selectedNote.id)} className="rounded-md p-1.5 text-gray-400 active:bg-gray-100 dark:active:bg-gray-800" title={selectedNote.pinned === 1 ? '取消置顶' : '置顶'}>
              <span className="text-sm">{selectedNote.pinned === 1 ? '📌' : '📍'}</span>
            </button>
            <button onClick={() => handleDelete(selectedNote.id)} className="rounded-md p-1.5 text-gray-400 active:bg-red-500/20 active:text-red-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
          <textarea value={selectedNote.content} onChange={(e) => updateContent(e.target.value)}
            className="flex-1 resize-none bg-transparent p-4 text-[14px] leading-relaxed text-gray-700 focus:outline-none dark:text-gray-300" placeholder="开始写作..." />
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-800/60">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">备忘录</h1>
          <p className="mt-0.5 text-[12px] text-gray-400">{notes.length} 条笔记</p>
        </div>
        <div className="p-3">
          <input type="text" placeholder="搜索笔记..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] text-gray-800 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-200 dark:placeholder:text-gray-600" />
        </div>
        <div className="px-3 pb-3">
          <button onClick={handleAddNote} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-[14px] text-gray-400 transition-colors active:border-gray-400 active:text-gray-500 dark:border-gray-700/60 dark:text-gray-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            新建笔记
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {loading && notes.length === 0 ? (
            <div className="py-12 text-center text-gray-400">加载中...</div>
          ) : (
            <>
              {pinnedNotes.length > 0 && <div className="mb-1 px-4 pt-1"><span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">置顶</span></div>}
              {pinnedNotes.map((note) => (<NoteItem key={note.id} note={note} selected={false} onClick={() => setSelectedId(note.id)} />))}
              {otherNotes.length > 0 && pinnedNotes.length > 0 && <div className="mt-2 mb-1 px-4"><span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">其他</span></div>}
              {otherNotes.map((note) => (<NoteItem key={note.id} note={note} selected={false} onClick={() => setSelectedId(note.id)} />))}
              {filteredNotes.length === 0 && <div className="py-12 text-center text-gray-400">暂无笔记</div>}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="w-72 border-r border-gray-200 bg-gray-50 dark:border-gray-800/60 dark:bg-gray-900/30">
        <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-800/60">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">备忘录</h1>
          <p className="mt-0.5 text-[12px] text-gray-400">{notes.length} 条笔记</p>
        </div>
        <div className="p-3">
          <input type="text" placeholder="搜索笔记..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-800 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-200 dark:placeholder:text-gray-600" />
        </div>
        <div className="px-3 pb-3">
          <button onClick={handleAddNote} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-2.5 text-[13px] text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-500 dark:border-gray-700/60 dark:text-gray-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            新建笔记
          </button>
        </div>
        {loading && notes.length === 0 ? (
          <div className="py-8 text-center text-gray-400">加载中...</div>
        ) : (
          <>
            {pinnedNotes.length > 0 && <div className="mb-1 px-4"><span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">置顶</span></div>}
            {pinnedNotes.map((note) => (<NoteItem key={note.id} note={note} selected={note.id === selectedId} onClick={() => setSelectedId(note.id)} />))}
            {otherNotes.length > 0 && pinnedNotes.length > 0 && <div className="mt-2 mb-1 px-4"><span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">其他</span></div>}
            {otherNotes.map((note) => (<NoteItem key={note.id} note={note} selected={note.id === selectedId} onClick={() => setSelectedId(note.id)} />))}
          </>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6">
        {selectedNote ? (
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedNote.title}</h2>
              <button onClick={() => handleTogglePin(selectedNote.id)} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800" title={selectedNote.pinned === 1 ? '取消置顶' : '置顶'}>
                <span className="text-sm">{selectedNote.pinned === 1 ? '📌' : '📍'}</span>
              </button>
            </div>
            <p className="mt-1 text-[12px] text-gray-400">更新于 {formatTime(selectedNote.updated_at)}</p>
            <textarea value={selectedNote.content} onChange={(e) => updateContent(e.target.value)}
              className="mt-4 h-[calc(100vh-200px)] w-full resize-none rounded-lg bg-transparent text-[14px] leading-relaxed text-gray-700 focus:outline-none dark:text-gray-300" placeholder="开始写作..." />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-500">选择或创建一条笔记</div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmModal
          title={"删除笔记"}
          message={`确定要删除「${deleteTarget.title}」吗？此操作无法撤销。`}
          confirmLabel={"删除"}
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}