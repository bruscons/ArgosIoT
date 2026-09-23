// hooks/useServices.ts
// Hook para gerenciar CRUD de serviços

import { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/ApiService';
import type { Service, CreateServiceData, UpdateServiceData } from '../types';

interface UseServicesReturn {
  services: Service[];
  loading: boolean;
  error: Error | null;
  createService: (data: CreateServiceData) => Promise<Service>;
  updateService: (id: number, data: UpdateServiceData) => Promise<Service>;
  deleteService: (id: number) => Promise<void>;
  getServiceById: (id: number) => Promise<Service>;
  refetch: () => Promise<void>;
}

// Ordena serviços por nome
const sortByName = (services: Service[]): Service[] => {
  return [...services].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
};

export function useServices(): UseServicesReturn {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Busca todos os serviços
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getServices();
      setServices(sortByName(data));
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro ao buscar serviços');
      setError(errorObj);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega serviços na montagem
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Cria novo serviço
  const createService = useCallback(async (serviceData: CreateServiceData): Promise<Service> => {
    try {
      setError(null);
      const newService = await ApiService.createService(serviceData);
      setServices((prev) => sortByName([...prev, newService]));
      return newService;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro ao criar serviço');
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  // Atualiza serviço existente
  const updateService = useCallback(async (id: number, serviceData: UpdateServiceData): Promise<Service> => {
    try {
      setError(null);
      const updatedService = await ApiService.updateService(id, serviceData);
      setServices((prev) => sortByName(
        prev.map((s) => (s.id === id ? updatedService : s))
      ));
      return updatedService;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro ao atualizar serviço');
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  // Remove serviço
  const deleteService = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      await ApiService.deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro ao deletar serviço');
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  // Busca serviço por ID
  const getServiceById = useCallback(async (id: number): Promise<Service> => {
    try {
      setError(null);
      return await ApiService.getServiceById(id);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro ao buscar serviço');
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    getServiceById,
    refetch: fetchServices,
  };
}
