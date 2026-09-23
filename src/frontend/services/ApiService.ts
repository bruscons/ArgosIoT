// services/ApiService.ts
// Serviço de comunicação com a API REST do backend

import type { 
  AccessLog, 
  AccessLogsFilters, 
  Device, 
  Worker, 
  CreateWorkerData, 
  UpdateWorkerData,
  Service,
  CreateServiceData,
  UpdateServiceData,
  ServiceAuthorization,
  CreateAuthorizationData,
  UpdateAuthorizationData,
  DashboardStats,
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper para construir query params
const buildQueryString = (params: Record<string, string | undefined>): string => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Helper para tratar erros de fetch
const handleFetchError = (error: unknown, context: string): never => {
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    throw new Error(`Não foi possível conectar ao backend em ${API_URL}. Verifique se o servidor está rodando.`);
  }
  if (error instanceof Error) {
    throw error;
  }
  throw new Error(`Erro desconhecido em ${context}`);
};

// Helper para fazer requisições
async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

class ApiService {
  // Buscar logs de acesso com filtros opcionais
  static async getAccessLogs(filters?: AccessLogsFilters): Promise<AccessLog[]> {
    try {
      const query = buildQueryString({
        room_id: filters?.room_id,
        event_type: filters?.event_type,
        start_date: filters?.start_date,
        end_date: filters?.end_date,
      });
      
      return await fetchApi<AccessLog[]>(`/api/access/logs${query}`);
    } catch (error) {
      console.error('[API] Erro ao buscar logs de acesso:', error);
      handleFetchError(error, 'getAccessLogs');
    }
  }

  // Buscar status do MQTT
  static async getMQTTStatus(): Promise<{ connected: boolean; lastMessage?: string }> {
    try {
      return await fetchApi('/api/access/mqtt/status');
    } catch (error) {
      console.error('[API] Erro ao buscar status MQTT:', error);
      handleFetchError(error, 'getMQTTStatus');
    }
  }

