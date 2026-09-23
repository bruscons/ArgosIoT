// ./services/LogService.js

const pool = require("../config/database/db_config");
const dateFormatter = require("../utils/dateFormatter");

class LogService {
  // Registrar log de tentativa de acesso
  static async createLog(logData) {
    const {
      request_id,
      rfid_uid,
      room_id,
      event_type,
      timestamp_request,
      access_granted,
      message,
      service_authorization_id,
      origin_ip,
    } = logData;

    // Converter timestamp de milissegundos para Date (em UTC)
    const timestampDate = new Date(parseInt(timestamp_request));
    // O dateFormatter faz a conversão para GMT-3 internamente
    const timestampReadable = dateFormatter.toReadable(timestampDate);

    // Data de criação do log (em UTC)
    const createdAt = new Date();
    // O dateFormatter faz a conversão para GMT-3 internamente
    const createdAtReadable = dateFormatter.toReadable(createdAt);

    // Formatar mensagem para armazenar no banco
    const messageText =
      typeof message === "object"
        ? `${message.line1} - ${message.line2}`
        : message;

    const query = `
            INSERT INTO access_logs (
                request_id, 
                rfid_uid, 
                room_id, 
                event_type, 
                timestamp_request, 
                timestamp_request_readable,
                access_granted, 
                message, 
                service_authorization_id, 
                origin_ip,
                created_at,
                created_at_readable
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id
        `;

    const values = [
      request_id,
      rfid_uid,
      room_id,
      event_type,
      timestampDate,
      timestampReadable,
      access_granted,
      messageText,
      service_authorization_id,
      origin_ip,
      createdAt,
      createdAtReadable,
    ];

    const result = await pool.query(query, values);
    return result.rows[0].id;
  }

  // Buscar logs de acesso com filtros
  static async getLogs(filters = {}) {
    try {
      const { room_id, event_type, start_date, end_date } = filters;
      
      let query = `
        SELECT 
          id,
          request_id,
          rfid_uid,
          room_id,
          event_type,
          timestamp_request,
          timestamp_request_readable,
          access_granted,
          message,
          created_at,
          created_at_readable
        FROM access_logs
        WHERE 1=1
      `;
      
      const values = [];
      let paramIndex = 1;

      if (room_id) {
        query += ` AND room_id = $${paramIndex}`;
        values.push(room_id);
        paramIndex++;
      }

      if (event_type) {
        query += ` AND event_type = $${paramIndex}`;
        values.push(event_type.toLowerCase());
        paramIndex++;
      }

      if (start_date) {
        query += ` AND timestamp_request >= $${paramIndex}`;
        values.push(new Date(start_date));
        paramIndex++;
      }

      if (end_date) {
        query += ` AND timestamp_request <= $${paramIndex}`;
        values.push(new Date(end_date));
        paramIndex++;
      }

      query += ` ORDER BY timestamp_request DESC LIMIT 1000`;

      const result = await pool.query(query, values);
    
      // Formatar mensagem para o formato esperado pelo frontend
      return result.rows.map((row) => {
        let message = { line1: '', line2: '' };
        if (row.message) {
          const parts = row.message.split(' - ');
          message.line1 = parts[0] || '';
          message.line2 = parts[1] || '';
        }
        
        return {
          id: row.id,
          request_id: row.request_id,
          rfid_uid: row.rfid_uid,
          room_id: row.room_id,
          event_type: row.event_type,
          timestamp_request: row.timestamp_request_readable || row.timestamp_request.toISOString(),
          access_granted: row.access_granted,
          message,
        };
      });
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      // Retorna array vazio em caso de erro ao invés de quebrar
      return [];
    }
  }

  // Buscar estatísticas de acesso
  static async getStats(filters = {}) {
    try {
      const { room_id, start_date, end_date } = filters;
      
      let query = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE access_granted = true) as granted,
          COUNT(*) FILTER (WHERE access_granted = false) as denied,
          COUNT(*) FILTER (WHERE event_type = 'entry') as entries,
          COUNT(*) FILTER (WHERE event_type = 'exit') as exits
        FROM access_logs
        WHERE 1=1
      `;
      
      const values = [];
      let paramIndex = 1;

      if (room_id) {
        query += ` AND room_id = $${paramIndex}`;
        values.push(room_id);
        paramIndex++;
      }

      if (start_date) {
        query += ` AND timestamp_request >= $${paramIndex}`;
        values.push(new Date(start_date));
        paramIndex++;
      }

      if (end_date) {
        query += ` AND timestamp_request <= $${paramIndex}`;
        values.push(new Date(end_date));
        paramIndex++;
      }

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Retorna objeto vazio em caso de erro
      return {
        total: 0,
        granted: 0,
        denied: 0,
        entries: 0,
        exits: 0,
      };
    }
  }
}

module.exports = LogService;
