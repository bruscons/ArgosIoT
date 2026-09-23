// ./controllers/ServiceController.js

const pool = require("../config/database/db_config");
const dateFormatter = require("../utils/dateFormatter");

class ServiceController {
  // GET /api/services - Listar todos os serviços
  static async getAll(req, res) {
    try {
      const query = `
        SELECT 
          s.id,
          s.name,
          s.room_id,
          s.rfid_responsible,
          s.start_time,
          s.end_time,
          s.weekdays,
          s.validity_start,
          s.validity_end,
          s.active,
          s.created_at,
          s.updated_at,
          w.name as responsible_name
        FROM services s
        LEFT JOIN workers w ON s.rfid_responsible = w.rfid_uid
        ORDER BY s.name ASC
      `;
      
      const result = await pool.query(query);
      
      // Formatar datas para leitura
      const services = result.rows.map(row => ({
        ...row,
        created_at_readable: row.created_at ? dateFormatter.toReadable(row.created_at) : null,
        updated_at_readable: row.updated_at ? dateFormatter.toReadable(row.updated_at) : null,
      }));
      
      return res.json(services);
    } catch (error) {
      console.error("Erro ao listar serviços:", error);
      return res.status(500).json({ 
        error: "Erro interno do servidor",
        message: error.message 
      });
    }
  }

