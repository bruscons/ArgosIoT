// src/routes/roomOccupancyRoutes.js

const express = require("express");
const router = express.Router();
const RoomOccupancyController = require("../controllers/RoomOccupancyController");

// Rotas específicas primeiro (antes das rotas com parâmetros)
router.get("/compare/all", (req, res) =>
  RoomOccupancyController.compareAll(req, res)
);
router.get("/stats/today", (req, res) =>
  RoomOccupancyController.getTodayStats(req, res)
);
router.get("/chart/realtime", (req, res) =>
  RoomOccupancyController.getChartData(req, res)
);

// Rotas CRUD
router.get("/", (req, res) => RoomOccupancyController.getAll(req, res));
router.get("/:room_id", (req, res) =>
  RoomOccupancyController.getByRoomId(req, res)
);
router.post("/", (req, res) => RoomOccupancyController.upsert(req, res));
router.delete("/:room_id", (req, res) =>
  RoomOccupancyController.delete(req, res)
);

module.exports = router;
