// ./controllers/WorkerController.js

const WorkerRepository = require("../repositories/WorkerRepository");

class WorkerController {
  // Listar todos os workers
  static async getAll(req, res) {
    try {
      const workers = await WorkerRepository.findAll();
      return res.json(workers);
    } catch (error) {
      console.error("Erro ao buscar workers:", error);
      return res.status(500).json({
        error: "Erro ao buscar workers",
        message: error.message,
      });
    }
  }

  // Buscar worker por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const worker = await WorkerRepository.findById(parseInt(id));

      if (!worker) {
        return res.status(404).json({
          error: "Worker não encontrado",
        });
      }

      return res.json(worker);
    } catch (error) {
      console.error("Erro ao buscar worker:", error);
      return res.status(500).json({
        error: "Erro ao buscar worker",
        message: error.message,
      });
    }
  }

  // Criar novo worker
  static async create(req, res) {
    try {
      const { rfid_uid, password, name, active } = req.body;

      // Validação
      if (!rfid_uid || !password || !name) {
        return res.status(400).json({
          error: "Campos obrigatórios faltando",
          required: ["rfid_uid", "password", "name"],
        });
      }

      // Verificar se RFID já existe
      const existing = await WorkerRepository.findByRfid(rfid_uid);
      if (existing) {
        return res.status(409).json({
          error: "RFID já cadastrado",
          message: `O RFID ${rfid_uid} já está em uso`,
        });
      }

      const worker = await WorkerRepository.create({
        rfid_uid,
        password,
        name,
        active: active !== undefined ? active : true,
      });

      return res.status(201).json(worker);
    } catch (error) {
      console.error("Erro ao criar worker:", error);
      return res.status(500).json({
        error: "Erro ao criar worker",
        message: error.message,
      });
    }
  }

  // Atualizar worker
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { rfid_uid, password, name, active } = req.body;

      // Verificar se worker existe
      const existing = await WorkerRepository.findById(parseInt(id));
      if (!existing) {
        return res.status(404).json({
          error: "Worker não encontrado",
        });
      }

      // Se RFID foi alterado, verificar se não está em uso
      if (rfid_uid && rfid_uid !== existing.rfid_uid) {
        const rfidExists = await WorkerRepository.findByRfid(rfid_uid);
        if (rfidExists) {
          return res.status(409).json({
            error: "RFID já cadastrado",
            message: `O RFID ${rfid_uid} já está em uso`,
          });
        }
      }

      const worker = await WorkerRepository.update(parseInt(id), {
        rfid_uid,
        password,
        name,
        active,
      });

      return res.json(worker);
    } catch (error) {
      console.error("Erro ao atualizar worker:", error);
      return res.status(500).json({
        error: "Erro ao atualizar worker",
        message: error.message,
      });
    }
  }

  // Deletar worker
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar se worker existe
      const existing = await WorkerRepository.findById(parseInt(id));
      if (!existing) {
        return res.status(404).json({
          error: "Worker não encontrado",
        });
      }

      await WorkerRepository.delete(parseInt(id));

      return res.json({
        message: "Worker deletado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao deletar worker:", error);
      return res.status(500).json({
        error: "Erro ao deletar worker",
        message: error.message,
      });
    }
  }
}

module.exports = WorkerController;

