
const AccessValidationService = require("../services/AccessValidationService");
const LogService = require("../services/LogService");
const MQTTService = require("../services/MQTTService");

class MQTTAccessController {
  static async verify(req, res) {
    try {
      const { request_id, timestamp, event_type, location, rfid } = req.body;

      // Validação básica dos campos obrigatórios
      if (!request_id || !timestamp || !event_type || !location || !rfid) {
        return res.status(400).json({
          request_id: request_id || "unknown",
          response_type: "error",
          access_granted: false,
          message: {
            line1: "Dados",
            line2: "incompletos",
          },
          display_duration: 3000,
          message_hash: "",
        });
      }

      let validationResult;

      // Processar entrada ou saída
      if (event_type === "entry") {
        // Para entrada, validar com senha
        validationResult = await AccessValidationService.validateEntry(
          rfid.uid,
          rfid.password_hash,
          location.room_id,
          timestamp
        );
      } else if (event_type === "exit") {
        // Para saída, validar sem senha
        validationResult = await AccessValidationService.validateExit(
          rfid.uid,
          location.room_id
        );
      } else {
        return res.status(400).json({
          request_id,
          response_type: "error",
          access_granted: false,
          message: {
            line1: "Tipo de evento",
            line2: "invalido",
          },
          display_duration: 3000,
          message_hash: "",
        });
      }

      // Registrar log da tentativa de acesso
      await LogService.createLog({
        request_id,
        rfid_uid: rfid.uid,
        room_id: location.room_id,
        event_type: event_type.toLowerCase(), 
        timestamp_request: timestamp,
        access_granted: validationResult.granted,
        message: validationResult.message,
        service_authorization_id: validationResult.authorization_id,
        origin_ip: req.ip,
      });

      // Preparar resposta para o ESP32
      const response = {
        request_id,
        response_type: validationResult.granted ? "success" : "denied",
        access_granted: validationResult.granted,
        message: validationResult.message,
        display_duration: validationResult.granted ? 3000 : 5000,
        message_hash: "",
      };

      return res.json(response);
    } catch (error) {
      console.error("Erro ao verificar acesso:", error);

      return res.status(500).json({
        request_id: req.body?.request_id || "unknown",
        response_type: "error",
        access_granted: false,
        message: {
          line1: "Erro 500",
          line2: "no servidor",
        },
        display_duration: 5000,
        message_hash: "",
      });
    }
  }

  // Método para enviar uma requisição via MQTT (simulação)
  static async sendMQTTRequest(req, res) {
    try {
      const { device_id, ...requestData } = req.body;
      
      if (!device_id) {
        return res.status(400).json({
          error: "device_id é obrigatório para requisições MQTT"
        });
      }

      if (!MQTTService.getConnectionStatus()) {
        return res.status(503).json({
          error: "Serviço MQTT não está conectado"
        });
      }

      // Simula o envio de uma requisição MQTT
      await MQTTService.processAccessRequest(device_id, JSON.stringify(requestData));
      
      return res.json({
        message: "Requisição MQTT processada",
        device_id,
        status: "sent"
      });
    } catch (error) {
      console.error("Erro ao enviar requisição MQTT:", error);
      return res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  }

  // Método para verificar status do MQTT
  static async getMQTTStatus(req, res) {
    try {
      const isConnected = MQTTService.getConnectionStatus();
      
      return res.json({
        mqtt_connected: isConnected,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Erro ao verificar status MQTT:", error);
      return res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  }
}

module.exports = MQTTAccessController;
