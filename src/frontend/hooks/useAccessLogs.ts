// hooks/useAccessLogs.ts
// Hook para gerenciar logs de acesso do backend

import { useState, useEffect, useCallback, useMemo } from 'react';
import ApiService from '../services/ApiService';
import type { AccessLog, AccessLogsFilters } from '../types';

interface UseAccessLogsReturn {
  logs: AccessLog[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAccessLogs(filters?: AccessLogsFilters): UseAccessLogsReturn {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Serializa filtros para uso como dependência
  const filtersKey = useMemo(() => {
    if (!filters) return '';
    return JSON.stringify({
      room_id: filters.room_id || '',
      event_type: filters.event_type || '',
      start_date: filters.start_date || '',
      end_date: filters.end_date || '',
    });
  }, [filters]);

  // Função de busca reutilizável
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await ApiService.getAccessLogs(filters);
      setLogs(data);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro desconhecido');
      setError(errorObj);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Busca inicial e quando filtros mudam
  useEffect(() => {
    fetchLogs();
  }, [filtersKey]); // Usa filtersKey para evitar loops infinitos

  return { 
    logs, 
    loading, 
    error, 
    refetch: fetchLogs 
  };
}
