import React from 'react';
import type { Task } from '@shared/types';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose
}) => {
  if (!isOpen || !task) return null;

  const formatTime = (time: string | null) => {
    if (!time) return 'Não definido';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEscapeKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={handleBackdropClick}
      onKeyDown={handleEscapeKey}
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Detalhes da Tarefa
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              title="Fechar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3">
            <div className={`
              w-6 h-6 rounded border-2 flex items-center justify-center
              ${task.completed 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'border-gray-300'
              }
            `}>
              {task.completed && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={`
              text-lg font-medium
              ${task.completed ? 'text-green-600' : 'text-orange-600'}
            `}>
              {task.completed ? 'Concluída' : 'Pendente'}
            </span>
          </div>

          {/* Nome da Tarefa */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nome da Tarefa
            </label>
            <p className="text-gray-900 text-lg leading-relaxed">
              {task.name}
            </p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <p className="text-gray-600 leading-relaxed">
              {task.description || 'Nenhuma descrição fornecida'}
            </p>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Categoria
            </label>
            <div className="flex items-center gap-2">
              {task.category ? (
                <>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-gray-900 bg-gray-100 px-2 py-1 rounded-md text-sm">
                    {task.category}
                  </span>
                </>
              ) : (
                <span className="text-gray-500">Nenhuma categoria definida</span>
              )}
            </div>
          </div>

          {/* Horário do Lembrete */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Horário do Lembrete
            </label>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-900">
                {formatTime(task.reminderTime)}
              </span>
            </div>
          </div>

          {/* Data de Criação */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Data de Criação
            </label>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-900">
                {formatDate(task.createdAt)}
              </span>
            </div>
          </div>

          {/* Data de Conclusão (se concluída) */}
          {task.completed && task.completedAt && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Data de Conclusão
              </label>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700 font-medium">
                  {formatDate(task.completedAt)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full btn-secondary"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};