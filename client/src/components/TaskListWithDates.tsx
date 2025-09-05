import React from 'react';
import { TaskItem } from './TaskItem';
import type { Task } from '@shared/types';

interface TaskListWithDatesProps {
  tasks: Task[];
  onToggleTask: (id: string, completed: boolean) => Promise<void>;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => Promise<void>;
  onViewDetails?: (task: Task) => void;
  loading?: boolean;
  emptyMessage?: string;
  title?: string;
}

interface TaskWithDateMarker extends Task {
  isDateMarker?: boolean;
}

export const TaskListWithDates: React.FC<TaskListWithDatesProps> = ({
  tasks,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onViewDetails,
  loading = false,
  emptyMessage = 'Nenhuma tarefa encontrada',
  title = 'Tarefas'
}) => {
  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            Carregando tarefas...
          </div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>

      <div className="space-y-3">
        {tasks.map((task, index) => {
          const taskWithMarker = task as TaskWithDateMarker;
          
          if (taskWithMarker.isDateMarker) {
            const formattedDate = formatDate(task.title);
            const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
            
            return (
              <div key={task.id} className="flex items-center py-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="px-4 text-sm font-medium text-gray-600 bg-gray-50 rounded-full">
                  {capitalizedDate}
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
            );
          }

          return (
            <div key={task.id}>
              <TaskItem
                task={task}
                onToggle={onToggleTask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onViewDetails={onViewDetails}
                loading={loading}
              />
              {index < tasks.length - 1 && !((tasks[index + 1] as TaskWithDateMarker).isDateMarker) && (
                <br />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};