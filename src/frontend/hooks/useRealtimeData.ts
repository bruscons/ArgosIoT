// hooks/useRealtimeData.ts
// Hook para gerenciar dados em tempo real via MQTT

import { useEffect, useState, useCallback } from 'react';
import MQTTService from '../services/MQTTService';
import { RESPONSE_TYPES } from '../config/constants';
import type { AccessEvent } from '../types';

// Número máximo de eventos mantidos em memória
const MAX_EVENTS = 1000;

interface UseRealtimeDataReturn {
  events: AccessEvent[];
  isConnected: boolean;
  error: Error | null;
}

export function useRealtimeData(): UseRealtimeDataReturn {
  const [events, setEvents] = useState<AccessEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Handler para processar mensagens MQTT recebidas
  const handleMessage = useCallback((topic: string, message: Buffer) => {
    try {
      const data = JSON.parse(message.toString());
      
      // Log para debug (pode ser removido em produção)
      console.log('[MQTT] Mensagem recebida:', { topic, data });
      
      // Extrai device_id do tópico (ex: access/response/ESP32_001)
      const topicParts = topic.split('/');
      const deviceId = topicParts[topicParts.length - 1];

      // Processa o timestamp (suporta string ou número)
      let timestamp = Date.now();
      if (data.timestamp) {
        timestamp = typeof data.timestamp === 'string' 
          ? parseInt(data.timestamp, 10) 
          : data.timestamp;
        
        // Valida se o timestamp é válido
        if (isNaN(timestamp) || timestamp <= 0) {
          timestamp = Date.now();
        }
      }

      // Monta o objeto de evento
      const event: AccessEvent = {
        request_id: data.request_id || `unknown_${Date.now()}`,
        response_type: data.response_type || RESPONSE_TYPES.ERROR,
        access_granted: Boolean(data.access_granted),
        message: data.message || { line1: 'Erro', line2: 'Desconhecido' },
        timestamp,
        device_id: deviceId,
      };

      console.log('[MQTT] Evento processado:', event);
      
      // Adiciona evento no início e limita quantidade
      setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS));
    } catch (err) {
      console.error('[MQTT] Erro ao processar mensagem:', err);
      console.error('[MQTT] Payload recebido:', message.toString());
    }
  }, []);

  // Conecta ao MQTT quando o componente monta
  useEffect(() => {
    console.log('[MQTT] Inicializando conexão...');
    
    MQTTService.connect(
      handleMessage,
      // Callback de conexão bem sucedida
      () => {
        console.log('[MQTT] Conectado com sucesso');
        setIsConnected(true);
        setError(null);
      },
      // Callback de erro
      (err) => {
        console.error('[MQTT] Erro na conexão:', err);
        setError(err);
        setIsConnected(false);
      }
    );

    // Cleanup: desconecta quando componente desmonta
    return () => {
      console.log('[MQTT] Desconectando...');
      MQTTService.disconnect();
    };
  }, [handleMessage]);

  return { events, isConnected, error };
}
