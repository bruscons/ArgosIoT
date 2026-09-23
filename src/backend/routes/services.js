// ./routes/services.js

const express = require("express");
const router = express.Router();

const ServiceController = require("../controllers/ServiceController");

// GET /api/services - Listar todos os serviços
router.get("/", ServiceController.getAll);

// GET /api/services/:id - Buscar serviço por ID
router.get("/:id", ServiceController.getById);

// POST /api/services - Criar novo serviço
router.post("/", ServiceController.create);

// PUT /api/services/:id - Atualizar serviço
router.put("/:id", ServiceController.update);

// DELETE /api/services/:id - Deletar serviço
router.delete("/:id", ServiceController.delete);

module.exports = router;
