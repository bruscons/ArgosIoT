// Includes de bibliotecas padrão do Arduino e ESP32
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <Keypad.h>
#include <ArduinoJson.h>

// config.h DEVE vir ANTES do PubSubClient
#include "config.h"

#include <PubSubClient.h>

#include <time.h>
#include <SPI.h>
#include <MFRC522.h>

// Includes dos nossos arquivos de projeto restantes
#include "types.h"
#include "door.h"
#include "rfid_reader.h"
#include "buzzer.h"

// Declaração das funções
void resetSystem();
void setSystemState(SystemState state);
bool processRfid();
bool processPassword();
String generateHash(const String& input);
String generateRequestId();
String buildRequestJson();
bool sendJsonMqtt();
bool connectWiFi();
bool connectMqtt();
void mqttCallback(char* topic, byte* payload, unsigned int length);
bool syncNTP();
bool ensureNtpSynced();
unsigned long long getCurrentTimestamp();
bool processServerResponse(const String& jsonResponse);
void showMessageOnLcd(const String& line1, const String& line2, unsigned int duration);
bool readRfidCard();


// Variáveis globais abaixo
// Objeto para controlar o buzzer
Buzzer buzzer(PIN_BUZZER);

// Objeto para controlar o LCD via I2C
LiquidCrystal_I2C lcd(LCD_I2C_ADDRESS, 16, 2);

// Objeto representando a porta (LED RGB)
Door door(PIN_LED_RED, PIN_LED_GREEN, PIN_LED_BLUE, DOOR_ID);

// Dimensões do keypad
const byte KEYPAD_ROWS = 4;
const byte KEYPAD_COLS = 4;

// Mapa de teclas do keypad
char KEYPAD_KEYS[4][4] = {
    {'1', '2', '3', 'A'},
    {'4', '5', '6', 'B'},
    {'7', '8', '9', 'C'},
    {'*', '0', '#', 'D'}
};

// Arrays de pinos do keypad
byte KEYPAD_ROW_PINS[4] = {PIN_KEYPAD_ROW_1, PIN_KEYPAD_ROW_2, PIN_KEYPAD_ROW_3, PIN_KEYPAD_ROW_4};
byte KEYPAD_COL_PINS[4] = {PIN_KEYPAD_COL_1, PIN_KEYPAD_COL_2, PIN_KEYPAD_COL_3, PIN_KEYPAD_COL_4};

// Objeto para ler o keypad
Keypad keypad = Keypad(makeKeymap(KEYPAD_KEYS), KEYPAD_ROW_PINS, KEYPAD_COL_PINS, KEYPAD_ROWS, KEYPAD_COLS);

// Objeto para ler cartões RFID
RfidReader rfidReader;

// Cliente WiFi seguro e MQTT
WiFiClientSecure wifiClient;
PubSubClient mqttClient(wifiClient);

// Contador de tempo para controles de timing
unsigned long lastMillis = 0;

// Estado global do sistema
SystemGlobalState systemState;

// Flag para indicar se o NTP já foi sincronizado
bool ntpSynced = false;

// VARIÁVEL PARA CONTROLAR SE O TIPO DE EVENTO FOI SELECIONADO
bool eventTypeSelected = false;  // Flag que indica se o usuário já escolheu entrada/saída

// Flag para controle não-bloqueante do estado MOSTRANDO_RESULTADO
bool resultDisplayInitialized = false;

// Flag para controle não-bloqueante do estado ERRO
bool errorDisplayInitialized = false;

// ID único do dispositivo baseado no MAC
String deviceId = "";




