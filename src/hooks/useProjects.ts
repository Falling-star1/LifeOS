import { useState, useCallback } from 'react';
import { getProjects, createProject, updateProject, deleteProject, Project } from '@/services/projectService';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const addProject = useCallback(async (name: string, color: string, icon?: string) => {
    const project = await createProject(name, color, icon);
    setProjects(prev => [...prev, project]);
    return project;
  }, []);

  const editProject = useCallback(async (id: string, name?: string, color?: string, icon?: string) => {
    const updated = await updateProject(id, name, color, icon);
    setProjects(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  }, []);

  const removeProject = useCallback(async (id: string) => {
    await deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  return { projects, loading, loadProjects, addProject, editProject, removeProject };
}
