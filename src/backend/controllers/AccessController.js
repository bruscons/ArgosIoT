// ./controllers/AccessController.js

const AccessValidationService = require("../services/AccessValidationService");
const LogService = require("../services/LogService");

class AccessController {
  static async verify(req, res) {
    try {
      const { request_id, timestamp, event_type, location, rfid } = req.body;

      // Validação básica dos campos obrigatórios
      if (!request_id || !timestamp || !event_type || !location || !rfid) {
        return res.status(400).json({
          request_id: request_id || "unknown",
          response_type: "error",
          access_granted: false,
          message: {
            line1: "Dados",
            line2: "incompletos",
          },
          display_duration: 3000,
          message_hash: "",
        });
      }

      let validationResult;

      // Processar entrada ou saída
      if (event_type === "entry") {
        // Para entrada, validar com senha
        validationResult = await AccessValidationService.validateEntry(
          rfid.uid,
          rfid.password_hash,
          location.room_id,
          timestamp
        );
      } else if (event_type === "exit") {
        // Para saída, validar sem senha
        validationResult = await AccessValidationService.validateExit(
          rfid.uid,
          location.room_id
        );
      } else {
        return res.status(400).json({
          request_id,
          response_type: "error",
          access_granted: false,
          message: {
            line1: "Tipo de evento",
            line2: "invalido",
          },
          display_duration: 3000,
          message_hash: "",
        });
      }

      // Registrar log da tentativa de acesso
      await LogService.createLog({
        request_id,
        rfid_uid: rfid.uid,
        room_id: location.room_id,
        event_type: event_type.toLowerCase(),
        timestamp_request: timestamp,
        access_granted: validationResult.granted,
        message: validationResult.message,
        service_authorization_id: validationResult.authorization_id,
        origin_ip: req.ip,
      });

      // Preparar resposta para o ESP32
      const response = {
        request_id,
        response_type: validationResult.granted ? "success" : "denied",
        access_granted: validationResult.granted,
        message: validationResult.message,
        display_duration: validationResult.granted ? 3000 : 5000,
        message_hash: "",
      };

      return res.json(response);
    } catch (error) {
      console.error("Erro ao verificar acesso:", error);

      return res.status(500).json({
        request_id: req.body?.request_id || "unknown",
        response_type: "error",
        access_granted: false,
        message: {
          line1: "Erro 500",
          line2: "no servidor",
        },
        display_duration: 5000,
        message_hash: "",
      });
    }
  }

  // Buscar logs de acesso
  static async getLogs(req, res) {
    try {
      const { room_id, event_type, start_date, end_date } = req.query;
      
      const filters = {};
      if (room_id) filters.room_id = room_id;
      if (event_type) filters.event_type = event_type;
      if (start_date) filters.start_date = start_date;
      if (end_date) filters.end_date = end_date;

      const logs = await LogService.getLogs(filters);
      return res.json(logs);
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
      return res.status(500).json({
        error: "Erro ao buscar logs de acesso",
        message: error.message,
      });
    }
  }

  // Buscar estatísticas de acesso
  static async getStats(req, res) {
    try {
      const { room_id, start_date, end_date } = req.query;
      
      const filters = {};
      if (room_id) filters.room_id = room_id;
      if (start_date) filters.start_date = start_date;
      if (end_date) filters.end_date = end_date;

      const stats = await LogService.getStats(filters);
      return res.json(stats);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return res.status(500).json({
        error: "Erro ao buscar estatísticas",
        message: error.message,
      });
    }
  }

  // Buscar dispositivos (baseado nos logs recentes)
  static async getDevices(req, res) {
    try {
      const pool = require("../config/database/db_config");
      
      // Buscar dispositivos únicos dos últimos logs (últimas 24 horas)
      const query = `
        SELECT DISTINCT 
          room_id,
          MAX(timestamp_request) as last_seen
        FROM access_logs
        WHERE timestamp_request >= NOW() - INTERVAL '24 hours'
        GROUP BY room_id
        ORDER BY last_seen DESC
      `;

      const result = await pool.query(query);
      
      // Formatar resposta
      const devices = result.rows.map((row, index) => {
        const deviceId = `ESP32_${String(index + 1).padStart(3, '0')}`;
        const lastSeen = new Date(row.last_seen);
        const now = new Date();
        const diffMinutes = Math.floor((now - lastSeen) / 60000);
        
        // Determinar status baseado na última atividade
        let status = 'online';
        if (diffMinutes > 30) {
          status = 'offline';
        } else if (diffMinutes > 10) {
          status = 'error';
        }

        return {
          id: deviceId,
          name: `Leitor RFID - ${row.room_id}`,
          status: status,
          room_id: row.room_id,
          last_seen: row.last_seen ? new Date(row.last_seen).toISOString() : null,
        };
      });

      return res.json(devices);
    } catch (error) {
      console.error("Erro ao buscar dispositivos:", error);
      return res.status(500).json({
        error: "Erro ao buscar dispositivos",
        message: error.message,
      });
    }
  }
}

module.exports = AccessController;
