#include "door.h"

// Construtor
Door::Door(int red, int green, int blue, const String& id)
    : doorId(id), pinRed(red), pinGreen(green), pinBlue(blue) {
}

// Configura os pinos como saídas
void Door::init() {
    pinMode(pinRed, OUTPUT);
    pinMode(pinGreen, OUTPUT);
    pinMode(pinBlue, OUTPUT);
    
    Serial.println("LED configurado:");
    Serial.println("- Red GPIO " + String(pinRed));
    Serial.println("- Green GPIO " + String(pinGreen));
    Serial.println("- Blue GPIO " + String(pinBlue));
    
    turnOff();

    Serial.println("LED inicializado.");
}

// Aplica os valores RGB atuais aos pinos
void Door::applyCurrentColor(bool red, bool green, bool blue) {
    // Força os pinos como OUTPUT (GPIO 0 pode ser alterado por outras bibliotecas)
    pinMode(pinRed, OUTPUT);
    pinMode(pinGreen, OUTPUT);
    pinMode(pinBlue, OUTPUT);
    
    digitalWrite(pinRed, red ? HIGH : LOW);
    digitalWrite(pinGreen, green ? HIGH : LOW);
    digitalWrite(pinBlue, blue ? HIGH : LOW);
    
    Serial.print("LED -> R:");
    Serial.print(red);
    Serial.print(" G:");
    Serial.print(green);
    Serial.print(" B:");
    Serial.println(blue);
}

// Verde para acesso permitido, vermelho para acesso negado
void Door::showAccess(bool granted) {
    if (granted) {
        // Verde
        applyCurrentColor(false, true, false);
    } else {
        // Vermelho
        applyCurrentColor(true, false, false);
    }
}

// Azul indica que está aguardando o usuário digitar a senha
void Door::showWaiting() {
    applyCurrentColor(false, false, true);
}

// Amarelo indica que está processando a requisição no servidor
// Vermelho + Verde = Amarelo
void Door::showProcessing() {
    applyCurrentColor(true, true, false);
}

// Vermelho indica erro do sistema
void Door::showError() {
    applyCurrentColor(true, false, false);
}

// Apaga o LED completamente
void Door::turnOff() {
    applyCurrentColor(false, false, false);
}

// Retorna o identificador da porta
String Door::getDoorId() const {
    return doorId;
}