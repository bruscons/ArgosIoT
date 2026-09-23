// app/authorizations/page.tsx

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAuthorizations } from '../../hooks/useAuthorizations';
import { useWorkers } from '../../hooks/useWorkers';
import { useServices } from '../../hooks/useServices';
import { Header, LoadingSpinner } from '../../components/Common';
import type { ServiceAuthorization } from '../../types';

export default function AuthorizationsPage() {
  const { authorizations, loading, error, createAuthorization, updateAuthorization, deleteAuthorization } = useAuthorizations();
  const { workers } = useWorkers();
  const { services } = useServices();
  const [expandedService, setExpandedService] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingToService, setAddingToService] = useState<number | null>(null);

  // Agrupar autorizações por serviço
  const authsByService = useMemo(() => {
    const grouped: Record<number, ServiceAuthorization[]> = {};
    services.forEach((s) => {
      grouped[s.id] = authorizations.filter((a) => a.service_id === s.id);
    });
    return grouped;
  }, [authorizations, services]);

  // Workers disponíveis para adicionar a um serviço específico
  const getAvailableWorkers = useCallback(
    (serviceId: number) => {
      const existingRfids = new Set(
        authorizations.filter((a) => a.service_id === serviceId).map((a) => a.rfid_uid)
      );
      return workers.filter(
        (w) =>
          w.active &&
          !existingRfids.has(w.rfid_uid) &&
          (w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.rfid_uid.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    },
    [workers, authorizations, searchTerm]
  );

  const handleAddAuthorization = async (serviceId: number, rfidUid: string) => {
    try {
      await createAuthorization({ service_id: serviceId, rfid_uid: rfidUid, active: true });
      setSearchTerm('');
      setAddingToService(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar autorização');
    }
  };

  const handleToggleStatus = async (auth: ServiceAuthorization) => {
    try {
      await updateAuthorization(auth.id, { active: !auth.active });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover esta autorização?')) return;
    try {
      await deleteAuthorization(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao remover');
    }
  };

  const getWorkerName = (rfid: string) => workers.find((w) => w.rfid_uid === rfid)?.name || rfid;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Autorizações" subtitle="Controle de acesso por serviço" />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" text="Carregando..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Autorizações" subtitle="Controle de acesso por serviço" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-medium text-yellow-800">API não disponível</p>
            <p className="text-sm text-yellow-700 mt-1">
              A rota <code className="bg-yellow-100 px-1 rounded">/api/authorizations</code> não está implementada.
            </p>
          </div>
        )}

        {/* Resumo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex gap-6 text-sm text-gray-600">
            <span>{services.length} serviço(s)</span>
            <span>{authorizations.length} autorização(ões)</span>
            <span>{authorizations.filter((a) => a.active).length} ativa(s)</span>
          </div>
        </div>

        {/* Lista de serviços */}
        {services.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Nenhum serviço cadastrado</p>
            <p className="text-sm text-gray-400 mt-1">Cadastre serviços antes de criar autorizações</p>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => {
              const serviceAuths = authsByService[service.id] || [];
              const isExpanded = expandedService === service.id;
              const isAdding = addingToService === service.id;
              const availableWorkers = getAvailableWorkers(service.id);

              return (
                <div
                  key={service.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Header do serviço */}
                  <button
                    onClick={() => setExpandedService(isExpanded ? null : service.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-2 h-2 rounded-full ${service.active ? 'bg-green-500' : 'bg-gray-300'}`}
                      />
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-500">
                          {service.room_id} · {service.start_time} - {service.end_time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {serviceAuths.length} pessoa(s)
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Conteúdo expandido */}
                  {isExpanded && (
                    <div className="border-t border-gray-200">
                      {/* Adicionar funcionário */}
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        {isAdding ? (
                          <div className="relative">
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Digite o nome ou RFID do funcionário..."
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                              autoFocus
                            />
                            {searchTerm && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto z-10">
                                {availableWorkers.length === 0 ? (
                                  <div className="px-4 py-3 text-sm text-gray-500">
                                    Nenhum funcionário encontrado
                                  </div>
                                ) : (
                                  availableWorkers.slice(0, 10).map((worker) => (
                                    <button
                                      key={worker.id}
                                      onClick={() => handleAddAuthorization(service.id, worker.rfid_uid)}
                                      className="w-full px-4 py-2 text-left hover:bg-purple-50 flex items-center justify-between"
                                    >
                                      <span className="font-medium text-gray-900">{worker.name}</span>
                                      <code className="text-xs text-gray-500">{worker.rfid_uid}</code>
                                    </button>
                                  ))
                                )}
                              </div>
                            )}
                            <button
                              onClick={() => {
                                setAddingToService(null);
                                setSearchTerm('');
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAddingToService(service.id)}
                            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                          >
                            + Adicionar funcionário
                          </button>
                        )}
                      </div>

                      {/* Lista de autorizações */}
                      {serviceAuths.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500 text-sm">
                          Nenhum funcionário autorizado
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {serviceAuths.map((auth) => (
                            <div
                              key={auth.id}
                              className="px-6 py-3 flex items-center justify-between hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                  <span className="text-purple-600 font-medium text-sm">
                                    {getWorkerName(auth.rfid_uid).charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">
                                    {auth.worker_name || getWorkerName(auth.rfid_uid)}
                                  </p>
                                  <code className="text-xs text-gray-400">{auth.rfid_uid}</code>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleStatus(auth)}
                                  className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                                    auth.active
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                  }`}
                                >
                                  {auth.active ? 'Ativo' : 'Inativo'}
                                </button>
                                <button
                                  onClick={() => handleDelete(auth.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}