// ./repositories/AuthorizationRepository.js

const pool = require("../config/database/db_config");

class AuthorizationRepository {
  // Buscar autorização específica entre worker e serviço
  static async findByWorkerAndService(rfid_uid, service_id) {
    const query = `
            SELECT * FROM service_authorizations 
            WHERE rfid_uid = $1 AND service_id = $2 AND active = true
        `;
    const result = await pool.query(query, [rfid_uid, service_id]);
    return result.rows[0];
  }

  // Buscar todas as autorizações ativas de um worker
  static async findActiveByWorker(rfid_uid) {
    const query = `
            SELECT * FROM service_authorizations 
            WHERE rfid_uid = $1 AND active = true
        `;
    const result = await pool.query(query, [rfid_uid]);
    return result.rows;
  }
}

module.exports = AuthorizationRepository;
