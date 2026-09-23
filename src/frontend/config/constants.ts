// config/constants.ts
// Constantes globais da aplicação Argos

// Tipos de eventos de acesso
export const EVENT_TYPES = {
  ENTRY: 'entry',
  EXIT: 'exit',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

// Tipos de resposta do sistema
export const RESPONSE_TYPES = {
  SUCCESS: 'success',
  DENIED: 'denied',
  ERROR: 'error',
} as const;

export type ResponseType = typeof RESPONSE_TYPES[keyof typeof RESPONSE_TYPES];

// Status de dispositivos IoT
export const DEVICE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  ERROR: 'error',
} as const;

export type DeviceStatusType = typeof DEVICE_STATUS[keyof typeof DEVICE_STATUS];

// Cores para status de acesso (usadas no gráfico)
export const ACCESS_COLORS = {
  GRANTED: '#10b981', // verde - acesso permitido
  DENIED: '#ef4444',  // vermelho - acesso negado
  ERROR: '#f59e0b',   // amarelo - erro no sistema
} as const;

// Durações de exibição em milissegundos
export const DISPLAY_DURATIONS = {
  SUCCESS: 3000,
  ERROR: 5000,
  NOTIFICATION: 4000,
} as const;

// Dias da semana em português (abreviados)
export const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'] as const;

// Dias da semana completos
export const WEEKDAYS_FULL = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
] as const;

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Configurações de atualização automática (em ms)
export const REFRESH_INTERVALS = {
  DEVICES: 30000,    // 30 segundos
  LOGS: 60000,       // 1 minuto
  STATS: 120000,     // 2 minutos
} as const;
