// ./controllers/ServiceAuthorizationController.js

const pool = require("../config/database/db_config");
const dateFormatter = require("../utils/dateFormatter");

class ServiceAuthorizationController {
  // GET /api/authorizations - Listar todas as autorizações
  static async getAll(req, res) {
    try {
      const query = `
        SELECT 
          sa.id,
          sa.rfid_uid,
          sa.service_id,
          sa.active,
          sa.created_at,
          sa.updated_at,
          w.name as worker_name,
          s.name as service_name,
          s.room_id
        FROM service_authorizations sa
        LEFT JOIN workers w ON sa.rfid_uid = w.rfid_uid
        LEFT JOIN services s ON sa.service_id = s.id
        ORDER BY s.name ASC, w.name ASC
      `;
      
      const result = await pool.query(query);
      
      // Formatar datas
      const authorizations = result.rows.map(row => ({
        ...row,
        created_at_readable: row.created_at ? dateFormatter.toReadable(row.created_at) : null,
        updated_at_readable: row.updated_at ? dateFormatter.toReadable(row.updated_at) : null,
      }));
      
      return res.json(authorizations);
    } catch (error) {
      console.error("Erro ao listar autorizações:", error);
      return res.status(500).json({ 
        error: "Erro interno do servidor",
        message: error.message 
      });
    }
  }

  // GET /api/authorizations/service/:serviceId - Listar autorizações por serviço
  static async getByService(req, res) {
    try {
      const { serviceId } = req.params;
      
      const query = `
        SELECT 
          sa.id,
          sa.rfid_uid,
          sa.service_id,
          sa.active,
          sa.created_at,
          sa.updated_at,
          w.name as worker_name,
          s.name as service_name,
          s.room_id
        FROM service_authorizations sa
        LEFT JOIN workers w ON sa.rfid_uid = w.rfid_uid
        LEFT JOIN services s ON sa.service_id = s.id
        WHERE sa.service_id = $1
        ORDER BY w.name ASC
      `;
      
      const result = await pool.query(query, [serviceId]);
      
      const authorizations = result.rows.map(row => ({
        ...row,
        created_at_readable: row.created_at ? dateFormatter.toReadable(row.created_at) : null,
        updated_at_readable: row.updated_at ? dateFormatter.toReadable(row.updated_at) : null,
      }));
      
      return res.json(authorizations);
    } catch (error) {
      console.error("Erro ao buscar autorizações por serviço:", error);
      return res.status(500).json({ 
        error: "Erro interno do servidor",
        message: error.message 
      });
    }
  }

  // GET /api/authorizations/worker/:rfidUid - Listar autorizações por worker
  static async getByWorker(req, res) {
    try {
      const { rfidUid } = req.params;
      
      const query = `
        SELECT 
          sa.id,
          sa.rfid_uid,
          sa.service_id,
          sa.active,
          sa.created_at,
          sa.updated_at,
          w.name as worker_name,
          s.name as service_name,
          s.room_id
        FROM service_authorizations sa
        LEFT JOIN workers w ON sa.rfid_uid = w.rfid_uid
        LEFT JOIN services s ON sa.service_id = s.id
        WHERE sa.rfid_uid = $1
        ORDER BY s.name ASC
      `;
      
      const result = await pool.query(query, [rfidUid]);
      
      const authorizations = result.rows.map(row => ({
        ...row,
        created_at_readable: row.created_at ? dateFormatter.toReadable(row.created_at) : null,
        updated_at_readable: row.updated_at ? dateFormatter.toReadable(row.updated_at) : null,
      }));
      
      return res.json(authorizations);
    } catch (error) {
      console.error("Erro ao buscar autorizações por worker:", error);
      return res.status(500).json({ 
        error: "Erro interno do servidor",
        message: error.message 
      });
    }
  }

