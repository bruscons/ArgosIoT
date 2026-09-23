// ./routes/authorizations.js

const express = require("express");
const router = express.Router();

const ServiceAuthorizationController = require("../controllers/ServiceAuthorizationController");

// GET /api/authorizations - Listar todas as autorizações
router.get("/", ServiceAuthorizationController.getAll);

// GET /api/authorizations/service/:serviceId - Listar autorizações por serviço
router.get("/service/:serviceId", ServiceAuthorizationController.getByService);

// GET /api/authorizations/worker/:rfidUid - Listar autorizações por worker
router.get("/worker/:rfidUid", ServiceAuthorizationController.getByWorker);

// GET /api/authorizations/:id - Buscar autorização por ID
router.get("/:id", ServiceAuthorizationController.getById);

// POST /api/authorizations - Criar nova autorização
router.post("/", ServiceAuthorizationController.create);

// PUT /api/authorizations/:id - Atualizar autorização
router.put("/:id", ServiceAuthorizationController.update);

// DELETE /api/authorizations/:id - Deletar autorização
router.delete("/:id", ServiceAuthorizationController.delete);

module.exports = router;
