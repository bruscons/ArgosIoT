#ifndef TYPES_H
#define TYPES_H

#include <Arduino.h>

// Representa os possíveis estados da máquina de controle de acesso
enum SystemState {
  STATE_AGUARDANDO_CONTATO,        // Sistema esperando aproximação de cartão
  STATE_AGUARDANDO_SENHA,       // Cartão lido, aguardando digitação de senha
  STATE_ENVIANDO,               // Enviando requisição ao servidor
  STATE_MOSTRANDO_RESULTADO,    // Exibindo resultado (acesso permitido/negado)
  STATE_ERRO                    // Estado de erro (timeout, falha de rede, etc)
};

// Representa o tipo de evento de acesso
enum EventType {
  EVENT_ENTRY,  // Tentativa de entrada (requer RFID + senha)
  EVENT_EXIT    // Tentativa de saída (requer apenas RFID)
};

// Representa qual sensor RFID foi usado
enum RfidSensor {
  RFID_ENTRADA,
  RFID_SAIDA,
  RFID_NONE
};

// Representa o tipo de resposta recebida do servidor
enum ResponseType {
  RESPONSE_SUCCESS,  // Requisição processada com sucesso (pode ter concedido ou negado acesso)
  RESPONSE_ERROR     // Erro no processamento da requisição no servidor
};

// Representa informações da localização física do sistema
struct Location {
  String room_id;   // Identificador da sala
  String door_id;   // Identificador da porta
  String esp_id;   // Identificador do ESP32
};

// Representa informações lidas de um cartão RFID
struct RfidInfo {
    String uid;     // UID único do cartão em formato hexadecimal
    unsigned long read_timestamp; // Momento da leitura
    RfidSensor sensor_used; // Qual sensor foi usado para a leitura
};

// Representa uma requisição de entrada ou saída a ser enviada ao servidor
struct AccessRequest {
    String request_id;       // ID da requisição
    unsigned long timestamp; // Momento de criação da requisição
    EventType event_type;    // Tipo de evento (entrada ou saída)
    Location location;       // Informações da sala
    RfidInfo rfid_info;      // Informações do cartão lido
    String password_hash;    // Hash da senha (vazio para saídas)
    String message_hash;     // Hash de integridade da mensagem
};

// Representa a resposta recebida do servidor
struct AccessResponse {
    String request_id;           // ID da requisição
    ResponseType response_type;  // Tipo de resposta (sucesso ou erro)
    bool access_granted;         // Se o acesso foi concedido ou negado
    String message_line1;        // Linha 1 da mensagem para o LCD
    String message_line2;        // Linha 2 da mensagem para o LCD
    unsigned int display_duration;  // Tempo em ms para mostrar a mensagem
    String message_hash;         // Hash de integridade da resposta
};

// Representa o estado global completo do sistema de controle de acesso
struct SystemGlobalState {
    SystemState current_state;          // Estado atual da máquina de estados
    EventType current_event_type;       // Tipo de evento sendo processado (entrada/saída)
    unsigned long request_counter;      // Contador sequencial de requisições
    bool offlineMode;                    // Flag para indicar se o sistema está em modo offline ou online
  
    String rfid_buffer;                 // Buffer para RFID sendo digitado
    RfidInfo last_rfid_read;           // Último RFID lido (enquanto aguarda senha)
    RfidSensor current_rfid_sensor;    // Qual sensor RFID foi usado na última leitura
    String password_buffer;             // Buffer para senha sendo digitada
  
    AccessRequest current_request;      // Requisição atual sendo processada
    AccessResponse current_response;    // Última resposta recebida do servidor
  
    unsigned long state_enter_time;     // Momento em que entrou no estado atual
};

// !!!!!!!!!!!!!!!!!!!!!!!!!! APENAS PARA DADOS MOCKADOS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Estrutura para armazenar dados de um cartão rfid válido
struct MockCard {
  String uid;             // UID do cartão
  String password;        // Senha para entrada

  String userName;        // Apenas para exibir no LCD

  bool allowEntry;        // Se permite entrada
  bool allowExit;         // Se permite saída
};



#endif