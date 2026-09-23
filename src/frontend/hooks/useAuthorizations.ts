// hooks/useAuthorizations.ts
// Hook para gerenciar autorizações de serviço

import { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/ApiService';
import type { ServiceAuthorization, CreateAuthorizationData, UpdateAuthorizationData } from '../types';

interface UseAuthorizationsReturn {
  authorizations: ServiceAuthorization[];
  loading: boolean;
  error: Error | null;
  createAuthorization: (data: CreateAuthorizationData) => Promise<ServiceAuthorization>;
  updateAuthorization: (id: number, data: UpdateAuthorizationData) => Promise<ServiceAuthorization>;
  deleteAuthorization: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useAuthorizations(): UseAuthorizationsReturn {
  const [authorizations, setAuthorizations] = useState<ServiceAuthorization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Busca todas as autorizações
  const fetchAuthorizations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getAuthorizations();
      setAuthorizations(data);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro ao buscar autorizações');
      setError(errorObj);
      setAuthorizations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega autorizações na montagem
  useEffect(() => {
    fetchAuthorizations();
  }, [fetchAuthorizations]);

  // Cria nova autorização
  const createAuthorization = useCallback(async (data: CreateAuthorizationData): Promise<ServiceAuthorization> => {
    try {
      setError(null);
      const newAuth = await ApiService.createAuthorization(data);
      setAuthorizations((prev) => [...prev, newAuth]);
      return newAuth;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro ao criar autorização');
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  // Atualiza autorização
  const updateAuthorization = useCallback(async (id: number, data: UpdateAuthorizationData): Promise<ServiceAuthorization> => {
    try {
      setError(null);
      const updatedAuth = await ApiService.updateAuthorization(id, data);
      setAuthorizations((prev) =>
        prev.map((a) => (a.id === id ? updatedAuth : a))
      );
      return updatedAuth;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro ao atualizar autorização');
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  // Remove autorização
  const deleteAuthorization = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      await ApiService.deleteAuthorization(id);
      setAuthorizations((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro ao deletar autorização');
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  return {
    authorizations,
    loading,
    error,
    createAuthorization,
    updateAuthorization,
    deleteAuthorization,
    refetch: fetchAuthorizations,
  };
}
