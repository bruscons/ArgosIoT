// ./routes/access.js

const express = require("express");
const router = express.Router();

const AccessController = require("../controllers/AccessController");
const MQTTAccessController = require("../controllers/MQTTAccessController");

// Endpoints para funcionalidades MQTT
router.post("/mqtt/send", MQTTAccessController.sendMQTTRequest);
router.get("/mqtt/status", MQTTAccessController.getMQTTStatus);

// Endpoints para logs e estatísticas
router.get("/logs", AccessController.getLogs);
router.get("/stats", AccessController.getStats);

module.exports = router;
