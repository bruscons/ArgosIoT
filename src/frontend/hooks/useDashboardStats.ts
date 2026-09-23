// hooks/useDashboardStats.ts
// Hook para buscar estatísticas do dashboard

import { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/ApiService';
import type { DashboardStats } from '../types';

// Valores padrão para exibição inicial
const defaultStats: DashboardStats = {
  totalWorkers: 0,
  activeWorkers: 0,
  totalServices: 0,
  activeServices: 0,
  totalAccessToday: 0,
  deniedAccessToday: 0,
  devicesOnline: 0,
  devicesTotal: 0,
};

interface UseDashboardStatsReturn {
  stats: DashboardStats;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Busca estatísticas
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getDashboardStats();
      setStats(data);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro ao buscar estatísticas');
      setError(errorObj);
      // Mantém valores padrão em caso de erro
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca inicial
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Atualiza a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