void setup() {
  Serial.begin(115200);
  Serial.println("Sistema iniciando...");

  // ⚠️ Define buffer MQTT em runtime também
  mqttClient.setBufferSize(1024);
  Serial.print("Buffer MQTT configurado para: ");
  Serial.println(mqttClient.getBufferSize());

  // Gera ID único do dispositivo baseado no MAC address
  uint64_t chipid = ESP.getEfuseMac();
  deviceId = String(MQTT_CLIENT_ID_PREFIX) + String((uint32_t)chipid, HEX);
  Serial.println("Device ID: " + deviceId);

  // Inicializa o barramento I2C com os pinos customizados
  Wire.begin(PIN_LCD_SDA, PIN_LCD_SCL);

  // Inicializa o LCD
  lcd.init();
  lcd.backlight();
  lcd.clear();
  Serial.println("LCD inicializado.");

  // Inicializa o LED
  door.init();

  // Inicializa o sensor RFID
  rfidReader.init();

  // Inicializa o buzzer
  buzzer.init(); 
  Serial.println("Buzzer inicializado.");
  
  // Configura MQTT
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  
  // Configura SSL/TLS (aceita qualquer certificado - apenas para desenvolvimento)
  wifiClient.setInsecure();

  // Configura estado inicial do sistema
  systemState.request_counter = 0;

  // Conecta ao WiFi
  if (!connectWiFi()) {
    Serial.println("Falha ao conectar WiFi");
    showMessageOnLcd("Erro WiFi", "Verifique rede", LCD_MESSAGE_DURATION);
    setSystemState(STATE_ERRO);
    return;
  }

  // Conecta ao MQTT
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Conectando MQTT");
  
  if (!connectMqtt()) {
    Serial.println("Falha ao conectar MQTT");
    showMessageOnLcd("Erro MQTT", "Verifique broker", LCD_MESSAGE_DURATION);
    setSystemState(STATE_ERRO);
    return;
  }

  // Sincroniza relógio NTP
  showMessageOnLcd("Sincronizando", "relogio NTP", LCD_MESSAGE_DURATION);
  if (!syncNTP()) {
    Serial.println("Falha na sincronização NTP");
    showMessageOnLcd("Erro NTP", "Continuando...", 2000);
    // Continua mesmo sem NTP (não é crítico)
  } else {
    ntpSynced = true;
  }

  // Feedback sonoro de inicialização bem-sucedida
  buzzer.beepSuccess();

  // Coloca o sistema no estado inicial
  resetSystem();
}

