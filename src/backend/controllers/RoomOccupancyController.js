// src/controllers/RoomOccupancyController.js

const pool = require("../config/database/db_config");

class RoomOccupancyController {
  // GET /api/room-occupancy - Listar todas as salas
  async getAll(req, res) {
    try {
      const result = await pool.query(
        "SELECT * FROM room_occupancy ORDER BY room_id"
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar ocupações:", error);
      res.status(500).json({ error: "Erro ao buscar dados de ocupação" });
    }
  }

  // GET /api/room-occupancy/:room_id - Buscar sala específica
  async getByRoomId(req, res) {
    try {
      const { room_id } = req.params;
      const result = await pool.query(
        "SELECT * FROM room_occupancy WHERE room_id = $1",
        [room_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Sala não encontrada" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao buscar ocupação:", error);
      res.status(500).json({ error: "Erro ao buscar dados de ocupação" });
    }
  }

  // POST /api/room-occupancy - Criar ou atualizar ocupação (upsert)
  async upsert(req, res) {
    try {
      const { room_id, current_count, camera_id } = req.body;

      if (!room_id) {
        return res.status(400).json({ error: "room_id é obrigatório" });
      }

      if (current_count === undefined || current_count < 0) {
        return res.status(400).json({ error: "current_count deve ser >= 0" });
      }

      const result = await pool.query(
        `INSERT INTO room_occupancy (room_id, current_count, last_camera_id, last_updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (room_id)
         DO UPDATE SET
           current_count = $2,
           last_camera_id = $3,
           last_updated_at = NOW()
         RETURNING *`,
        [room_id, current_count, camera_id || null]
      );

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao atualizar ocupação:", error);
      res.status(500).json({ error: "Erro ao atualizar dados de ocupação" });
    }
  }

  // DELETE /api/room-occupancy/:room_id - Remover sala
  async delete(req, res) {
    try {
      const { room_id } = req.params;
      const result = await pool.query(
        "DELETE FROM room_occupancy WHERE room_id = $1 RETURNING *",
        [room_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Sala não encontrada" });
      }

      res.json({
        message: "Sala removida com sucesso",
        deleted: result.rows[0],
      });
    } catch (error) {
      console.error("Erro ao remover ocupação:", error);
      res.status(500).json({ error: "Erro ao remover dados de ocupação" });
    }
  }

  // GET /api/room-occupancy/compare/all - Comparar RFID vs Câmera
  async compareAll(req, res) {
    try {
      // Calcula ocupação por RFID: entradas - saídas (últimas 24h)
      const rfidQuery = `
        SELECT 
          room_id,
          SUM(CASE WHEN event_type = 'entry' AND access_granted = true THEN 1 ELSE 0 END) as entries,
          SUM(CASE WHEN event_type = 'exit' AND access_granted = true THEN 1 ELSE 0 END) as exits
        FROM access_logs
        WHERE timestamp_request >= NOW() - INTERVAL '24 hours'
        GROUP BY room_id
      `;

      // Busca ocupação por câmera
      const cameraQuery = `
        SELECT room_id, current_count, last_camera_id, last_updated_at
        FROM room_occupancy
      `;

      const [rfidResult, cameraResult] = await Promise.all([
        pool.query(rfidQuery),
        pool.query(cameraQuery),
      ]);

      // Monta mapa de salas
      const roomsMap = new Map();

      // Adiciona dados RFID
      rfidResult.rows.forEach((row) => {
        const entries = parseInt(row.entries) || 0;
        const exits = parseInt(row.exits) || 0;
        roomsMap.set(row.room_id, {
          room_id: row.room_id,
          rfid_entries: entries,
          rfid_exits: exits,
          rfid_count: Math.max(0, entries - exits),
          camera_count: null,
          last_camera_id: null,
          last_camera_update: null,
        });
      });

      // Adiciona/mescla dados da câmera
      cameraResult.rows.forEach((row) => {
        const cameraCount = parseInt(row.current_count) || 0;
        if (roomsMap.has(row.room_id)) {
          const existing = roomsMap.get(row.room_id);
          existing.camera_count = cameraCount;
          existing.last_camera_id = row.last_camera_id;
          existing.last_camera_update = row.last_updated_at;
        } else {
          roomsMap.set(row.room_id, {
            room_id: row.room_id,
            rfid_entries: 0,
            rfid_exits: 0,
            rfid_count: 0,
            camera_count: cameraCount,
            last_camera_id: row.last_camera_id,
            last_camera_update: row.last_updated_at,
          });
        }
      });

      // Converte para array e calcula match
      const rooms = Array.from(roomsMap.values()).map((room) => ({
        ...room,
        match:
          room.camera_count !== null
            ? room.rfid_count === room.camera_count
            : null,
        difference:
          room.camera_count !== null
            ? Math.abs(room.rfid_count - room.camera_count)
            : null,
      }));

      res.json({
        rooms,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Erro ao comparar ocupação:", error);
      res.status(500).json({ error: "Erro ao comparar dados de ocupação" });
    }
  }

  // GET /api/room-occupancy/stats/today - Estatísticas de hoje
  async getTodayStats(req, res) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN access_granted = true THEN 1 ELSE 0 END) as granted,
          SUM(CASE WHEN access_granted = false THEN 1 ELSE 0 END) as denied,
          SUM(CASE WHEN event_type = 'entry' AND access_granted = true THEN 1 ELSE 0 END) as entries_granted,
          SUM(CASE WHEN event_type = 'exit' AND access_granted = true THEN 1 ELSE 0 END) as exits_granted
        FROM access_logs
        WHERE DATE(timestamp_request AT TIME ZONE 'America/Sao_Paulo') = 
              DATE(NOW() AT TIME ZONE 'America/Sao_Paulo')
      `;

      const result = await pool.query(query);
      const row = result.rows[0];

      res.json({
        total: parseInt(row.total) || 0,
        granted: parseInt(row.granted) || 0,
        denied: parseInt(row.denied) || 0,
        entries_granted: parseInt(row.entries_granted) || 0,
        exits_granted: parseInt(row.exits_granted) || 0,
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  }

  // GET /api/room-occupancy/chart/realtime - Dados para gráfico em tempo real
  async getChartData(req, res) {
    try {
      const query = `
        SELECT 
          TO_CHAR(timestamp_request AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI') as minute,
          event_type,
          access_granted,
          COUNT(*) as count
        FROM access_logs
        WHERE timestamp_request >= NOW() - INTERVAL '2 hours'
        GROUP BY minute, event_type, access_granted
        ORDER BY minute ASC
      `;

      const result = await pool.query(query);

      // Agrupa por minuto
      const grouped = {};
      result.rows.forEach((row) => {
        const min = row.minute;
        if (!grouped[min]) {
          grouped[min] = {
            entry_granted: 0,
            entry_denied: 0,
            exit_granted: 0,
            exit_denied: 0,
          };
        }
        const key = `${row.event_type}_${
          row.access_granted ? "granted" : "denied"
        }`;
        grouped[min][key] = parseInt(row.count) || 0;
      });

      // Converte para array
      const data = Object.entries(grouped).map(([time, values]) => ({
        time,
        ...values,
      }));

      res.json(data);
    } catch (error) {
      console.error("Erro ao buscar dados do gráfico:", error);
      res.status(500).json({ error: "Erro ao buscar dados" });
    }
  }
}

module.exports = new RoomOccupancyController();