  // GET /api/services/:id - Buscar serviço por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      const query = `
        SELECT 
          s.id,
          s.name,
          s.room_id,
          s.rfid_responsible,
          s.start_time,
          s.end_time,
          s.weekdays,
          s.validity_start,
          s.validity_end,
          s.active,
          s.created_at,
          s.updated_at,
          w.name as responsible_name
        FROM services s
        LEFT JOIN workers w ON s.rfid_responsible = w.rfid_uid
        WHERE s.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          error: "Serviço não encontrado" 
        });
      }
      
      const service = {
        ...result.rows[0],
        created_at_readable: result.rows[0].created_at ? dateFormatter.toReadable(result.rows[0].created_at) : null,
        updated_at_readable: result.rows[0].updated_at ? dateFormatter.toReadable(result.rows[0].updated_at) : null,
      };
      
      return res.json(service);
    } catch (error) {
      console.error("Erro ao buscar serviço:", error);
      return res.status(500).json({ 
        error: "Erro interno do servidor",
        message: error.message 
      });
    }
  }

  // POST /api/services - Criar novo serviço
  static async create(req, res) {
    try {
      const {
        name,
        room_id,
        rfid_responsible,
        start_time,
        end_time,
        weekdays,
        validity_start,
        validity_end,
        active = true
      } = req.body;

      // Validação dos campos obrigatórios
      if (!name || !room_id || !rfid_responsible || !start_time || !end_time || !weekdays || !validity_start || !validity_end) {
        return res.status(400).json({ 
          error: "Campos obrigatórios não preenchidos",
          required: ["name", "room_id", "rfid_responsible", "start_time", "end_time", "weekdays", "validity_start", "validity_end"]
        });
      }

      // Verificar se o responsável existe
      const workerCheck = await pool.query(
        "SELECT id FROM workers WHERE rfid_uid = $1",
        [rfid_responsible]
      );
      
      if (workerCheck.rows.length === 0) {
        return res.status(400).json({ 
          error: "Responsável não encontrado com o RFID informado" 
        });
      }

      const now = new Date();
      const nowReadable = dateFormatter.toReadable(now);

      const query = `
        INSERT INTO services (
          name, room_id, rfid_responsible, start_time, end_time, 
          weekdays, validity_start, validity_end, active, 
          created_at, created_at_readable, updated_at, updated_at_readable
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $10, $11)
        RETURNING *
      `;
      
      const values = [
        name,
        room_id,
        rfid_responsible,
        start_time,
        end_time,
        weekdays,
        validity_start,
        validity_end,
        active,
        now,
        nowReadable
      ];

      const result = await pool.query(query, values);
      
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao criar serviço:", error);
      
      // Erro de constraint única
      if (error.code === '23505') {
        return res.status(400).json({ 
          error: "Já existe um serviço com este nome" 
        });
      }
      
      return res.status(500).json({ 
        error: "Erro interno do servidor",
        message: error.message 
      });
    }
  }

  // PUT /api/services/:id - Atualizar serviço
  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        room_id,
        rfid_responsible,
        start_time,
        end_time,
        weekdays,
        validity_start,
        validity_end,
        active
      } = req.body;

      // Verificar se o serviço existe
      const checkService = await pool.query(
        "SELECT id FROM services WHERE id = $1",
        [id]
      );
      
      if (checkService.rows.length === 0) {
        return res.status(404).json({ 
          error: "Serviço não encontrado" 
        });
      }

      // Verificar se o responsável existe (se foi fornecido)
      if (rfid_responsible) {
        const workerCheck = await pool.query(
          "SELECT id FROM workers WHERE rfid_uid = $1",
          [rfid_responsible]
        );
        
        if (workerCheck.rows.length === 0) {
          return res.status(400).json({ 
            error: "Responsável não encontrado com o RFID informado" 
          });
        }
      }

      const now = new Date();
      const nowReadable = dateFormatter.toReadable(now);

      // Construir query dinamicamente baseada nos campos fornecidos
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(name);
      }
      if (room_id !== undefined) {
        updates.push(`room_id = $${paramIndex++}`);
        values.push(room_id);
      }
      if (rfid_responsible !== undefined) {
        updates.push(`rfid_responsible = $${paramIndex++}`);
        values.push(rfid_responsible);
      }
      if (start_time !== undefined) {
        updates.push(`start_time = $${paramIndex++}`);
        values.push(start_time);
      }
      if (end_time !== undefined) {
        updates.push(`end_time = $${paramIndex++}`);
        values.push(end_time);
      }
      if (weekdays !== undefined) {
        updates.push(`weekdays = $${paramIndex++}`);
        values.push(weekdays);
      }
      if (validity_start !== undefined) {
        updates.push(`validity_start = $${paramIndex++}`);
        values.push(validity_start);
      }
      if (validity_end !== undefined) {
        updates.push(`validity_end = $${paramIndex++}`);
        values.push(validity_end);
      }
      if (active !== undefined) {
        updates.push(`active = $${paramIndex++}`);
        values.push(active);
      }

      // Sempre atualiza updated_at
      updates.push(`updated_at = $${paramIndex++}`);
      values.push(now);
      updates.push(`updated_at_readable = $${paramIndex++}`);
      values.push(nowReadable);

      // Adiciona o ID como último parâmetro
      values.push(id);

      const query = `
        UPDATE services 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      
      return res.json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);
      
      if (error.code === '23505') {
        return res.status(400).json({ 
          error: "Já existe um serviço com este nome" 
        });
      }
      
      return res.status(500).json({ 
        error: "Erro interno do servidor",
        message: error.message 
      });
    }
  }

  // DELETE /api/services/:id - Deletar serviço
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o serviço existe
      const checkService = await pool.query(
        "SELECT id, name FROM services WHERE id = $1",
        [id]
      );
      
      if (checkService.rows.length === 0) {
        return res.status(404).json({ 
          error: "Serviço não encontrado" 
        });
      }

      // Verificar se existem autorizações vinculadas
      const checkAuthorizations = await pool.query(
        "SELECT COUNT(*) FROM service_authorizations WHERE service_id = $1",
        [id]
      );
      
      if (parseInt(checkAuthorizations.rows[0].count) > 0) {
        return res.status(400).json({ 
          error: "Não é possível deletar este serviço pois existem autorizações vinculadas",
          authorizations_count: parseInt(checkAuthorizations.rows[0].count)
        });
      }

      await pool.query("DELETE FROM services WHERE id = $1", [id]);

      return res.json({ 
        message: "Serviço deletado com sucesso",
        deleted: checkService.rows[0]
      });
    } catch (error) {
      console.error("Erro ao deletar serviço:", error);
      return res.status(500).json({ 
        error: "Erro interno do servidor",
        message: error.message 
      });
    }
  }
}

module.exports = ServiceController;