void loop() {
  // Mantém conexão MQTT ativa
  if (!mqttClient.connected()) {
    connectMqtt();
  } else {
    mqttClient.loop(); // Processa mensagens MQTT
  }
  
  char key = keypad.getKey();

  switch (systemState.current_state) {
    case STATE_AGUARDANDO_CONTATO:
      // Verifica teclas do keypad para escolher tipo de evento
      if (key) {
        if (key == '1') {
          // ENTRADA selecionada
          systemState.current_event_type = EVENT_ENTRY;
          systemState.current_rfid_sensor = RFID_ENTRADA;
          eventTypeSelected = true;
          buzzer.beepShort();
          
          showMessageOnLcd("ENTRADA", "Aproxime cartao", 0);
          door.showWaiting();
          
        } else if (key == '2') {
          // SAÍDA selecionada
          systemState.current_event_type = EVENT_EXIT;
          systemState.current_rfid_sensor = RFID_SAIDA;
          eventTypeSelected = true;
          buzzer.beepShort();
          
          showMessageOnLcd("SAIDA", "Aproxime cartao", 0);
          door.showWaiting();
        }
      }
      
      // SÓ PROCESSA RFID SE O TIPO DE EVENTO JÁ FOI SELECIONADO
      if (eventTypeSelected) {
        // Verifica se há cartão RFID presente
        if (readRfidCard()) {
          // Cartão detectado, processa automaticamente
          if (processRfid()) {
            // RFID processado com sucesso
            if (systemState.current_event_type == EVENT_ENTRY) {
              // Para entrada, pede senha
              setSystemState(STATE_AGUARDANDO_SENHA);
            } else {
              // Para saída, envia direto
              setSystemState(STATE_ENVIANDO);
            }
          }
        }
      }
      break;

    case STATE_AGUARDANDO_SENHA:
      if (key) {
        buzzer.beepShort();

        if (key == '*') {
          // Cancela a operação e reseta o sistema
          resetSystem();
          
        } else if (key == 'D') {
          // Apaga o último dígito da senha
          if (systemState.password_buffer.length() > 0) {
            systemState.password_buffer.remove(systemState.password_buffer.length() - 1);

            // Atualiza o LCD
            lcd.clear();
            lcd.setCursor(0, 0);
            lcd.print("Senha: ");
            lcd.setCursor(0, 1);
            for (size_t i = 0; i < systemState.password_buffer.length(); i++) {
              lcd.print("*");
            }
            lcd.blink();
          }
          
        } else if (key == '#') {
          // Confirma a senha digitada
          if (systemState.password_buffer.length() > 0) {
            lcd.noBlink();
            if (processPassword()) {
              // Senha confirmada com sucesso, avança para envio
              setSystemState(STATE_ENVIANDO);
            }
          }

        } else {
          // Adiciona dígito à senha
          if (systemState.password_buffer.length() < 16) {
            if (systemState.password_buffer.length() == 0) {
              // Limpa o LCD na primeira digitação
              lcd.clear();
              lcd.setCursor(0, 0);
              lcd.print("Senha: ");
              lcd.setCursor(0, 1);
              lcd.blink();
            }
            // Adiciona o dígito ao buffer de senha
            systemState.password_buffer += key;

            if (systemState.password_buffer.length() == 16) {
              // Assume que o usuário confirmou a senha ao digitar 16 dígitos
              lcd.noBlink();
              if (processPassword()) {
                // Senha confirmada com sucesso - avança para envio
                setSystemState(STATE_ENVIANDO);
              }
            } else {
              // Atualiza o LCD com asteriscos apenas se não completou 16 dígitos ainda
              lcd.print("*");
            }
          }

        }

      }
      break;

    case STATE_ENVIANDO:
      door.showProcessing();
      // Cria o JSON e envia via MQTT
      if (sendJsonMqtt()) {
        // Envio bem-sucedido, aguarda resposta assíncrona
        setSystemState(STATE_MOSTRANDO_RESULTADO);
      } else {
        // Falha no envio, mostra erro
        showMessageOnLcd("Erro 004", "Erro no envio", LCD_MESSAGE_DURATION);
        resetSystem();
      }
      break;
    
    case STATE_MOSTRANDO_RESULTADO:
      // Inicialização única ao entrar no estado (não-bloqueante)
      if (!resultDisplayInitialized) {
        // Exibe a resposta do servidor no LCD
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print(systemState.current_response.message_line1);
        lcd.setCursor(0, 1);
        lcd.print(systemState.current_response.message_line2);

        // Feedback sonoro baseado no resultado
        if (systemState.current_response.access_granted) {
          buzzer.beepSuccess();  // dois beeps curtos para sucesso
        } else {
          buzzer.beepDenied();   // beep longo para negado
        }

        // Acende o LED baseado no resultado
        door.showAccess(systemState.current_response.access_granted);
        
        resultDisplayInitialized = true;
      }
      
      // Verifica se já passou o tempo definido para exibição (não-bloqueante)
      if (millis() - systemState.state_enter_time >= systemState.current_response.display_duration) {
        resetSystem();
      }
      break;


    case STATE_ERRO:
      // Inicialização única ao entrar no estado (não-bloqueante)
      if (!errorDisplayInitialized) {
        door.showError();
        errorDisplayInitialized = true;
      }
      
      // Estado de erro - aguarda tempo definido de forma não-bloqueante
      if (millis() - systemState.state_enter_time >= LCD_MESSAGE_DURATION) {
        resetSystem();
      }
      break;
  }
}


