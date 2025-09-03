import React from 'react';
import { TaskItem } from './TaskItem';
import type { Task } from '@shared/types';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string, completed: boolean) => Promise<void>;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => Promise<void>;
  onViewDetails?: (task: Task) => void;
  loading?: boolean;
  emptyMessage?: string;
  title?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onViewDetails,
  loading = false,
  emptyMessage = 'Nenhuma tarefa encontrada',
  title = 'Tarefas de Hoje'
}) => {
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  
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
          <p className="text-sm text-gray-500 mt-1">
            Adicione uma nova tarefa para começar!
          </p>
        </div>
      </div>
    );
  }

  const taskStats = {
    total: tasks.length,
    completed: completedTasks.length,
    pending: pendingTasks.length,
    completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">
            {taskStats.pending} pendente{taskStats.pending !== 1 ? 's' : ''}
          </span>
          <span className="text-green-600">
            {taskStats.completed} concluída{taskStats.completed !== 1 ? 's' : ''}
          </span>
          <span className="text-primary-600 font-medium">
            {taskStats.completionRate}% concluído
          </span>
        </div>
      </div>

      {taskStats.completionRate > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progresso do dia</span>
            <span>{taskStats.completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${taskStats.completionRate}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {pendingTasks.length > 0 && (
          <>
            {pendingTasks.length > 0 && completedTasks.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span>Pendentes</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}
            
            {pendingTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onViewDetails={onViewDetails}
                loading={loading}
              />
            ))}
          </>
        )}

        {completedTasks.length > 0 && (
          <>
            {pendingTasks.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span>Concluídas</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}
            
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onViewDetails={onViewDetails}
                loading={loading}
              />
            ))}
          </>
        )}
      </div>

      {taskStats.total > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold text-gray-900">{taskStats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-orange-600">{taskStats.pending}</div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-green-600">{taskStats.completed}</div>
              <div className="text-sm text-gray-600">Concluídas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};