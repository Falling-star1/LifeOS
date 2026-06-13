import { Task } from '@/types/task';

let tasks: Task[] = [];

export function setTasks(list: Task[]) {
  tasks = list;
}

export function getTasks() {
  return tasks;
}
