import db from '../database/connection.js';
import type { Task, TaskCreateRequest, TaskUpdateRequest, HeatmapData } from '@shared/types';

export class TaskService {
  static async createTask(userId: string, taskData: TaskCreateRequest): Promise<Task> {
    const { name, description, reminderTime, category } = taskData;
    
    if (!name || name.trim().length === 0) {
      throw new Error('Task name is required');
    }

    if (name.trim().length > 100) {
      throw new Error('Task name must be 100 characters or less');
    }

    if (description && description.length > 500) {
      throw new Error('Description must be 500 characters or less');
    }

    const result = db.prepare(`
      INSERT INTO tasks (user_id, name, description, reminder_time, category) 
      VALUES (?, ?, ?, ?, ?) 
      RETURNING *
    `).get(userId, name.trim(), description?.trim() || null, reminderTime || null, category?.trim() || null) as Task;

    return {
      ...result,
      completed: Boolean(result.completed)
    };
  }

  static async getTasks(userId: string, date?: string): Promise<Task[]> {
    let query = `
      SELECT * FROM tasks 
      WHERE user_id = ?
    `;
    const params: any[] = [userId];

    if (date) {
      query += ` AND date(created_at) = ?`;
      params.push(date);
    }

    query += ` ORDER BY created_at DESC`;

    const tasks = db.prepare(query).all(...params) as Task[];
    
    return tasks.map(task => ({
      ...task,
      completed: Boolean(task.completed)
    }));
  }

  static async getTaskById(userId: string, taskId: string): Promise<Task | null> {
    const task = db.prepare(`
      SELECT * FROM tasks 
      WHERE id = ? AND user_id = ?
    `).get(taskId, userId) as Task | undefined;

    if (!task) return null;

    return {
      ...task,
      completed: Boolean(task.completed)
    };
  }

  static async updateTask(userId: string, taskId: string, updates: TaskUpdateRequest): Promise<Task> {
    const existingTask = await this.getTaskById(userId, taskId);
    if (!existingTask) {
      throw new Error('Task not found');
    }

    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      if (!updates.name.trim()) {
        throw new Error('Task name cannot be empty');
      }
      if (updates.name.trim().length > 100) {
        throw new Error('Task name must be 100 characters or less');
      }
      updateFields.push('name = ?');
      values.push(updates.name.trim());
    }

    if (updates.description !== undefined) {
      if (updates.description && updates.description.length > 500) {
        throw new Error('Description must be 500 characters or less');
      }
      updateFields.push('description = ?');
      values.push(updates.description?.trim() || null);
    }

    if (updates.reminderTime !== undefined) {
      updateFields.push('reminder_time = ?');
      values.push(updates.reminderTime || null);
    }

    if (updates.category !== undefined) {
      updateFields.push('category = ?');
      values.push(updates.category?.trim() || null);
    }

    if (updates.completed !== undefined) {
      updateFields.push('completed = ?');
      values.push(updates.completed ? 1 : 0);
      
      if (updates.completed) {
        updateFields.push('completed_at = CURRENT_TIMESTAMP');
      } else {
        updateFields.push('completed_at = NULL');
      }
    }

    if (updateFields.length === 0) {
      return existingTask;
    }

    values.push(taskId, userId);

    const updatedTask = db.prepare(`
      UPDATE tasks 
      SET ${updateFields.join(', ')} 
      WHERE id = ? AND user_id = ? 
      RETURNING *
    `).get(...values) as Task;

    return {
      ...updatedTask,
      completed: Boolean(updatedTask.completed)
    };
  }

  static async deleteTask(userId: string, taskId: string): Promise<boolean> {
    const result = db.prepare(`
      DELETE FROM tasks 
      WHERE id = ? AND user_id = ?
    `).run(taskId, userId);

    return result.changes > 0;
  }

  static async getTodayTasks(userId: string): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getTasks(userId, today);
  }

  static async getHeatmapData(userId: string, startDate?: string, endDate?: string): Promise<HeatmapData[]> {
    const now = new Date();
    const defaultEndDate = now.toISOString().split('T')[0];
    const defaultStartDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const queryStartDate = startDate || defaultStartDate;
    const queryEndDate = endDate || defaultEndDate;

    const result = db.prepare(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as total_tasks,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_tasks
      FROM tasks 
      WHERE user_id = ? 
        AND date(created_at) >= ? 
        AND date(created_at) <= ?
      GROUP BY date(created_at)
      ORDER BY date(created_at)
    `).all(userId, queryStartDate, queryEndDate) as Array<{
      date: string;
      total_tasks: number;
      completed_tasks: number;
    }>;

    return result.map(row => {
      const percentage = row.total_tasks > 0 ? (row.completed_tasks / row.total_tasks) * 100 : 0;
      const level = percentage === 0 ? 0 : 
                  percentage <= 25 ? 1 :
                  percentage <= 50 ? 2 :
                  percentage <= 75 ? 3 : 4;

      return {
        date: row.date,
        count: Math.round(percentage),
        level
      };
    });
  }

  static async getTasksInDateRange(userId: string, startDate: string, endDate: string): Promise<Task[]> {
    const tasks = db.prepare(`
      SELECT * FROM tasks 
      WHERE user_id = ? 
        AND date(created_at) >= ? 
        AND date(created_at) <= ?
      ORDER BY created_at DESC
    `).all(userId, startDate, endDate) as Task[];
    
    return tasks.map(task => ({
      ...task,
      completed: Boolean(task.completed)
    }));
  }
}