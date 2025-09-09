import React, { useState } from 'react';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => Promise<void>;
  onViewDetails?: (task: Task) => void;
  loading?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  onViewDetails,
  loading = false
}) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (loading || isToggling) return;
    
    setIsToggling(true);
    try {
      await onToggle(task.id, !task.completed);
    } finally {
      // Keep the toggling state for a brief moment to show animation
      setTimeout(() => setIsToggling(false), 300);
    }
  };

  const handleEdit = () => {
    if (loading || !onEdit) return;
    onEdit(task);
  };

  const handleDelete = async () => {
    if (loading || !onDelete) return;
    
    if (window.confirm('Tem certeza que deseja deletar esta tarefa?')) {
      await onDelete(task.id);
    }
  };

  const handleViewDetails = () => {
    console.log('TaskItem handleViewDetails called', { loading, onViewDetails: !!onViewDetails, task });
    if (loading || !onViewDetails) return;
    console.log('Calling onViewDetails with task:', task);
    onViewDetails(task);
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className={`
      bg-white rounded-lg border transition-all duration-300 hover:shadow-md
      ${task.completed 
        ? 'border-green-200 bg-gradient-to-r from-green-50 to-green-25 shadow-sm' 
        : 'border-gray-200 hover:border-gray-300'
      }
      ${loading ? 'opacity-60' : ''}
    `}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={handleToggle}
            disabled={loading || isToggling}
            className={`
              mt-1 w-5 h-5 rounded border-2 flex items-center justify-center
              transition-all duration-300 disabled:cursor-not-allowed transform hover:scale-105
              ${isToggling ? 'animate-pulse' : ''}
              ${task.completed 
                ? 'bg-green-500 border-green-500 text-white shadow-md' 
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
              }
            `}
            title={task.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
          >
            {task.completed && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div 
                onClick={handleViewDetails}
                className={`
                  flex-1 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors
                  ${onViewDetails ? '' : 'cursor-default'}
                `}
                title={onViewDetails ? 'Clique para ver detalhes' : ''}
              >
                <h3 className={`
                  font-medium text-gray-900 leading-tight
                  ${task.completed ? 'line-through text-gray-600' : ''}
                `}>
                  {task.name}
                </h3>
                
                {task.description && (
                  <p className={`
                    text-sm mt-1 text-gray-600 leading-relaxed truncate
                    ${task.completed ? 'text-gray-500' : ''}
                  `}>
                    {task.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 ml-2">
                {onEdit && (
                  <button
                    onClick={handleEdit}
                    disabled={loading}
                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors disabled:cursor-not-allowed"
                    title="Editar tarefa"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:cursor-not-allowed"
                    title="Deletar tarefa"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              {task.category && (
                <span className="inline-flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {task.category}
                </span>
              )}

              {task.reminderTime && (
                <span className="inline-flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatTime(task.reminderTime)}
                </span>
              )}

              <span className="inline-flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(task.createdAt)}
              </span>

              {task.completed && task.completedAt && (
                <span className="inline-flex items-center gap-1 text-green-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Concluída em {formatDate(task.completedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};