// Reseta o sistema para o estado inicial
void resetSystem() {
  // Limpa buffers
  systemState.rfid_buffer = "";
  systemState.password_buffer = "";

  // Reseta informações de RFID
  systemState.last_rfid_read.uid = "";
  systemState.last_rfid_read.read_timestamp = 0;
  systemState.last_rfid_read.sensor_used = RFID_NONE;

  // Reseta tipo de evento
  systemState.current_event_type = EVENT_ENTRY;

  // Reseta a flag de tipo de evento selecionado
  eventTypeSelected = false;
  
  // Reseta a flag de inicialização do estado de resultado
  resultDisplayInitialized = false;
  
  // Reseta a flag de inicialização do estado de erro
  errorDisplayInitialized = false;

  // Apaga o LED
  door.turnOff();

  // Limpa o LCD e mostra mensagem de espera
  lcd.clear();
  lcd.noBlink();
  lcd.setCursor(0, 0);
  lcd.print("Selecione:");
  lcd.setCursor(0, 1);
  lcd.print("1-Entrada 2-Saida");

  // Retorna para o estado inicial
  setSystemState(STATE_AGUARDANDO_CONTATO);
}

// Muda o estado do sistema e registra o momento da mudança
void setSystemState(SystemState newState) {
  systemState.current_state = newState;
  systemState.state_enter_time = millis();
  
  Serial.print("Estado mudou para: ");
  Serial.println(newState);
}

// Processa o RFID lido e prepara o sistema para o próximo passo
bool processRfid() {
  // Armazena as informações do RFID lido
  systemState.last_rfid_read.uid = systemState.rfid_buffer;
  systemState.last_rfid_read.read_timestamp = millis();
  systemState.last_rfid_read.sensor_used = systemState.current_rfid_sensor;

  // Mostra feedback no LCD baseado no tipo de evento
  lcd.clear();
  lcd.setCursor(0, 0);
  if (systemState.current_event_type == EVENT_ENTRY) {
    lcd.print("Cartao lido:");
    lcd.setCursor(0, 1);
    lcd.print("Digite senha");
  } else {
    lcd.print("Cartao lido:");
    lcd.setCursor(0, 1);
    lcd.print("Processando...");
  }

  return true;
}

// Processa a senha digitada e prepara a requisição
bool processPassword() {
  // A senha já está em systemState.password_buffer
  // Apenas confirma que há senha para processar
  if (systemState.password_buffer.length() == 0) {
    return false;
  }

  Serial.println("Senha confirmada. Avançando para envio...");
  return true;
}

// Gera um hash simples para a mensagem (placeholder)
// TODO: Implementar hash real (SHA256) para produção
String generateHash(const String& input) {
  // TODO: implementar hash real da senha (bcrypt) ou da mensagem
  // Por enquanto retorna a string pura
  // IMPORTANTE: O backend espera receber o hash bcrypt da senha
  // Precisará usar uma biblioteca de bcrypt para ESP32
  return input;
}

// Gera um ID único para a requisição
String generateRequestId() {
  // Formato: ESP_ID + contador sequencial + timestamp
  systemState.request_counter++;
  
  // Reseta contador se ultrapassar o máximo definido
  if (systemState.request_counter > REQUEST_COUNTER_MAX) {
    systemState.request_counter = 1;
  }

  String requestId = String(ESP_ID) + "_" + 
                    String(systemState.request_counter) + "_" + 
                    String(millis());

  return requestId;
}

