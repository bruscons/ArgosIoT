// ./routes/workers.js

const express = require("express");
const router = express.Router();

const WorkerController = require("../controllers/WorkerController");

// GET /api/workers - Listar todos os workers
router.get("/", WorkerController.getAll);

// GET /api/workers/:id - Buscar worker por ID
router.get("/:id", WorkerController.getById);

// POST /api/workers - Criar novo worker
router.post("/", WorkerController.create);

// PUT /api/workers/:id - Atualizar worker
router.put("/:id", WorkerController.update);

// DELETE /api/workers/:id - Deletar worker
router.delete("/:id", WorkerController.delete);

module.exports = router;

