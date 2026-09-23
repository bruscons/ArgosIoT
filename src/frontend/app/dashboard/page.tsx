// app/dashboard/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import RealtimeChart from "../../components/Dashboard/RealtimeChart";
import DeviceMonitor from "../../components/Dashboard/DeviceMonitor";
import AccessLogsTable from "../../components/Dashboard/AccessLogsTable";
import RoomOccupancyMonitor from "../../components/Dashboard/RoomOccupancyMonitor";
import { Header, StatsCard } from "../../components/Common";
import { useOccupancy } from "../../hooks/useOccupancy";
import ApiService from "../../services/ApiService";

interface RecentLog {
  id: number;
  rfid_uid: string;
  room_id: string;
  event_type: string;
  access_granted: boolean;
  timestamp_request: string;
  message: { line1: string; line2: string };
}

export default function DashboardPage() {
  const { todayStats, loading: statsLoading } = useOccupancy(10000);
  const [workersCount, setWorkersCount] = useState({ total: 0, active: 0 });
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const workers = await ApiService.getWorkers().catch(() => []);
      const logs = await ApiService.getAccessLogs({}).catch(() => []);

      setWorkersCount({
        total: workers.length,
        active: workers.filter((w: { active: boolean }) => w.active).length,
      });
      setRecentLogs(logs.slice(0, 5));
    } catch {
      // silencia erros
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        title="Argos Dashboard"
        subtitle="Sistema de Controle de Acesso"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Cards de estatísticas */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Funcionários Ativos"
            value={workersCount.active}
            subtitle={`${workersCount.total} cadastrados`}
            color="purple"
            loading={loading}
          />
          <StatsCard
            title="Entradas Hoje"
            value={todayStats?.entries_granted || 0}
            subtitle="Permitidas"
            color="green"
            loading={statsLoading}
          />
          <StatsCard
            title="Saídas Hoje"
            value={todayStats?.exits_granted || 0}
            subtitle="Registradas"
            color="blue"
            loading={statsLoading}
          />
          <StatsCard
            title="Negados Hoje"
            value={todayStats?.denied || 0}
            subtitle={`de ${todayStats?.total || 0} tentativas`}
            color="red"
            loading={statsLoading}
          />
        </section>

        {/* Ocupação das Salas */}
        <section className="bg-white p-6 rounded-lg shadow mb-6">
          <RoomOccupancyMonitor />
        </section>

        {/* Gráfico em tempo real */}
        <section className="bg-white p-6 rounded-lg shadow mb-6">
          <RealtimeChart />
        </section>

        {/* Grid de duas colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <section className="bg-white p-6 rounded-lg shadow">
            <DeviceMonitor />
          </section>

          <section className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Atividade Recente
              </h3>
              <button
                onClick={fetchData}
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                Atualizar
              </button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-sm text-gray-500">
                    Carregando...
                  </span>
                </div>
              ) : recentLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Nenhum registro encontrado</p>
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        log.access_granted ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {log.room_id}
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            log.event_type === "entry"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {log.event_type === "entry" ? "Entrada" : "Saída"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        RFID: {log.rfid_uid}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-medium ${
                          log.access_granted ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {log.access_granted ? "OK" : "Negado"}
                      </span>
                      <p className="text-xs text-gray-400">
                        {log.timestamp_request}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Tabela de logs */}
        <section className="bg-white p-6 rounded-lg shadow">
          <AccessLogsTable pageSize={10} />
        </section>
      </main>
    </div>
  );
}
