#ifndef CONFIG_H
#define CONFIG_H

#define MQTT_MAX_PACKET_SIZE 1024
#define MQTT_MAX_TRANSFER_SIZE 1024

/****************************************************************
 * Identificação do sistema
*/

#define ROOM_ID "SALA_01"
#define DOOR_ID "PORTA_01"
#define ESP_ID "ESP_001"


/****************************************************************
 * Configuração da rede
*/

#define WIFI_SSID "VictorG." // Nome da rede WiFi
#define WIFI_PASSWORD "helloguys"



#define MQTT_BROKER "d8375c5d1154430bbaedae91fd4e1632.s1.eu.hivemq.cloud" // HiveMQ Cloud
#define MQTT_PORT 8883 // Porta TLS do HiveMQ
#define MQTT_CLIENT_ID_PREFIX "ESP32_" // Prefixo para o client ID
#define MQTT_USERNAME "Argos"
#define MQTT_PASSWORD "ioTrain*99!"

// Tópicos MQTT
#define MQTT_TOPIC_REQUEST_PREFIX "access/request/" // Prefixo para tópico de requisições //PUBLISH
#define MQTT_TOPIC_RESPONSE_PREFIX "access/response/" // Prefixo para tópico de respostas //SUBSCRIBE

/****************************************************************
 * Configurações de timeout
*/
#define LCD_MESSAGE_DURATION 3000 // Duração padrão de mensagens no LCD em milissegundos
#define REQUEST_COUNTER_MAX 99999 // Valor máximo do contador de requisições antes de resetar

/****************************************************************
  * Pinagem dos sensores RFID
*/

// Pinos SPI compartilhados pelos dois sensores
#define PIN_SPI_SCK 18 // Clock do barramento SPI
#define PIN_SPI_MISO 19 // MISO (Dados dos sensores para o esp)
#define PIN_SPI_MOSI 23 // MOSI (Dados do esp para os sensores)

// Pinos do leitor RFID único
#define PIN_RFID_SS 5
#define PIN_RFID_RST 34

/****************************************************************
  * Pinagem e configuração do keypad
*/

// Pinos das linhas
#define PIN_KEYPAD_ROW_1 13
#define PIN_KEYPAD_ROW_2 12
#define PIN_KEYPAD_ROW_3 14
#define PIN_KEYPAD_ROW_4 27

// Pinos das colunas
#define PIN_KEYPAD_COL_1 26
#define PIN_KEYPAD_COL_2 25
#define PIN_KEYPAD_COL_3 33
#define PIN_KEYPAD_COL_4 32

/****************************************************************
  * Pinagem do LCD
*/

#define PIN_LCD_SDA 21
#define PIN_LCD_SCL 22

// Endereço I2C do LCD
#define LCD_I2C_ADDRESS 0x27

/****************************************************************
  * Pinagem do LED RGB (que representa a porta 1)
*/

#define PIN_LED_RED 4
#define PIN_LED_GREEN 0
#define PIN_LED_BLUE 2

/****************************************************************
  * Pinagem do Buzzer
*/

#define PIN_BUZZER 17

#endif