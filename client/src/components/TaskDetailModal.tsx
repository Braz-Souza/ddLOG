import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Task, TaskUpdateRequest } from '@shared/types';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (taskId: string, updates: TaskUpdateRequest) => Promise<void>;
  onDelete?: (taskId: string) => void;
  loading?: boolean;
}

interface FormData {
  name: string;
  description: string;
  reminderTime: string;
  category: string;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  loading = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      reminderTime: '',
      category: ''
    }
  });

  React.useEffect(() => {
    if (task && isOpen) {
      reset({
        name: task.name,
        description: task.description || '',
        reminderTime: task.reminderTime || '',
        category: task.category || ''
      });
      setIsEditing(false);
    }
  }, [task, isOpen, reset]);

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

  console.log('TaskDetailModal render - isOpen:', isOpen, 'task:', task);
  if (!isOpen) return null;
  
  if (!task) {
    return (
      <div
        className="fixed inset-0 bg-red-500 bg-opacity-80 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Tarefa não encontrada</p>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const watchedName = isEditing ? watch('name') : task.name;

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (task) {
      reset({
        name: task.name,
        description: task.description || '',
        reminderTime: task.reminderTime || '',
        category: task.category || ''
      });
    }
  };

  const handleSave = async (data: FormData) => {
    if (!onSave || !task || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const updates: TaskUpdateRequest = {
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        reminderTime: data.reminderTime || undefined,
        category: data.category.trim() || undefined,
      };
      
      await onSave(task.id, updates);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && task) {
      if (window.confirm(`Tem certeza que deseja excluir a tarefa "${task.name}"?\n\nEsta ação não pode ser desfeita.`)) {
        onDelete(task.id);
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-red-500 bg-opacity-80 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
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

        <form onSubmit={handleSubmit(handleSave)} className="p-6 space-y-6">
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
              Nome da Tarefa {isEditing && '*'}
            </label>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Digite o nome da tarefa..."
                  {...register('name', {
                    required: 'Nome da tarefa é obrigatório',
                    minLength: {
                      value: 1,
                      message: 'Nome deve ter pelo menos 1 caractere'
                    },
                    maxLength: {
                      value: 100,
                      message: 'Nome deve ter no máximo 100 caracteres'
                    },
                    validate: value => value.trim().length > 0 || 'Nome não pode estar vazio'
                  })}
                  disabled={isSubmitting || loading}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {(watchedName?.length || 0)}/100 caracteres
                </p>
              </div>
            ) : (
              <p className="text-gray-900 text-lg leading-relaxed">
                {task.name}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            {isEditing ? (
              <div>
                <textarea
                  rows={3}
                  className={`input-field resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Adicione uma descrição detalhada..."
                  {...register('description', {
                    maxLength: {
                      value: 500,
                      message: 'Descrição deve ter no máximo 500 caracteres'
                    }
                  })}
                  disabled={isSubmitting || loading}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-600 leading-relaxed">
                {task.description || 'Nenhuma descrição fornecida'}
              </p>
            )}
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Categoria
            </label>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Trabalho, Pessoal, Estudos..."
                  {...register('category', {
                    maxLength: {
                      value: 50,
                      message: 'Categoria deve ter no máximo 50 caracteres'
                    }
                  })}
                  disabled={isSubmitting || loading}
                />
                {errors.category && (
                  <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
                )}
              </div>
            ) : (
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
            )}
          </div>

          {/* Horário do Lembrete */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Horário do Lembrete
            </label>
            {isEditing ? (
              <input
                type="time"
                className="input-field"
                {...register('reminderTime')}
                disabled={isSubmitting || loading}
              />
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-900">
                  {formatTime(task.reminderTime)}
                </span>
              </div>
            )}
          </div>

          {/* Informações não editáveis */}
          {!isEditing && (
            <>
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
            </>
          )}
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
          {isEditing ? (
            <div className="flex gap-3">
              <button
                type="submit"
                onClick={handleSubmit(handleSave)}
                disabled={isSubmitting || loading || !watchedName?.trim()}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Salvar
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting || loading}
                className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              {(onSave || onDelete) && (
                <div className="flex gap-3 flex-1">
                  {onSave && (
                    <button
                      onClick={handleEdit}
                      className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                  )}
                  
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Excluir
                    </button>
                  )}
                </div>
              )}
              
              <button
                onClick={onClose}
                className={`${(onSave || onDelete) ? 'flex-1 sm:flex-none sm:min-w-[100px]' : 'w-full'} btn-secondary`}
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};