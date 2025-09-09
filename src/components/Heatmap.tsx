import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HeatmapCalendar } from '../components/HeatmapCalendar';
import { taskApi } from '../services/api';
import type { HeatmapData } from '../types';

export const Heatmap: React.FC = () => {
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

  return (
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
  );
}