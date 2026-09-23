// app/workers/page.tsx

"use client";

import { useState, useCallback, useMemo } from "react";
import { useWorkers } from "../../hooks/useWorkers";
import { Header, LoadingSpinner } from "../../components/Common";
import type { Worker, CreateWorkerData, UpdateWorkerData } from "../../types";

interface FormData {
  rfid_uid: string;
  password: string;
  name: string;
  active: boolean;
}

const initialFormData: FormData = {
  rfid_uid: "",
  password: "",
  name: "",
  active: true,
};

export default function WorkersPage() {
  const { workers, loading, error, createWorker, updateWorker, deleteWorker } =
    useWorkers();
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Filtrar workers
  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const matchesSearch =
        worker.name.toLowerCase().includes(search.toLowerCase()) ||
        worker.rfid_uid.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && worker.active) ||
        (filterStatus === "inactive" && !worker.active);
      return matchesSearch && matchesStatus;
    });
  }, [workers, search, filterStatus]);

  const handleOpenModal = useCallback((worker?: Worker) => {
    if (worker) {
      setEditingWorker(worker);
      setFormData({
        rfid_uid: worker.rfid_uid,
        password: "",
        name: worker.name,
        active: worker.active,
      });
    } else {
      setEditingWorker(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingWorker(null);
    setFormData(initialFormData);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingWorker) {
        const updateData: UpdateWorkerData = {
          rfid_uid: formData.rfid_uid,
          name: formData.name,
          active: formData.active,
        };
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }
        await updateWorker(editingWorker.id, updateData);
      } else {
        const createData: CreateWorkerData = {
          rfid_uid: formData.rfid_uid,
          password: formData.password,
          name: formData.name,
          active: formData.active,
        };
        await createWorker(createData);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Erro ao salvar funcionário:", err);
      alert(err instanceof Error ? err.message : "Erro ao salvar funcionário");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) return;
    try {
      await deleteWorker(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir");
    }
  };

  const handleToggleStatus = async (worker: Worker) => {
    try {
      await updateWorker(worker.id, { active: !worker.active });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          title="Funcionários"
          subtitle="Cadastro e controle de funcionários"
        />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" text="Carregando..." />
        </div>
      </div>
    );
  }

  const activeCount = workers.filter((w) => w.active).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Funcionários"
        subtitle="Cadastro e controle de funcionários"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error.message}
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-1 gap-3">
              {/* Busca */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome ou RFID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Filtro status */}
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as "all" | "active" | "inactive"
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium whitespace-nowrap"
            >
              + Novo Funcionário
            </button>
          </div>

          {/* Contagem */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-sm text-gray-500">
            <span>{workers.length} total</span>
            <span>{activeCount} ativos</span>
            <span>{workers.length - activeCount} inativos</span>
            {search && (
              <span className="text-purple-600">
                {filteredWorkers.length} encontrado(s)
              </span>
            )}
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funcionário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RFID
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cadastro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {search
                      ? "Nenhum resultado encontrado"
                      : "Nenhum funcionário cadastrado"}
                  </td>
                </tr>
              ) : (
                filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 font-semibold text-sm">
                            {worker.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {worker.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: {worker.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                        {worker.rfid_uid}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(worker)}
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                          worker.active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {worker.active ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {worker.created_at_readable || worker.created_at || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(worker)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(worker.id, worker.name)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingWorker ? "Editar Funcionário" : "Novo Funcionário"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    placeholder="Nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RFID UID
                  </label>
                  <input
                    type="text"
                    value={formData.rfid_uid}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rfid_uid: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                    required
                    placeholder="Ex: A1B2C3D4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha{" "}
                    {editingWorker && (
                      <span className="font-normal text-gray-400">
                        (deixe vazio para manter)
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required={!editingWorker}
                    placeholder={editingWorker ? "••••••••" : "Senha de acesso"}
                  />
                </div>

                <div className="flex items-center pt-2">
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
                    Funcionário ativo
                  </label>
                </div>
              </div>

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
