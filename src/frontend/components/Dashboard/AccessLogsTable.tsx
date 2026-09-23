// components/Dashboard/AccessLogsTable.tsx
// Tabela de histórico de acessos com paginação

'use client';

import { useMemo, useState } from 'react';
import { useAccessLogs } from '../../hooks/useAccessLogs';
import DateFormatter from '../../utils/dateFormatter';

interface AccessLogsTableProps {
  filters?: {
    room_id?: string;
    event_type?: string;
    start_date?: string;
    end_date?: string;
  };
  pageSize?: number;
}

// Traduz o tipo de evento para português
const getActivity = (eventType: string): string => {
  const activities: Record<string, string> = {
    entry: 'Entrada',
    exit: 'Saída',
  };
  return activities[eventType] || eventType;
};

// Retorna a equipe baseada no room_id
const getTeam = (roomId: string): string => {
  if (!roomId) return '-';
  
  const teamMapping: Record<string, string> = {
    SALA_A: 'Manutenção',
    SALA_B: 'Limpeza',
    SALA_01: 'Técnica',
    SALA_02: 'Operações',
  };
  
  for (const [key, team] of Object.entries(teamMapping)) {
    if (roomId.includes(key) || roomId.toUpperCase().includes(key)) {
      return team;
    }
  }
  
  return 'Geral';
};

// Formata a mensagem completa (line1 + line2)
const formatMessage = (message: { line1?: string; line2?: string } | string | null): string => {
  if (!message) return '-';
  
  if (typeof message === 'string') {
    return message || '-';
  }
  
  const parts = [message.line1, message.line2].filter(Boolean);
  return parts.length > 0 ? parts.join(' - ') : '-';
};

export default function AccessLogsTable({ filters, pageSize = 10 }: AccessLogsTableProps) {
  const { logs, loading, error } = useAccessLogs(filters);
  const [currentPage, setCurrentPage] = useState(1);

  // Formata os logs para exibição
  const formattedLogs = useMemo(() => {
    return logs.map((log) => ({
      ...log,
      formattedTime: typeof log.timestamp_request === 'string' 
        ? log.timestamp_request 
        : DateFormatter.toReadable(new Date(log.timestamp_request)),
      activity: getActivity(log.event_type),
      team: getTeam(log.room_id),
      fullMessage: formatMessage(log.message),
    }));
  }, [logs]);

  // Cálculos de paginação
  const totalPages = Math.ceil(formattedLogs.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLogs = formattedLogs.slice(startIndex, endIndex);

  // Navegação de páginas
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Reset para primeira página quando filtros mudam
  useMemo(() => {
    setCurrentPage(1);
  }, [filters?.room_id, filters?.event_type, filters?.start_date, filters?.end_date]);

  if (loading) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4">Histórico de Acessos</h3>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-gray-500">Carregando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4">Histórico de Acessos</h3>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Erro ao carregar logs: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header com contagem */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Histórico de Acessos</h3>
        <span className="text-sm text-gray-500">
          {formattedLogs.length} registro(s) encontrado(s)
        </span>
      </div>
      
      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sala
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Atividade
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipe
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RFID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data/Hora
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mensagem
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Nenhum log encontrado
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.room_id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        log.event_type === 'entry'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {log.activity}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {log.team}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-700">
                    {log.rfid_uid}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        log.access_granted
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {log.access_granted ? 'Permitido' : 'Negado'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {log.formattedTime}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span title={log.fullMessage} className="block">
                      {log.fullMessage}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          {/* Info de páginas */}
          <div className="text-sm text-gray-500">
            Mostrando {startIndex + 1} a {Math.min(endIndex, formattedLogs.length)} de {formattedLogs.length}
          </div>

          {/* Controles de navegação */}
          <div className="flex items-center gap-2">
            {/* Primeira página */}
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Primeira página"
            >
              ««
            </button>

            {/* Página anterior */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {/* Números de página */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Mostra: primeira, última, atual, e páginas próximas
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, index, array) => {
                  // Adiciona reticências se houver lacuna
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <span key={page} className="flex items-center">
                      {showEllipsis && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => goToPage(page)}
                        className={`w-8 h-8 text-sm rounded ${
                          page === currentPage
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    </span>
                  );
                })}
            </div>

            {/* Próxima página */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>

            {/* Última página */}
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Última página"
            >
              »»
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
