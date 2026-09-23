#include "buzzer.h"

// Construtor
Buzzer::Buzzer(int buzzerPin) : pin(buzzerPin) {
}

// Inicializa o pino como OUTPUT
void Buzzer::init() {
  pinMode(pin, OUTPUT);
  off();
}

// Faz um beep curto (100ms)
void Buzzer::beepShort() {
  on();
  delay(100);
  off();
}

// Faz um beep médio (300ms)
void Buzzer::beepMedium() {
  on();
  delay(300);
  off();
}

// Faz um beep longo (500ms)
void Buzzer::beepLong() {
  on();
  delay(500);
  off();
}

// Faz múltiplos beeps rápidos (para erro)
void Buzzer::beepError() {
  for (int i = 0; i < 3; i++) {
    on();
    delay(100);
    off();
    delay(100);
  }
}

// Faz um beep de sucesso (dois beeps curtos)
void Buzzer::beepSuccess() {
  beepShort();
  delay(100);
  beepShort();
}

// Faz um beep de negado (beep longo)
void Buzzer::beepDenied() {
  beepLong();
}

// Liga o buzzer
void Buzzer::on() {
  digitalWrite(pin, HIGH);
}

// Desliga o buzzer
void Buzzer::off() {
  digitalWrite(pin, LOW);
}