// Constrói o JSON da requisição
String buildRequestJson() {
  // Gera ID da requisição
  String requestId = generateRequestId();
  systemState.current_request.request_id = requestId;

  // Preenche informações de localização
  systemState.current_request.location.room_id = ROOM_ID;
  systemState.current_request.location.door_id = DOOR_ID;
  systemState.current_request.location.esp_id = ESP_ID;

  // Preenche informações do RFID
  systemState.current_request.rfid_info = systemState.last_rfid_read;

  // Preenche tipo de evento
  systemState.current_request.event_type = systemState.current_event_type;

  // Obtém timestamp direto como unsigned long long (NÃO armazena na estrutura ainda)
  unsigned long long timestamp = getCurrentTimestamp();

  // Converte timestamp para string para evitar overflow
  char timestampStr[32];
  sprintf(timestampStr, "%llu", timestamp);

  // Armazena na estrutura só por completude (vai dar overflow mas não usamos esse valor)
  systemState.current_request.timestamp = timestamp;

  // Preenche hash da senha (apenas para entrada)
  if (systemState.current_event_type == EVENT_ENTRY) {
    systemState.current_request.password_hash = generateHash(systemState.password_buffer);
  } else {
    systemState.current_request.password_hash = "";
  }

  // Cria o documento JSON
  StaticJsonDocument<1024> doc;

  doc["request_id"] = systemState.current_request.request_id;
  doc["timestamp"] = timestampStr;  // USA A STRING, não o campo da estrutura
  doc["event_type"] = (systemState.current_request.event_type == EVENT_ENTRY) ? "entry" : "exit";

  // Objeto de localização
  JsonObject location = doc.createNestedObject("location");
  location["room_id"] = systemState.current_request.location.room_id;
  location["door_id"] = systemState.current_request.location.door_id;
  location["esp_id"] = systemState.current_request.location.esp_id;

  // Objeto de informações RFID
  JsonObject rfid = doc.createNestedObject("rfid");
  rfid["uid"] = systemState.current_request.rfid_info.uid;
  
  String sensorType;
  if (systemState.current_request.rfid_info.sensor_used == RFID_ENTRADA) {
    sensorType = "entrada";
  } else if (systemState.current_request.rfid_info.sensor_used == RFID_SAIDA) {
    sensorType = "saida";
  } else {
    sensorType = "none";
  }
  rfid["sensor_used"] = sensorType;

  // Hash da senha dentro do objeto rfid
  if (systemState.current_event_type == EVENT_ENTRY) {
    rfid["password_hash"] = systemState.current_request.password_hash;
  } else {
    rfid["password_hash"] = "";
  }

  // Gera hash de integridade usando a string do timestamp
  String messageForHash = requestId + String(timestampStr) + 
                         systemState.current_request.rfid_info.uid;
  systemState.current_request.message_hash = generateHash(messageForHash);
  doc["message_hash"] = systemState.current_request.message_hash;

  // Serializa o JSON em string
  String jsonString;
  serializeJson(doc, jsonString);

  Serial.println("JSON da requisição:");
  Serial.println(jsonString);

  return jsonString;
}


