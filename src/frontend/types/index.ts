// types/index.ts
// Definições de tipos TypeScript para o projeto Argos

// Evento de acesso recebido via MQTT
export interface AccessEvent {
  request_id: string;
  response_type: string;
  access_granted: boolean;
  message: {
    line1: string;
    line2: string;
  };
  timestamp: number;
  device_id?: string;
}

// Log de acesso armazenado no banco
export interface AccessLog {
  id: number;
  request_id: string;
  rfid_uid: string;
  room_id: string;
  event_type: 'entry' | 'exit';
  timestamp_request: string;
  access_granted: boolean;
  message: {
    line1: string;
    line2: string;
  };
  service_authorization_id?: number;
  worker_name?: string; // Pode vir populado do backend
  service_name?: string; // Pode vir populado do backend
}

// Dispositivo IoT (ESP32)
export interface Device {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  last_seen?: string;
  room_id?: string;
}

// Filtros para busca de logs
export interface AccessLogsFilters {
  room_id?: string;
  event_type?: string;
  start_date?: string;
  end_date?: string;
}

// Funcionário/Worker
export interface Worker {
  id: number;
  rfid_uid: string;
  password_hash?: string;
  name: string;
  active: boolean;
  created_at?: string;
  created_at_readable?: string;
  updated_at?: string;
  updated_at_readable?: string;
}

// Dados para criar novo funcionário
export interface CreateWorkerData {
  rfid_uid: string;
  password: string;
  name: string;
  active?: boolean;
}

// Dados para atualizar funcionário
export interface UpdateWorkerData {
  rfid_uid?: string;
  password?: string;
  name?: string;
  active?: boolean;
}

// Serviço/Agendamento
export interface Service {
  id: number;
  name: string;
  room_id: string;
  rfid_responsible: string;
  responsible_name?: string; // Populado via JOIN
  start_time: string;
  end_time: string;
  weekdays: string;
  validity_start: string;
  validity_start_readable?: string;
  validity_end: string;
  validity_end_readable?: string;
  active: boolean;
  created_at?: string;
  created_at_readable?: string;
  updated_at?: string;
  updated_at_readable?: string;
}

// Dados para criar serviço
export interface CreateServiceData {
  name: string;
  room_id: string;
  rfid_responsible: string;
  start_time: string;
  end_time: string;
  weekdays: string;
  validity_start: string;
  validity_end: string;
  active?: boolean;
}

// Dados para atualizar serviço
export interface UpdateServiceData {
  name?: string;
  room_id?: string;
  rfid_responsible?: string;
  start_time?: string;
  end_time?: string;
  weekdays?: string;
  validity_start?: string;
  validity_end?: string;
  active?: boolean;
}

// Autorização de serviço (relação worker-service)
export interface ServiceAuthorization {
  id: number;
  rfid_uid: string;
  service_id: number;
  active: boolean;
  created_at?: string;
  created_at_readable?: string;
  updated_at?: string;
  updated_at_readable?: string;
  worker_name?: string; // Populado via JOIN
  service_name?: string; // Populado via JOIN
  room_id?: string; // Populado via JOIN
}

// Dados para criar autorização
export interface CreateAuthorizationData {
  rfid_uid: string;
  service_id: number;
  active?: boolean;
}

// Dados para atualizar autorização
export interface UpdateAuthorizationData {
  active?: boolean;
}

// Estatísticas de acesso
export interface AccessStats {
  total: number;
  granted: number;
  denied: number;
  errors?: number;
}

// Estatísticas do dashboard
export interface DashboardStats {
  totalWorkers: number;
  activeWorkers: number;
  totalServices: number;
  activeServices: number;
  totalAccessToday: number;
  deniedAccessToday: number;
  devicesOnline: number;
  devicesTotal: number;
}

// Status do MQTT
export interface MQTTStatus {
  connected: boolean;
  lastMessage?: string;
  subscribedTopics?: string[];
}
