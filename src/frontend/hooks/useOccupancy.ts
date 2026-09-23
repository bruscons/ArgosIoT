// hooks/useOccupancy.ts

import { useState, useEffect, useCallback } from "react";

interface RoomOccupancy {
  room_id: string;
  rfid_entries: number;
  rfid_exits: number;
  rfid_count: number;
  camera_count: number | null;
  last_camera_id: string | null;
  last_camera_update: string | null;
  match: boolean | null;
  difference: number | null;
}

interface TodayStats {
  total: number;
  granted: number;
  denied: number;
  entries_granted: number;
  exits_granted: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function useOccupancy(refreshInterval = 1000) {
  const [rooms, setRooms] = useState<RoomOccupancy[]>([]);
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [compareRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/room-occupancy/compare/all`),
        fetch(`${API_URL}/api/room-occupancy/stats/today`),
      ]);

      if (compareRes.ok) {
        const data = await compareRes.json();
        setRooms(data.rooms || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setTodayStats(data);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { rooms, todayStats, loading, error, refetch: fetchData };
}
