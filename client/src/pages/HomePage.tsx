import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { TaskSummary } from '../components/TaskSummary';
import { useTasks } from '../hooks/useTasks';
import type { TaskCreateRequest, Task, TaskUpdateRequest } from '@shared/types';

export const HomePage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    toggleTask,
    deleteTask
  } = useTasks();

  const handleCreateTask = async (taskData: TaskCreateRequest) => {
    try {
      const newTask = await createTask(taskData);
      if (newTask) {
        toast.success('Tarefa adicionada com sucesso!');
        setShowForm(false);
      }
    } catch (error) {
      toast.error('Erro ao adicionar tarefa');
    }
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      const success = await toggleTask(id, completed);
      if (success) {
        toast.success(
          completed 
            ? 'Tarefa marcada como concluída!' 
            : 'Tarefa marcada como pendente!'
        );
      }
    } catch (error) {
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleViewTaskDetails = (task: Task) => {
    console.log('HomePage handleViewTaskDetails called with task:', task);
    console.log('Before state update - selectedTask:', selectedTask, 'showDetailModal:', showDetailModal);
    setSelectedTask(task);
    setShowDetailModal(true);
    console.log('State update called - should now show modal');
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTask(null);
  };


  const handleSaveTask = async (taskId: string, updates: TaskUpdateRequest) => {
    try {
      const updatedTask = await updateTask(taskId, updates);
      if (updatedTask) {
        toast.success('Tarefa atualizada com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const handleDeleteFromModal = async (taskId: string) => {
    try {
      const success = await deleteTask(taskId);
      if (success) {
        toast.success('Tarefa deletada com sucesso!');
        setShowDetailModal(false);
        setSelectedTask(null);
      }
    } catch (error) {
      toast.error('Erro ao deletar tarefa');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const success = await deleteTask(id);
      if (success) {
        toast.success('Tarefa deletada com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao deletar tarefa');
    }
  };

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ddLOG</h1>
          <p className="text-gray-600">{todayFormatted}</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {!showForm ? (
            <div className="card">
              <button
                onClick={() => setShowForm(true)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Tarefa
              </button>
            </div>
          ) : (
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setShowForm(false)}
              loading={loading}
            />
          )}

          <TaskSummary tasks={tasks} />

          <TaskList
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onViewDetails={handleViewTaskDetails}
            loading={loading}
            title="Tarefas de Hoje"
            emptyMessage="Nenhuma tarefa para hoje"
          />
        </div>

        {tasks.length > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              As tarefas são salvas automaticamente
            </div>
          </div>
        )}

        {/* Floating Action Button for mobile */}
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
          className={`
            fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-200 
            disabled:cursor-not-allowed disabled:opacity-50 md:hidden
            ${showForm 
              ? 'bg-gray-600 hover:bg-gray-700 rotate-45' 
              : 'bg-primary-500 hover:bg-primary-600'
            } text-white
          `}
        >
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Task Detail Modal */}
        <TaskDetailModal
          task={selectedTask}
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          onSave={handleSaveTask}
          onDelete={handleDeleteFromModal}
          loading={loading}
        />

      </div>
    </div>
  );
};