// Conecta ao WiFi
// Retorna true se conectado com sucesso
bool connectWiFi() {
  // Se já está conectado, não precisa conectar novamente
  if (WiFi.status() == WL_CONNECTED) {
    return true;
  }

  // Mostra feedback no LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Conectando WiFi");

  // Inicia a conexão
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // Aguarda até conectar ou timeout (10 segundos)
  unsigned long startTime = millis();
  while(WiFi.status() != WL_CONNECTED) {
    // Aguarda 500 ms antes de checar novamente
    delay(500);
    
    if (millis() - startTime > 10000) {
      // Timeout de 10 segundos
      return false;
    }
  }

  // Conectou com sucesso
  Serial.println("\nWiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  
  return true;
}

// Sincroniza o relógio do ESP32 com servidor NTP
// Retorna true se sincronizado com sucesso
bool syncNTP() {
  showMessageOnLcd("Sincronizando", "relogio...", 1000);

  // Configura o servidor NTP
  // GMT offset para Brasília: -3 horas = -10800 segundos
  // Daylight offset: 0 (Brasil não usa horário de verão desde 2019)
  configTime(-10800, 0, "pool.ntp.org", "time.nist.gov");

  // Aguarda a sincronização (timeout de 10 segundos)
  unsigned long startTime = millis();
  time_t now = 0;
  
  while (now < 1000000000) { // Timestamp precisa ser razoável (após ano 2001)
    time(&now);
    delay(500);
    
    if (millis() - startTime > 10000) {
      // Timeout de 10 segundos
      return false;
    }
  }

  // Sincronizou com sucesso
  Serial.println("\nNTP SINCRONIZADO");
  Serial.print("Timestamp atual: ");
  Serial.println(now);
  
  return true;
}

// Obtém o timestamp atual em milissegundos desde Unix epoch
// Retorna o timestamp em milissegundos
unsigned long long getCurrentTimestamp() {
  struct timeval tv;
  gettimeofday(&tv, NULL);
  
  // Converte para milissegundos
  unsigned long long milliseconds = 
    ((unsigned long long)tv.tv_sec * 1000ULL) + 
    ((unsigned long long)tv.tv_usec / 1000ULL);
  
  return milliseconds;
}

// Processa o JSON de resposta recebido do servidor
// Retorna true se conseguiu processar
bool processServerResponse(const String& jsonResponse) {
  // Cria um documento JSON para parsear a resposta
  StaticJsonDocument<512> responseDoc;

  // Tenta parsear o JSON
  DeserializationError error = deserializeJson(responseDoc, jsonResponse);
  if (error) {
    // JSON inválido ou corrompido
    Serial.print(F("Json inválido: "));
    Serial.println(error.c_str());

    buzzer.beepError();

    showMessageOnLcd("Erro 006", "Erro deserialize", LCD_MESSAGE_DURATION);
    return false;
  }

  // Extrai os dados do JSON e preenche o systemState.current_response
  systemState.current_response.request_id = responseDoc["request_id"].as<String>();
  
  
  String responseType = responseDoc["response_type"].as<String>();
  systemState.current_response.response_type = (responseType == "success") ? RESPONSE_SUCCESS : RESPONSE_ERROR;
  
  systemState.current_response.access_granted = responseDoc["access_granted"].as<bool>();
  systemState.current_response.message_line1 = responseDoc["message"]["line1"].as<String>();
  systemState.current_response.message_line2 = responseDoc["message"]["line2"].as<String>();
  systemState.current_response.display_duration = responseDoc["display_duration"].as<unsigned int>();
  systemState.current_response.message_hash = responseDoc["message_hash"].as<String>();
  
  // TODO: Validar se o request_id corresponde ao que foi enviado
  // TODO: Validar o message_hash para garantir integridade

  return true;
}

void showMessageOnLcd(const String& line1, const String& line2, unsigned int duration) {

  // TODO: implementar função para verificar tamanho das linhas

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(line1);
  lcd.setCursor(0, 1);
  lcd.print(line2);
  
  if (duration > 0) {
    delay(duration);
  }
}

// Sincroniza com servidor NTP se ainda não sincronizou
bool ensureNtpSynced() {
  if (!ntpSynced) {
    if (!syncNTP()) {
      // Falha na sincronização NTP
      buzzer.beepError();
      showMessageOnLcd("Erro 007", "Erro NTP", LCD_MESSAGE_DURATION);
      resetSystem();
      return false;
    }
    ntpSynced = true;
  }

  return ntpSynced;
}

// Função para ler cartão RFID do sensor único
// Retorna true se um cartão foi lido com sucesso
bool readRfidCard() {
  // Verifica se o sensor está inicializado
  if (!rfidReader.isInitialized()) {
    return false;
  }
  
  String uid;
  
  // Lê do sensor baseado no tipo de evento selecionado
  bool cardRead = false;
  if (systemState.current_event_type == EVENT_ENTRY) {
    cardRead = rfidReader.readEntradaCard(uid);
  } else {
    cardRead = rfidReader.readSaidaCard(uid);
  }
  
  if (cardRead) {
    // Cartão lido com sucesso
    systemState.rfid_buffer = uid;

    Serial.println("UID: " + uid);
    buzzer.beepShort();
    
    return true;
  }
  
  return false;
}

// Conecta ao broker MQTT
bool connectMqtt() {
  if (!WiFi.isConnected()) {
    return false;
  }

  Serial.println("Conectando ao MQTT...");
  
  // Tenta conectar com username/password 
  bool connected = false;
  if (strlen(MQTT_USERNAME) > 0) {
    connected = mqttClient.connect(deviceId.c_str(), MQTT_USERNAME, MQTT_PASSWORD);
  } else {
    connected = mqttClient.connect(deviceId.c_str());
  }

  if (connected) {
    Serial.println("Conectado ao MQTT broker");
    
    // Inscreve-se no tópico de resposta específico para este dispositivo
    String responseTopic = String(MQTT_TOPIC_RESPONSE_PREFIX) + deviceId;
    mqttClient.subscribe(responseTopic.c_str());
    Serial.println("Inscrito no tópico: " + responseTopic);
    
    return true;
  } else {
    Serial.print("Falha na conexão MQTT, rc=");
    Serial.println(mqttClient.state());
    return false;
  }
}

// Callback para mensagens MQTT recebidas
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  // Converte payload para String
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.println("Mensagem MQTT recebida no tópico: " + String(topic));
  Serial.println("Conteúdo: " + message);
  
  // Verifica se é uma resposta para este dispositivo
  String expectedTopic = String(MQTT_TOPIC_RESPONSE_PREFIX) + deviceId;
  if (String(topic) == expectedTopic) {
    // Processa a resposta do servidor
    if (processServerResponse(message)) {
      Serial.println("Resposta MQTT processada com sucesso");
    } else {
      Serial.println("Erro ao processar resposta MQTT");
    }
  }
}


