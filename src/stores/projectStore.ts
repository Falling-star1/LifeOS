import { create } from 'zustand';
import { Project, getProjects, createProject, deleteProject } from '@/services/projectService';

interface ProjectStore {
  projects: Project[];
  loadProjects: () => Promise<void>;
  addProject: (name: string, color: string) => Promise<Project>;
  removeProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],

  loadProjects: async () => {
    const data = await getProjects();
    set({ projects: data });
  },

  addProject: async (name, color) => {
    const project = await createProject(name, color);
    set(s => ({ projects: [...s.projects, project] }));
    return project;
  },

  removeProject: async (id) => {
    await deleteProject(id);
    set(s => ({ projects: s.projects.filter(p => p.id !== id) }));
  },
}));
