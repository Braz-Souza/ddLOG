import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HeatmapCalendar } from '../components/HeatmapCalendar';
import { taskApi } from '../services/api';
import type { HeatmapData } from '@shared/types';

export const ProgressPage: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadHeatmapData();
  }, [selectedYear]);

  const loadHeatmapData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;
      
      const response = await taskApi.getHeatmapData(startDate, endDate);
      
      if (response.success && response.data) {
        setHeatmapData(response.data);
      } else {
        setError(response.error || 'Erro ao carregar dados do progresso');
      }
    } catch (error) {
      setError('Erro ao carregar dados do progresso');
      toast.error('Erro ao carregar dados do progresso');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const totalDaysWithTasks = heatmapData.length;
  const completedDays = heatmapData.filter(day => day.level > 0).length;
  const perfectDays = heatmapData.filter(day => day.level === 4).length;
  const averageCompletion = totalDaysWithTasks > 0 
    ? Math.round(heatmapData.reduce((acc, day) => acc + day.count, 0) / totalDaysWithTasks) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Progresso</h1>
              <p className="text-gray-600">Visualize seu desempenho ao longo do tempo</p>
            </div>
            
            <div className="flex items-center gap-2">
              <label htmlFor="year" className="text-sm font-medium text-gray-700">
                Ano:
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
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
              <button
                onClick={loadHeatmapData}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{totalDaysWithTasks}</div>
                  <div className="text-sm text-gray-600">Dias com tarefas</div>
                </div>
              </div>
              
              <div className="card">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completedDays}</div>
                  <div className="text-sm text-gray-600">Dias com progresso</div>
                </div>
              </div>
              
              <div className="card">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{perfectDays}</div>
                  <div className="text-sm text-gray-600">Dias 100% completos</div>
                </div>
              </div>
              
              <div className="card">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{averageCompletion}%</div>
                  <div className="text-sm text-gray-600">Média de conclusão</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando dados do progresso...</p>
              </div>
            </div>
          ) : !error ? (
            <div className="overflow-x-auto">
              <HeatmapCalendar data={heatmapData} year={selectedYear} />
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-600">Não foi possível carregar os dados do progresso</p>
            </div>
          )}
        </div>

        {!loading && !error && heatmapData.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado encontrado</h3>
            <p className="text-gray-600">Não há dados de tarefas para {selectedYear}. Comece a criar tarefas para ver seu progresso!</p>
          </div>
        )}
      </div>
    </div>
  );
};