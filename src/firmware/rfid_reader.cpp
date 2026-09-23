#include "rfid_reader.h"
#include "config.h"

// Construtor
RfidReader::RfidReader() : initialized(false) {
  // Aloca memória para o sensor único
  mfrc522 = new MFRC522(PIN_RFID_SS, PIN_RFID_RST);
}

// Inicializa o sensor RFID
void RfidReader::init() {
  // Inicializa o barramento SPI
  SPI.begin();
  
  // Inicializa o sensor
  mfrc522->PCD_Init();
  
  // Aguarda um pouco para estabilização
  delay(100);
  
  // Considera o sensor inicializado se chegou até aqui sem travar
  initialized = true;
  Serial.println("RFID: Sensor inicializado com sucesso");
}

// Verifica se há cartão presente no sensor
bool RfidReader::isCardPresent() {
  if (!initialized) return false;
  
  return mfrc522->PICC_IsNewCardPresent();
}

// Lê cartão do sensor de entrada (usa o sensor único)
bool RfidReader::readEntradaCard(String& uid) {
  if (!initialized) return false;
  
  if (mfrc522->PICC_IsNewCardPresent() && mfrc522->PICC_ReadCardSerial()) {
    // Converte UID para string hexadecimal
    uid = "";
    for (byte i = 0; i < mfrc522->uid.size; i++) {
      if (mfrc522->uid.uidByte[i] < 0x10) uid += "0";
      uid += String(mfrc522->uid.uidByte[i], HEX);
    }
    uid.toUpperCase();
    
    // Para a comunicação com o cartão
    mfrc522->PICC_HaltA();
    mfrc522->PCD_StopCrypto1();
    
    return true;
  }
  
  return false;
}

// Lê cartão do sensor de saída (usa o mesmo sensor físico)
bool RfidReader::readSaidaCard(String& uid) {
  if (!initialized) return false;
  
  if (mfrc522->PICC_IsNewCardPresent() && mfrc522->PICC_ReadCardSerial()) {
    // Converte UID para string hexadecimal
    uid = "";
    for (byte i = 0; i < mfrc522->uid.size; i++) {
      if (mfrc522->uid.uidByte[i] < 0x10) uid += "0";
      uid += String(mfrc522->uid.uidByte[i], HEX);
    }
    uid.toUpperCase();
    
    // Para a comunicação com o cartão
    mfrc522->PICC_HaltA();
    mfrc522->PCD_StopCrypto1();
    
    return true;
  }
  
  return false;
}

// Lê cartão de qualquer sensor disponível
bool RfidReader::readAnyCard(String& uid, RfidSensor& sensor) {
  if (!initialized) {
    sensor = RFID_NONE;
    return false;
  }
  
  // Tenta ler do sensor de entrada primeiro
  if (readEntradaCard(uid)) {
    sensor = RFID_ENTRADA;
    return true;
  }
  
  // Se não conseguiu, tenta do sensor de saída
  if (readSaidaCard(uid)) {
    sensor = RFID_SAIDA;
    return true;
  }
  
  sensor = RFID_NONE;
  return false;
}

// Verifica se o sensor está inicializado
bool RfidReader::isInitialized() const {
  return initialized;
}

// Destrutor
RfidReader::~RfidReader() {
  delete mfrc522;
}