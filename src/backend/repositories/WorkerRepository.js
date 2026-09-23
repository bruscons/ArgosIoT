// ./repositories/WorkerRepository.js

const pool = require("../config/database/db_config");
const dateFormatter = require("../utils/dateFormatter");
const bcrypt = require("bcrypt");

class WorkerRepository {
  // Buscar worker por RFID
  static async findByRfid(rfid_uid) {
    const query = "SELECT * FROM workers WHERE rfid_uid = $1";
    const result = await pool.query(query, [rfid_uid]);
    return result.rows[0];
  }

  // Verificar se worker está ativo
  static async isActive(rfid_uid) {
    const query = "SELECT active FROM workers WHERE rfid_uid = $1";
    const result = await pool.query(query, [rfid_uid]);
    return result.rows[0]?.active || false;
  }

  // Buscar todos os workers
  static async findAll() {
    const query = "SELECT * FROM workers ORDER BY name ASC";
    const result = await pool.query(query);
    return result.rows;
  }

  // Buscar worker por ID
  static async findById(id) {
    const query = "SELECT * FROM workers WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Criar novo worker
  static async create(workerData) {
    const { rfid_uid, password, name, active = true } = workerData;

    // Hash da senha
    const password_hash = await bcrypt.hash(password, 10);

    const now = new Date();
    const nowReadable = dateFormatter.toReadable(now);

    const query = `
      INSERT INTO workers (rfid_uid, password_hash, name, active, created_at, created_at_readable, updated_at, updated_at_readable)
      VALUES ($1, $2, $3, $4, $5, $6, $5, $6)
      RETURNING *
    `;

    const values = [rfid_uid, password_hash, name, active, now, nowReadable];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Atualizar worker
  static async update(id, workerData) {
    const { rfid_uid, password, name, active } = workerData;

    const now = new Date();
    const nowReadable = dateFormatter.toReadable(now);

    let query;
    let values;

    // Se senha foi fornecida, atualizar hash
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      query = `
        UPDATE workers 
        SET rfid_uid = COALESCE($1, rfid_uid),
            password_hash = $2,
            name = COALESCE($3, name),
            active = COALESCE($4, active),
            updated_at = $5,
            updated_at_readable = $6
        WHERE id = $7
        RETURNING *
      `;
      values = [rfid_uid, password_hash, name, active, now, nowReadable, id];
    } else {
      query = `
        UPDATE workers 
        SET rfid_uid = COALESCE($1, rfid_uid),
            name = COALESCE($2, name),
            active = COALESCE($3, active),
            updated_at = $4,
            updated_at_readable = $5
        WHERE id = $6
        RETURNING *
      `;
      values = [rfid_uid, name, active, now, nowReadable, id];
    }

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Deletar worker
  static async delete(id) {
    const query = "DELETE FROM workers WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = WorkerRepository;