  // GET /api/authorizations/:id - Buscar autorização por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      const query = `
        SELECT 
          sa.id,
          sa.rfid_uid,
          sa.service_id,
          sa.active,
          sa.created_at,
          sa.updated_at,
          w.name as worker_name,
          s.name as service_name,
          s.room_id
        FROM service_authorizations sa
        LEFT JOIN workers w ON sa.rfid_uid = w.rfid_uid
        LEFT JOIN services s ON sa.service_id = s.id
        WHERE sa.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          error: "Autorização não encontrada" 
        });
      }
      
      const authorization = {
        ...result.rows[0],
        created_at_readable: result.rows[0].created_at ? dateFormatter.toReadable(result.rows[0].created_at) : null,
        updated_at_readable: result.rows[0].updated_at ? dateFormatter.toReadable(result.rows[0].updated_at) : null,
      };
      
      return res.json(authorization);
    } catch (error) {
      console.error("Erro ao buscar autorização:", error);
      return res.status(500).json({ 
        error: "Erro interno do servidor",
        message: error.message 
      });
    }
  }

  // POST /api/authorizations - Criar nova autorização
  static async create(req, res) {
    try {
      const { rfid_uid, service_id, active = true } = req.body;

      // Validação dos campos obrigatórios
      if (!rfid_uid || !service_id) {
        return res.status(400).json({ 
          error: "Campos obrigatórios não preenchidos",
          required: ["rfid_uid", "service_id"]
        });
      }

      // Verificar se o worker existe
      const workerCheck = await pool.query(
        "SELECT id, name FROM workers WHERE rfid_uid = $1",
        [rfid_uid]
      );
      
      if (workerCheck.rows.length === 0) {
        return res.status(400).json({ 
          error: "Funcionário não encontrado com o RFID informado" 
        });
      }

      // Verificar se o serviço existe
      const serviceCheck = await pool.query(
        "SELECT id, name FROM services WHERE id = $1",
        [service_id]
      );
      
      if (serviceCheck.rows.length === 0) {
        return res.status(400).json({ 
          error: "Serviço não encontrado" 
        });
      }

      // Verificar se já existe essa autorização
      const existingAuth = await pool.query(
        "SELECT id FROM service_authorizations WHERE rfid_uid = $1 AND service_id = $2",
        [rfid_uid, service_id]
      );
      
      if (existingAuth.rows.length > 0) {
        return res.status(400).json({ 
          error: "Já existe uma autorização para este funcionário neste serviço",
          existing_id: existingAuth.rows[0].id
        });
      }

      const now = new Date();
      const nowReadable = dateFormatter.toReadable(now);

      const query = `
        INSERT INTO service_authorizations (
          rfid_uid, service_id, active, 
          created_at, created_at_readable, updated_at, updated_at_readable
        ) VALUES ($1, $2, $3, $4, $5, $4, $5)
        RETURNING *
      `;
      
      const values = [rfid_uid, service_id, active, now, nowReadable];

      const result = await pool.query(query, values);
      
      // Retornar com informações do worker e serviço
      const newAuth = {
        ...result.rows[0],
        worker_name: workerCheck.rows[0].name,
        service_name: serviceCheck.rows[0].name,
      };
      
      return res.status(201).json(newAuth);
    } catch (error) {
      console.error("Erro ao criar autorização:", error);
      
      // Erro de constraint única
      if (error.code === '23505') {
        return res.status(400).json({ 
          error: "Já existe uma autorização para este funcionário neste serviço" 
        });
      }
      
      return res.status(500).json({ 
        error: "Erro interno do servidor",
        message: error.message 
      });
    }
  }

  // PUT /api/authorizations/:id - Atualizar autorização
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { active } = req.body;

      // Verificar se a autorização existe
      const checkAuth = await pool.query(
        "SELECT id FROM service_authorizations WHERE id = $1",
        [id]
      );
      
      if (checkAuth.rows.length === 0) {
        return res.status(404).json({ 
          error: "Autorização não encontrada" 
        });
      }

      if (active === undefined) {
        return res.status(400).json({ 
          error: "Nenhum campo para atualizar fornecido" 
        });
      }

      const now = new Date();
      const nowReadable = dateFormatter.toReadable(now);

      const query = `
        UPDATE service_authorizations 
        SET active = $1, updated_at = $2, updated_at_readable = $3
        WHERE id = $4
        RETURNING *
      `;

      const result = await pool.query(query, [active, now, nowReadable, id]);
      
      return res.json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao atualizar autorização:", error);
      return res.status(500).json({ 
        error: "Erro interno do servidor",
        message: error.message 
      });
    }
  }

  // DELETE /api/authorizations/:id - Deletar autorização
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a autorização existe
      const checkAuth = await pool.query(
        `SELECT sa.id, w.name as worker_name, s.name as service_name
         FROM service_authorizations sa
         LEFT JOIN workers w ON sa.rfid_uid = w.rfid_uid
         LEFT JOIN services s ON sa.service_id = s.id
         WHERE sa.id = $1`,
        [id]
      );
      
      if (checkAuth.rows.length === 0) {
        return res.status(404).json({ 
          error: "Autorização não encontrada" 
        });
      }

      await pool.query("DELETE FROM service_authorizations WHERE id = $1", [id]);

      return res.json({ 
        message: "Autorização deletada com sucesso",
        deleted: checkAuth.rows[0]
      });
    } catch (error) {
      console.error("Erro ao deletar autorização:", error);
      return res.status(500).json({ 
        error: "Erro interno do servidor",
        message: error.message 
      });
    }
  }
}

module.exports = ServiceAuthorizationController;