// Envia JSON via MQTT
bool sendJsonMqtt() {
  if (!mqttClient.connected()) {
    Serial.println("MQTT não conectado");
    return false;
  }

  // Garante que o NTP está sincronizado antes de enviar
  if (!ntpSynced) {
    Serial.println("Tentando sincronizar NTP antes de enviar...");
    if (!syncNTP()) {
      buzzer.beepError();
      showMessageOnLcd("Erro NTP", "Sem sincronia", LCD_MESSAGE_DURATION);
      return false;
    }
    ntpSynced = true;
  }

  // Monta o JSON da requisição
  String requestJson = buildRequestJson();

  // Verifica se o JSON foi gerado corretamente
  if (requestJson.length() == 0) {
    Serial.println("Erro: JSON vazio");
    buzzer.beepError();
    showMessageOnLcd("Erro JSON", "JSON vazio", LCD_MESSAGE_DURATION);
    return false;
  }

  // Tópico de requisição específico para este dispositivo
  String requestTopic = String(MQTT_TOPIC_REQUEST_PREFIX) + deviceId;

  Serial.println("Enviando via MQTT:");
  Serial.println("Tópico: " + requestTopic);
  Serial.println("Mensagem: " + requestJson);
  Serial.print("Tamanho: ");
  Serial.println(requestJson.length());

  // ⚠️ MUDANÇA PRINCIPAL: Usar o método publish com tamanho explícito
  // Isso garante que o buffer seja lido corretamente
  bool published = mqttClient.publish(
    requestTopic.c_str(), 
    (const uint8_t*)requestJson.c_str(), 
    requestJson.length(),
    false  // retained = false (não mantém mensagem no broker)
  );

  if (published) {
    Serial.println("✓ Mensagem MQTT enviada com sucesso");
    
    // Aguarda resposta por alguns segundos
    Serial.println("Aguardando resposta...");
    unsigned long startWait = millis();
    while (millis() - startWait < 5000) { // Aguarda até 5 segundos
      mqttClient.loop(); // Processa mensagens recebidas
      delay(100);
    }
    
    return true;
  } else {
    Serial.println("✗ Falha ao enviar mensagem MQTT");
    Serial.print("Estado do cliente: ");
    Serial.println(mqttClient.state());
    
    buzzer.beepError();
    showMessageOnLcd("Erro MQTT", "Falha no envio", LCD_MESSAGE_DURATION);
    return false;
  }
}
