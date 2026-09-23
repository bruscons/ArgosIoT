// hooks/useWorkers.ts
// Hook para gerenciar CRUD de funcionários

import { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/ApiService';
import type { Worker, CreateWorkerData, UpdateWorkerData } from '../types';

interface UseWorkersReturn {
  workers: Worker[];
  loading: boolean;
  error: Error | null;
  createWorker: (data: CreateWorkerData) => Promise<Worker>;
  updateWorker: (id: number, data: UpdateWorkerData) => Promise<Worker>;
  deleteWorker: (id: number) => Promise<void>;
  getWorkerById: (id: number) => Promise<Worker>;
  refetch: () => Promise<void>;
}

// Ordena workers por nome alfabeticamente
const sortByName = (workers: Worker[]): Worker[] => {
  return [...workers].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
};

export function useWorkers(): UseWorkersReturn {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Busca todos os workers
  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getWorkers();
      setWorkers(sortByName(data));
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro ao buscar funcionários');
      setError(errorObj);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega workers na montagem
  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // Cria novo worker
  const createWorker = useCallback(async (workerData: CreateWorkerData): Promise<Worker> => {
    try {
      setError(null);
      const newWorker = await ApiService.createWorker(workerData);
      setWorkers((prev) => sortByName([...prev, newWorker]));
      return newWorker;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro ao criar funcionário');
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  // Atualiza worker existente
  const updateWorker = useCallback(async (id: number, workerData: UpdateWorkerData): Promise<Worker> => {
    try {
      setError(null);
      const updatedWorker = await ApiService.updateWorker(id, workerData);
      setWorkers((prev) => sortByName(
        prev.map((w) => (w.id === id ? updatedWorker : w))
      ));
      return updatedWorker;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro ao atualizar funcionário');
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  // Remove worker
  const deleteWorker = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      await ApiService.deleteWorker(id);
      setWorkers((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro ao deletar funcionário');
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  // Busca worker por ID
  const getWorkerById = useCallback(async (id: number): Promise<Worker> => {
    try {
      setError(null);
      return await ApiService.getWorkerById(id);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro ao buscar funcionário');
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  return {
    workers,
    loading,
    error,
    createWorker,
    updateWorker,
    deleteWorker,
    getWorkerById,
    refetch: fetchWorkers,
  };
}
