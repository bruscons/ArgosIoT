// ./routes/index.js

const express = require("express");
const router = express.Router();

const accessRoutes = require("./access");
const workerRoutes = require("./workers");
const serviceRoutes = require("./services");
const authorizationRoutes = require("./authorizations");
const roomOccupancyRoutes = require("./roomOccupancyRoutes");


const AccessController = require("../controllers/AccessController");

// Rota raiz - informações sobre a API
router.get("/", (req, res) => {
  res.json({
    name: "IoTrain Access Control API",
    version: "1.0.0",
    status: "online",
    endpoints: {
      access_verify: "/api/access/verify",
      access_logs: "/api/access/logs",
      access_stats: "/api/access/stats",
      mqtt_status: "/api/access/mqtt/status",
      workers: "/api/workers",
      services: "/api/services",
      authorizations: "/api/authorizations",
      devices: "/api/devices",
      room_occupancy: "/api/room-occupancy",
    },
  });
});

// Prefixo /api para todas as rotas
router.use("/api/access", accessRoutes);
router.use("/api/workers", workerRoutes);
router.use("/api/services", serviceRoutes);
router.use("/api/authorizations", authorizationRoutes);

// Rota para dispositivos
router.get("/api/devices", AccessController.getDevices);

// Rota para visao computacional
router.use("/api/room-occupancy", roomOccupancyRoutes);

module.exports = router;
