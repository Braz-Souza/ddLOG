import { useState, useEffect } from 'react';
import { taskApi } from '../services/api';
import type { Task, TaskCreateRequest, TaskUpdateRequest } from '@shared/types';

export const useTasks = (date?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = date ? await taskApi.getAll(date) : await taskApi.getToday();
      
      if (response.success && response.data) {
        setTasks(response.data);
      } else {
        setError(response.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError('Network error while fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: TaskCreateRequest): Promise<Task | null> => {
    try {
      setError(null);
      
      const response = await taskApi.create(taskData);
      
      if (response.success && response.data) {
        setTasks(prev => [response.data!, ...prev]);
        return response.data;
      } else {
        setError(response.error || 'Failed to create task');
        return null;
      }
    } catch (err) {
      setError('Network error while creating task');
      return null;
    }
  };

  const updateTask = async (id: string, updates: TaskUpdateRequest): Promise<Task | null> => {
    try {
      setError(null);
      
      const response = await taskApi.update(id, updates);
      
      if (response.success && response.data) {
        setTasks(prev => prev.map(task => 
          task.id === id ? response.data! : task
        ));
        return response.data;
      } else {
        setError(response.error || 'Failed to update task');
        return null;
      }
    } catch (err) {
      setError('Network error while updating task');
      return null;
    }
  };

  const toggleTask = async (id: string, completed: boolean): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await taskApi.patch(id, { completed });
      
      if (response.success && response.data) {
        setTasks(prev => prev.map(task => 
          task.id === id ? response.data! : task
        ));
        return true;
      } else {
        setError(response.error || 'Failed to toggle task');
        return false;
      }
    } catch (err) {
      setError('Network error while toggling task');
      return false;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await taskApi.delete(id);
      
      if (response.success) {
        setTasks(prev => prev.filter(task => task.id !== id));
        return true;
      } else {
        setError(response.error || 'Failed to delete task');
        return false;
      }
    } catch (err) {
      setError('Network error while deleting task');
      return false;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [date]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
  };
};