  // Buscar estatísticas de acesso
  static async getAccessStats(filters?: {
    room_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{ total: number; granted: number; denied: number }> {
    try {
      const query = buildQueryString({
        room_id: filters?.room_id,
        start_date: filters?.start_date,
        end_date: filters?.end_date,
      });
      
      return await fetchApi(`/api/access/stats${query}`);
    } catch (error) {
      console.error('[API] Erro ao buscar estatísticas:', error);
      handleFetchError(error, 'getAccessStats');
    }
  }

  // Buscar dispositivos conectados
  static async getDevices(): Promise<Device[]> {
    try {
      return await fetchApi<Device[]>('/api/devices');
    } catch (error) {
      console.error('[API] Erro ao buscar dispositivos:', error);
      handleFetchError(error, 'getDevices');
    }
  }

  // =============================================
  // Workers CRUD
  // =============================================

  // Buscar todos os workers
  static async getWorkers(): Promise<Worker[]> {
    try {
      return await fetchApi<Worker[]>('/api/workers');
    } catch (error) {
      console.error('[API] Erro ao buscar workers:', error);
      handleFetchError(error, 'getWorkers');
    }
  }

  // Buscar worker por ID
  static async getWorkerById(id: number): Promise<Worker> {
    try {
      return await fetchApi<Worker>(`/api/workers/${id}`);
    } catch (error) {
      console.error('[API] Erro ao buscar worker:', error);
      handleFetchError(error, 'getWorkerById');
    }
  }

  // Criar novo worker
  static async createWorker(workerData: CreateWorkerData): Promise<Worker> {
    try {
      return await fetchApi<Worker>('/api/workers', {
        method: 'POST',
        body: JSON.stringify(workerData),
      });
    } catch (error) {
      console.error('[API] Erro ao criar worker:', error);
      handleFetchError(error, 'createWorker');
    }
  }

  // Atualizar worker existente
  static async updateWorker(id: number, workerData: UpdateWorkerData): Promise<Worker> {
    try {
      return await fetchApi<Worker>(`/api/workers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(workerData),
      });
    } catch (error) {
      console.error('[API] Erro ao atualizar worker:', error);
      handleFetchError(error, 'updateWorker');
    }
  }

  // Deletar worker
  static async deleteWorker(id: number): Promise<{ message: string }> {
    try {
      return await fetchApi<{ message: string }>(`/api/workers/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('[API] Erro ao deletar worker:', error);
      handleFetchError(error, 'deleteWorker');
    }
  }

  // =============================================
  // Services CRUD
  // =============================================

  // Buscar todos os serviços
  static async getServices(): Promise<Service[]> {
    try {
      return await fetchApi<Service[]>('/api/services');
    } catch (error) {
      console.error('[API] Erro ao buscar serviços:', error);
      handleFetchError(error, 'getServices');
    }
  }

  // Buscar serviço por ID
  static async getServiceById(id: number): Promise<Service> {
    try {
      return await fetchApi<Service>(`/api/services/${id}`);
    } catch (error) {
      console.error('[API] Erro ao buscar serviço:', error);
      handleFetchError(error, 'getServiceById');
    }
  }

  // Criar novo serviço
  static async createService(serviceData: CreateServiceData): Promise<Service> {
    try {
      return await fetchApi<Service>('/api/services', {
        method: 'POST',
        body: JSON.stringify(serviceData),
      });
    } catch (error) {
      console.error('[API] Erro ao criar serviço:', error);
      handleFetchError(error, 'createService');
    }
  }

  // Atualizar serviço existente
  static async updateService(id: number, serviceData: UpdateServiceData): Promise<Service> {
    try {
      return await fetchApi<Service>(`/api/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(serviceData),
      });
    } catch (error) {
      console.error('[API] Erro ao atualizar serviço:', error);
      handleFetchError(error, 'updateService');
    }
  }

  // Deletar serviço
  static async deleteService(id: number): Promise<{ message: string }> {
    try {
      return await fetchApi<{ message: string }>(`/api/services/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('[API] Erro ao deletar serviço:', error);
      handleFetchError(error, 'deleteService');
    }
  }

  // =============================================
  // Service Authorizations CRUD
  // =============================================

  // Buscar todas as autorizações
  static async getAuthorizations(): Promise<ServiceAuthorization[]> {
    try {
      return await fetchApi<ServiceAuthorization[]>('/api/authorizations');
    } catch (error) {
      console.error('[API] Erro ao buscar autorizações:', error);
      handleFetchError(error, 'getAuthorizations');
    }
  }

  // Buscar autorizações por serviço
  static async getAuthorizationsByService(serviceId: number): Promise<ServiceAuthorization[]> {
    try {
      return await fetchApi<ServiceAuthorization[]>(`/api/authorizations/service/${serviceId}`);
    } catch (error) {
      console.error('[API] Erro ao buscar autorizações do serviço:', error);
      handleFetchError(error, 'getAuthorizationsByService');
    }
  }

  // Buscar autorizações por worker
  static async getAuthorizationsByWorker(rfidUid: string): Promise<ServiceAuthorization[]> {
    try {
      return await fetchApi<ServiceAuthorization[]>(`/api/authorizations/worker/${rfidUid}`);
    } catch (error) {
      console.error('[API] Erro ao buscar autorizações do worker:', error);
      handleFetchError(error, 'getAuthorizationsByWorker');
    }
  }

  // Criar nova autorização
  static async createAuthorization(data: CreateAuthorizationData): Promise<ServiceAuthorization> {
    try {
      return await fetchApi<ServiceAuthorization>('/api/authorizations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('[API] Erro ao criar autorização:', error);
      handleFetchError(error, 'createAuthorization');
    }
  }

  // Atualizar autorização
  static async updateAuthorization(id: number, data: UpdateAuthorizationData): Promise<ServiceAuthorization> {
    try {
      return await fetchApi<ServiceAuthorization>(`/api/authorizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('[API] Erro ao atualizar autorização:', error);
      handleFetchError(error, 'updateAuthorization');
    }
  }

  // Deletar autorização
  static async deleteAuthorization(id: number): Promise<{ message: string }> {
    try {
      return await fetchApi<{ message: string }>(`/api/authorizations/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('[API] Erro ao deletar autorização:', error);
      handleFetchError(error, 'deleteAuthorization');
    }
  }

  // =============================================
  // Dashboard Stats
  // =============================================

  // Buscar estatísticas do dashboard
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      return await fetchApi<DashboardStats>('/api/dashboard/stats');
    } catch (error) {
      console.error('[API] Erro ao buscar estatísticas do dashboard:', error);
      // Retorna valores padrão em caso de erro (graceful degradation)
      return {
        totalWorkers: 0,
        activeWorkers: 0,
        totalServices: 0,
        activeServices: 0,
        totalAccessToday: 0,
        deniedAccessToday: 0,
        devicesOnline: 0,
        devicesTotal: 0,
      };
    }
  }
}

export default ApiService;
