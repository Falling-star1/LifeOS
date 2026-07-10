import { create } from 'zustand';
import { Tag } from '@/types/tag';
import { getTags, createTag, deleteTag, getTaskTags, setTaskTags } from '@/services/tagService';

interface TagStore {
  tags: Tag[];
  loadTags: () => Promise<void>;
  addTag: (name: string, color?: string) => Promise<Tag>;
  removeTag: (id: string) => Promise<void>;
  getTaskTags: (taskId: string) => Promise<Tag[]>;
  setTaskTags: (taskId: string, tagIds: string[]) => Promise<void>;
}

export const useTagStore = create<TagStore>((set) => ({
  tags: [],

  loadTags: async () => {
    const data = await getTags();
    set({ tags: data });
  },

  addTag: async (name, color) => {
    const tag = await createTag(name, color);
    set(s => ({ tags: [...s.tags, tag] }));
    return tag;
  },

  removeTag: async (id) => {
    await deleteTag(id);
    set(s => ({ tags: s.tags.filter(t => t.id !== id) }));
  },

  getTaskTags,
  setTaskTags,
}));
