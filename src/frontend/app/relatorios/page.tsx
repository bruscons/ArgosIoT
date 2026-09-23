// app/relatorios/page.tsx
// Página de relatórios e histórico de acessos

'use client';

import { useState, useCallback } from 'react';
import AccessLogsTable from '../../components/Dashboard/AccessLogsTable';
import { Header } from '../../components/Common';

// Interface para os filtros
interface Filters {
  room_id: string;
  event_type: string;
  start_date: string;
  end_date: string;
}

// Estado inicial dos filtros
const initialFilters: Filters = {
  room_id: '',
  event_type: '',
  start_date: '',
  end_date: '',
};

export default function RelatoriosPage() {
  const [filters, setFilters] = useState<Filters>(initialFilters);

  // Handler para mudança de filtros com useCallback para performance
  const handleFilterChange = useCallback((field: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Reset dos filtros
  const handleReset = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Relatórios" subtitle="Histórico e análise de acessos" />

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seção de filtros */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Filtros</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro de sala */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sala
              </label>
              <input
                type="text"
                value={filters.room_id}
                onChange={(e) => handleFilterChange('room_id', e.target.value)}
                placeholder="Ex: SALA_01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filtro de tipo de evento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Evento
              </label>
              <select
                value={filters.event_type}
                onChange={(e) => handleFilterChange('event_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="entry">Entrada</option>
                <option value="exit">Saída</option>
              </select>
            </div>

            {/* Filtro de data inicial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filtro de data final */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botões de ação */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </section>

        {/* Tabela de logs com paginação maior */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <AccessLogsTable filters={filters} pageSize={20} />
        </section>
      </main>
    </div>
  );
}
