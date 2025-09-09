import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { TaskCreateRequest } from '../types';

interface TaskFormProps {
  onSubmit: (task: TaskCreateRequest) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

interface FormData {
  name: string;
  description: string;
  reminderTime: string;
  category: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({ 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
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

  const watchedName = watch('name');

  const onFormSubmit = async (data: FormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const taskData: TaskCreateRequest = {
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        reminderTime: data.reminderTime || undefined,
        category: data.category.trim() || undefined,
      };
      
      await onSubmit(taskData);
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Adicionar Nova Tarefa
      </h2>
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Tarefa *
          </label>
          <input
            id="name"
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
            {watchedName?.length || 0}/100 caracteres
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição (opcional)
          </label>
          <textarea
            id="description"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 mb-1">
              Horário do Lembrete (opcional)
            </label>
            <input
              id="reminderTime"
              type="time"
              className="input-field"
              {...register('reminderTime')}
              disabled={isSubmitting || loading}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria (opcional)
            </label>
            <input
              id="category"
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
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || loading || !watchedName?.trim()}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adicionando...
              </>
            ) : (
              'Adicionar Tarefa'
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting || loading}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};