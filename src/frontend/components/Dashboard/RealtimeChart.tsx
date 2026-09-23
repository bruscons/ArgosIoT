// components/Dashboard/RealtimeChart.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ChartDataPoint {
  time: string;
  entry_granted: number;
  entry_denied: number;
  exit_granted: number;
  exit_denied: number;
}

export default function RealtimeChart() {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/room-occupancy/chart/realtime`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdate(new Date());
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const stats = useMemo(() => {
    return data.reduce(
      (acc, item) => ({
        entries: acc.entries + item.entry_granted,
        exits: acc.exits + item.exit_granted,
        denied: acc.denied + item.entry_denied + item.exit_denied,
      }),
      { entries: 0, exits: 0, denied: 0 }
    );
  }, [data]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Acessos em Tempo Real</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {lastUpdate
              ? `Atualizado: ${lastUpdate.toLocaleTimeString("pt-BR")}`
              : ""}
          </span>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                error ? "bg-red-500" : "bg-green-500"
              }`}
            />
            <span className="text-sm text-gray-600">
              {error ? "Erro" : "Online"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-green-700">
            Entradas: <strong>{stats.entries}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm text-blue-700">
            Saídas: <strong>{stats.exits}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-red-700">
            Negados: <strong>{stats.denied}</strong>
          </span>
        </div>
      </div>

      {loading && data.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-gray-600 font-medium">
            Nenhum evento nas últimas 2 horas
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar
              dataKey="entry_granted"
              name="Entradas OK"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="exit_granted"
              name="Saídas OK"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="entry_denied"
              name="Entradas Negadas"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="exit_denied"
              name="Saídas Negadas"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
