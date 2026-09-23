// components/Dashboard/RoomOccupancyMonitor.tsx

"use client";

import { useOccupancy } from "../../hooks/useOccupancy";

export default function RoomOccupancyMonitor() {
  const { rooms, loading, error } = useOccupancy(1000);

  if (loading && rooms.length === 0) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4">Ocupação das Salas</h3>
        <div className="text-center py-4 text-gray-500 text-sm">
          Carregando...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4">Ocupação das Salas</h3>
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      </div>
    );
  }

  const totalRfid = rooms.reduce((sum, r) => sum + r.rfid_count, 0);
  const totalCamera = rooms.reduce((sum, r) => sum + (r.camera_count ?? 0), 0);
  const roomsWithIssues = rooms.filter(
    (r) => r.difference !== null && r.difference > 0
  ).length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Ocupação das Salas</h3>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Total RFID:</span>
            <span className="font-bold text-blue-600">{totalRfid}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Total Câmera:</span>
            <span className="font-bold text-purple-600">{totalCamera}</span>
          </div>
          {roomsWithIssues > 0 && (
            <div className="flex items-center gap-2 px-2 py-1 bg-red-100 rounded">
              <span className="text-red-700 font-medium">
                {roomsWithIssues} divergência(s)
              </span>
            </div>
          )}
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-sm">
          Nenhuma sala monitorada
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sala
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  RFID
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Câmera
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.map((room) => {
                const diff = room.difference ?? 0;
                const hasCamera = room.camera_count !== null;

                let statusBg = "bg-gray-100";
                let statusText = "text-gray-500";
                let statusLabel = "—";
                let rowBg = "";

                if (hasCamera) {
                  if (diff === 0) {
                    statusBg = "bg-green-100";
                    statusText = "text-green-700";
                    statusLabel = "OK";
                  } else if (diff <= 1) {
                    statusBg = "bg-yellow-100";
                    statusText = "text-yellow-700";
                    statusLabel = `±${diff}`;
                    rowBg = "bg-yellow-50";
                  } else {
                    statusBg = "bg-red-100";
                    statusText = "text-red-700";
                    statusLabel = `±${diff}`;
                    rowBg = "bg-red-50";
                  }
                }

                return (
                  <tr key={room.room_id} className={rowBg}>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {room.room_id}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xl font-bold text-blue-600">
                        {room.rfid_count}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">
                        ({room.rfid_entries}/{room.rfid_exits})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xl font-bold text-purple-600">
                        {hasCamera ? room.camera_count : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusBg} ${statusText}`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
