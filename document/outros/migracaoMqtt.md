
## O que é MQTT? 

A principal diferença do HTTP para o MQTT é que o sistema sempre está ativo: existe um "broker" (um cluster central na nuvem) que fica sempre disponível. O Arduino e o servidor ficam conectados no canal criado, trocando mensagens (como as requisições HTTP, mas de forma persistente).

### Componentes da Arquitetura MQTT:

1. ESP32 (Arduino) - O cliente que envia mensagens
2. HiveMQ Broker - O Gerenciador das conversas  
3. Backend Node.js - O servidor que processa
4. PostgreSQL - O banco de dados que valida acessos

### Fluxo:

ESP32 -> HiveMQ Cloud -> Backend -> PostgreSQL -> Backend -> HiveMQ -> ESP32

1. Usuário digita `1` no keypad
2. Usuário digita código RFID (ex: A1B2C3D4)
3. Usuário digita senha (ex: 1234)
4. ESP32 monta mensagem JSON e envia para tópico access/request/ESP32_XXXXX
5. HiveMQ recebe e roteia para o canal e seu ouvinte, no caso o próprio backend
6. Backend processa, consultando o banco PostgreSQL
7. PostgreSQL retorna se o acesso foi permitido
8. Backend monta resposta e envia para tópico: `access/response/ESP32_XXXXX`
9. HiveMQ roteia de volta para o ESP32 específico
10. ESP32 recebe
11. Porta libera acesso ou não como anteriormente

## Alterações no Backend

### 1. Dependência 
- mqtt: Cliente MQTT para Node.js

### 2. Arquivos

#### server.js
Inicialização do serviço MQTT durante o startup do servidor:
```javascript
const MQTTService = require("./services/MQTTService");

await MQTTService.connect();
console.log("Serviço MQTT inicializado com sucesso");
```

Desconectar MQTT:
```javascript
process.on('SIGINT', () => {
  MQTTService.disconnect();
  process.exit(0);
});
```

#### services/MQTTService.js
Arquivo principal que gerencia toda a comunicação MQTT, contendo as seguintes funções:

```javascript
class MQTTService {
  async connect() 
  // Conecta no HiveMQ Cloud usando credenciais do .env
  
  setupSubscriptions() 
  // Se inscreve no tópico access/request/+ para escutar todos os ESP32s
  
  async handleMessage(topic, message) 
  // Processa mensagens recebidas dos dispositivos
  
  async processAccessRequest(deviceId, messageStr) 
  // Lógica principal de validação de acesso via MQTT
  
  async publishResponse(deviceId, response) 
  // Envia resposta de volta para o ESP32 específico
}
```

#### controllers/MQTTAccessController.js
Controller do MQTTService:

#### routes/access.js
 Rotas para monitoramento MQTT:
```javascript
router.get('/mqtt/status', // Verifica status da conexão MQTT
router.post('/mqtt/send', // Envia requisição de teste via MQTT
```

### 3. Configurações no .env
```env
# Configuração do MQTT Broker - HiveMQ Cloud com TLS
MQTT_BROKER_URL="mqtts://d8375c5d1154430bbaedae91fd4e1632.s1.eu.hivemq.cloud:8883"
MQTT_USERNAME="Argos"
MQTT_PASSWORD="ioTrain*99!"
MQTT_CLIENT_ID="access-control-backend"
```

### 4. Endpoints
- `GET /api/access/mqtt/status`: Verifica status da conexão MQTT
- `POST /api/access/mqtt/send`: Envia requisição via MQTT 

## Alterações no Firmware

### 1. Dependências 
- **Removido**: `HTTPClient` 
- **Adicionado**: `PubSubClient` e `WiFiClientSecure` - Cliente MQTT com TLS para ESP32

### 2. Configurações no config.h
```cpp
// Tópicos MQTT
#define MQTT_TOPIC_REQUEST_PREFIX "access/request/"
#define MQTT_TOPIC_RESPONSE_PREFIX "access/response/"
```

### 3. Recursos Adicionais Necessários para o MQTT
- ID único do dispositivo baseado no MAC address
- Reconexão automática do MQTT
- Callback assíncrono para respostas

### Logs do Firmware
- Device ID único mostrado no Serial Monitor junto dos status das conexões MQTT





