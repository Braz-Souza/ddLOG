import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { TaskListWithDates } from '../components/TaskListWithDates';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { TaskSummary } from '../components/TaskSummary';
import { useTasks } from '../hooks/useTasks';
import { taskApi } from '../services/api';
import type { TaskCreateRequest, Task, TaskUpdateRequest } from '../types';

export const HomePage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    toggleTask,
    deleteTask
  } = useTasks();

  const fetchRecentTasks = async () => {
    try {
      setRecentLoading(true);
      
      const tasksByDate: { [key: string]: Task[] } = {};
      const today = new Date();
      
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const response = await taskApi.getAll(dateStr);
        if (response.success && response.data && response.data.length > 0) {
          tasksByDate[dateStr] = response.data;
        }
      }
      
      // Convert to flat array with date markers
      const flatTasks: Task[] = [];
      const sortedDates = Object.keys(tasksByDate).sort((a, b) => b.localeCompare(a)); // Most recent first
      
      sortedDates.forEach(dateStr => {
        const tasks = tasksByDate[dateStr];
        // Add a date marker task
        const dateMarker = {
          id: `date-marker-${dateStr}`,
          name: dateStr,
          description: '',
          completed: false,
          createdAt: dateStr,
          updatedAt: dateStr,
          isDateMarker: true
        } as Task & { isDateMarker: boolean };

        flatTasks.push(dateMarker);
        flatTasks.push(...tasks);
      });
      
      setRecentTasks(flatTasks);
    } catch (error) {
      console.error('Error fetching recent tasks:', error);
    } finally {
      setRecentLoading(false);
    }
  };

  const handleToggleRecentTask = async (id: string, completed: boolean) => {
    // Don't try to toggle date markers
    if (id.startsWith('date-marker-')) {
      return;
    }

    try {
      const response = await taskApi.patch(id, { completed });
      if (response.success && response.data) {
        setRecentTasks(prev => prev.map(task => 
          task.id === id ? response.data! : task
        ));
        toast.success(
          completed 
            ? 'Tarefa marcada como concluída!' 
            : 'Tarefa desmarcada!'
        );
      }
    } catch (error) {
      toast.error('Erro ao atualizar tarefa');
    }
  };

  useEffect(() => {
    fetchRecentTasks();
  }, []);

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

  const handleExportCSV = async () => {
    try {
      setExportLoading(true);
      await taskApi.exportCSV();
      toast.success('Arquivo CSV exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar arquivo CSV');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExportLoading(true);
      await taskApi.exportPDF();
      toast.success('Arquivo PDF exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar arquivo PDF');
    } finally {
      setExportLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1);

  // Sort today's tasks by creation date (ascending - oldest first)
  const sortedTodayTasks = [...tasks].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">ddLOG</h1>
              <p className="text-gray-600">{todayFormatted}</p>
            </div>
            
            {/* Export Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                disabled={exportLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Exportar dados dos últimos 7 dias como CSV"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CSV
              </button>
              
              <button
                onClick={handleExportPDF}
                disabled={exportLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Exportar dados dos últimos 7 dias como PDF"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF
              </button>
            </div>
          </div>
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

          <TaskSummary tasks={sortedTodayTasks} />

          <TaskList
            tasks={sortedTodayTasks}
            onToggleTask={handleToggleTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onViewDetails={handleViewTaskDetails}
            loading={loading}
            title="Tarefas de Hoje"
            emptyMessage="Nenhuma tarefa para hoje"
          />

          {/* Seção de Últimas Concluídas */}
          {recentTasks.length > 0 && (
            <div className="mt-8">
              <TaskListWithDates
                tasks={recentTasks}
                onToggleTask={handleToggleRecentTask}
                onEditTask={handleEditTask}
                onDeleteTask={() => Promise.resolve()}
                onViewDetails={handleViewTaskDetails}
                loading={recentLoading}
                title="Últimas Concluídas (7 dias anteriores)"
                emptyMessage="Nenhuma tarefa concluída nos últimos 7 dias"
              />
            </div>
          )}
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