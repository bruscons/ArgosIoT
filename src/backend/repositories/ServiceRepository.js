// ./repositories/ServiceRepository.js

const pool = require("../config/database/db_config");

class ServiceRepository {
  // Buscar serviços ativos em uma sala específica
  static async findActiveByRoom(room_id) {
    const query = `
            SELECT * FROM services 
            WHERE room_id = $1 AND active = true
        `;
    const result = await pool.query(query, [room_id]);
    return result.rows;
  }

  // Buscar serviço por ID
  static async findById(service_id) {
    const query = "SELECT * FROM services WHERE id = $1";
    const result = await pool.query(query, [service_id]);
    return result.rows[0];
  }
}

module.exports = ServiceRepository;
