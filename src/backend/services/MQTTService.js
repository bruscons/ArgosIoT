// ./services/MQTTService.js

const mqtt = require("mqtt");
const AccessValidationService = require("./AccessValidationService");
const LogService = require("./LogService");

class MQTTService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;

    // Tópicos MQTT
    this.topics = {
      REQUEST: "access/request/+", // + é referencia para device_id //SUBSCRIBE
      RESPONSE: "access/response/", // Será completado com device_id específico //PUBLISH
    };
  }

  // Conecta ao broker MQTT
  async connect() {
    try {
      const brokerUrl = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";
      const options = {
        clientId: `${
          process.env.MQTT_CLIENT_ID || "access-control-backend"
        }-${Date.now()}`,
        clean: true,
        connectTimeout: 10000, // Aumentado para 10 segundos
        username: process.env.MQTT_USERNAME || "",
        password: process.env.MQTT_PASSWORD || "",
        reconnectPeriod: 5000, // Reconectar a cada 5 segundos (não muito agressivo)
        keepalive: 60, // Keepalive de 60 segundos para conexões mais estáveis
        // Configurações específicas para HiveMQ Cloud
        rejectUnauthorized: true,
        protocolVersion: 4, // MQTT 3.1.1
      };

      console.log(`Conectando ao broker MQTT: ${brokerUrl}`);

      this.client = mqtt.connect(brokerUrl, options);

      return new Promise((resolve, reject) => {
        // Timeout para conexão inicial
        const connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error("Timeout ao conectar ao broker MQTT"));
          }
        }, 15000);

        this.client.on("connect", () => {
          clearTimeout(connectionTimeout);
          console.log("Conectado ao broker MQTT");
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.setupSubscriptions();
          resolve();
        });

        this.client.on("error", (error) => {
          console.error("Erro de conexão MQTT:", error.message);
          this.isConnected = false;

          // Não rejeita na primeira tentativa para permitir reconexão
          if (this.reconnectAttempts === 0) {
            clearTimeout(connectionTimeout);
            reject(error);
          }
        });

        this.client.on("close", () => {
          console.log("Conexão MQTT fechada");
          this.isConnected = false;
        });

        this.client.on("reconnect", () => {
          this.reconnectAttempts++;
          console.log(
            `Reconectando ao MQTT... (tentativa ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
          );

          // Para reconexões infinitas
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log(
              "Máximo de tentativas de reconexão atingido. Parando reconexões automáticas."
            );
            this.client.options.reconnectPeriod = 0; // Desabilita reconexão automática
          }
        });

        this.client.on("offline", () => {
          console.log("Cliente MQTT offline");
          this.isConnected = false;
        });

        this.client.on("message", (topic, message) => {
          this.handleMessage(topic, message);
        });
      });
    } catch (error) {
      console.error("Erro ao conectar MQTT:", error);
      throw error;
    }
  }

  // Configura as inscrições nos tópicos
  setupSubscriptions() {
    // Inscreve-se no tópico de requisições de todos os dispositivos
    this.client.subscribe(this.topics.REQUEST, { qos: 1 }, (err) => {
      if (err) {
        console.error("Erro ao se inscrever no tópico de requisições:", err);
      } else {
        console.log(`Inscrito no tópico: ${this.topics.REQUEST}`);
      }
    });
  }

  // Processa mensagens recebidas
  async handleMessage(topic, message) {
    try {
      console.log(
        `Mensagem recebida no tópico ${topic}: ${message.toString()}`
      );

      // Extrai o device_id do tópico
      const topicParts = topic.split("/");
      const deviceId = topicParts[topicParts.length - 1];

      if (topic.startsWith("access/request/")) {
        await this.processAccessRequest(deviceId, message.toString());
      }
    } catch (error) {
      console.error("Erro ao processar mensagem MQTT:", error);
    }
  }

  // Processa uma requisição de acesso
  async processAccessRequest(deviceId, messageStr) {
    let request;
    try {
      console.log("[DEBUG] Iniciando processAccessRequest");
      console.log("[DEBUG] deviceId:", deviceId);
      console.log("[DEBUG] messageStr:", messageStr);

      request = JSON.parse(messageStr);
      console.log(
        "[DEBUG] JSON parseado com sucesso:",
        JSON.stringify(request, null, 2)
      );

      const { request_id, timestamp, event_type, location, rfid } = request;

      console.log("[DEBUG] Campos extraídos:");
      console.log("[DEBUG] - request_id:", request_id);
      console.log("[DEBUG] - timestamp:", timestamp);
      console.log("[DEBUG] - event_type:", event_type);
      console.log("[DEBUG] - location:", JSON.stringify(location));
      console.log("[DEBUG] - rfid:", JSON.stringify(rfid));

      // Validação básica dos campos obrigatórios
      if (!request_id || !timestamp || !event_type || !location || !rfid) {
        console.log("[DEBUG] Validação falhou - campos obrigatórios faltando");
        const errorResponse = {
          request_id: request_id || "unknown",
          response_type: "error",
          access_granted: false,
          message: {
            line1: "Dados",
            line2: "incompletos",
          },
          display_duration: 3000,
          message_hash: "",
          timestamp: Date.now(),
        };

        await this.publishResponse(deviceId, errorResponse);
        return;
      }

      let validationResult;

      // Processar entrada ou saída
      if (event_type === "entry") {
        console.log("[DEBUG] Processando ENTRY");
        console.log(
          "[DEBUG] Chamando AccessValidationService.validateEntry com:"
        );
        console.log("[DEBUG] - rfid.uid:", rfid.uid);
        console.log("[DEBUG] - rfid.password_hash:", rfid.password_hash);
        console.log("[DEBUG] - location.room_id:", location.room_id);
        console.log("[DEBUG] - timestamp:", timestamp);

        // Para entrada, validar com senha
        validationResult = await AccessValidationService.validateEntry(
          rfid.uid,
          rfid.password_hash,
          location.room_id,
          timestamp
        );
        console.log(
          "[DEBUG] validateEntry retornou:",
          JSON.stringify(validationResult)
        );
      } else if (event_type === "exit") {
        console.log("[DEBUG] Processando EXIT");
        // Para saída, validar sem senha
        validationResult = await AccessValidationService.validateExit(
          rfid.uid,
          location.room_id
        );
        console.log(
          "[DEBUG] validateExit retornou:",
          JSON.stringify(validationResult)
        );
      } else {
        console.log("[DEBUG] event_type inválido:", event_type);
        const errorResponse = {
          request_id,
          response_type: "error",
          access_granted: false,
          message: {
            line1: "Tipo de evento",
            line2: "invalido",
          },
          display_duration: 3000,
          message_hash: "",
          timestamp: Date.now(),
        };

        await this.publishResponse(deviceId, errorResponse);
        return;
      }

      console.log("[DEBUG] Chamando LogService.createLog");
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
        origin_ip: "mqtt",
      });
      console.log("[DEBUG] LogService.createLog concluído");

      // Preparar resposta para o ESP32
      const response = {
        request_id,
        response_type: validationResult.granted ? "success" : "denied",
        access_granted: validationResult.granted,
        message: validationResult.message,
        display_duration: validationResult.granted ? 3000 : 5000,
        message_hash: "",
        timestamp: Date.now(),
      };

      console.log("[DEBUG] Enviando resposta:", JSON.stringify(response));
      await this.publishResponse(deviceId, response);
      console.log("[DEBUG] processAccessRequest concluído com sucesso");
    } catch (error) {
      console.error("[DEBUG] ERRO CAPTURADO em processAccessRequest:");
      console.error("[DEBUG] Tipo do erro:", error.constructor.name);
      console.error("[DEBUG] Mensagem:", error.message);
      console.error("[DEBUG] Stack:", error.stack);

      if (request) {
        console.error(
          "[DEBUG] Request que causou o erro:",
          JSON.stringify(request, null, 2)
        );
      }

      const errorResponse = {
        request_id: request?.request_id || "unknown",
        response_type: "error",
        access_granted: false,
        message: {
          line1: "Erro 500",
          line2: "no servidor",
        },
        display_duration: 5000,
        message_hash: "",
        timestamp: Date.now(),
      };

      await this.publishResponse(deviceId, errorResponse);
    }
  }

  // Publica resposta para um dispositivo específico
  async publishResponse(deviceId, response) {
    if (!this.isConnected) {
      console.error("MQTT não conectado. Não é possível enviar resposta.");
      return false;
    }

    try {
      const topic = `${this.topics.RESPONSE}${deviceId}`;
      const message = JSON.stringify(response);

      this.client.publish(topic, message, { qos: 1 }, (err) => {
        if (err) {
          console.error("Erro ao publicar resposta:", err);
        } else {
          console.log(`Resposta enviada para ${topic}: ${message}`);
        }
      });

      return true;
    } catch (error) {
      console.error("Erro ao publicar mensagem MQTT:", error);
      return false;
    }
  }

  // Desconecta do broker MQTT
  disconnect() {
    if (this.client) {
      this.client.end(true); // true = force disconnect
      this.isConnected = false;
      console.log("Desconectado do broker MQTT");
    }
  }

  // Verifica se está conectado
  getConnectionStatus() {
    return this.isConnected;
  }

  // Reconecta manualmente (útil para chamar via API)
  async reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    await this.connect();
  }
}

module.exports = new MQTTService();
