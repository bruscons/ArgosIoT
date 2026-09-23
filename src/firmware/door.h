#ifndef DOOR_H
#define DOOR_H

#include <Arduino.h>

class Door {
    private:
        String doorId;  // Identificador da porta
        int pinRed;
        int pinGreen;
        int pinBlue;

        // Aplica os valores RGB atuais aos pinos
        void applyCurrentColor(bool red, bool green, bool blue);

    public:
        // Construtor: recebe os pinos RGB e o identificador da porta
        Door(int red, int green, int blue, const String& id);
  
        // Inicializa os pinos como OUTPUT
        void init();
  
        // Mostra status de acesso: verde se permitido, vermelho se negado
        void showAccess(bool granted);
  
        // Mostra que está aguardando usuário digitar a senha (azul)
        void showWaiting();
  
        // Mostra que está processando requisição (amarelo)
        void showProcessing();
  
        // Mostra estado de erro (vermelho)
        void showError();
  
        // Apaga o LED completamente
        void turnOff();
  
        // Retorna o identificador da porta
        String getDoorId() const;
};

#endif