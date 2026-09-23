// components/Dashboard/DeviceMonitor.tsx
// Monitoramento de dispositivos ESP32 conectados

'use client';

import { useState, useEffect, useCallback } from 'react';
import ApiService from '../../services/ApiService';
import { DEVICE_STATUS } from '../../config/constants';

interface Device {
  id: string;
  name: string;
  status: string;
  last_seen?: string;
  room_id?: string;
}

export default function DeviceMonitor() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Busca os dispositivos da API
  const fetchDevices = useCallback(async () => {
    try {
      setError(null);
      const data = await ApiService.getDevices();
      setDevices(data || []);
      setLastUpdate(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar dispositivos';
      setError(message);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
    
    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchDevices, 30000);
    return () => clearInterval(interval);
  }, [fetchDevices]);

  // Retorna a cor do indicador de status
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      [DEVICE_STATUS.ONLINE]: 'bg-green-500',
      [DEVICE_STATUS.OFFLINE]: 'bg-red-500',
      [DEVICE_STATUS.ERROR]: 'bg-yellow-500',
    };
    return colors[status] || 'bg-gray-400';
  };

  // Retorna o texto do status traduzido
  const getStatusText = (status: string): string => {
    const texts: Record<string, string> = {
      [DEVICE_STATUS.ONLINE]: 'Online',
      [DEVICE_STATUS.OFFLINE]: 'Offline',
      [DEVICE_STATUS.ERROR]: 'Erro',
    };
    return texts[status] || 'Desconhecido';
  };

  // Retorna a cor do texto do status
  const getStatusTextColor = (status: string): string => {
    const colors: Record<string, string> = {
      [DEVICE_STATUS.ONLINE]: 'text-green-600',
      [DEVICE_STATUS.OFFLINE]: 'text-red-600',
      [DEVICE_STATUS.ERROR]: 'text-yellow-600',
    };
    return colors[status] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitoramento de Dispositivos</h3>
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-sm text-gray-500">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Monitoramento de Dispositivos</h3>
        <button
          onClick={fetchDevices}
          className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
        >
          Atualizar
        </button>
      </div>
      
      {/* Mensagem de erro */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Lista de dispositivos */}
      <div className="space-y-3">
        {devices.length === 0 ? (
          <div className="text-center text-gray-500 py-8 border border-dashed border-gray-200 rounded-lg">
            <p className="text-sm">Nenhum dispositivo cadastrado</p>
            <p className="text-xs text-gray-400 mt-1">
              Os dispositivos ESP32 aparecerão aqui quando cadastrados
            </p>
          </div>
        ) : (
          devices.map((device) => (
            <div
              key={device.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors flex items-center justify-between"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{device.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 font-mono">ID: {device.id}</span>
                  {device.room_id && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="text-xs text-gray-500">Sala: {device.room_id}</span>
                    </>
                  )}
                </div>
                {device.last_seen && (
                  <p className="text-xs text-gray-400 mt-1">
                    Última atividade: {device.last_seen}
                  </p>
                )}
              </div>
              
              {/* Indicador de status */}
              <div className="flex items-center gap-2 ml-4">
                <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(device.status)}`} />
                <span className={`text-sm font-medium ${getStatusTextColor(device.status)}`}>
                  {getStatusText(device.status)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Informação de última atualização */}
      {lastUpdate && (
        <p className="text-xs text-gray-400 mt-4 text-right">
          Última verificação: {lastUpdate.toLocaleTimeString('pt-BR')}
        </p>
      )}
    </div>
  );
}
