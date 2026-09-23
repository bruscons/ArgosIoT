// ./services/MQTTService.ts

import mqtt from "mqtt";
import type { MqttClient } from "mqtt";

class MQTTService {
  private client: MqttClient | null = null;
  private isConnected: boolean = false;

  // Conectar ao broker MQTT
  connect(
    onMessage: (topic: string, message: Buffer) => void,
    onConnect?: () => void,
    onError?: (error: Error) => void
  ) {
    try {
      const mqttUrl = process.env.NEXT_PUBLIC_MQTT_URL || "ws://localhost:8083";
      const username = process.env.NEXT_PUBLIC_MQTT_USERNAME || "";
      const password = process.env.NEXT_PUBLIC_MQTT_PASSWORD || "";
      const options = {
        clientId: `argos-frontend-${Math.random().toString(16).substr(2, 8)}`,
        clean: true,
        connectTimeout: 30000, // 30 segundos para HiveMQ Cloud
        username: username || undefined,
        password: password || undefined,
        reconnectPeriod: 5000, // 5 segundos entre reconexões
      };

      console.log("Conectando ao broker MQTT:", mqttUrl);

      this.client = mqtt.connect(mqttUrl, options);

      this.client.on("connect", () => {
        console.log("Conectado ao broker MQTT");
        this.isConnected = true;

        // Inscrever-se nos tópicos de resposta (wildcard para todos os dispositivos)
        const topic = "access/response/+";
        this.client?.subscribe(topic, { qos: 1 }, (err) => {
          if (err) {
            console.error("Erro ao se inscrever no tópico de respostas:", err);
          } else {
            console.log("Inscrito no tópico:", topic);
          }
        });

        // Também se inscrever no tópico geral (caso o backend publique lá)
        const generalTopic = "access/response/#";
        this.client?.subscribe(generalTopic, { qos: 1 }, (err) => {
          if (err) {
            console.error("Erro ao se inscrever no tópico geral:", err);
          } else {
            console.log("Inscrito no tópico geral:", generalTopic);
          }
        });

        if (onConnect) onConnect();
      });

      this.client.on("message", (topic, message) => {
        console.log("Mensagem MQTT recebida no tópico:", topic);
        console.log("Payload:", message.toString());
        onMessage(topic, message);
      });

      this.client.on("error", (error) => {
        console.error("Erro de conexão MQTT:", error);
        this.isConnected = false;
        if (onError) onError(error);
      });

      this.client.on("close", () => {
        console.log("Conexão MQTT fechada");
        this.isConnected = false;
      });

      this.client.on("reconnect", () => {
        console.log("Reconectando ao MQTT...");
      });
    } catch (error) {
      console.error("Erro ao conectar MQTT:", error);
      if (onError && error instanceof Error) onError(error);
    }
  }

  // Desconectar do broker MQTT
  disconnect() {
    if (this.client) {
      this.client.end();
      this.isConnected = false;
      console.log("Desconectado do broker MQTT");
    }
  }

  // Verificar se está conectado
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Publicar mensagem (se necessário)
  publish(topic: string, message: string) {
    if (!this.isConnected || !this.client) {
      console.error("MQTT não conectado. Não é possível enviar mensagem.");
      return false;
    }

    try {
      this.client.publish(topic, message, { qos: 1 }, (err) => {
        if (err) {
          console.error("Erro ao publicar mensagem:", err);
        } else {
          console.log(`Mensagem enviada para ${topic}: ${message}`);
        }
      });
      return true;
    } catch (error) {
      console.error("Erro ao publicar mensagem MQTT:", error);
      return false;
    }
  }
}

export default new MQTTService();
