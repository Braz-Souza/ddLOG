import React from 'react';
import type { Task } from '../types';

interface TaskSummaryProps {
  tasks: Task[];
}

export const TaskSummary: React.FC<TaskSummaryProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  if (totalTasks === 0) {
    return null;
  }

  const allCompleted = pendingTasks === 0;

  return (
    <div className={`
      card mb-6 
      ${allCompleted 
        ? 'bg-green-50 border border-green-200' 
        : 'bg-blue-50 border border-blue-200'
      }
    `}>
      <div className="flex items-center justify-center gap-3">
        {allCompleted ? (
          <>
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-1">
                🎉 Todas as tarefas concluídas!
              </h3>
              <p className="text-sm text-green-700">
                Parabéns! Você completou todas as {totalTasks} tarefas de hoje.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-800 mb-1">
                Faltam {pendingTasks} de {totalTasks} tarefas
              </h3>
              <p className="text-sm text-blue-700">
                {completedTasks > 0 
                  ? `Você já completou ${completedTasks} tarefa${completedTasks > 1 ? 's' : ''}. Continue assim!`
                  : 'Comece completando uma tarefa para ver seu progresso!'
                }
              </p>
            </div>
          </>
        )}
        
        {/* Barra de progresso */}
        {totalTasks > 0 && (
          <div className="ml-4">
            <div className="flex flex-col items-end">
              <span className={`text-xs font-medium mb-1 ${
                allCompleted ? 'text-green-700' : 'text-blue-700'
              }`}>
                {Math.round((completedTasks / totalTasks) * 100)}%
              </span>
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    allCompleted ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};