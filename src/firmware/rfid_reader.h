#ifndef RFID_READER_H
#define RFID_READER_H

#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include "types.h"


class RfidReader {
  private:
    MFRC522* mfrc522;
    bool initialized;
    
  public:
    // Construtor
    RfidReader();
    
    // Inicializa o sensor RFID
    void init();
    
    // Verifica se há cartão presente no sensor
    bool isCardPresent();
    
    // Lê cartão do sensor de entrada
    bool readEntradaCard(String& uid);
    
    // Lê cartão do sensor de saída
    bool readSaidaCard(String& uid);
    
    // Lê cartão de qualquer sensor disponível
    bool readAnyCard(String& uid, RfidSensor& sensor);
    
    // Verifica se o sensor está inicializado
    bool isInitialized() const;
    
    // Destrutor
    ~RfidReader();
};

#endif