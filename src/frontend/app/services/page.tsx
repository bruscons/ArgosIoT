// app/services/page.tsx

"use client";

import { useState, useCallback } from "react";
import { useServices } from "../../hooks/useServices";
import { useWorkers } from "../../hooks/useWorkers";
import { Header, LoadingSpinner } from "../../components/Common";
import type { Service, CreateServiceData } from "../../types";
import { WEEKDAYS } from "../../config/constants";

interface FormData {
  name: string;
  room_id: string;
  rfid_responsible: string;
  start_time: string;
  end_time: string;
  weekdays: string[];
  validity_start: string;
  validity_end: string;
  active: boolean;
}

const initialFormData: FormData = {
  name: "",
  room_id: "",
  rfid_responsible: "",
  start_time: "08:00",
  end_time: "18:00",
  weekdays: ["SEG", "TER", "QUA", "QUI", "SEX"],
  validity_start: "",
  validity_end: "",
  active: true,
};

export default function ServicesPage() {
  const {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
  } = useServices();
  const { workers } = useWorkers();
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenModal = useCallback((service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        room_id: service.room_id,
        rfid_responsible: service.rfid_responsible,
        start_time: service.start_time,
        end_time: service.end_time,
        weekdays: service.weekdays.split(","),
        validity_start: service.validity_start.split("T")[0],
        validity_end: service.validity_end.split("T")[0],
        active: service.active,
      });
    } else {
      setEditingService(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingService(null);
    setFormData(initialFormData);
  }, []);

  const toggleWeekday = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter((d) => d !== day)
        : [...prev.weekdays, day],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const serviceData = {
        name: formData.name,
        room_id: formData.room_id,
        rfid_responsible: formData.rfid_responsible,
        start_time: formData.start_time,
        end_time: formData.end_time,
        weekdays: formData.weekdays.join(","),
        validity_start: formData.validity_start,
        validity_end: formData.validity_end,
        active: formData.active,
      };

      if (editingService) {
        await updateService(editingService.id, serviceData);
      } else {
        await createService(serviceData as CreateServiceData);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Erro ao salvar serviço:", err);
      alert(err instanceof Error ? err.message : "Erro ao salvar serviço");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Tem certeza que deseja deletar o serviço "${name}"?`)) {
      return;
    }

    try {
      await deleteService(id);
    } catch (err) {
      console.error("Erro ao deletar serviço:", err);
      alert(err instanceof Error ? err.message : "Erro ao deletar serviço");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Serviços" subtitle="Agendamentos e horários de acesso" />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" text="Carregando serviços..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Serviços" subtitle="Agendamentos e horários de acesso" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="font-medium text-yellow-800">
                  API não disponível
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  A rota{" "}
                  <code className="bg-yellow-100 px-1 rounded">
                    /api/services
                  </code>{" "}
                  ainda não está implementada no backend.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header com contagem e botão */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-500">
            {services.length} serviço(s) cadastrado(s)
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
            disabled={!!error}
          >
            + Novo Serviço
          </button>
        </div>

        {/* Tabela de serviços */}
        {services.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">
              {error
                ? "Não foi possível carregar os serviços"
                : "Nenhum serviço cadastrado"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sala
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dias
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validade
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {service.name}
                        </p>
                        {service.responsible_name && (
                          <p className="text-xs text-gray-500">
                            {service.responsible_name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-700">
                        {service.room_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {service.start_time} - {service.end_time}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {service.weekdays.split(",").map((day) => (
                          <span
                            key={day}
                            className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500">
                        {new Date(service.validity_start).toLocaleDateString(
                          "pt-BR"
                        )}{" "}
                        -{" "}
                        {new Date(service.validity_end).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          service.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {service.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(service)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(service.id, service.name)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingService ? "Editar Serviço" : "Novo Serviço"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Serviço
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    placeholder="Ex: Manutenção Elétrica"
                  />
                </div>

                {/* Sala */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sala
                  </label>
                  <input
                    type="text"
                    value={formData.room_id}
                    onChange={(e) =>
                      setFormData({ ...formData, room_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    placeholder="Ex: SALA_01"
                  />
                </div>

                {/* Responsável */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsável
                  </label>
                  <select
                    value={formData.rfid_responsible}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rfid_responsible: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione</option>
                    {workers
                      .filter((w) => w.active)
                      .map((worker) => (
                        <option key={worker.id} value={worker.rfid_uid}>
                          {worker.name} ({worker.rfid_uid})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Horários */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Início
                    </label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({ ...formData, start_time: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fim
                    </label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Dias da semana */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dias da Semana
                  </label>
                  <div className="flex gap-1">
                    {WEEKDAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWeekday(day)}
                        className={`flex-1 py-2 text-xs font-medium rounded transition-colors ${
                          formData.weekdays.includes(day)
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Validade */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Válido de
                    </label>
                    <input
                      type="date"
                      value={formData.validity_start}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          validity_start: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Até
                    </label>
                    <input
                      type="date"
                      value={formData.validity_end}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          validity_end: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Ativo */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label
                    htmlFor="active"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Serviço ativo
                  </label>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
