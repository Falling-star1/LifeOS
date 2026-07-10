import { useState, useCallback } from 'react';
import { Tag } from '@/types/tag';
import { getTags, createTag, deleteTag, getTaskTags, setTaskTags } from '@/services/tagService';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);

  const loadTags = useCallback(async () => {
    const data = await getTags();
    setTags(data);
  }, []);

  const addTag = useCallback(async (name: string, color?: string) => {
    const tag = await createTag(name, color);
    setTags(prev => [...prev, tag]);
    return tag;
  }, []);

  const removeTag = useCallback(async (id: string) => {
    await deleteTag(id);
    setTags(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tags, loadTags, addTag, removeTag, getTaskTags, setTaskTags };
}