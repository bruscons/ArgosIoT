#ifndef BUZZER_H
#define BUZZER_H

#include <Arduino.h>

class Buzzer {
  private:
    int pin;
    
  public:
    // Construtor: recebe o pino do buzzer
    Buzzer(int buzzerPin);
    
    // Inicializa o pino como OUTPUT
    void init();
    
    // Faz um beep curto (100ms)
    void beepShort();
    
    // Faz um beep médio (300ms)
    void beepMedium();
    
    // Faz um beep longo (500ms)
    void beepLong();
    
    // Faz múltiplos beeps rápidos (para erro)
    void beepError();
    
    // Faz um beep de sucesso (dois beeps curtos)
    void beepSuccess();
    
    // Faz um beep de negado (beep longo grave)
    void beepDenied();
    
    // Liga o buzzer
    void on();
    
    // Desliga o buzzer
    void off();
};

#endif